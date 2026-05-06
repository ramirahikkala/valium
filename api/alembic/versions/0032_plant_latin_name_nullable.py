"""Make plant latin_name nullable

Revision ID: 0032
Revises: 0031
Create Date: 2026-05-06 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0032"
down_revision: Union[str, None] = "0031"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Allow latin_name to be NULL."""
    op.alter_column("plants", "latin_name", existing_type=sa.String(500), nullable=True)


def downgrade() -> None:
    """Revert latin_name to NOT NULL (fails if NULLs exist)."""
    op.alter_column("plants", "latin_name", existing_type=sa.String(500), nullable=False)
