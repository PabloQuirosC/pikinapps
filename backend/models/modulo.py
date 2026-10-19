from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.bases import Base


class Modulo(Base):
    __tablename__ = "modulo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
