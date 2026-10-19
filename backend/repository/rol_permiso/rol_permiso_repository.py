from sqlalchemy.orm import Session

from models.rol_permiso import RolPermiso


def get_by_rol(db: Session, rol_id: int) -> list[RolPermiso]:
    return db.query(RolPermiso).filter(RolPermiso.rol_id == rol_id).all()


def get_by_permiso(db: Session, permiso_id: int) -> list[RolPermiso]:
    return db.query(RolPermiso).filter(RolPermiso.permiso_id == permiso_id).all()


def create(db: Session, rol_id: int, permiso_id: int) -> RolPermiso:
    value = RolPermiso(rol_id=rol_id, permiso_id=permiso_id)
    db.add(value)
    db.commit()
    db.refresh(value)
    return value


def delete(db: Session, rol_id: int, permiso_id: int) -> bool:
    value = db.get(RolPermiso, (rol_id, permiso_id))
    if value is None:
        return False
    db.delete(value)
    db.commit()
    return True
