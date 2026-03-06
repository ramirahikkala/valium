"""Add checklist session and template sharing tables.

Revision ID: 0023
Revises: 0022
Create Date: 2026-03-06
"""

from alembic import op
import sqlalchemy as sa

revision = "0023"
down_revision = "0022"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "checklist_session_shares",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "session_id",
            sa.Integer(),
            sa.ForeignKey("checklist_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "shared_with_user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("permission", sa.String(10), nullable=False, server_default="write"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("session_id", "shared_with_user_id"),
    )

    op.create_table(
        "checklist_template_shares",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "template_id",
            sa.Integer(),
            sa.ForeignKey("checklist_templates.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "shared_with_user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("permission", sa.String(10), nullable=False, server_default="read"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("template_id", "shared_with_user_id"),
    )


def downgrade() -> None:
    op.drop_table("checklist_template_shares")
    op.drop_table("checklist_session_shares")
