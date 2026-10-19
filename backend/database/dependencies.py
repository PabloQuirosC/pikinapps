import logging
import os
from collections.abc import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .connection import get_db

security = HTTPBearer(auto_error=True)
logger = logging.getLogger(__name__)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    secret = os.getenv("SECRET_KEY")
    if not secret:
        raise HTTPException(status_code=500, detail="SECRET_KEY no está configurada.")

    try:
        payload = jwt.decode(
            credentials.credentials,
            secret,
            algorithms=[os.getenv("ALGORITHM", "HS256")],
        )
    except JWTError as exc:
        logger.warning("JWT inválido: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if not payload.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token no contiene user_id.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


get_db_dependency = get_db
get_db_app_pikinapps = get_db
