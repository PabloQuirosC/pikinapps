import os
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models.usuario import Usuario
from repository.usuario import usuario_repository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(db: Session, user: Usuario) -> str:
    secret = os.getenv("SECRET_KEY")
    if not secret:
        raise RuntimeError("SECRET_KEY no está configurada.")

    expires = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user.nombre_usuario,
        "user_id": user.id,
        "permisos": _get_permissions(db, user.id),
        "exp": now + timedelta(minutes=expires),
        "iat": now,
    }
    return jwt.encode(payload, secret, algorithm=os.getenv("ALGORITHM", "HS256"))


def _get_permissions(db: Session, user_id: int) -> list[dict[str, str]]:
    from models.permiso import Permiso
    from models.rol_permiso import RolPermiso
    from models.usuario_rol import UsuarioRol

    rows = (
        db.query(Permiso.modulo, Permiso.nombre_permiso)
        .join(RolPermiso, RolPermiso.permiso_id == Permiso.id)
        .join(UsuarioRol, UsuarioRol.rol_id == RolPermiso.rol_id)
        .filter(UsuarioRol.usuario_id == user_id)
        .all()
    )
    return [{"modulo": modulo or "", "permiso": permiso} for modulo, permiso in rows]


def authenticate_user(db: Session, username: str, password: str) -> Usuario:
    user = usuario_repository.get_usuario_by_username(db, username)
    if not user or not user.activo or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña inválidos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user.fecha_ultimo_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def verify_token(token: str) -> dict:
    secret = os.getenv("SECRET_KEY")
    if not secret:
        raise HTTPException(status_code=500, detail="SECRET_KEY no está configurada.")
    try:
        payload = jwt.decode(
            token, secret, algorithms=[os.getenv("ALGORITHM", "HS256")]
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    if not payload.get("user_id"):
        raise HTTPException(status_code=401, detail="Token inválido.")
    return payload
