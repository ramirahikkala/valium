"""Add exercise library table; refactor program_exercises and session_sets

Revision ID: 0008
Revises: 0007
Create Date: 2026-02-22 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create the exercises table (global exercise library per user)
    op.create_table(
        "exercises",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_exercises_user_id", "exercises", ["user_id"])

    # 2. Populate exercises from unique (user_id, name) pairs in program_exercises
    op.execute("""
        INSERT INTO exercises (user_id, name)
        SELECT DISTINCT wp.user_id, pe.name
        FROM program_exercises pe
        JOIN workout_programs wp ON pe.program_id = wp.id
    """)

    # 3. Add exercise_id column to program_exercises (nullable first for data migration)
    op.add_column(
        "program_exercises",
        sa.Column("exercise_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_program_exercises_exercise_id",
        "program_exercises",
        "exercises",
        ["exercise_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # 4. Fill exercise_id by matching user + name
    op.execute("""
        UPDATE program_exercises pe
        SET exercise_id = e.id
        FROM exercises e, workout_programs wp
        WHERE pe.program_id = wp.id
          AND e.user_id = wp.user_id
          AND e.name = pe.name
    """)

    # 5. Make exercise_id NOT NULL, drop old name column
    op.alter_column("program_exercises", "exercise_id", nullable=False)
    op.drop_column("program_exercises", "name")

    # 6. Migrate session_sets: change exercise_id FK from program_exercises → exercises
    #    Add a temporary column to hold the new exercise_id
    op.add_column(
        "session_sets",
        sa.Column("new_exercise_id", sa.Integer(), nullable=True),
    )

    # 7. Fill new_exercise_id via program_exercises.exercise_id
    op.execute("""
        UPDATE session_sets ss
        SET new_exercise_id = pe.exercise_id
        FROM program_exercises pe
        WHERE ss.exercise_id = pe.id
    """)

    # 8. Drop old FK constraint on session_sets.exercise_id (→ program_exercises)
    op.drop_constraint("session_sets_exercise_id_fkey", "session_sets", type_="foreignkey")
    op.drop_column("session_sets", "exercise_id")

    # 9. Rename new_exercise_id → exercise_id and add new FK (→ exercises)
    op.alter_column("session_sets", "new_exercise_id", new_column_name="exercise_id")
    op.create_foreign_key(
        "fk_session_sets_exercise_id",
        "session_sets",
        "exercises",
        ["exercise_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    # Reverse: restore name column and old FK on session_sets
    op.drop_constraint("fk_session_sets_exercise_id", "session_sets", type_="foreignkey")
    op.add_column(
        "session_sets",
        sa.Column("old_exercise_id", sa.Integer(), nullable=True),
    )
    # We cannot fully restore the program_exercise FK since the mapping is lost;
    # downgrade leaves session_sets.exercise_id as NULL after this point.
    op.drop_column("session_sets", "exercise_id")
    op.alter_column("session_sets", "old_exercise_id", new_column_name="exercise_id")

    # Restore name column in program_exercises from exercises
    op.add_column(
        "program_exercises",
        sa.Column("name", sa.String(255), nullable=True),
    )
    op.execute("""
        UPDATE program_exercises pe
        SET name = e.name
        FROM exercises e
        WHERE pe.exercise_id = e.id
    """)
    op.alter_column("program_exercises", "name", nullable=False)
    op.drop_constraint("fk_program_exercises_exercise_id", "program_exercises", type_="foreignkey")
    op.drop_column("program_exercises", "exercise_id")

    # Drop exercises table
    op.drop_index("ix_exercises_user_id", table_name="exercises")
    op.drop_table("exercises")
