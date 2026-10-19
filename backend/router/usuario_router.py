from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.dependencies import get_current_user, get_db
from schemas.schemas import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from service.usuario.usuario_service import (
    create_usuario,
    delete_usuario,
    get_all_usuarios,
    get_usuario,
    update_usuario,
)
from utils.auth_middleware import requiere_modulo

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/", response_model=list[UsuarioResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("usuarios")(current_user)
    return get_all_usuarios(db, skip, limit)


@router.get("/{usuario_id}", response_model=UsuarioResponse)
def get_user(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("usuarios")(current_user)
    return get_usuario(db, usuario_id)


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    data: UsuarioCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("usuarios", "write")(current_user)
    return create_usuario(db, data)


@router.put("/{usuario_id}", response_model=UsuarioResponse)
def update_user(
    usuario_id: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("usuarios", "write")(current_user)
    return update_usuario(db, usuario_id, data)


@router.delete("/{usuario_id}")
def delete_user(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("usuarios", "write")(current_user)
    return delete_usuario(db, usuario_id)
