"""Add list_shares and plant_collection_shares tables

Revision ID: 0021
Revises: 0020
Create Date: 2026-03-03 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0021"
down_revision: Union[str, None] = "0020"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "list_shares",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("list_id", sa.Integer(), nullable=False),
        sa.Column("shared_with_user_id", sa.Integer(), nullable=False),
        sa.Column("permission", sa.String(10), nullable=False, server_default="read"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["list_id"], ["lists.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["shared_with_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("list_id", "shared_with_user_id"),
    )

    op.create_table(
        "plant_collection_shares",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_user_id", sa.Integer(), nullable=False),
        sa.Column("shared_with_user_id", sa.Integer(), nullable=False),
        sa.Column("permission", sa.String(10), nullable=False, server_default="read"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["shared_with_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("owner_user_id", "shared_with_user_id"),
    )


def downgrade() -> None:
    op.drop_table("plant_collection_shares")
    op.drop_table("list_shares")
