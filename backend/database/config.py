import os
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

from dotenv import load_dotenv

from .enums import DatabaseType

load_dotenv()


class DatabaseConfig:
    """Configuración de la conexión PostgreSQL de Supabase."""

    def __init__(self, db_type: DatabaseType = DatabaseType.SUPABASE):
        database_url = os.getenv("DATABASE_URL", "").strip()
        if not database_url:
            raise ValueError("DATABASE_URL no está configurada.")

        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif database_url.startswith("postgresql://"):
            database_url = database_url.replace(
                "postgresql://", "postgresql+psycopg://", 1
            )

        if not database_url.startswith("postgresql+psycopg://"):
            raise ValueError(
                "DATABASE_URL debe usar postgresql+psycopg:// para Supabase."
            )

        self.database_url = database_url

    @property
    def url(self) -> str:
        return self.database_url

    @property
    def connect_args(self) -> dict[str, str]:
        query = parse_qs(urlsplit(self.database_url).query)
        return {} if "sslmode" in query else {"sslmode": "require"}
