import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useModal } from "@/components/modal/ModalProvider";
import { useAuth } from "@/store/auth";
import { useSite } from "@/store/site";
import logoUrl from "@/assets/logo.png";

const schema = z.object({
  email: z.string().trim().min(1, "Escribe tu correo").email("Correo no válido"),
  password: z.string().min(1, "Escribe tu contraseña"),
});
type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceso privado — PikinApps" },
      { name: "description", content: "Acceso al panel de administración de PikinApps." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

const field =
  "login-autofill w-full rounded-2xl border bg-background/50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";

function Login() {
  const { company } = useSite();
  const { session, initialize, login } = useAuth();
  const modal = useModal();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const onSubmit = async (d: FormData) => {
    await new Promise((r) => setTimeout(r, 600)); // pausa para que el botón muestre el estado de carga
    const res = await login(d.email, d.password);
    if (!res.ok) {
      const message =
        res.reason === "email"
          ? "No encontramos ninguna cuenta con ese correo."
          : res.reason === "inactive"
            ? "Esta cuenta está desactivada. Escribe al administrador."
            : "La contraseña no coincide. Revísala e inténtalo otra vez.";
      await modal.error({ title: "No pudimos iniciar sesión", message });
      return;
    }
    await navigate({ to: "/admin" });
  };

  if (session) return <Navigate to="/admin" replace />;

  return (
    <div className="grain grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Panel de marca */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-aurora absolute -left-1/4 top-0 size-[36rem] rounded-full bg-gradient-brand opacity-25 blur-[110px]" />
          <div
            className="animate-aurora absolute -bottom-1/3 right-0 size-[30rem] rounded-full bg-magenta/25 blur-[110px]"
            style={{ animationDelay: "-6s" }}
          />
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver al sitio
        </Link>
        <div className="flex flex-1 flex-col items-center justify-center">
          <img
            src={logoUrl}
            alt={`Logo de ${company.companyName}`}
            className="w-full max-w-sm object-contain drop-shadow-[0_0_45px_rgba(255,91,136,0.2)]"
          />
          <div className="mt-10 w-full max-w-sm">
            <p className="text-center text-lg font-medium text-foreground">
              Bienvenido a tu centro de control.
            </p>
            <p className="mt-2 text-center text-sm leading-6 text-muted-foreground">
              Todo lo que necesitas para mantener tu presencia digital en movimiento.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <ShieldCheck className="size-5 text-primary" />
                <p className="mt-3 text-sm font-semibold">Acceso seguro</p>
                <p className="mt-1 text-xs text-muted-foreground">Tu espacio, protegido.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <Check className="size-5 text-success" />
                <p className="mt-3 text-sm font-semibold">Todo en orden</p>
                <p className="mt-1 text-xs text-muted-foreground">Gestiona sin complicaciones.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Formulario */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Volver
            </Link>
            <span className="inline-flex items-center gap-2 font-display text-sm font-bold">
              <img src={logoUrl} alt="" className="size-7 rounded-lg object-contain" />
              {company.companyName}
              <span className="text-gradient">.</span>
            </span>
          </div>

          <div className="mb-8">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles className="size-3.5" /> Acceso privado
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight">
              Hola de nuevo<span className="text-gradient">.</span>
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
              Inicia sesión y vuelve a poner tus ideas en marcha.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Correo</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  className={field}
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  {...register("email")}
                />
              </span>
              {errors.email && (
                <span role="alert" className="mt-1.5 block text-xs text-destructive">
                  {errors.email.message}
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Contraseña</span>
              <span className="relative block">
                <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  className={`${field} pr-11`}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
              {errors.password && (
                <span role="alert" className="mt-1.5 block text-xs text-destructive">
                  {errors.password.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-4 font-semibold text-primary-foreground shadow-glow transition disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Entrando…
                </>
              ) : (
                "Entrar al panel"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
