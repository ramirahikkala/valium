"""Move consecutive_failures from program_exercises to exercises (global per exercise)

Revision ID: 0014
Revises: 0013
Create Date: 2026-02-28 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0014"
down_revision: Union[str, None] = "0013"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add consecutive_failures to exercises, migrate data, drop from program_exercises."""
    op.add_column(
        "exercises",
        sa.Column(
            "consecutive_failures", sa.Integer(), nullable=False, server_default="0"
        ),
    )
    # Migrate: use the max consecutive_failures across all program exercises per library exercise
    op.execute(
        """
        UPDATE exercises e
        SET consecutive_failures = (
            SELECT COALESCE(MAX(pe.consecutive_failures), 0)
            FROM program_exercises pe
            WHERE pe.exercise_id = e.id
        )
        """
    )
    op.drop_column("program_exercises", "consecutive_failures")


def downgrade() -> None:
    """Re-add consecutive_failures to program_exercises, drop from exercises."""
    op.add_column(
        "program_exercises",
        sa.Column(
            "consecutive_failures", sa.Integer(), nullable=False, server_default="0"
        ),
    )
    op.drop_column("exercises", "consecutive_failures")
