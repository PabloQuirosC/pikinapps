import os

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .connection import get_db
from utils.logger import get_logger
from models.usuario import Usuario

security = HTTPBearer(auto_error=True)
logger = get_logger(__name__)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> dict:
    secret = os.getenv("SECRET_KEY")
    if not secret:
        logger.error("SECRET_KEY no está configurada; no se puede validar el JWT.")
        raise HTTPException(status_code=500, detail="SECRET_KEY no está configurada.")

    try:
        payload = jwt.decode(
            credentials.credentials,
            secret,
            algorithms=[os.getenv("ALGORITHM", "HS256")],
        )
    except JWTError as exc:
        logger.warning("JWT inválido o expirado: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user_id = payload.get("user_id")
    if not user_id:
        logger.warning("JWT rechazado porque no contiene user_id.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token no contiene user_id.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if (
        not user
        or not user.activo
        or payload.get("sub") != user.nombre_usuario
        or payload.get("email") != user.email
    ):
        logger.warning("JWT rechazado porque la sesión del usuario ya no es válida: user_id=%s", user_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión ya no es válida. Inicia sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


get_db_dependency = get_db
get_db_app_pikinapps = get_db
