"""Delete test workout sessions from before 2026-03-01

Revision ID: 0030
Revises: 0029
Create Date: 2026-03-18
"""

from alembic import op


def upgrade() -> None:
    op.execute("DELETE FROM workout_sessions WHERE started_at < '2026-03-01 00:00:00+00'")


def downgrade() -> None:
    pass  # data deletion is not reversible
