"""Add gym tables

Revision ID: 0006
Revises: 0005
Create Date: 2026-02-22 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "workout_programs",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "is_active", sa.Boolean, nullable=False, server_default=sa.text("true")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "program_exercises",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "program_id",
            sa.Integer,
            sa.ForeignKey("workout_programs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("weight", sa.Float, nullable=False, server_default="0"),
        sa.Column("sets", sa.Integer, nullable=False, server_default="3"),
        sa.Column("reps", sa.Integer, nullable=False, server_default="10"),
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
    )

    op.create_table(
        "workout_sessions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "program_id",
            sa.Integer,
            sa.ForeignKey("workout_programs.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("program_name", sa.String(255), nullable=False),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "session_sets",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column(
            "session_id",
            sa.Integer,
            sa.ForeignKey("workout_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "exercise_id",
            sa.Integer,
            sa.ForeignKey("program_exercises.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("exercise_name", sa.String(255), nullable=False),
        sa.Column("set_number", sa.Integer, nullable=False),
        sa.Column("weight_used", sa.Float, nullable=False, server_default="0"),
        sa.Column("reps_done", sa.Integer, nullable=False, server_default="0"),
        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("session_sets")
    op.drop_table("workout_sessions")
    op.drop_table("program_exercises")
    op.drop_table("workout_programs")
