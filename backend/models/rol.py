from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.bases import Base


class Rol(Base):
    __tablename__ = "rol"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre_rol: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)

    usuario_roles = relationship(
        "UsuarioRol", back_populates="rol", cascade="all, delete-orphan"
    )
    rol_permisos = relationship(
        "RolPermiso", back_populates="rol", cascade="all, delete-orphan"
    )
