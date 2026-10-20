import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import {
  Archive, ArrowLeft, Building2, Check, Inbox, LayoutDashboard, Loader2, LogOut, Mail,
  Moon, Send, Sun, Trash2, Users as UsersIcon, type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useModal } from "@/components/modal/ModalProvider";
import { useAuth, can } from "@/store/auth";
import { useSite } from "@/store/site";
import type { Message, MessageStatus } from "@/types";

type Panel = "resumen" | "mensajes" | "empresa" | "usuarios";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panel de control — PikinApps" },
      { name: "description", content: "Administración del sitio: mensajes, contenido y cuentas." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});

const roleLabel = { admin: "Administrador", editor: "Editor/a", lector: "Lector" } as const;

function Admin() {
  const { session, hydrated, initialize, logout } = useAuth();
  const { theme, toggleTheme } = useSite();
  const modal = useModal();
  const navigate = useNavigate();
  const [panel, setPanel] = useState<Panel>("resumen");

  useEffect(() => { void initialize(); }, [initialize]);

  const nav: { id: Panel; label: string; Icon: LucideIcon; needs?: "ver_usuarios" }[] = [
    { id: "resumen", label: "Resumen", Icon: LayoutDashboard },
    { id: "mensajes", label: "Mensajes", Icon: Inbox },
    { id: "empresa", label: "Mi empresa", Icon: Building2 },
    { id: "usuarios", label: "Cuentas", Icon: UsersIcon, needs: "ver_usuarios" },
  ];

  const exit = async () => {
    if (await modal.confirm({ title: "¿Cerrar sesión?", message: "Volverás al sitio público.", confirmText: "Salir" })) {
      await logout();
      await navigate({ to: "/" });
    }
  };

  if (!hydrated)
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="grain flex min-h-screen flex-col lg:flex-row">
      {/* Barra lateral */}
      <aside className="glass w-full shrink-0 border-b p-5 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between lg:block">
          <Link to="/" className="font-display text-lg font-bold">
            PikinApps<span className="text-gradient">.</span>
          </Link>
          <div className="mt-1 text-xs text-muted-foreground lg:mt-2">
            {session.name} · {roleLabel[session.role]}
          </div>
        </div>
        <nav className="mt-6 flex gap-1 overflow-x-auto lg:flex-col lg:mt-8">
          {nav
            .filter((n) => !n.needs || can(session.role, n.needs))
            .map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setPanel(id)}
                className={`inline-flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  panel === id ? "bg-gradient-brand text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
        </nav>
        <div className="mt-6 flex gap-2 border-t pt-5 lg:absolute lg:bottom-6 lg:left-5 lg:right-5 lg:mt-0">
          <button onClick={toggleTheme} className="grid size-10 place-items-center rounded-full border hover:bg-muted" aria-label="Cambiar tema">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button onClick={exit} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium hover:bg-muted">
            <LogOut className="size-4" /> Salir
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="min-w-0 flex-1 p-6 lg:p-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Ir al sitio
        </Link>
        {panel === "resumen" && <Resumen onGo={setPanel} />}
        {panel === "mensajes" && <Mensajes />}
        {panel === "empresa" && <Empresa readOnly={!can(session.role, "editar_contenido")} />}
        {panel === "usuarios" && <Cuentas readOnly={!can(session.role, "editar_usuarios")} />}
      </main>
    </div>
  );
}

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </header>
  );
}

function Resumen({ onGo }: { onGo: (p: Panel) => void }) {
  const messages = useSite((s) => s.messages);
  const projects = useSite((s) => s.projects);
  const newCount = messages.filter((m) => m.status === "new").length;
  const cards = [
    { label: "Mensajes nuevos", value: newCount, action: () => onGo("mensajes") },
    { label: "Mensajes totales", value: messages.length, action: () => onGo("mensajes") },
    { label: "Proyectos publicados", value: projects.filter((p) => p.status === "published").length, action: undefined },
  ];
  return (
    <>
      <Head title="Resumen" sub="Lo que está pasando en tu sitio." />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={c.action}
            disabled={!c.action}
            className="glass rounded-3xl p-6 text-left transition hover:-translate-y-0.5 hover:shadow-glow disabled:hover:translate-y-0"
          >
            <p className="text-eyebrow">{c.label}</p>
            <p className="mt-3 font-display text-4xl font-bold">{c.value}</p>
          </button>
        ))}
      </div>
      <div className="mt-10">
        <p className="text-eyebrow mb-4">Últimos mensajes</p>
        {messages.length === 0 ? (
          <p className="glass rounded-3xl p-8 text-sm text-muted-foreground">
            Todavía no hay mensajes. Envía el formulario de contacto desde el sitio para verlo aparecer aquí.
          </p>
        ) : (
          <ul className="glass divide-y divide-border rounded-3xl">
            {messages.slice(0, 5).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{m.subject}</span>
                  <span className="block truncate text-xs text-muted-foreground">{m.name} · {m.email}</span>
                </span>
                <button onClick={() => onGo("mensajes")} className="shrink-0 rounded-full border px-4 py-2 text-xs font-medium hover:bg-muted">
                  Ver
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

const statusLabel: Record<MessageStatus, string> = { new: "Nuevo", read: "Leído", replied: "Respondido", archived: "Archivado", spam: "Spam" };
const statusCls: Record<MessageStatus, string> = {
  new: "bg-primary/15 text-primary",
  read: "bg-muted text-foreground",
  replied: "bg-success/15 text-success",
  archived: "bg-muted text-muted-foreground",
  spam: "bg-destructive/15 text-destructive",
};

function Mensajes() {
  const { messages, setMessageStatus, deleteMessage } = useSite();
  const modal = useModal();
  const [filter, setFilter] = useState<"all" | MessageStatus>("all");
  const [sel, setSel] = useState<string | null>(null);

  const list = useMemo(() => (filter === "all" ? messages : messages.filter((m) => m.status === filter)), [messages, filter]);
  const open: Message | undefined = messages.find((m) => m.id === sel);

  const remove = async (m: Message) => {
    if (await modal.confirm({ title: "¿Eliminar mensaje?", message: `El mensaje de ${m.name} se borrará de este navegador.`, confirmText: "Eliminar", danger: true })) {
      deleteMessage(m.id);
      if (sel === m.id) setSel(null);
    }
  };

  return (
    <>
      <Head title="Mensajes" sub="Los que llegan por el formulario de contacto." />
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "new", "read", "replied", "archived", "spam"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${filter === f ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}
          >
            {f === "all" ? "Todos" : statusLabel[f]}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="glass rounded-3xl p-8 text-sm text-muted-foreground">No hay mensajes en esta vista.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <ul className="glass max-h-[32rem] divide-y divide-border overflow-y-auto rounded-3xl">
            {list.map((m) => (
              <li key={m.id}>
                <button onClick={() => { setSel(m.id); if (m.status === "new") setMessageStatus(m.id, "read"); }}
                  className={`w-full px-5 py-4 text-left transition hover:bg-muted ${sel === m.id ? "bg-muted" : ""}`}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate font-medium">{m.subject}</span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${statusCls[m.status]}`}>{statusLabel[m.status]}</span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{m.name} · {m.email}</span>
                </button>
              </li>
            ))}
          </ul>

          {open ? (
            <div className="glass h-fit rounded-3xl p-6">
              <p className="text-eyebrow">{statusLabel[open.status]}</p>
              <h2 className="mt-2 font-display text-xl font-bold">{open.subject}</h2>
              <p className="mt-4 text-sm leading-relaxed">{open.message}</p>
              <dl className="mt-6 grid gap-2 border-t pt-5 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Nombre</dt><dd>{open.name}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Correo</dt><dd className="truncate">{open.email}</dd></div>
                {open.phone && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Teléfono</dt><dd>{open.phone}</dd></div>}
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Proyecto</dt><dd>{open.projectType}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Presupuesto</dt><dd>{open.budget}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Fecha</dt><dd>{new Date(open.createdAt).toLocaleString("es")}</dd></div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject)}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
                  <Mail className="size-4" /> Responder
                </a>
                <button onClick={() => setMessageStatus(open.id, "replied")} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted">
                  <Check className="size-4" /> Marcado como respondido
                </button>
                <button onClick={() => setMessageStatus(open.id, "archived")} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted">
                  <Archive className="size-4" /> Archivar
                </button>
                <button onClick={() => remove(open)} className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-4" /> Eliminar
                </button>
              </div>
            </div>
          ) : (
            <p className="glass grid place-items-center rounded-3xl p-8 text-sm text-muted-foreground">Elige un mensaje de la lista.</p>
          )}
        </div>
      )}
    </>
  );
}

