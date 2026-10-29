from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.empresa import Empresa
from models.experiencia import Experiencia
from models.habilidad import Habilidad
from schemas.schemas import (
    EmpresaResponse,
    EmpresaUpdate,
    ExperienciaResponse,
    HabilidadResponse,
)


def _response(db: Session, empresa: Empresa) -> EmpresaResponse:
    data = EmpresaResponse.model_validate(empresa)
    data.experience = [
        ExperienciaResponse.model_validate(row)
        for row in db.query(Experiencia).order_by(Experiencia.id).all()
    ]
    data.skills = [
        HabilidadResponse.model_validate(row)
        for row in db.query(Habilidad).order_by(Habilidad.id).all()
    ]
    return data


def get_empresa(db: Session) -> EmpresaResponse:
    empresa = db.query(Empresa).filter(Empresa.id == 1).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La configuración de empresa todavía no está disponible.",
        )
    return _response(db, empresa)


def update_empresa(db: Session, data: EmpresaUpdate) -> EmpresaResponse:
    empresa = db.query(Empresa).filter(Empresa.id == 1).first()
    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La configuración de empresa todavía no está disponible.",
        )

    values = data.model_dump(exclude_unset=True)
    experience = values.pop("experience", None)
    skills = values.pop("skills", None)
    for field, value in values.items():
        setattr(empresa, field, value)

    if experience is not None:
        db.query(Experiencia).delete()
        db.add_all(Experiencia(**item) for item in experience)
    if skills is not None:
        db.query(Habilidad).delete()
        db.add_all(Habilidad(**item) for item in skills)

    db.commit()
    db.refresh(empresa)
    return _response(db, empresa)
