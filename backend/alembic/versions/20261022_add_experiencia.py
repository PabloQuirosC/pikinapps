"""add professional experience

Revision ID: 20261022_add_experiencia
Revises: 20261022_add_empresa
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261022_add_experiencia"
down_revision: Union[str, Sequence[str], None] = "20261022_add_empresa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "experiencia",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("kind", sa.String(length=30), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("org", sa.String(length=150), nullable=False),
        sa.Column("start", sa.String(length=30), nullable=False),
        sa.Column("end", sa.String(length=30), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("visible", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    experiencia = sa.table(
        "experiencia",
        sa.column("kind", sa.String),
        sa.column("title", sa.String),
        sa.column("org", sa.String),
        sa.column("start", sa.String),
        sa.column("end", sa.String),
        sa.column("description", sa.Text),
        sa.column("visible", sa.Boolean),
    )
    op.bulk_insert(
        experiencia,
        [
            {
                "kind": "work",
                "title": "Fundador & Lead Developer",
                "org": "PikinApps",
                "start": "2019",
                "end": "Actualidad",
                "description": "Dirijo un estudio boutique que ha lanzado más de 120 productos.",
                "visible": True,
            },
            {
                "kind": "work",
                "title": "Senior Frontend Engineer",
                "org": "Agencia Global Digital",
                "start": "2016",
                "end": "2019",
                "description": "Lideré el frontend de plataformas e-commerce.",
                "visible": True,
            },
        ],
    )


def downgrade() -> None:
    op.drop_table("experiencia")
