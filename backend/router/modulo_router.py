from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.dependencies import get_current_user, get_db
from schemas.schemas import ModuloCreate, ModuloResponse, ModuloUpdate
from service.modulo.modulo_service import (
    create_modulo,
    delete_modulo,
    get_modulo,
    list_modulos,
    update_modulo,
)
from utils.auth_middleware import requiere_modulo

router = APIRouter(prefix="/modulos", tags=["Módulos"])


@router.get("/", response_model=list[ModuloResponse])
def list_modules(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("modulos")(current_user)
    return list_modulos(db, skip, limit)


@router.get("/{modulo_id}", response_model=ModuloResponse)
def get_module(
    modulo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("modulos")(current_user)
    return get_modulo(db, modulo_id)


@router.post("/", response_model=ModuloResponse, status_code=status.HTTP_201_CREATED)
def create_module(
    data: ModuloCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("modulos", "write")(current_user)
    return create_modulo(db, data)


@router.put("/{modulo_id}", response_model=ModuloResponse)
def update_module(
    modulo_id: int,
    data: ModuloUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("modulos", "write")(current_user)
    return update_modulo(db, modulo_id, data)


@router.delete("/{modulo_id}")
def delete_module(
    modulo_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("modulos", "write")(current_user)
    return delete_modulo(db, modulo_id)
