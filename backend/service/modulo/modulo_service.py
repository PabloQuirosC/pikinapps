from fastapi import HTTPException
from sqlalchemy.orm import Session

from repository.modulo import modulo_repository
from schemas.schemas import ModuloCreate, ModuloResponse, ModuloUpdate


def list_modulos(db: Session, skip: int = 0, limit: int = 100):
    return [
        ModuloResponse.model_validate(value)
        for value in modulo_repository.get_all(db, skip, limit)
    ]


def get_modulo(db: Session, modulo_id: int):
    value = modulo_repository.get_by_id(db, modulo_id)
    if not value:
        raise HTTPException(status_code=404, detail="Módulo no encontrado.")
    return ModuloResponse.model_validate(value)


def create_modulo(db: Session, data: ModuloCreate):
    return ModuloResponse.model_validate(
        modulo_repository.create(db, data.model_dump())
    )


def update_modulo(db: Session, modulo_id: int, data: ModuloUpdate):
    value = modulo_repository.update(db, modulo_id, data.model_dump(exclude_unset=True))
    if not value:
        raise HTTPException(status_code=404, detail="Módulo no encontrado.")
    return ModuloResponse.model_validate(value)


def delete_modulo(db: Session, modulo_id: int):
    if not modulo_repository.delete(db, modulo_id):
        raise HTTPException(status_code=404, detail="Módulo no encontrado.")
    return {"message": "Módulo eliminado exitosamente."}
