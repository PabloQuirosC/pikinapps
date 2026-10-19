import os
import sys
from logging.config import fileConfig
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import create_engine, pool

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.bases import Base
from models.permiso import Permiso
from models.rol import Rol
from models.rol_permiso import RolPermiso
from models.usuario import Usuario
from models.usuario_rol import UsuarioRol
from models.modulo import Modulo

load_dotenv()
config = context.config
target_metadata = Base.metadata


def database_url() -> str:
    value = os.getenv("DATABASE_URL")
    if not value:
        raise RuntimeError("DATABASE_URL no está configurada.")
    if value.startswith("postgres://"):
        value = "postgresql://" + value[len("postgres://") :]
    if value.startswith("postgresql://"):
        value = "postgresql+psycopg://" + value[len("postgresql://") :]
    parts = urlsplit(value)
    query = dict(parse_qsl(parts.query))
    query.setdefault("sslmode", "require")
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment))


if config.config_file_name is not None:
    fileConfig(config.config_file_name)


def run_migrations_offline() -> None:
    context.configure(
        url=database_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(database_url(), poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
