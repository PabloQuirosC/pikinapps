from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.dependencies import get_current_user, get_db
from models.rol_permiso import RolPermiso
from models.usuario_rol import UsuarioRol
from schemas.schemas import AsignarPermisoRequest, AsignarRolRequest, RelationResponse
from utils.auth_middleware import requiere_modulo

router = APIRouter(prefix="/relaciones", tags=["Relaciones"])


@router.post("/usuarios-roles", response_model=RelationResponse, status_code=status.HTTP_201_CREATED)
def assign_role(
    data: AsignarRolRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("roles", "write")(current_user)
    relation = UsuarioRol(**data.model_dump())
    if db.get(UsuarioRol, (data.usuario_id, data.rol_id)):
        raise HTTPException(status_code=409, detail="La relación ya existe.")
    db.add(relation)
    db.commit()
    return RelationResponse(usuario_id=data.usuario_id, rol_id=data.rol_id)


@router.delete("/usuarios-roles/{usuario_id}/{rol_id}")
def remove_role(
    usuario_id: int,
    rol_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("roles", "write")(current_user)
    relation = db.get(UsuarioRol, (usuario_id, rol_id))
    if not relation:
        raise HTTPException(status_code=404, detail="La relación no existe.")
    db.delete(relation)
    db.commit()
    return {"message": "Rol removido del usuario."}


@router.post("/roles-permisos", response_model=RelationResponse, status_code=status.HTTP_201_CREATED)
def assign_permission(
    data: AsignarPermisoRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("permisos", "write")(current_user)
    relation = RolPermiso(**data.model_dump())
    if db.get(RolPermiso, (data.rol_id, data.permiso_id)):
        raise HTTPException(status_code=409, detail="La relación ya existe.")
    db.add(relation)
    db.commit()
    return RelationResponse(rol_id=data.rol_id, permiso_id=data.permiso_id)


@router.delete("/roles-permisos/{rol_id}/{permiso_id}")
def remove_permission(
    rol_id: int,
    permiso_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    requiere_modulo("permisos", "write")(current_user)
    relation = db.get(RolPermiso, (rol_id, permiso_id))
    if not relation:
        raise HTTPException(status_code=404, detail="La relación no existe.")
    db.delete(relation)
    db.commit()
    return {"message": "Permiso removido del rol."}
