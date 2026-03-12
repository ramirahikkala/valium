"""Move progression config from program_exercises to exercises

Revision ID: 0029
Revises: 0028
Create Date: 2026-03-12
"""

from alembic import op
import sqlalchemy as sa

revision = "0029"
down_revision = "0028"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add progression config columns to exercises
    op.add_column("exercises", sa.Column("weight", sa.Float(), nullable=False, server_default="0"))
    op.add_column("exercises", sa.Column("base_weight", sa.Float(), nullable=False, server_default="0"))
    op.add_column("exercises", sa.Column("auto_increment", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("exercises", sa.Column("increment_kg", sa.Float(), nullable=False, server_default="2.5"))
    op.add_column("exercises", sa.Column("reset_increment_kg", sa.Float(), nullable=False, server_default="5"))
    op.add_column("exercises", sa.Column("deload_mode", sa.String(), nullable=False, server_default="reset"))
    op.add_column("exercises", sa.Column("failure_threshold", sa.Integer(), nullable=False, server_default="3"))

    # Copy config from the first (lowest id) program_exercise per exercise
    op.execute("""
        UPDATE exercises e
        SET
            weight = pe.weight,
            base_weight = pe.base_weight,
            auto_increment = pe.auto_increment,
            increment_kg = pe.increment_kg,
            reset_increment_kg = pe.reset_increment_kg,
            deload_mode = pe.deload_mode,
            failure_threshold = pe.failure_threshold
        FROM (
            SELECT DISTINCT ON (exercise_id)
                exercise_id, weight, base_weight, auto_increment,
                increment_kg, reset_increment_kg, deload_mode, failure_threshold
            FROM program_exercises
            ORDER BY exercise_id, id
        ) pe
        WHERE e.id = pe.exercise_id
    """)

    # Drop config columns from program_exercises
    op.drop_column("program_exercises", "weight")
    op.drop_column("program_exercises", "base_weight")
    op.drop_column("program_exercises", "auto_increment")
    op.drop_column("program_exercises", "increment_kg")
    op.drop_column("program_exercises", "reset_increment_kg")
    op.drop_column("program_exercises", "deload_mode")
    op.drop_column("program_exercises", "failure_threshold")


def downgrade() -> None:
    op.add_column("program_exercises", sa.Column("weight", sa.Float(), nullable=False, server_default="0"))
    op.add_column("program_exercises", sa.Column("base_weight", sa.Float(), nullable=False, server_default="0"))
    op.add_column("program_exercises", sa.Column("auto_increment", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("program_exercises", sa.Column("increment_kg", sa.Float(), nullable=False, server_default="2.5"))
    op.add_column("program_exercises", sa.Column("reset_increment_kg", sa.Float(), nullable=False, server_default="5"))
    op.add_column("program_exercises", sa.Column("deload_mode", sa.String(), nullable=False, server_default="reset"))
    op.add_column("program_exercises", sa.Column("failure_threshold", sa.Integer(), nullable=False, server_default="3"))

    op.execute("""
        UPDATE program_exercises pe
        SET
            weight = e.weight,
            base_weight = e.base_weight,
            auto_increment = e.auto_increment,
            increment_kg = e.increment_kg,
            reset_increment_kg = e.reset_increment_kg,
            deload_mode = e.deload_mode,
            failure_threshold = e.failure_threshold
        FROM exercises e
        WHERE pe.exercise_id = e.id
    """)

    op.drop_column("exercises", "failure_threshold")
    op.drop_column("exercises", "deload_mode")
    op.drop_column("exercises", "reset_increment_kg")
    op.drop_column("exercises", "increment_kg")
    op.drop_column("exercises", "auto_increment")
    op.drop_column("exercises", "base_weight")
    op.drop_column("exercises", "weight")
