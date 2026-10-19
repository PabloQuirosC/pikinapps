from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.dependencies import get_current_user, get_db
from schemas.schemas import PermisoCreate, PermisoResponse, PermisoUpdate
from service.permiso.permiso_service import (
    create_permiso,
    delete_permiso,
    get_all_permisos,
    get_permiso,
    update_permiso,
)
from utils.auth_middleware import requiere_modulo

router = APIRouter(prefix="/permisos", tags=["Permisos"])


@router.get("/", response_model=list[PermisoResponse])
def list_permissions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("permisos")(current_user)
    return get_all_permisos(db, skip, limit)


@router.get("/{permiso_id}", response_model=PermisoResponse)
def get_permission(
    permiso_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("permisos")(current_user)
    return get_permiso(db, permiso_id)


@router.post("/", response_model=PermisoResponse, status_code=status.HTTP_201_CREATED)
def create_permission(
    data: PermisoCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("permisos", "write")(current_user)
    return create_permiso(db, data)


@router.put("/{permiso_id}", response_model=PermisoResponse)
def update_permission(
    permiso_id: int,
    data: PermisoUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("permisos", "write")(current_user)
    return update_permiso(db, permiso_id, data)


@router.delete("/{permiso_id}")
def delete_permission(
    permiso_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("permisos", "write")(current_user)
    return delete_permiso(db, permiso_id)