function Empresa({ readOnly }: { readOnly: boolean }) {
  const { company, updateCompany } = useSite();
  const modal = useModal();
  const [draft, setDraft] = useState(company);
  const dirty = JSON.stringify(draft) !== JSON.stringify(company);

  const fields: { key: keyof typeof draft; label: string }[] = [
    { key: "ownerName", label: "Tu nombre" },
    { key: "companyName", label: "Nombre de la empresa" },
    { key: "role", label: "Puesto" },
    { key: "heroTitle", label: "Titular principal" },
    { key: "heroSubtitle", label: "Subtítulo" },
    { key: "mission", label: "Misión" },
    { key: "vision", label: "Visión" },
    { key: "email", label: "Correo de contacto" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "location", label: "Ubicación" },
  ];

  const save = async () => {
    if (!draft.companyName.trim() || !draft.ownerName.trim()) {
      await modal.error({ title: "Faltan datos", message: "El nombre y el nombre de la empresa no pueden quedar vacíos." });
      return;
    }
    updateCompany(draft);
    await modal.success({ title: "Guardado", message: "Los cambios ya se ven en el sitio público." });
  };

  return (
    <>
      <Head title="Mi empresa" sub="Estos textos alimentan la portada, el pie de página y el contacto." />
      <div className="grid gap-5 rounded-3xl border p-6 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className={f.key === "heroSubtitle" || f.key === "mission" || f.key === "vision" ? "sm:col-span-2 block" : "block"}>
            <span className="mb-2 block text-sm font-medium">{f.label}</span>
            {f.key === "heroSubtitle" || f.key === "mission" || f.key === "vision" ? (
              <textarea rows={2} disabled={readOnly} value={draft[f.key] as string}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                className="w-full rounded-2xl border bg-background/50 px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:opacity-60" />
            ) : (
              <input disabled={readOnly} value={draft[f.key] as string}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                className="w-full rounded-2xl border bg-background/50 px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:opacity-60" />
            )}
          </label>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button onClick={save} disabled={readOnly || !dirty}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50">
          <Send className="size-4" /> Guardar cambios
        </button>
        <button onClick={() => setDraft(company)} disabled={readOnly || !dirty} className="rounded-full border px-6 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50">
          Descartar
        </button>
        {readOnly && <span className="text-xs text-muted-foreground">Tu cuenta es de solo lectura.</span>}
      </div>
    </>
  );
}

function Cuentas({ readOnly }: { readOnly: boolean }) {
  const { accounts, session } = useAuth();
  const { company } = useSite();
  return (
    <>
      <Head title="Cuentas" sub={`Quién puede entrar al panel de ${company.companyName}.`} />
      <ul className="glass divide-y divide-border rounded-3xl">
        {accounts.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <span className="min-w-0">
              <span className="block truncate font-medium">
                {a.name} {a.id === session?.userId && <span className="text-xs text-primary">· tú</span>}
              </span>
              <span className="block truncate text-xs text-muted-foreground">{a.email}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${a.active ? "bg-muted" : "bg-destructive/15 text-destructive"}`}>
                {roleLabel[a.role]}
              </span>
              <span className={`text-xs ${a.active ? "text-success" : "text-muted-foreground"}`}>{a.active ? "Activa" : "Desactivada"}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        {readOnly ? "Solo un administrador puede crear o cambiar cuentas." : "Crear y editar cuentas llegará en el siguiente paso de esta fase."}
      </p>
    </>
  );
}
