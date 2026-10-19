from sqlalchemy.orm import Session

from models.usuario import Usuario
from models.usuario_rol import UsuarioRol


def get_usuario_by_username(db: Session, username: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.nombre_usuario == username).first()


def create_usuario(db: Session, values: dict) -> Usuario:
    user = Usuario(**values)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_usuario_by_id(db: Session, usuario_id: int) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()


def get_all_usuarios(db: Session, skip: int = 0, limit: int = 100) -> list[Usuario]:
    return db.query(Usuario).offset(skip).limit(limit).all()


def update_usuario(db: Session, usuario_id: int, values: dict) -> Usuario | None:
    user = get_usuario_by_id(db, usuario_id)
    if not user:
        return None
    for key, value in values.items():
        if value is not None:
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def delete_usuario(db: Session, usuario_id: int) -> bool:
    user = get_usuario_by_id(db, usuario_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True


def get_usuario_roles(db: Session, usuario_id: int):
    from models.rol import Rol

    return (
        db.query(Rol)
        .join(UsuarioRol, Rol.id == UsuarioRol.rol_id)
        .filter(UsuarioRol.usuario_id == usuario_id)
        .all()
    )
