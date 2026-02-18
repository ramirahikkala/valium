"""Notification senders for alarm delivery.

Pluggable channel design — add new senders (e.g. Telegram) by subclassing
NotificationSender and registering in CHANNEL_SENDERS.
"""

import logging
import os
import smtplib
from abc import ABC, abstractmethod
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")


class NotificationSender(ABC):
    """Abstract base for notification channel senders."""

    @abstractmethod
    def send(self, recipient: str, subject: str, body_html: str, body_text: str) -> bool:
        """Send a notification. Returns True on success."""


class EmailSender(NotificationSender):
    """Send notifications via SMTP email."""

    def send(self, recipient: str, subject: str, body_html: str, body_text: str) -> bool:
        """Send an email via SMTP. Returns True on success, False on failure."""
        if not SMTP_USER or not SMTP_PASSWORD:
            logger.warning("SMTP credentials not configured — skipping email to %s", recipient)
            return False

        msg = MIMEMultipart("alternative")
        msg["From"] = SMTP_USER
        msg["To"] = recipient
        msg["Subject"] = subject
        msg.attach(MIMEText(body_text, "plain"))
        msg.attach(MIMEText(body_html, "html"))

        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [recipient], msg.as_string())
            logger.info("Email sent to %s: %s", recipient, subject)
            return True
        except Exception:
            logger.exception("Failed to send email to %s", recipient)
            return False


def build_alarm_email(
    title: str, description: str | None, alarm_time: datetime
) -> tuple[str, str, str]:
    """Build subject, HTML body, and plain-text body for an alarm email.

    Returns:
        (subject, html, text) tuple.
    """
    time_str = alarm_time.strftime("%Y-%m-%d %H:%M %Z")
    subject = f"Valium Reminder: {title}"

    desc_html = f"<p>{description}</p>" if description else ""
    desc_text = f"\n{description}\n" if description else ""

    html = f"""\
<html>
<body style="font-family: sans-serif; color: #2d2d3f;">
  <h2 style="color: #6c7bb5;">Valium Reminder</h2>
  <h3>{title}</h3>
  {desc_html}
  <p style="color: #6b6b80; font-size: 0.9em;">Scheduled for: {time_str}</p>
  <hr style="border: none; border-top: 1px solid #d8d8e8;">
  <p style="color: #6b6b80; font-size: 0.8em;">
    Your little helper for getting things done.
  </p>
</body>
</html>"""

    text = f"""\
Valium Reminder
===============
{title}
{desc_text}
Scheduled for: {time_str}

--
Your little helper for getting things done.
"""

    return subject, html, text


# Channel registry — add new channels here
CHANNEL_SENDERS: dict[str, NotificationSender] = {
    "email": EmailSender(),
}
