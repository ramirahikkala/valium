"""Add position column to tasks for manual ordering

Revision ID: 0003
Revises: 0002
Create Date: 2025-01-03 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
    )
    # Backfill: assign position based on created_at ASC (oldest=0, next=1, ...)
    op.execute(
        """
        UPDATE tasks SET position = sub.rn
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS rn
            FROM tasks
        ) sub
        WHERE tasks.id = sub.id
        """
    )


def downgrade() -> None:
    op.drop_column("tasks", "position")
