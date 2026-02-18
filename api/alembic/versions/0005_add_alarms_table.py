"""Add alarms table

Revision ID: 0005
Revises: 0004
Create Date: 2026-02-18 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "alarms",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "task_id",
            sa.Integer,
            sa.ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("channel", sa.String(20), nullable=False, server_default="email"),
        sa.Column("alarm_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("recurrence", sa.String(20), nullable=False, server_default="none"),
        sa.Column("enabled", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("last_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint("task_id", "channel", name="uq_alarm_task_channel"),
    )
    op.create_index("ix_alarm_enabled_at", "alarms", ["enabled", "alarm_at"])


def downgrade() -> None:
    op.drop_index("ix_alarm_enabled_at", table_name="alarms")
    op.drop_table("alarms")
