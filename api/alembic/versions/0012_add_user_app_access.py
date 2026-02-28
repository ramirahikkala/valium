"""Add user_app_access table for per-user app feature flags

Revision ID: 0012
Revises: 0011
Create Date: 2026-02-28 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0012"
down_revision: Union[str, None] = "0011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create user_app_access table."""
    op.create_table(
        "user_app_access",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("app", sa.String(50), nullable=False),
        sa.Column(
            "enabled", sa.Boolean(), nullable=False, server_default="true"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("user_id", "app"),
    )


def downgrade() -> None:
    """Drop user_app_access table."""
    op.drop_table("user_app_access")
