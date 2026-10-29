from fastapi import HTTPException, status

from .logger import get_logger

logger = get_logger(__name__)


def requiere_modulo(modulo: str, tipo: str = "read"):
    def validator(current_user: dict):
        permisos = current_user.get("permisos", [])
        matches = [
            item for item in permisos
            if item.get("modulo") == modulo
            or item.get("permiso", "").lower() in {modulo.lower(), f"{modulo}:read", f"{modulo}:write"}
        ]
        if not matches:
            logger.warning(
                "Intento de acceso sin permisos: modulo=%s user_id=%s",
                modulo,
                current_user.get("user_id"),
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tiene acceso al módulo {modulo}.",
            )
        if tipo == "write" and not any(
            item.get("permiso", "").lower() in {"write", f"{modulo.lower()}:write"}
            for item in matches
        ):
            logger.warning(
                "Intento de escritura sin permisos: modulo=%s user_id=%s",
                modulo,
                current_user.get("user_id"),
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tiene permisos de escritura en el módulo {modulo}.",
            )
        return True

    return validator
