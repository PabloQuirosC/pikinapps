"""add professional skills

Revision ID: 20261029_add_habilidades
Revises: 20261022_add_experiencia
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261029_add_habilidades"
down_revision: Union[str, Sequence[str], None] = "20261022_add_experiencia"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "habilidad",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("visible", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    habilidad = sa.table(
        "habilidad",
        sa.column("name", sa.String),
        sa.column("level", sa.Integer),
        sa.column("visible", sa.Boolean),
    )
    op.bulk_insert(
        habilidad,
        [
            {"name": "React / Next.js", "level": 96, "visible": True},
            {"name": "TypeScript", "level": 93, "visible": True},
            {"name": "UI / UX Design", "level": 88, "visible": True},
            {"name": "Node.js", "level": 85, "visible": True},
        ],
    )


def downgrade() -> None:
    op.drop_table("habilidad")
