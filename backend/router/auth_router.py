from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.dependencies import get_db, get_current_user
from schemas.schemas import LoginRequest, TokenResponse
from service.auth.auth_service import authenticate_user, create_access_token
from utils.logger import get_logger

router = APIRouter(prefix="/auth", tags=["Autenticación"])
logger = get_logger(__name__)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    logger.info("Solicitud de inicio de sesión recibida para: %s", data.usuario)
    user = authenticate_user(db, data.usuario, data.contrasena)
    logger.info("Token generado para user_id=%s", user.id)
    return TokenResponse(access_token=create_access_token(db, user))


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    logger.info("Consulta de sesión actual para user_id=%s", current_user.get("user_id"))
    return current_user
