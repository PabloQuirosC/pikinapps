from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.dependencies import get_current_user, get_db
from schemas.schemas import RolCreate, RolResponse, RolUpdate
from service.rol.rol_service import (
    create_rol,
    delete_rol,
    get_all_roles,
    get_rol,
    update_rol,
)
from utils.auth_middleware import requiere_modulo

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("/", response_model=list[RolResponse])
def list_roles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("roles")(current_user)
    return get_all_roles(db, skip, limit)


@router.get("/{rol_id}", response_model=RolResponse)
def get_role(
    rol_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("roles")(current_user)
    return get_rol(db, rol_id)


@router.post("/", response_model=RolResponse, status_code=status.HTTP_201_CREATED)
def create_role(
    data: RolCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("roles", "write")(current_user)
    return create_rol(db, data)


@router.put("/{rol_id}", response_model=RolResponse)
def update_role(
    rol_id: int,
    data: RolUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("roles", "write")(current_user)
    return update_rol(db, rol_id, data)


@router.delete("/{rol_id}")
def delete_role(
    rol_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("roles", "write")(current_user)
    return delete_rol(db, rol_id)
