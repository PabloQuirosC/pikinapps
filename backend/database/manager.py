import os
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import DatabaseConfig
from .enums import DatabaseType
from utils.logger import get_logger

logger = get_logger(__name__)


class DatabaseManager:
    _engine = None
    _session_maker = None

    @classmethod
    def get_engine(cls, db_type: DatabaseType = DatabaseType.SUPABASE):
        if cls._engine is None:
            config = DatabaseConfig(db_type)
            logger.info("Creando conexión SQLAlchemy para la base de datos.")
            cls._engine = create_engine(
                config.url,
                connect_args=config.connect_args,
                pool_pre_ping=True,
                pool_recycle=1800,
                pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
                max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "5")),
                echo=os.getenv("DB_ECHO", "false").lower() == "true",
            )
            logger.info("Conexión SQLAlchemy configurada correctamente.")
        return cls._engine

    @classmethod
    def get_session_maker(cls, db_type: DatabaseType = DatabaseType.SUPABASE):
        if cls._session_maker is None:
            cls._session_maker = sessionmaker(
                bind=cls.get_engine(db_type),
                autocommit=False,
                autoflush=False,
                expire_on_commit=False,
            )
        return cls._session_maker

    @classmethod
    def get_session(cls, db_type: DatabaseType = DatabaseType.SUPABASE) -> Session:
        return cls.get_session_maker(db_type)()

    @classmethod
    def close_all(cls) -> None:
        if cls._engine is not None:
            logger.info("Cerrando conexiones de la base de datos.")
            cls._engine.dispose()
        cls._engine = None
        cls._session_maker = None
