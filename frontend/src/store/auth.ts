import { create } from "zustand";
import type { AuthChangeEvent, Session as SupabaseSession, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Account, Role, Session } from "@/types";

export type Action = "ver_panel" | "ver_mensajes" | "editar_mensajes" | "editar_contenido" | "ver_usuarios" | "editar_usuarios";

const matrix: Record<Role, Action[]> = {
  admin: ["ver_panel", "ver_mensajes", "editar_mensajes", "editar_contenido", "ver_usuarios", "editar_usuarios"],
  editor: ["ver_panel", "ver_mensajes", "editar_mensajes", "editar_contenido"],
  lector: ["ver_panel", "ver_mensajes"],
};

export const can = (role: Role | undefined, action: Action) => (role ? matrix[role].includes(action) : false);

function getRole(user: User): Role {
  const role = user.user_metadata?.role;
  return role === "admin" || role === "editor" || role === "lector" ? role : "lector";
}

function toSession(user: User): Session {
  return {
    userId: user.id,
    name: user.user_metadata?.name ?? user.email ?? "Usuario",
    email: user.email ?? "",
    role: getRole(user),
    at: new Date().toISOString(),
  };
}

function toAccount(user: User): Account {
  const session = toSession(user);
  return { id: session.userId, name: session.name, email: session.email, role: session.role, active: true };
}

interface AuthState {
  accounts: Account[];
  session: Session | null;
  hydrated: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; reason?: "email" | "password" | "inactive" }>;
  logout: () => Promise<void>;
}

let initialized = false;

export const useAuth = create<AuthState>()((set) => ({
  accounts: [],
  session: null,
  hydrated: false,
  initialize: async () => {
    if (initialized) return;
    initialized = true;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      initialized = false;
      throw error;
    }
    if (data.session?.user) {
      set({ session: toSession(data.session.user), accounts: [toAccount(data.session.user)] });
    }
    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, authSession: SupabaseSession | null) => {
      const user = authSession?.user;
      set(user
        ? { session: toSession(user), accounts: [toAccount(user)] }
        : { session: null, accounts: [] });
    });
    set({ hydrated: true });
  },
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const reason = error.message.toLowerCase().includes("email") ? "email" : "password";
      return { ok: false, reason };
    }
    if (!data.user) return { ok: false, reason: "email" };
    set({ session: toSession(data.user), accounts: [toAccount(data.user)] });
    return { ok: true };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ session: null, accounts: [] });
  },
}));
