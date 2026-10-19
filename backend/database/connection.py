from collections.abc import Generator

from sqlalchemy.orm import Session

from .manager import DatabaseManager


def get_db() -> Generator[Session, None, None]:
    db = DatabaseManager.get_session()
    try:
        yield db
    finally:
        db.close()


get_db_supabase = get_db
