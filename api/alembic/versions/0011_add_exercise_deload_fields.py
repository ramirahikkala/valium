"""Add deload tracking fields to program_exercises

Revision ID: 0011
Revises: 0010
Create Date: 2026-02-25 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add consecutive_failures, deload_mode and failure_threshold to program_exercises."""
    op.add_column(
        "program_exercises",
        sa.Column(
            "consecutive_failures", sa.Integer(), nullable=False, server_default="0"
        ),
    )
    op.add_column(
        "program_exercises",
        sa.Column(
            "deload_mode", sa.String(), nullable=False, server_default="reset"
        ),
    )
    op.add_column(
        "program_exercises",
        sa.Column(
            "failure_threshold", sa.Integer(), nullable=False, server_default="3"
        ),
    )


def downgrade() -> None:
    """Remove deload tracking fields from program_exercises."""
    op.drop_column("program_exercises", "failure_threshold")
    op.drop_column("program_exercises", "deload_mode")
    op.drop_column("program_exercises", "consecutive_failures")
