from fastapi import HTTPException
from sqlalchemy.orm import Session

from repository.permiso import permiso_repository
from schemas.schemas import PermisoCreate, PermisoResponse, PermisoUpdate


def create_permiso(db: Session, data: PermisoCreate) -> PermisoResponse:
    if permiso_repository.get_permiso_by_nombre(db, data.nombre_permiso):
        raise HTTPException(status_code=409, detail="El permiso ya existe.")
    return PermisoResponse.model_validate(
        permiso_repository.create_permiso(db, data.model_dump())
    )


def get_permiso(db: Session, permiso_id: int) -> PermisoResponse:
    value = permiso_repository.get_permiso_by_id(db, permiso_id)
    if not value:
        raise HTTPException(status_code=404, detail="Permiso no encontrado.")
    return PermisoResponse.model_validate(value)


def get_all_permisos(db: Session, skip: int = 0, limit: int = 100):
    return [
        PermisoResponse.model_validate(value)
        for value in permiso_repository.get_all_permisos(db, skip, limit)
    ]


def update_permiso(db: Session, permiso_id: int, data: PermisoUpdate) -> PermisoResponse:
    value = permiso_repository.update_permiso(
        db, permiso_id, data.model_dump(exclude_unset=True)
    )
    if not value:
        raise HTTPException(status_code=404, detail="Permiso no encontrado.")
    return PermisoResponse.model_validate(value)


def delete_permiso(db: Session, permiso_id: int) -> dict:
    if not permiso_repository.delete_permiso(db, permiso_id):
        raise HTTPException(status_code=404, detail="Permiso no encontrado.")
    return {"message": "Permiso eliminado exitosamente."}
