"""Delete remaining test workout sessions from 2026-03-01

Revision ID: 0031
Revises: 0030
Create Date: 2026-03-18
"""

from alembic import op

revision = "0031"
down_revision = "0030"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DELETE FROM workout_sessions WHERE started_at < '2026-03-02 00:00:00+00'")


def downgrade() -> None:
    pass
