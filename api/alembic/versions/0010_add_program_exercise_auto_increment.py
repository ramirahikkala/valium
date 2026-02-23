"""Add auto-increment columns to program_exercises

Revision ID: 0010
Revises: 0009
Create Date: 2026-02-23 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0010"
down_revision: Union[str, None] = "0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add auto_increment, increment_kg, base_weight, reset_increment_kg to program_exercises."""
    op.add_column(
        "program_exercises",
        sa.Column("auto_increment", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column(
        "program_exercises",
        sa.Column("increment_kg", sa.Float(), nullable=False, server_default="2.5"),
    )
    op.add_column(
        "program_exercises",
        sa.Column("base_weight", sa.Float(), nullable=False, server_default="0"),
    )
    op.add_column(
        "program_exercises",
        sa.Column("reset_increment_kg", sa.Float(), nullable=False, server_default="5"),
    )


def downgrade() -> None:
    """Remove auto-increment columns from program_exercises."""
    op.drop_column("program_exercises", "reset_increment_kg")
    op.drop_column("program_exercises", "base_weight")
    op.drop_column("program_exercises", "increment_kg")
    op.drop_column("program_exercises", "auto_increment")
