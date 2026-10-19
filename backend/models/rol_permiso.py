from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.bases import Base


class RolPermiso(Base):
    __tablename__ = "rol_permiso"

    rol_id: Mapped[int] = mapped_column(
        ForeignKey("rol.id", ondelete="CASCADE"), primary_key=True
    )
    permiso_id: Mapped[int] = mapped_column(
        ForeignKey("permiso.id", ondelete="CASCADE"), primary_key=True
    )

    rol = relationship("Rol", back_populates="rol_permisos")
    permiso = relationship("Permiso", back_populates="rol_permisos")
