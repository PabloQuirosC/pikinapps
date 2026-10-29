import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import {
  Archive,
  ArrowLeft,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Moon,
  Plus,
  Send,
  ShieldCheck,
  Sun,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useModal } from "@/components/modal/ModalProvider";
import { api, type PermissionResponse, type RoleResponse, type UserResponse } from "@/lib/api";
import { useAuth, can } from "@/store/auth";
import { useSite } from "@/store/site";
import type { Experience, ExperienceKind, Message, MessageStatus, Skill } from "@/types";

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

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const nav: { id: Panel; label: string; Icon: LucideIcon; needs?: "ver_usuarios" }[] = [
    { id: "resumen", label: "Resumen", Icon: LayoutDashboard },
    { id: "mensajes", label: "Mensajes", Icon: Inbox },
    { id: "empresa", label: "Mi empresa", Icon: Building2 },
    { id: "usuarios", label: "Cuentas", Icon: UsersIcon, needs: "ver_usuarios" },
  ];

  const exit = async () => {
    if (
      await modal.confirm({
        title: "¿Cerrar sesión?",
        message: "Volverás al sitio público.",
        confirmText: "Salir",
      })
    ) {
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
    <div className="admin-shell grain flex min-h-screen flex-col lg:h-screen lg:flex-row">
      {/* Barra lateral */}
      <aside className="admin-sidebar glass w-full shrink-0 border-b p-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-b-0">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link to="/" className="font-display text-lg font-bold">
              PikinApps<span className="text-gradient">.</span>
            </Link>
            <button
              onClick={exit}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold hover:bg-muted"
              title="Cerrar sesión"
            >
              <LogOut className="size-3.5" /> Salir
            </button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
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
                  panel === id
                    ? "bg-gradient-brand text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
        </nav>
        <div className="mt-auto flex gap-2 pt-5">
          <button
            onClick={toggleTheme}
            className="grid size-10 place-items-center rounded-full border hover:bg-muted"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="admin-main min-w-0 flex-1 p-6 lg:p-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
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
    {
      label: "Proyectos publicados",
      value: projects.filter((p) => p.status === "published").length,
      action: undefined,
    },
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
            Todavía no hay mensajes. Envía el formulario de contacto desde el sitio para verlo
            aparecer aquí.
          </p>
        ) : (
          <ul className="glass divide-y divide-border rounded-3xl">
            {messages.slice(0, 5).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{m.subject}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {m.name} · {m.email}
                  </span>
                </span>
                <button
                  onClick={() => onGo("mensajes")}
                  className="shrink-0 rounded-full border px-4 py-2 text-xs font-medium hover:bg-muted"
                >
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

const statusLabel: Record<MessageStatus, string> = {
  new: "Nuevo",
  read: "Leído",
  replied: "Respondido",
  archived: "Archivado",
  spam: "Spam",
};
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

  const list = useMemo(
    () => (filter === "all" ? messages : messages.filter((m) => m.status === filter)),
    [messages, filter],
  );
  const open: Message | undefined = messages.find((m) => m.id === sel);

  const remove = async (m: Message) => {
    if (
      await modal.confirm({
        title: "¿Eliminar mensaje?",
        message: `El mensaje de ${m.name} se borrará de este navegador.`,
        confirmText: "Eliminar",
        danger: true,
      })
    ) {
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
        <p className="glass rounded-3xl p-8 text-sm text-muted-foreground">
          No hay mensajes en esta vista.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <ul className="glass max-h-[32rem] divide-y divide-border overflow-y-auto rounded-3xl">
            {list.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => {
                    setSel(m.id);
                    if (m.status === "new") setMessageStatus(m.id, "read");
                  }}
                  className={`w-full px-5 py-4 text-left transition hover:bg-muted ${sel === m.id ? "bg-muted" : ""}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate font-medium">{m.subject}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${statusCls[m.status]}`}
                    >
                      {statusLabel[m.status]}
                    </span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {m.name} · {m.email}
                  </span>
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
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Nombre</dt>
                  <dd>{open.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Correo</dt>
                  <dd className="truncate">{open.email}</dd>
                </div>
                {open.phone && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Teléfono</dt>
                    <dd>{open.phone}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Proyecto</dt>
                  <dd>{open.projectType}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Presupuesto</dt>
                  <dd>{open.budget}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Fecha</dt>
                  <dd>{new Date(open.createdAt).toLocaleString("es")}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                <a
                  href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject)}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                >
                  <Mail className="size-4" /> Responder
                </a>
                <button
                  onClick={() => setMessageStatus(open.id, "replied")}
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <Check className="size-4" /> Marcado como respondido
                </button>
                <button
                  onClick={() => setMessageStatus(open.id, "archived")}
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <Archive className="size-4" /> Archivar
                </button>
                <button
                  onClick={() => remove(open)}
                  className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" /> Eliminar
                </button>
              </div>
            </div>
          ) : (
            <p className="glass grid place-items-center rounded-3xl p-8 text-sm text-muted-foreground">
              Elige un mensaje de la lista.
            </p>
          )}
        </div>
      )}
    </>
  );
}

