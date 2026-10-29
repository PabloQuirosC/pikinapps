"""add company configuration

Revision ID: 20261022_add_empresa
Revises: d835a88b5847
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261022_add_empresa"
down_revision: Union[str, Sequence[str], None] = "d835a88b5847"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "empresa",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("owner_name", sa.String(length=150), nullable=False),
        sa.Column("company_name", sa.String(length=150), nullable=False),
        sa.Column("role", sa.String(length=150), nullable=False),
        sa.Column("hero_title", sa.String(length=255), nullable=False),
        sa.Column("hero_rotating", sa.JSON(), nullable=False),
        sa.Column("hero_subtitle", sa.Text(), nullable=False),
        sa.Column("mission", sa.Text(), nullable=False),
        sa.Column("vision", sa.Text(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("whatsapp", sa.String(length=50), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    empresa = sa.table(
        "empresa",
        sa.column("id", sa.Integer),
        sa.column("owner_name", sa.String),
        sa.column("company_name", sa.String),
        sa.column("role", sa.String),
        sa.column("hero_title", sa.String),
        sa.column("hero_rotating", sa.JSON),
        sa.column("hero_subtitle", sa.Text),
        sa.column("mission", sa.Text),
        sa.column("vision", sa.Text),
        sa.column("email", sa.String),
        sa.column("whatsapp", sa.String),
        sa.column("location", sa.String),
    )
    op.bulk_insert(
        empresa,
        [
            {
                "id": 1,
                "owner_name": "Pablo Quirós Cortes",
                "company_name": "PikinApps",
                "role": "Fundador & Desarrollador Full-Stack",
                "hero_title": "Construyo productos digitales que",
                "hero_rotating": [
                    "venden más.",
                    "se sienten premium.",
                    "escalan sin miedo.",
                    "enamoran a tus clientes.",
                ],
                "hero_subtitle": (
                    "Diseño y desarrollo sitios web, e-commerce y aplicaciones "
                    "a medida para marcas que quieren destacar."
                ),
                "mission": (
                    "Convertir ideas ambiciosas en productos digitales rápidos, "
                    "bellos y rentables."
                ),
                "vision": (
                    "Ser el estudio de referencia en Latinoamérica para marcas "
                    "que compiten a nivel global."
                ),
                "email": "hola@miempresa.com",
                "whatsapp": "+50600000000",
                "location": "San José, Costa Rica",
            }
        ],
    )


def downgrade() -> None:
    op.drop_table("empresa")
