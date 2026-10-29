from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.dependencies import get_current_user, get_db
from schemas.schemas import EmpresaResponse, EmpresaUpdate
from service.empresa_service import get_empresa, update_empresa
from utils.auth_middleware import requiere_modulo

router = APIRouter(prefix="/empresa", tags=["Empresa"])


@router.get("/", response_model=EmpresaResponse)
def read_empresa(db: Session = Depends(get_db)):
    return get_empresa(db)


@router.put("/", response_model=EmpresaResponse)
def save_empresa(
    data: EmpresaUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") not in {"admin", "editor"}:
        requiere_modulo("empresa", "write")(current_user)
    return update_empresa(db, data)
