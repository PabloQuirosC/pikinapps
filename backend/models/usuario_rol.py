from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.bases import Base


class UsuarioRol(Base):
    __tablename__ = "usuario_rol"

    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id", ondelete="CASCADE"), primary_key=True
    )
    rol_id: Mapped[int] = mapped_column(
        ForeignKey("rol.id", ondelete="CASCADE"), primary_key=True
    )

    usuario = relationship("Usuario", back_populates="usuario_roles")
    rol = relationship("Rol", back_populates="usuario_roles")
