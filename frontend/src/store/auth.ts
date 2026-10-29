import { create } from "zustand";
import { api, clearToken, getToken, setToken } from "@/lib/api";
import type { Account, Role, Session } from "@/types";

export type Action =
  | "ver_panel"
  | "ver_mensajes"
  | "editar_mensajes"
  | "editar_contenido"
  | "ver_usuarios"
  | "editar_usuarios";

const matrix: Record<Role, Action[]> = {
  admin: [
    "ver_panel",
    "ver_mensajes",
    "editar_mensajes",
    "editar_contenido",
    "ver_usuarios",
    "editar_usuarios",
  ],
  editor: ["ver_panel", "ver_mensajes", "editar_mensajes", "editar_contenido"],
  lector: ["ver_panel", "ver_mensajes"],
};

export const can = (role: Role | undefined, action: Action) =>
  role ? matrix[role].includes(action) : false;

function getRole(role: string | undefined): Role {
  return role === "admin" || role === "editor" || role === "lector" ? role : "lector";
}

function toSession(data: {
  user_id: number;
  sub: string;
  nombre?: string;
  email?: string;
  role?: string;
}): Session {
  return {
    userId: String(data.user_id),
    name: data.nombre ?? data.sub,
    email: data.email ?? "",
    role: getRole(data.role),
    at: new Date().toISOString(),
  };
}

function toAccount(session: Session): Account {
  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
    active: true,
  };
}

interface AuthState {
  accounts: Account[];
  session: Session | null;
  hydrated: boolean;
  initialize: () => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; reason?: "email" | "password" | "inactive" }>;
  logout: () => Promise<void>;
  expireSession: () => void;
}

let initialized = false;
let sessionListenerRegistered = false;
let sessionMonitorListenersRegistered = false;
let sessionMonitor: ReturnType<typeof setInterval> | null = null;
let sessionCheckInFlight = false;

function stopSessionMonitor(): void {
  if (sessionMonitor !== null) {
    clearInterval(sessionMonitor);
    sessionMonitor = null;
  }
}

function checkSession(): void {
  if (sessionCheckInFlight || !getToken()) return;
  sessionCheckInFlight = true;
  void api
    .me()
    .catch(() => {
      // Las respuestas 401 disparan el evento que limpia la sesión.
    })
    .finally(() => {
      sessionCheckInFlight = false;
    });
}

function startSessionMonitor(): void {
  if (typeof window === "undefined" || sessionMonitor !== null) return;
  sessionMonitor = setInterval(checkSession, 10000);
  if (!sessionMonitorListenersRegistered) {
    window.addEventListener("focus", checkSession);
    window.addEventListener("storage", (event) => {
      if (event.key === "pikinapps_access_token" && !event.newValue) {
        useAuth.getState().expireSession();
      }
    });
    sessionMonitorListenersRegistered = true;
  }
}

export const useAuth = create<AuthState>()((set) => ({
  accounts: [],
  session: null,
  hydrated: false,
  expireSession: () => {
    clearToken();
    stopSessionMonitor();
    initialized = false;
    set({ session: null, accounts: [], hydrated: true });
  },
  initialize: async () => {
    if (initialized) return;
    initialized = true;
    if (typeof window !== "undefined" && !sessionListenerRegistered) {
      window.addEventListener("pikinapps:session-expired", () => {
        useAuth.getState().expireSession();
      });
      sessionListenerRegistered = true;
    }
    const token = getToken();
    if (!token) {
      set({ hydrated: true });
      return;
    }
    try {
      const data = await api.me();
      const session = toSession(data);
      set({ session, accounts: [toAccount(session)], hydrated: true });
      startSessionMonitor();
    } catch {
      clearToken();
      set({ session: null, accounts: [], hydrated: true });
      initialized = false;
    }
  },
  login: async (email, password) => {
    try {
      const token = await api.login(email, password);
      setToken(token.access_token);
      const data = await api.me();
      const session = toSession(data);
      set({ session, accounts: [toAccount(session)] });
      startSessionMonitor();
      return { ok: true };
    } catch (error) {
      clearToken();
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      return {
        ok: false,
        reason: message.includes("activo")
          ? "inactive"
          : message.includes("usuario") || message.includes("correo")
            ? "email"
            : "password",
      };
    }
  },
  logout: async () => {
    clearToken();
    stopSessionMonitor();
    initialized = false;
    set({ session: null, accounts: [] });
  },
}));
