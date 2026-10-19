from fastapi import HTTPException
from sqlalchemy.orm import Session

from repository.rol import rol_repository
from schemas.schemas import RolCreate, RolResponse, RolUpdate


def create_rol(db: Session, data: RolCreate) -> RolResponse:
    if rol_repository.get_rol_by_nombre(db, data.nombre_rol):
        raise HTTPException(status_code=409, detail="El rol ya existe.")
    return RolResponse.model_validate(rol_repository.create_rol(db, data.model_dump()))


def get_rol(db: Session, rol_id: int) -> RolResponse:
    value = rol_repository.get_rol_by_id(db, rol_id)
    if not value:
        raise HTTPException(status_code=404, detail="Rol no encontrado.")
    return RolResponse.model_validate(value)


def get_all_roles(db: Session, skip: int = 0, limit: int = 100):
    return [RolResponse.model_validate(value) for value in rol_repository.get_all_roles(db, skip, limit)]


def update_rol(db: Session, rol_id: int, data: RolUpdate) -> RolResponse:
    value = rol_repository.update_rol(db, rol_id, data.model_dump(exclude_unset=True))
    if not value:
        raise HTTPException(status_code=404, detail="Rol no encontrado.")
    return RolResponse.model_validate(value)


def delete_rol(db: Session, rol_id: int) -> dict:
    if not rol_repository.delete_rol(db, rol_id):
        raise HTTPException(status_code=404, detail="Rol no encontrado.")
    return {"message": "Rol eliminado exitosamente."}
