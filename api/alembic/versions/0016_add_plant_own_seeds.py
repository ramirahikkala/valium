"""Add own_seeds to plants; fix malformed Saxifraga entry

Revision ID: 0016
Revises: 0015
Create Date: 2026-03-01 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0016"
down_revision: Union[str, None] = "0015"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

plants = sa.table(
    "plants",
    sa.column("id", sa.Integer),
    sa.column("latin_name", sa.String),
    sa.column("cultivar", sa.String),
    sa.column("year_acquired", sa.Integer),
    sa.column("source", sa.String),
    sa.column("notes", sa.Text),
    sa.column("own_seeds", sa.Boolean),
)


def upgrade() -> None:
    """Add own_seeds column and fix malformed Saxifraga oppositifolia entry."""
    op.add_column(
        "plants",
        sa.Column(
            "own_seeds",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # Fix the malformed Saxifraga oppositifolia entry that was entered as a
    # single blob in latin_name: "Saxifraga oppositifolia (2023"
    # with cultivar "'theoden'", source "siemenkasvatus/S.P.", notes "Onko itänyt"
    conn = op.get_bind()
    rows = conn.execute(
        sa.select(plants.c.id, plants.c.latin_name, plants.c.cultivar, plants.c.source)
        .where(plants.c.latin_name.like("Saxifraga oppositifolia%(2023%"))
    ).fetchall()

    for row in rows:
        conn.execute(
            sa.update(plants)
            .where(plants.c.id == row.id)
            .values(
                latin_name="Saxifraga oppositifolia",
                cultivar="Theoden",
                year_acquired=2023,
                source="S.P.",
                own_seeds=True,
            )
        )


def downgrade() -> None:
    """Remove own_seeds column."""
    op.drop_column("plants", "own_seeds")
