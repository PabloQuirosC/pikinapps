from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.bases import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    nombre_usuario: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    pais: Mapped[str | None] = mapped_column(String(10))
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_ultimo_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    usuario_roles = relationship(
        "UsuarioRol", back_populates="usuario", cascade="all, delete-orphan"
    )
