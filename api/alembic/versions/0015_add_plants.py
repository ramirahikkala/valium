"""Add plant_locations and plants tables

Revision ID: 0015
Revises: 0014
Create Date: 2026-02-28 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0015"
down_revision: Union[str, None] = "0014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create plant_locations and plants tables."""
    op.create_table(
        "plant_locations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
    )
    op.create_table(
        "plants",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("latin_name", sa.String(500), nullable=False),
        sa.Column("common_name", sa.String(500), nullable=True),
        sa.Column("cultivar", sa.String(255), nullable=True),
        sa.Column("year_acquired", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(255), nullable=True),
        sa.Column("location_id", sa.Integer(), sa.ForeignKey("plant_locations.id", ondelete="SET NULL"), nullable=True),
        sa.Column("category", sa.String(50), nullable=False, server_default="perennial"),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
        sa.Column("lost_year", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    """Drop plants and plant_locations tables."""
    op.drop_table("plants")
    op.drop_table("plant_locations")
