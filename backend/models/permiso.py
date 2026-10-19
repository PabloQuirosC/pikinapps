from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.bases import Base


class Permiso(Base):
    __tablename__ = "permiso"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre_permiso: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    modulo: Mapped[str | None] = mapped_column(String(100))

    rol_permisos = relationship(
        "RolPermiso", back_populates="permiso", cascade="all, delete-orphan"
    )
