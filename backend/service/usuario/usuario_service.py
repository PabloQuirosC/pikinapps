from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.usuario import Usuario
from repository.usuario import usuario_repository
from schemas.schemas import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from service.auth.auth_service import hash_password


def _response(user: Usuario) -> UsuarioResponse:
    return UsuarioResponse(
        id=user.id,
        nombre=user.nombre,
        apellido=user.apellido,
        email=user.email,
        nombre_usuario=user.nombre_usuario,
        rol=user.usuario_roles[0].rol.nombre_rol if user.usuario_roles else None,
        pais=user.pais,
        activo=user.activo,
        fecha_ultimo_login=user.fecha_ultimo_login,
    )


def create_usuario(db: Session, data: UsuarioCreate) -> UsuarioResponse:
    if usuario_repository.get_usuario_by_username(db, data.nombre_usuario):
        raise HTTPException(status_code=409, detail="El usuario ya existe.")
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=409, detail="El email ya está registrado.")

    values = data.model_dump()
    values["password"] = hash_password(values.pop("contrasena"))
    user = usuario_repository.create_usuario(db, values)
    return _response(user)


def get_usuario(db: Session, usuario_id: int) -> UsuarioResponse:
    user = usuario_repository.get_usuario_by_id(db, usuario_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return _response(user)


def get_all_usuarios(db: Session, skip: int = 0, limit: int = 100):
    return [_response(user) for user in usuario_repository.get_all_usuarios(db, skip, limit)]


def update_usuario(db: Session, usuario_id: int, data: UsuarioUpdate) -> UsuarioResponse:
    user = usuario_repository.get_usuario_by_id(db, usuario_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    values = data.model_dump(exclude_unset=True)
    if "nombre_usuario" in values:
        existing = usuario_repository.get_usuario_by_username(db, values["nombre_usuario"])
        if existing and existing.id != usuario_id:
            raise HTTPException(status_code=409, detail="El nombre de usuario ya existe.")
    if "contrasena" in values:
        values["password"] = hash_password(values.pop("contrasena"))
    user = usuario_repository.update_usuario(db, usuario_id, values)
    return _response(user)


def delete_usuario(db: Session, usuario_id: int) -> dict:
    if not usuario_repository.delete_usuario(db, usuario_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return {"message": "Usuario eliminado exitosamente."}
