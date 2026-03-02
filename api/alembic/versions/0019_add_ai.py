"""Add ai_providers table and ai_summary to plants

Revision ID: 0019
Revises: 0018
Create Date: 2026-03-02 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0019"
down_revision: Union[str, None] = "0018"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create ai_providers table and add ai_summary to plants."""
    op.create_table(
        "ai_providers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("api_key", sa.Text(), nullable=False),
        sa.Column("label", sa.String(100), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.add_column("plants", sa.Column("ai_summary", sa.Text(), nullable=True))


def downgrade() -> None:
    """Drop ai_providers table and ai_summary column."""
    op.drop_column("plants", "ai_summary")
    op.drop_table("ai_providers")
