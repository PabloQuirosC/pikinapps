from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.bases import Base


class Experiencia(Base):
    __tablename__ = "experiencia"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    kind: Mapped[str] = mapped_column(String(30), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    org: Mapped[str] = mapped_column(String(150), nullable=False)
    start: Mapped[str] = mapped_column(String(30), nullable=False)
    end: Mapped[str] = mapped_column(String(30), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
