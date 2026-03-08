"""Add is_staple to recipe_ingredients

Revision ID: 0028
Revises: 0027
Create Date: 2026-03-08
"""

from alembic import op
import sqlalchemy as sa

revision = "0028"
down_revision = "0027"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "recipe_ingredients",
        sa.Column("is_staple", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    op.drop_column("recipe_ingredients", "is_staple")
