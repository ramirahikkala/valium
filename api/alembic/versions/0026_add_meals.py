"""Add meal planner tables."""

import sqlalchemy as sa
from alembic import op

revision = "0026"
down_revision = "0025"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "recipes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("servings", sa.Integer(), nullable=False, server_default="4"),
        sa.Column("category", sa.String(50), nullable=False, server_default=sa.text("'other'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "recipe_ingredients",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("recipe_id", sa.Integer(), sa.ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("amount", sa.String(50), nullable=True),
        sa.Column("unit", sa.String(50), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_table(
        "meals",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "meal_recipes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("meal_id", sa.Integer(), sa.ForeignKey("meals.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recipe_id", sa.Integer(), sa.ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_table(
        "meal_plans",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "meal_plan_slots",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("meal_plan_id", sa.Integer(), sa.ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("day_label", sa.String(50), nullable=False),
        sa.Column("slot_label", sa.String(50), nullable=False),
        sa.Column("meal_id", sa.Integer(), sa.ForeignKey("meals.id", ondelete="SET NULL"), nullable=True),
        sa.Column("recipe_id", sa.Integer(), sa.ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_table(
        "shopping_lists",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("source_plan_id", sa.Integer(), sa.ForeignKey("meal_plans.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "shopping_list_items",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("shopping_list_id", sa.Integer(), sa.ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("amount", sa.String(50), nullable=True),
        sa.Column("unit", sa.String(50), nullable=True),
        sa.Column("checked", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("source_recipe", sa.String(200), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_table(
        "recipe_shares",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("recipe_id", sa.Integer(), sa.ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shared_with_user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("permission", sa.String(10), nullable=False, server_default=sa.text("'read'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("recipe_id", "shared_with_user_id"),
    )
    op.create_table(
        "meal_plan_shares",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("meal_plan_id", sa.Integer(), sa.ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shared_with_user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("permission", sa.String(10), nullable=False, server_default=sa.text("'read'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("meal_plan_id", "shared_with_user_id"),
    )
    op.create_table(
        "shopping_list_shares",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("shopping_list_id", sa.Integer(), sa.ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shared_with_user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("permission", sa.String(10), nullable=False, server_default=sa.text("'write'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("shopping_list_id", "shared_with_user_id"),
    )


def downgrade() -> None:
    op.drop_table("shopping_list_shares")
    op.drop_table("meal_plan_shares")
    op.drop_table("recipe_shares")
    op.drop_table("shopping_list_items")
    op.drop_table("shopping_lists")
    op.drop_table("meal_plan_slots")
    op.drop_table("meal_plans")
    op.drop_table("meal_recipes")
    op.drop_table("meals")
    op.drop_table("recipe_ingredients")
    op.drop_table("recipes")
