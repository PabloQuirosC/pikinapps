from sqlalchemy import Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.bases import Base


class Empresa(Base):
    __tablename__ = "empresa"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    owner_name: Mapped[str] = mapped_column(String(150), nullable=False)
    company_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(String(150), nullable=False)
    hero_title: Mapped[str] = mapped_column(String(255), nullable=False)
    hero_rotating: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    hero_subtitle: Mapped[str] = mapped_column(Text, nullable=False)
    mission: Mapped[str] = mapped_column(Text, nullable=False)
    vision: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    whatsapp: Mapped[str] = mapped_column(String(50), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
