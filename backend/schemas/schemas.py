from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    usuario: str = Field(min_length=1, max_length=100)
    contrasena: str = Field(min_length=1, max_length=255)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    apellido: str = Field(min_length=1, max_length=100)
    email: EmailStr
    nombre_usuario: str = Field(min_length=1, max_length=100)
    contrasena: str = Field(min_length=8, max_length=255)
    pais: str | None = Field(default=None, max_length=10)
    activo: bool = True


class UsuarioUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    apellido: str | None = Field(default=None, min_length=1, max_length=100)
    email: EmailStr | None = None
    contrasena: str | None = Field(default=None, min_length=8, max_length=255)
    pais: str | None = Field(default=None, max_length=10)
    activo: bool | None = None


class UsuarioResponse(SchemaBase):
    id: int
    nombre: str
    apellido: str
    email: EmailStr
    nombre_usuario: str
    pais: str | None
    activo: bool
    fecha_ultimo_login: datetime | None


class RolCreate(BaseModel):
    nombre_rol: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None


class RolUpdate(BaseModel):
    nombre_rol: str | None = Field(default=None, min_length=1, max_length=100)
    descripcion: str | None = None


class RolResponse(SchemaBase):
    id: int
    nombre_rol: str
    descripcion: str | None


class PermisoCreate(BaseModel):
    nombre_permiso: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None
    modulo: str | None = Field(default=None, max_length=100)


class PermisoUpdate(BaseModel):
    nombre_permiso: str | None = Field(default=None, min_length=1, max_length=100)
    descripcion: str | None = None
    modulo: str | None = Field(default=None, max_length=100)


class PermisoResponse(SchemaBase):
    id: int
    nombre_permiso: str
    descripcion: str | None
    modulo: str | None


class ModuloCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None
    activo: bool = True


class ModuloUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    descripcion: str | None = None
    activo: bool | None = None


class ModuloResponse(SchemaBase):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool


class AsignarRolRequest(BaseModel):
    usuario_id: int
    rol_id: int


class AsignarPermisoRequest(BaseModel):
    rol_id: int
    permiso_id: int


class RelationResponse(BaseModel):
    usuario_id: int | None = None
    rol_id: int
    permiso_id: int | None = None