function Empresa({ readOnly }: { readOnly: boolean }) {
  const { company, experience, skills, updateCompany, updateExperience, updateSkills } = useSite();
  const modal = useModal();
  const [draft, setDraft] = useState(company);
  const [activeTab, setActiveTab] = useState("Identidad");
  const [experienceDraft, setExperienceDraft] = useState<Experience[]>(experience);
  const [skillsDraft, setSkillsDraft] = useState<Skill[]>(skills);
  const [activeExperienceKind, setActiveExperienceKind] = useState<ExperienceKind>("work");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(company);
  const experienceDirty = JSON.stringify(experienceDraft) !== JSON.stringify(experience);
  const skillsDirty = JSON.stringify(skillsDraft) !== JSON.stringify(skills);

  useEffect(() => {
    setDraft(company);
  }, [company]);

  useEffect(() => {
    setExperienceDraft(experience);
  }, [experience]);

  useEffect(() => {
    setSkillsDraft(skills);
  }, [skills]);

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
  const fieldClass =
    "autofill-field w-full rounded-2xl border bg-transparent px-4 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60";
  const sections = [
    {
      eyebrow: "Identidad",
      title: "La marca detrás del trabajo",
      description: "Define cómo se presenta tu negocio y quién lidera la experiencia.",
      keys: ["ownerName", "companyName", "role"] as const,
    },
    {
      eyebrow: "Portada",
      title: "La primera impresión",
      description: "Estos mensajes aparecen en el encabezado principal del sitio.",
      keys: ["heroTitle", "heroSubtitle"] as const,
    },
    {
      eyebrow: "Dirección",
      title: "Lo que guía tu trabajo",
      description: "Comparte la misión y la visión que orientan tus proyectos.",
      keys: ["mission", "vision"] as const,
    },
    {
      eyebrow: "Contacto",
      title: "Canales para encontrarte",
      description: "Se muestran en el pie de página y en la sección de contacto.",
      keys: ["email", "whatsapp", "location"] as const,
    },
    {
      eyebrow: "Experiencia",
      title: "Tu recorrido profesional",
      description: "Administra los trabajos, estudios y certificaciones que aparecen en tu sitio.",
      keys: [] as const,
    },
    {
      eyebrow: "Habilidades",
      title: "Tus habilidades",
      description:
        "Administra las tecnologías y competencias que aparecen junto a tu recorrido profesional.",
      keys: [] as const,
    },
  ];

  const save = async () => {
    if (saving) return;
    setSaveMessage(null);
    if (!draft.companyName.trim() || !draft.ownerName.trim()) {
      await modal.error({
        title: "Faltan datos",
        message: "El nombre y el nombre de la empresa no pueden quedar vacíos.",
      });
      return;
    }
    setSaving(true);
    try {
      const saved = await api.updateCompany({
        owner_name: draft.ownerName,
        company_name: draft.companyName,
        role: draft.role,
        hero_title: draft.heroTitle,
        hero_rotating: draft.heroRotating,
        hero_subtitle: draft.heroSubtitle,
        mission: draft.mission,
        vision: draft.vision,
        email: draft.email,
        whatsapp: draft.whatsapp,
        location: draft.location,
        experience: experienceDraft.map(({ id: _id, ...item }) => item),
        skills: skillsDraft.map(({ id: _id, ...item }) => item),
      });
      updateCompany({
        ownerName: saved.owner_name,
        companyName: saved.company_name,
        role: saved.role,
        heroTitle: saved.hero_title,
        heroRotating: saved.hero_rotating,
        heroSubtitle: saved.hero_subtitle,
        mission: saved.mission,
        vision: saved.vision,
        email: saved.email,
        whatsapp: saved.whatsapp,
        location: saved.location,
      });
      updateExperience(
        saved.experience.map((item) => ({
          id: String(item.id),
          kind: item.kind,
          title: item.title,
          org: item.org,
          start: item.start,
          end: item.end,
          description: item.description,
          visible: item.visible,
        })),
      );
      updateSkills(
        saved.skills.map((item) => ({
          id: String(item.id),
          name: item.name,
          level: item.level,
          visible: item.visible,
        })),
      );
      await modal.success({
        title: "Guardado",
        message: "Los cambios se guardaron en el backend y ya se ven en el sitio público.",
      });
      setSaveMessage("Cambios guardados correctamente.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "La API no pudo guardar los cambios.";
      setSaveMessage(`No se pudo guardar: ${message}`);
      await modal.error({
        title: "No se pudo guardar",
        message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head
        title="Mi empresa"
        sub="Controla la identidad, el mensaje y los canales de contacto que ve tu audiencia."
      />
      <div className="glass overflow-hidden rounded-3xl shadow-card">
        <div className="flex flex-wrap gap-2 border-b p-3 sm:p-4">
          {sections.map((section) => (
            <button
              key={section.eyebrow}
              type="button"
              onClick={() => setActiveTab(section.eyebrow)}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                activeTab === section.eyebrow
                  ? "bg-gradient-brand text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="block text-[0.65rem] uppercase tracking-[0.18em] opacity-80">
                {section.eyebrow}
              </span>
              <span className="mt-1 block">{section.title}</span>
            </button>
          ))}
        </div>
        {sections
          .filter((section) => section.eyebrow === activeTab)
          .map((section) => (
            <section key={section.eyebrow} className="p-6 sm:p-7">
              <p className="text-eyebrow">{section.eyebrow}</p>
              <h2 className="mt-2 font-display text-xl font-bold">{section.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {section.description}
              </p>
              {section.eyebrow === "Habilidades" ? (
                <div className="mt-6 space-y-4">
                  {skillsDraft.map((skill, index) => (
                    <div key={skill.id} className="rounded-2xl border p-4">
                      <div className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
                        <label>
                          <span className="mb-2 block text-sm font-semibold">Habilidad</span>
                          <input
                            disabled={readOnly}
                            value={skill.name}
                            onChange={(e) =>
                              setSkillsDraft(
                                skillsDraft.map((current, currentIndex) =>
                                  currentIndex === index
                                    ? { ...current, name: e.target.value }
                                    : current,
                                ),
                              )
                            }
                            className={fieldClass}
                            placeholder="Ej. React / Next.js"
                          />
                        </label>
                        <label>
                          <span className="mb-2 block text-sm font-semibold">
                            Nivel: {skill.level}%
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            disabled={readOnly}
                            value={skill.level}
                            onChange={(e) =>
                              setSkillsDraft(
                                skillsDraft.map((current, currentIndex) =>
                                  currentIndex === index
                                    ? { ...current, level: Number(e.target.value) }
                                    : current,
                                ),
                              )
                            }
                            className="mt-3 w-full accent-[var(--color-primary)]"
                          />
                        </label>
                        <button
                          type="button"
                          disabled={readOnly}
                          onClick={() =>
                            setSkillsDraft(
                              skillsDraft.filter((_, currentIndex) => currentIndex !== index),
                            )
                          }
                          className="rounded-full border border-destructive/40 px-4 py-2 text-sm text-destructive disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                      <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          disabled={readOnly}
                          checked={skill.visible}
                          onChange={(e) =>
                            setSkillsDraft(
                              skillsDraft.map((current, currentIndex) =>
                                currentIndex === index
                                  ? { ...current, visible: e.target.checked }
                                  : current,
                              ),
                            )
                          }
                        />
                        Mostrar en el sitio público
                      </label>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-brand transition-all"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {skillsDraft.length === 0 && (
                    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                      No hay habilidades. Agrega la primera con el botón inferior.
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      setSkillsDraft([
                        ...skillsDraft,
                        {
                          id: `new-${Date.now()}`,
                          name: "",
                          level: 50,
                          visible: true,
                        },
                      ])
                    }
                    className="rounded-full border px-5 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50"
                  >
                    + Agregar habilidad
                  </button>
                </div>
              ) : section.eyebrow === "Experiencia" ? (
                <div className="mt-6 space-y-4">
                  <div
                    role="tablist"
                    aria-label="Categorías del recorrido profesional"
                    className="flex flex-wrap gap-2 rounded-2xl border bg-background/20 p-2"
                  >
                    {(
                      [
                        ["work", "Laboral"],
                        ["certification", "Certificaciones"],
                        ["education", "Educación"],
                      ] as const
                    ).map(([kind, label]) => (
                      <button
                        key={kind}
                        type="button"
                        role="tab"
                        aria-selected={activeExperienceKind === kind}
                        onClick={() => setActiveExperienceKind(kind)}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          activeExperienceKind === kind
                            ? "bg-gradient-brand text-primary-foreground shadow-glow"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {label}
                        <span className="ml-2 text-xs opacity-70">
                          {experienceDraft.filter((item) => item.kind === kind).length}
                        </span>
                      </button>
                    ))}
                  </div>
                  {experienceDraft
                    .map((item, index) => ({ item, index }))
                    .filter(({ item }) => item.kind === activeExperienceKind)
                    .map(({ item, index }) => (
                      <div key={item.id} className="rounded-2xl border p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label>
                            <span className="mb-2 block text-sm font-semibold">Tipo</span>
                            <select
                              disabled={readOnly}
                              value={item.kind}
                              onChange={(e) =>
                                setExperienceDraft(
                                  experienceDraft.map((current, currentIndex) =>
                                    currentIndex === index
                                      ? { ...current, kind: e.target.value as Experience["kind"] }
                                      : current,
                                  ),
                                )
                              }
                              className={`${fieldClass} admin-select`}
                            >
                              <option value="work">Laboral</option>
                              <option value="education">Educación</option>
                              <option value="certification">Certificación</option>
                            </select>
                          </label>
                          {(["title", "org", "start", "end"] as const).map((key) => (
                            <label key={key}>
                              <span className="mb-2 block text-sm font-semibold">
                                {key === "title"
                                  ? "Título"
                                  : key === "org"
                                    ? "Empresa o institución"
                                    : key === "start"
                                      ? "Desde"
                                      : "Hasta"}
                              </span>
                              <input
                                disabled={readOnly}
                                value={item[key]}
                                onChange={(e) =>
                                  setExperienceDraft(
                                    experienceDraft.map((current, currentIndex) =>
                                      currentIndex === index
                                        ? { ...current, [key]: e.target.value }
                                        : current,
                                    ),
                                  )
                                }
                                className={fieldClass}
                              />
                            </label>
                          ))}
                          <label className="sm:col-span-2">
                            <span className="mb-2 block text-sm font-semibold">Descripción</span>
                            <textarea
                              rows={3}
                              disabled={readOnly}
                              value={item.description}
                              onChange={(e) =>
                                setExperienceDraft(
                                  experienceDraft.map((current, currentIndex) =>
                                    currentIndex === index
                                      ? { ...current, description: e.target.value }
                                      : current,
                                  ),
                                )
                              }
                              className={fieldClass}
                            />
                          </label>
                          <label className="flex items-center gap-3 text-sm font-semibold">
                            <input
                              type="checkbox"
                              disabled={readOnly}
                              checked={item.visible}
                              onChange={(e) =>
                                setExperienceDraft(
                                  experienceDraft.map((current, currentIndex) =>
                                    currentIndex === index
                                      ? { ...current, visible: e.target.checked }
                                      : current,
                                  ),
                                )
                              }
                            />
                            Mostrar en el sitio público
                          </label>
                          <button
                            type="button"
                            disabled={readOnly}
                            onClick={() =>
                              setExperienceDraft(
                                experienceDraft.filter((_, currentIndex) => currentIndex !== index),
                              )
                            }
                            className="justify-self-end rounded-full border border-destructive/40 px-4 py-2 text-sm text-destructive disabled:opacity-50"
                          >
                            Eliminar experiencia
                          </button>
                        </div>
                      </div>
                    ))}
                  {experienceDraft.filter((item) => item.kind === activeExperienceKind).length ===
                    0 && (
                    <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                      No hay registros en esta categoría. Agrega el primero con el botón inferior.
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      setExperienceDraft([
                        ...experienceDraft,
                        {
                          id: `new-${Date.now()}`,
                          kind: activeExperienceKind,
                          title: "",
                          org: "",
                          start: "",
                          end: "",
                          description: "",
                          visible: true,
                        },
                      ])
                    }
                    className="rounded-full border px-5 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50"
                  >
                    + Agregar experiencia
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {section.keys.map((key) => {
                    const field = fields.find((item) => item.key === key)!;
                    const longText =
                      key === "heroSubtitle" || key === "mission" || key === "vision";
                    return (
                      <label key={field.key} className={longText ? "block sm:col-span-2" : "block"}>
                        <span className="mb-2 block text-sm font-semibold">{field.label}</span>
                        {longText ? (
                          <textarea
                            rows={4}
                            disabled={readOnly}
                            value={draft[field.key] as string}
                            onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                            className={fieldClass}
                          />
                        ) : (
                          <input
                            disabled={readOnly}
                            value={draft[field.key] as string}
                            onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                            className={fieldClass}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={readOnly || saving || (!dirty && !experienceDirty && !skillsDirty)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => setDraft(company)}
          disabled={readOnly || saving || !dirty}
          className="rounded-full border px-6 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          Descartar
        </button>
        {saveMessage && (
          <span
            role="status"
            className={`text-xs ${saveMessage.startsWith("No se pudo") ? "text-destructive" : "text-success"}`}
          >
            {saveMessage}
          </span>
        )}
        {readOnly && (
          <span className="text-xs text-muted-foreground">Tu cuenta es de solo lectura.</span>
        )}
      </div>
    </>
  );
}

function formatLastLogin(value: string | null): string {
  if (!value) return "Nunca";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function Cuentas({ readOnly }: { readOnly: boolean }) {
  const { company } = useSite();
  const session = useAuth((s) => s.session);
  const modal = useModal();
  const [section, setSection] = useState<"usuarios" | "roles" | "permisos">("usuarios");
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [userRoles, setUserRoles] = useState<Record<number, RoleResponse | undefined>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<
    | { type: "usuario"; item: UserResponse }
    | { type: "rol"; item: RoleResponse }
    | { type: "permiso"; item: PermissionResponse }
    | null
  >(null);
  const [showCreate, setShowCreate] = useState(false);
  const [userForm, setUserForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    nombre_usuario: "",
    contrasena: "",
    pais: "",
    activo: true,
    rolId: "",
  });
  const [roleForm, setRoleForm] = useState({ nombre_rol: "", descripcion: "" });
  const [permissionForm, setPermissionForm] = useState({
    nombre_permiso: "",
    modulo: "",
    descripcion: "",
  });
  const inputClass =
    "autofill-field w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
  const pageSize = 4;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, roleData, permissionData] = await Promise.all([
        api.users(),
        api.roles(),
        api.permissions(),
      ]);
      const sessionRole = roleData.find((role) => role.nombre_rol === session?.role);
      const roleEntries = userData.map(
        (user) => [user.id, user.id === Number(session?.userId) ? sessionRole : undefined] as const,
      );
      setUsers(userData);
      setRoles(roleData);
      setPermissions(permissionData);
      setUserRoles((current) => {
        const next = { ...current };
        for (const [userId, role] of roleEntries) {
          if (role) next[userId] = role;
        }
        return next;
      });
    } catch (error) {
      await modal.error({
        title: "No pudimos cargar la administración",
        message: error instanceof Error ? error.message : "Revisa tus permisos.",
      });
    } finally {
      setLoading(false);
    }
  }, [modal, session?.role, session?.userId]);
  useEffect(() => {
    void loadData();
  }, [loadData]);
  useEffect(() => {
    setPage(1);
    setEditing(null);
    setEditTarget(null);
    setShowCreate(false);
  }, [section]);

  const total =
    section === "usuarios" ? users.length : section === "roles" ? roles.length : permissions.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = (page - 1) * pageSize;
  const pagedUsers = users.slice(rangeStart, rangeStart + pageSize);
  const pagedRoles = roles.slice(rangeStart, rangeStart + pageSize);
  const pagedPermissions = permissions.slice(rangeStart, rangeStart + pageSize);
  const run = async (action: () => Promise<void>) => {
    try {
      await action();
      setEditing(null);
      setShowCreate(false);
      await loadData();
    } catch (error) {
      await modal.error({
        title: "No se pudo guardar",
        message: error instanceof Error ? error.message : "Revisa los datos.",
      });
    }
  };
  const remove = async (label: string, action: () => Promise<void>) => {
    if (
      await modal.confirm({
        title: `¿Eliminar ${label}?`,
        message: "Esta acción no se puede deshacer.",
        confirmText: "Eliminar",
        cancelText: "Cancelar",
        danger: true,
      })
    )
      await run(action);
  };
  const tabs = [
    { id: "usuarios" as const, label: "Usuarios", Icon: UsersIcon },
    { id: "roles" as const, label: "Roles", Icon: ShieldCheck },
    { id: "permisos" as const, label: "Permisos", Icon: KeyRound },
  ];
  const actions = (id: number, onEdit: () => void, onDelete: () => void) =>
    readOnly ? null : (
      <span className="flex items-center gap-1">
        <button
          onClick={onEdit}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Editar"
        >
          <Edit3 className="size-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          aria-label="Eliminar"
        >
          <Trash2 className="size-4" />
        </button>
      </span>
    );
  const header =
    section === "usuarios"
      ? ["Nombre", "Usuario", "Rol", "Correo", "País", "Estado", "Último login", "Acciones"]
      : section === "roles"
        ? ["Rol", "Descripción", "Acciones"]
        : ["Permiso", "Módulo", "Descripción", "Acciones"];

  return (
    <>
      <Head
        title="Administración"
        sub={`Gestiona usuarios, roles y permisos de ${company.companyName}.`}
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${section === id ? "bg-gradient-brand text-primary-foreground shadow-glow" : "border text-muted-foreground hover:bg-muted"}`}
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>
        {!readOnly && (
          <button
            onClick={() => {
              setEditing(null);
              setEditTarget(null);
              setShowCreate(true);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="size-4" /> Nuevo {section.slice(0, -1)}
          </button>
        )}
      </div>
      {showCreate && !readOnly && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-md">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-account-title"
            className="w-full max-w-2xl rounded-3xl border bg-card p-6 shadow-card sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-eyebrow">Administración</p>
                <h2 id="create-account-title" className="mt-1 font-display text-2xl font-bold">
                  Nuevo {section.slice(0, -1)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Completa la información para registrar un nuevo elemento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              >
                Cerrar
              </button>
            </div>
            <div className="mt-6">
              {section === "usuarios" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(async () => {
                      const { rolId, ...userData } = userForm;
                      const created = await api.createUser(userData);
                      await api.assignUserRole(created.id, Number(rolId));
                      setUserForm({
                        nombre: "",
                        apellido: "",
                        email: "",
                        nombre_usuario: "",
                        contrasena: "",
                        pais: "",
                        activo: true,
                        rolId: "",
                      });
                    });
                  }}
                  autoComplete="off"
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {(
                    ["nombre", "apellido", "email", "nombre_usuario", "contrasena", "pais"] as const
                  ).map((key) => (
                    <input
                      key={key}
                      required
                      type={key === "email" ? "email" : key === "contrasena" ? "password" : "text"}
                      autoComplete={
                        key === "email"
                          ? "email"
                          : key === "nombre_usuario"
                            ? "username"
                            : key === "contrasena"
                              ? "new-password"
                              : key === "nombre"
                                ? "given-name"
                                : key === "apellido"
                                  ? "family-name"
                                  : "country"
                      }
                      placeholder={key.replace("_", " ")}
                      value={userForm[key]}
                      onChange={(e) => setUserForm({ ...userForm, [key]: e.target.value })}
                      className={inputClass}
                    />
                  ))}
                  <select
                    required
                    value={userForm.rolId}
                    onChange={(e) => setUserForm({ ...userForm, rolId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Selecciona un rol</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.nombre_rol}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-3 sm:col-span-2">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      Cancelar
                    </button>
                    <button className="rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                      Crear usuario
                    </button>
                  </div>
                </form>
              )}
              {section === "roles" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(async () => {
                      await api.createRole(roleForm);
                      setRoleForm({ nombre_rol: "", descripcion: "" });
                    });
                  }}
                  className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]"
                >
                  <input
                    required
                    placeholder="Nombre del rol"
                    value={roleForm.nombre_rol}
                    onChange={(e) => setRoleForm({ ...roleForm, nombre_rol: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    placeholder="Descripción"
                    value={roleForm.descripcion}
                    onChange={(e) => setRoleForm({ ...roleForm, descripcion: e.target.value })}
                    className={inputClass}
                  />
                  <button className="rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                    Crear
                  </button>
                </form>
              )}
              {section === "permisos" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(async () => {
                      await api.createPermission(permissionForm);
                      setPermissionForm({ nombre_permiso: "", modulo: "", descripcion: "" });
                    });
                  }}
                  className="grid gap-3 sm:grid-cols-3"
                >
                  <input
                    required
                    placeholder="Nombre del permiso"
                    value={permissionForm.nombre_permiso}
                    onChange={(e) =>
                      setPermissionForm({ ...permissionForm, nombre_permiso: e.target.value })
                    }
                    className={inputClass}
                  />
                  <input
                    placeholder="Módulo"
                    value={permissionForm.modulo}
                    onChange={(e) =>
                      setPermissionForm({ ...permissionForm, modulo: e.target.value })
                    }
                    className={inputClass}
                  />
                  <input
                    placeholder="Descripción"
                    value={permissionForm.descripcion}
                    onChange={(e) =>
                      setPermissionForm({ ...permissionForm, descripcion: e.target.value })
                    }
                    className={inputClass}
                  />
                  <button className="rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground sm:col-span-3">
                    Crear permiso
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <div className="glass grid place-items-center rounded-3xl p-12">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border bg-card/30 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {header.map((item) => (
                    <th key={item} className="px-5 py-4 font-semibold">
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {section === "usuarios" &&
                  pagedUsers.map((user) =>
                    editing === user.id ? (
                      <tr key={user.id}>
                        <td colSpan={8} className="p-4">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void run(() =>
                                api.updateUser(user.id, {
                                  nombre: userForm.nombre,
                                  apellido: userForm.apellido,
                                  email: userForm.email,
                                  contrasena: userForm.contrasena || undefined,
                                  pais: userForm.pais || undefined,
                                  activo: user.activo,
                                }),
                              );
                            }}
                            className="grid gap-2 sm:grid-cols-4"
                          >
                            <input
                              className={inputClass}
                              value={userForm.nombre}
                              onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                            />
                            <input
                              className={inputClass}
                              value={userForm.apellido}
                              onChange={(e) =>
                                setUserForm({ ...userForm, apellido: e.target.value })
                              }
                            />
                            <input
                              className={inputClass}
                              value={userForm.email}
                              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                            />
                            <input
                              className={inputClass}
                              placeholder="Nueva contraseña (opcional)"
                              value={userForm.contrasena}
                              onChange={(e) =>
                                setUserForm({ ...userForm, contrasena: e.target.value })
                              }
                            />
                            <button className="rounded-xl bg-gradient-brand px-3 py-2 text-xs font-semibold text-primary-foreground">
                              Guardar
                            </button>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={user.id} className="hover:bg-muted/30">
                        <td className="px-5 py-4 font-medium">
                          {user.nombre} {user.apellido}
                          {String(user.id) === session?.userId && (
                            <span className="ml-2 text-xs text-primary">Tú</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-medium text-primary">
                          @{user.nombre_usuario}
                        </td>
                        <td className="px-5 py-4">
                          {" "}
                          {user.rol ?? userRoles[user.id]?.nombre_rol ?? "Sin rol"}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{user.email}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {user.pais || "No indicado"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${user.activo ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                          >
                            {user.activo ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {formatLastLogin(user.fecha_ultimo_login)}
                        </td>
                        <td className="px-5 py-4">
                          {actions(
                            user.id,
                            () => {
                              setEditing(null);
                              setEditTarget({ type: "usuario", item: user });
                            },
                            () => void remove("usuario", () => api.deleteUser(user.id)),
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                {section === "roles" &&
                  pagedRoles.map((role) =>
                    editing === role.id ? (
                      <tr key={role.id}>
                        <td colSpan={3} className="p-4">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void run(() => api.updateRole(role.id, roleForm));
                            }}
                            className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]"
                          >
                            <input
                              className={inputClass}
                              value={roleForm.nombre_rol}
                              onChange={(e) =>
                                setRoleForm({ ...roleForm, nombre_rol: e.target.value })
                              }
                            />
                            <input
                              className={inputClass}
                              value={roleForm.descripcion}
                              onChange={(e) =>
                                setRoleForm({ ...roleForm, descripcion: e.target.value })
                              }
                            />
                            <button className="rounded-xl bg-gradient-brand px-3 py-2 text-xs font-semibold text-primary-foreground">
                              Guardar
                            </button>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={role.id} className="hover:bg-muted/30">
                        <td className="px-5 py-4 font-medium">{role.nombre_rol}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {role.descripcion ?? "Sin descripción"}
                        </td>
                        <td className="px-5 py-4">
                          {actions(
                            role.id,
                            () => {
                              setEditing(null);
                              setEditTarget({ type: "rol", item: role });
                            },
                            () => void remove("rol", () => api.deleteRole(role.id)),
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                {section === "permisos" &&
                  pagedPermissions.map((permission) =>
                    editing === permission.id ? (
                      <tr key={permission.id}>
                        <td colSpan={4} className="p-4">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void run(() => api.updatePermission(permission.id, permissionForm));
                            }}
                            className="grid gap-2 sm:grid-cols-3"
                          >
                            <input
                              className={inputClass}
                              value={permissionForm.nombre_permiso}
                              onChange={(e) =>
                                setPermissionForm({
                                  ...permissionForm,
                                  nombre_permiso: e.target.value,
                                })
                              }
                            />
                            <input
                              className={inputClass}
                              value={permissionForm.modulo}
                              onChange={(e) =>
                                setPermissionForm({ ...permissionForm, modulo: e.target.value })
                              }
                            />
                            <input
                              className={inputClass}
                              value={permissionForm.descripcion}
                              onChange={(e) =>
                                setPermissionForm({
                                  ...permissionForm,
                                  descripcion: e.target.value,
                                })
                              }
                            />
                            <button className="rounded-xl bg-gradient-brand px-3 py-2 text-xs font-semibold text-primary-foreground">
                              Guardar
                            </button>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={permission.id} className="hover:bg-muted/30">
                        <td className="px-5 py-4 font-medium">{permission.nombre_permiso}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-muted px-3 py-1 text-xs">
                            {permission.modulo ?? "General"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {permission.descripcion ?? "Sin descripción"}
                        </td>
                        <td className="px-5 py-4">
                          {actions(
                            permission.id,
                            () => {
                              setEditing(null);
                              setEditTarget({ type: "permiso", item: permission });
                            },
                            () => void remove("permiso", () => api.deletePermission(permission.id)),
                          )}
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t px-5 py-4 text-sm text-muted-foreground">
            <span>
              {total === 0
                ? "Sin registros"
                : `${rangeStart + 1}-${Math.min(rangeStart + pageSize, total)} de ${total}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-lg border p-2 hover:bg-muted disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span>
                Página {page} de {pages}
              </span>
              <button
                disabled={page === pages}
                onClick={() => setPage((value) => Math.min(pages, value + 1))}
                className="rounded-lg border p-2 hover:bg-muted disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {readOnly && (
        <p className="mt-4 text-xs text-muted-foreground">
          Tu cuenta tiene permisos de solo lectura.
        </p>
      )}
      {editTarget && (
        <EditAccountModal
          target={editTarget}
          roleId={
            editTarget.type === "usuario"
              ? (userRoles[editTarget.item.id]?.id ??
                roles.find((role) => role.nombre_rol === editTarget.item.rol)?.id ??
                null)
              : null
          }
          roles={roles}
          inputClass={inputClass}
          onClose={() => setEditTarget(null)}
          onSave={async (target, values) => {
            await run(async () => {
              if (target.type === "usuario") {
                await api.updateUser(target.item.id, {
                  nombre: values.nombre,
                  apellido: values.apellido,
                  email: values.email,
                  nombre_usuario: values.nombre_usuario,
                  contrasena: values.contrasena || undefined,
                  pais: values.pais || undefined,
                  activo: values.activo,
                });
                const previousRoleId =
                  userRoles[target.item.id]?.id ??
                  roles.find((role) => role.nombre_rol === target.item.rol)?.id;
                const nextRoleId = values.rolId ? Number(values.rolId) : null;
                if (previousRoleId && previousRoleId !== nextRoleId) {
                  await api.removeUserRole(target.item.id, previousRoleId);
                }
                if (nextRoleId && previousRoleId !== nextRoleId) {
                  await api.assignUserRole(target.item.id, nextRoleId);
                }
                const selectedRole = roles.find((role) => role.id === nextRoleId);
                if (selectedRole) {
                  setUserRoles((current) => ({ ...current, [target.item.id]: selectedRole }));
                }
              } else if (target.type === "rol") {
                await api.updateRole(target.item.id, {
                  nombre_rol: values.nombre_rol,
                  descripcion: values.descripcion,
                });
              } else {
                await api.updatePermission(target.item.id, {
                  nombre_permiso: values.nombre_permiso,
                  modulo: values.modulo,
                  descripcion: values.descripcion,
                });
              }
              setEditTarget(null);
            });
          }}
        />
      )}
    </>
  );
}

type EditTarget =
  | { type: "usuario"; item: UserResponse }
  | { type: "rol"; item: RoleResponse }
  | { type: "permiso"; item: PermissionResponse };

type EditValues = {
  nombre: string;
  apellido: string;
  email: string;
  nombre_usuario: string;
  contrasena: string;
  pais: string;
  activo: boolean;
  rolId: string;
  nombre_rol: string;
  nombre_permiso: string;
  modulo: string;
  descripcion: string;
};

function EditAccountModal({
  target,
  roleId,
  roles,
  inputClass,
  onClose,
  onSave,
}: {
  target: EditTarget;
  roleId: number | null;
  roles: RoleResponse[];
  inputClass: string;
  onClose: () => void;
  onSave: (target: EditTarget, values: EditValues) => Promise<void>;
}) {
  const [values, setValues] = useState<EditValues>(() => ({
    nombre: target.type === "usuario" ? target.item.nombre : "",
    apellido: target.type === "usuario" ? target.item.apellido : "",
    email: target.type === "usuario" ? target.item.email : "",
    nombre_usuario: target.type === "usuario" ? target.item.nombre_usuario : "",
    contrasena: "",
    pais: target.type === "usuario" ? (target.item.pais ?? "") : "",
    activo: target.type === "usuario" ? target.item.activo : true,
    rolId: roleId ? String(roleId) : "",
    nombre_rol: target.type === "rol" ? target.item.nombre_rol : "",
    nombre_permiso: target.type === "permiso" ? target.item.nombre_permiso : "",
    modulo: target.type === "permiso" ? (target.item.modulo ?? "") : "",
    descripcion:
      target.type === "rol" || target.type === "permiso" ? (target.item.descripcion ?? "") : "",
  }));
  const [saving, setSaving] = useState(false);
  const title =
    target.type === "usuario"
      ? "Editar usuario"
      : target.type === "rol"
        ? "Editar rol"
        : "Editar permiso";
  const update = (key: keyof EditValues, value: string | boolean) =>
    setValues((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(target, values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-account-title"
        className="w-full max-w-2xl rounded-3xl border bg-card p-6 shadow-card sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-eyebrow">Administración</p>
            <h2 id="edit-account-title" className="mt-1 font-display text-2xl font-bold">
              {title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Actualiza la información y guarda los cambios.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          >
            Cerrar
          </button>
        </div>
        <form onSubmit={save} autoComplete="off" className="mt-6 grid gap-4 sm:grid-cols-2">
          {target.type === "usuario" && (
            <>
              <label className="space-y-1.5 text-sm font-medium">
                Nombre
                <input
                  required
                  className={`${inputClass} admin-select`}
                  value={values.nombre}
                  onChange={(e) => update("nombre", e.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Apellido
                <input
                  required
                  className={inputClass}
                  value={values.apellido}
                  onChange={(e) => update("apellido", e.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                Correo electrónico
                <input
                  required
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                Nombre de usuario
                <input
                  required
                  maxLength={100}
                  autoComplete="username"
                  className={inputClass}
                  value={values.nombre_usuario}
                  onChange={(e) => update("nombre_usuario", e.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                Nueva contraseña{" "}
                <span className="font-normal text-muted-foreground">(opcional)</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={inputClass}
                  value={values.contrasena}
                  onChange={(e) => update("contrasena", e.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                País
                <input
                  maxLength={10}
                  className={inputClass}
                  value={values.pais}
                  onChange={(e) => update("pais", e.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Estado
                <select
                  className={`${inputClass} admin-select`}
                  value={values.activo ? "activo" : "inactivo"}
                  onChange={(e) => update("activo", e.target.value === "activo")}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Rol
                <select
                  required
                  className={`${inputClass} admin-select`}
                  value={values.rolId}
                  onChange={(e) => update("rolId", e.target.value)}
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre_rol}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {target.type === "rol" && (
            <>
              <label className="space-y-1.5 text-sm font-medium">
                Nombre del rol
                <input
                  required
                  className={inputClass}
                  value={values.nombre_rol}
                  onChange={(e) => update("nombre_rol", e.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Descripción
                <input
                  className={inputClass}
                  value={values.descripcion}
                  onChange={(e) => update("descripcion", e.target.value)}
                />
              </label>
            </>
          )}
          {target.type === "permiso" && (
            <>
              <label className="space-y-1.5 text-sm font-medium">
                Nombre del permiso
                <input
                  required
                  className={inputClass}
                  value={values.nombre_permiso}
                  onChange={(e) => update("nombre_permiso", e.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Módulo
                <input
                  className={inputClass}
                  value={values.modulo}
                  onChange={(e) => update("modulo", e.target.value)}
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                Descripción
                <input
                  className={inputClass}
                  value={values.descripcion}
                  onChange={(e) => update("descripcion", e.target.value)}
                />
              </label>
            </>
          )}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              className="rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
