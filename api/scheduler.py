"""APScheduler-based alarm checker.

Runs an interval job every 60 seconds that queries for due alarms,
sends notifications, and advances recurring alarms.
"""

import logging
from datetime import datetime, timezone

from dateutil.relativedelta import relativedelta
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import async_session
from models import Alarm, List, RecurrenceType, Task
from notifications import CHANNEL_SENDERS, build_alarm_email

logger = logging.getLogger(__name__)

_scheduler = None


def _advance_alarm_at(alarm: Alarm) -> None:
    """Advance alarm_at for recurring alarms, or disable one-shot alarms."""
    if alarm.recurrence == RecurrenceType.none.value:
        alarm.enabled = False
        return

    now = datetime.now(timezone.utc)
    next_time = alarm.alarm_at

    if alarm.recurrence == RecurrenceType.daily.value:
        delta = relativedelta(days=1)
    elif alarm.recurrence == RecurrenceType.weekly.value:
        delta = relativedelta(weeks=1)
    elif alarm.recurrence == RecurrenceType.monthly.value:
        delta = relativedelta(months=1)
    else:
        alarm.enabled = False
        return

    # Advance past now in case multiple intervals have elapsed
    while next_time <= now:
        next_time = next_time + delta

    alarm.alarm_at = next_time


async def check_due_alarms() -> None:
    """Check for and process all due alarms."""
    logger.info("Checking for due alarms")
    now = datetime.now(timezone.utc)

    async with async_session() as session:
        result = await session.execute(
            select(Alarm)
            .where(Alarm.enabled.is_(True), Alarm.alarm_at <= now)
            .options(
                selectinload(Alarm.task)
                .selectinload(Task.list)
                .selectinload(List.user),
            )
        )
        alarms = list(result.scalars().all())

        if not alarms:
            logger.info("No due alarms found")
            return

        logger.info("Found %d due alarm(s)", len(alarms))

        for alarm in alarms:
            task = alarm.task
            if task is None:
                continue

            # Walk up to get the user email: task → list → user
            user_email = None
            if task.list and task.list.user:
                user_email = task.list.user.email

            if not user_email:
                logger.warning(
                    "Alarm %d: cannot determine recipient email (task=%d)",
                    alarm.id, task.id,
                )
                continue

            sender = CHANNEL_SENDERS.get(alarm.channel)
            if sender is None:
                logger.warning("No sender for channel %r", alarm.channel)
                continue

            subject, html, text = build_alarm_email(
                task.title, task.description, alarm.alarm_at
            )
            success = sender.send(user_email, subject, html, text)

            if success:
                alarm.last_sent_at = now
                _advance_alarm_at(alarm)
                logger.info("Alarm %d sent to %s", alarm.id, user_email)
            else:
                logger.warning("Alarm %d: send failed for %s", alarm.id, user_email)

        await session.commit()


def start_scheduler() -> None:
    """Start the APScheduler background scheduler."""
    global _scheduler  # noqa: PLW0603

    from apscheduler.schedulers.asyncio import AsyncIOScheduler

    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(check_due_alarms, "interval", seconds=60, id="check_due_alarms")
    _scheduler.start()
    logger.info("Alarm scheduler started (60s interval)")


def stop_scheduler() -> None:
    """Stop the APScheduler background scheduler."""
    global _scheduler  # noqa: PLW0603
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("Alarm scheduler stopped")
