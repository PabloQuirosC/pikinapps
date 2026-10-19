from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.dependencies import get_db, get_current_user
from schemas.schemas import LoginRequest, TokenResponse
from service.auth.auth_service import authenticate_user, create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.usuario, data.contrasena)
    return TokenResponse(access_token=create_access_token(db, user))


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user
