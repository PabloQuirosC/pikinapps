const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const TOKEN_KEY = "pikinapps_access_token";
let pendingRequests = 0;

interface ApiErrorBody {
  detail?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface MeResponse {
  user_id: number;
  sub: string;
  nombre?: string;
  email?: string;
  role?: string;
  permisos: Array<{ modulo: string; permiso: string }>;
}

export interface UserResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  nombre_usuario: string;
  rol?: string | null;
  pais: string | null;
  activo: boolean;
  fecha_ultimo_login: string | null;
}

export interface RoleResponse {
  id: number;
  nombre_rol: string;
  descripcion: string | null;
}

export interface PermissionResponse {
  id: number;
  nombre_permiso: string;
  descripcion: string | null;
  modulo: string | null;
}

export interface CompanyResponse {
  id: number;
  owner_name: string;
  company_name: string;
  role: string;
  hero_title: string;
  hero_rotating: string[];
  hero_subtitle: string;
  mission: string;
  vision: string;
  email: string;
  whatsapp: string;
  location: string;
  experience?: ExperienceResponse[];
  skills?: SkillResponse[];
}

export interface ExperienceResponse {
  id: number;
  kind: "work" | "education" | "certification";
  title: string;
  org: string;
  start: string;
  end: string;
  description: string;
  visible: boolean;
}

export interface SkillResponse {
  id: number;
  name: string;
  level: number;
  visible: boolean;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", ["Bearer", token].join(" "));
  const tracksTransaction = (init.method ?? "GET").toUpperCase() !== "GET";

  if (tracksTransaction && typeof window !== "undefined") {
    pendingRequests += 1;
    window.dispatchEvent(new CustomEvent("pikinapps:request-count", { detail: pendingRequests }));
  }
  try {
    const response = await fetch(`${API_URL}${path}`, { ...init, headers });
    if (response.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pikinapps:session-expired"));
      }
    }
    if (!response.ok) {
      let message = `La API respondió con ${response.status}.`;
      try {
        const body = (await response.json()) as ApiErrorBody;
        if (body.detail) message = body.detail;
      } catch {
        // El backend puede responder sin JSON en errores de infraestructura.
      }
      throw new Error(message);
    }
    return (await response.json()) as T;
  } finally {
    if (tracksTransaction && typeof window !== "undefined") {
      pendingRequests = Math.max(0, pendingRequests - 1);
      window.dispatchEvent(new CustomEvent("pikinapps:request-count", { detail: pendingRequests }));
    }
  }
}

export function getPendingRequests(): number {
  return pendingRequests;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export const api = {
  login: (usuario: string, contrasena: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ usuario, contrasena }),
    }),
  me: () => request<MeResponse>("/api/auth/me"),
  users: () => request<UserResponse[]>("/api/usuarios/"),
  roles: () => request<RoleResponse[]>("/api/roles/"),
  permissions: () => request<PermissionResponse[]>("/api/permisos/"),
  company: () => request<CompanyResponse>("/api/empresa/"),
  updateCompany: (data: Omit<CompanyResponse, "id">) =>
    request<CompanyResponse>("/api/empresa/", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  userRoles: (userId: number) =>
    request<RoleResponse[]>(`/api/relaciones/usuarios-roles/${userId}`),
  assignUserRole: (userId: number, roleId: number) =>
    request<{ usuario_id: number; rol_id: number }>("/api/relaciones/usuarios-roles", {
      method: "POST",
      body: JSON.stringify({ usuario_id: userId, rol_id: roleId }),
    }).catch((error: unknown) => {
      if (error instanceof Error && error.message === "La relación ya existe.") {
        return { usuario_id: userId, rol_id: roleId };
      }
      throw error;
    }),
  removeUserRole: (userId: number, roleId: number) =>
    request<{ message: string }>(`/api/relaciones/usuarios-roles/${userId}/${roleId}`, {
      method: "DELETE",
    }),
  createUser: (data: {
    nombre: string;
    apellido: string;
    email: string;
    nombre_usuario: string;
    contrasena: string;
    pais?: string;
    activo?: boolean;
  }) =>
    request<UserResponse>("/api/usuarios/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createRole: (data: { nombre_rol: string; descripcion?: string }) =>
    request<RoleResponse>("/api/roles/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createPermission: (data: { nombre_permiso: string; descripcion?: string; modulo?: string }) =>
    request<PermissionResponse>("/api/permisos/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id: number, data: Record<string, unknown>) =>
    request<UserResponse>(`/api/usuarios/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id: number) =>
    request<{ message: string }>(`/api/usuarios/${id}`, { method: "DELETE" }),
  updateRole: (id: number, data: { nombre_rol?: string; descripcion?: string }) =>
    request<RoleResponse>(`/api/roles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteRole: (id: number) =>
    request<{ message: string }>(`/api/roles/${id}`, { method: "DELETE" }),
  updatePermission: (
    id: number,
    data: { nombre_permiso?: string; descripcion?: string; modulo?: string },
  ) =>
    request<PermissionResponse>(`/api/permisos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePermission: (id: number) =>
    request<{ message: string }>(`/api/permisos/${id}`, { method: "DELETE" }),
};
