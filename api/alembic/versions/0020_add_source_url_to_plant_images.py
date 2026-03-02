"""Add source_url to plant_images

Revision ID: 0020
Revises: 0019
Create Date: 2026-03-02 00:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0020"
down_revision: Union[str, None] = "0019"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("plant_images", sa.Column("source_url", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("plant_images", "source_url")
