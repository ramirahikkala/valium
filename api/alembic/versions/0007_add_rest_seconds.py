"""Add rest_seconds to program_exercises

Revision ID: 0007
Revises: 0006
Create Date: 2026-02-22 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "program_exercises",
        sa.Column("rest_seconds", sa.Integer, nullable=False, server_default="90"),
    )


def downgrade() -> None:
    op.drop_column("program_exercises", "rest_seconds")
