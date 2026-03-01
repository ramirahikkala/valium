"""Fix malformed plant data: siemenkasvatus, year-in-name, swapped fields

Revision ID: 0017
Revises: 0016
Create Date: 2026-03-01 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0017"
down_revision: Union[str, None] = "0016"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

plants = sa.table(
    "plants",
    sa.column("id", sa.Integer),
    sa.column("latin_name", sa.String),
    sa.column("common_name", sa.String),
    sa.column("year_acquired", sa.Integer),
    sa.column("source", sa.String),
    sa.column("notes", sa.Text),
    sa.column("own_seeds", sa.Boolean),
)


def fix(conn, id_, **values):
    conn.execute(sa.update(plants).where(plants.c.id == id_).values(**values))


def upgrade() -> None:
    """Fix three categories of malformed plant entries."""
    conn = op.get_bind()

    # ------------------------------------------------------------------
    # Category 1: "siemenkasvatus" stored in common_name
    # → set own_seeds=true, extract real common_name, fix source/notes
    # ------------------------------------------------------------------

    # 119: Achillea — common_name was just "siemenkasvatus"
    fix(conn, 119, common_name=None, own_seeds=True)

    # 154: Anthericum liliago L — "Tähkähietalilja oma siemenkasvatus/"
    fix(conn, 154, common_name="Tähkähietalilja", own_seeds=True)

    # 156: Aquilegia canadensis — "siemenkasvatus/S.P"
    fix(conn, 156, common_name=None, source="S.P.", own_seeds=True)

    # 192: Cimicifuga racemosa — "tähkäkimikki, oma siemenkasvatus"
    fix(conn, 192, common_name="tähkäkimikki", own_seeds=True)

    # 245: Gentiana — "metsäkatkero sin., oma siemenkasvatus"
    fix(conn, 245, common_name="metsäkatkero sin.", own_seeds=True)

    # 268: Helleborus orientalis — "tarhajouluruusu vaaleankeltainen, oma siemenkasvatus"
    fix(conn, 268, common_name="tarhajouluruusu", notes="vaaleankeltainen", own_seeds=True)

    # 521: Knautia macedonica — "etelänruusuruoho, oma siemenkasvatus"
    fix(conn, 521, common_name="etelänruusuruoho", own_seeds=True)

    # 344: Primula pruchoniciana — "suikeroesikko pinkki, oma siemenkasvatus"
    fix(conn, 344, common_name="suikeroesikko", notes="pinkki", own_seeds=True)

    # 349: Pulsatilla albana f. alboviolacea — "oma siemenkasvatus"
    fix(conn, 349, common_name=None, own_seeds=True)

    # 358: Pulsatilla vulgaris f. Rosea oma siemenkasvatus (in latin_name!)
    fix(conn, 358, latin_name="Pulsatilla vulgaris f. Rosea", own_seeds=True)

    # 369: Saxifraga oppositifolia — previous migration fixed latin_name/cultivar/source/year
    # but left "siemenkasvatus/S.P. Onko itänyt" in common_name and notes empty
    fix(conn, 369, common_name=None, notes="Onko itänyt")

    # ------------------------------------------------------------------
    # Category 2: Year in parentheses inside latin_name
    # ------------------------------------------------------------------

    # 38: "Clematis fremontii (2023" + common_name="siemenkasvatus/S.P. Onko itänyt"
    fix(
        conn, 38,
        latin_name="Clematis fremontii",
        year_acquired=2023,
        source="S.P.",
        common_name=None,
        notes="Onko itänyt",
        own_seeds=True,
    )

    # 103: "Hosta (2023"
    fix(conn, 103, latin_name="Hosta", year_acquired=2023)

    # 256: "Geranium sanguineum (2022" + common_name="Paula k" (= source)
    fix(
        conn, 256,
        latin_name="Geranium sanguineum",
        year_acquired=2022,
        source="Paula K",
        common_name=None,
    )

    # 511: "Gentiana s strain alba' (2020" — strip the year and stray apostrophe
    fix(conn, 511, latin_name="Gentiana s.str. alba", year_acquired=2020)

    # ------------------------------------------------------------------
    # Category 3: Latin name and common name swapped
    # ------------------------------------------------------------------

    # 338: latin="Loistokevätesikko", common="Primula Polyantha"
    fix(conn, 338, latin_name="Primula \u00d7 polyantha", common_name="Loistokevätesikko")

    # 348: latin="Punaimikkä", common="Pulmonaria Rubra"
    fix(conn, 348, latin_name="Pulmonaria rubra", common_name="Punaimikkä")


def downgrade() -> None:
    """Restore original malformed values (for reference only)."""
    conn = op.get_bind()

    fix(conn, 119, common_name="siemenkasvatus", own_seeds=False)
    fix(conn, 154, common_name="Tähkähietalilja oma siemenkasvatus/", own_seeds=False)
    fix(conn, 156, common_name="siemenkasvatus/S.P", source=None, own_seeds=False)
    fix(conn, 192, common_name="tähkäkimikki, oma siemenkasvatus", own_seeds=False)
    fix(conn, 245, common_name="metsäkatkero sin., oma siemenkasvatus", own_seeds=False)
    fix(conn, 268, common_name="tarhajouluruusu vaaleankeltainen, oma siemenkasvatus", notes=None, own_seeds=False)
    fix(conn, 521, common_name="etelänruusuruoho, oma siemenkasvatus", own_seeds=False)
    fix(conn, 344, common_name="suikeroesikko pinkki, oma siemenkasvatus", notes=None, own_seeds=False)
    fix(conn, 349, common_name="oma siemenkasvatus", own_seeds=False)
    fix(conn, 358, latin_name="Pulsatilla vulgaris f. Rosea oma siemenkasvatus", own_seeds=False)
    fix(conn, 369, common_name="siemenkasvatus/S.P. Onko itänyt", notes=None)

    fix(conn, 38, latin_name="Clematis fremontii (2023", year_acquired=None, source=None, common_name="siemenkasvatus/S.P. Onko itänyt", notes=None, own_seeds=False)
    fix(conn, 103, latin_name="Hosta (2023", year_acquired=None)
    fix(conn, 256, latin_name="Geranium sanguineum (2022", year_acquired=None, source=None, common_name="Paula k")
    fix(conn, 511, latin_name="Gentiana s strain alba' (2020", year_acquired=None)

    fix(conn, 338, latin_name="Loistokevätesikko", common_name="Primula Polyantha")
    fix(conn, 348, latin_name="Punaimikkä", common_name="Pulmonaria Rubra")
