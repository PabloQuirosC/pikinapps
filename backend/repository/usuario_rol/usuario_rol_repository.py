from sqlalchemy.orm import Session

from models.usuario_rol import UsuarioRol


def get_by_usuario(db: Session, usuario_id: int) -> list[UsuarioRol]:
    return db.query(UsuarioRol).filter(UsuarioRol.usuario_id == usuario_id).all()


def get_by_rol(db: Session, rol_id: int) -> list[UsuarioRol]:
    return db.query(UsuarioRol).filter(UsuarioRol.rol_id == rol_id).all()


def create(db: Session, usuario_id: int, rol_id: int) -> UsuarioRol:
    value = UsuarioRol(usuario_id=usuario_id, rol_id=rol_id)
    db.add(value)
    db.commit()
    db.refresh(value)
    return value


def delete(db: Session, usuario_id: int, rol_id: int) -> bool:
    value = db.get(UsuarioRol, (usuario_id, rol_id))
    if value is None:
        return False
    db.delete(value)
    db.commit()
    return True
