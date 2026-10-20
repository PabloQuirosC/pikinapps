import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2, Mail, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useModal } from "@/components/modal/ModalProvider";
import { useSite } from "@/store/site";
import { Reveal, SpotlightCard } from "./effects";
import { SocialLinks } from "./chrome";
import { daysEs, useOpenStatus } from "./schedule-utils";
import { SectionHead } from "./top";

export function ScheduleSection() {
  const schedule = useSite((s) => s.schedule);
  const status = useOpenStatus();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <section id="horario" className="section-y">
      <div className="container-x grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow="05 — Horario" title={<>Siempre <span className="text-gradient">a tu alcance.</span></>} sub={`Horario de atención en zona ${schedule.timezone.replace("_", " ")}.`} />
          <Reveal>
            <div className="glass inline-flex items-center gap-3 rounded-2xl px-5 py-4">
              {status ? (
                <>
                  <span className={`relative flex size-3`}>{status.open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />}<span className={`relative inline-flex size-3 rounded-full ${status.open ? "bg-success" : "bg-destructive"}`} /></span>
                  <div><p className="font-semibold">{status.open ? "Abierto ahora" : "Cerrado ahora"}</p><p className="text-xs text-muted-foreground">Hora local: {status.time}{status.exception ? ` · ${status.exception}` : ""}</p></div>
                </>
              ) : (
                <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
              )}
            </div>
          </Reveal>
          <div className="mt-10"><p className="text-eyebrow mb-4">Redes sociales</p><SocialLinks size="lg" /></div>
        </div>
        <Reveal delay={0.1}>
          <SpotlightCard tilt={false} className="p-4 md:p-6">
            <ul>
              {order.map((d) => {
                const day = schedule.days.find((x) => x.day === d)!;
                const isToday = status?.today === d;
                return (
                  <li key={d} className={`flex items-center justify-between rounded-2xl px-5 py-4 ${isToday ? "bg-muted" : ""}`}>
                    <span className="flex items-center gap-3 font-medium">{isToday && <Clock className="size-4 text-primary" />}{daysEs[d]}</span>
                    <span className="text-right text-sm text-muted-foreground">{day.enabled ? day.slots.map((s) => `${s.open} – ${s.close}`).join("  ·  ") : "Cerrado"}</span>
                  </li>
                );
              })}
            </ul>
            {schedule.exceptions.length > 0 && (
              <div className="mt-4 border-t px-5 pt-4 text-xs text-muted-foreground">
                Feriados: {schedule.exceptions.map((e) => `${e.label} (${e.date})`).join(", ")}
              </div>
            )}
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

const schema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre").max(80),
  email: z.string().trim().email("Correo no válido").max(120),
  phone: z.string().trim().max(20).regex(/^[+\d\s-]*$/, "Teléfono no válido").optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Agrega un asunto").max(120),
  projectType: z.string().min(1, "Selecciona un tipo"),
  budget: z.string().min(1, "Selecciona un rango"),
  message: z.string().trim().min(20, "Cuéntame un poco más (mín. 20 caracteres)").max(2000),
  website: z.string().max(0).optional(), // honeypot
});
type FormData = z.infer<typeof schema>;

const field = "w-full rounded-2xl border bg-background/50 px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1.5 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function Contact() {
  const { company, addMessage } = useSite();
  const modal = useModal();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: FormData) => {
    if (d.website) return; // bot
    try {
      await new Promise((r) => setTimeout(r, 1200));
      addMessage({ name: d.name, email: d.email, phone: d.phone, subject: d.subject, message: d.message, projectType: d.projectType, budget: d.budget });
      reset();
      await modal.success({ title: "¡Mensaje enviado!", message: `Gracias, ${d.name}. Te responderé en menos de 24 horas hábiles.` });
    } catch {
      await modal.error({ title: "No se pudo enviar", message: "Ocurrió un problema al guardar tu mensaje.", onRetry: () => handleSubmit(onSubmit)() });
    }
  };

  return (
    <section id="contacto" className="section-y">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <SectionHead eyebrow="06 — Contacto" title={<>¿Tienes un proyecto? <span className="text-gradient">Hablemos.</span></>} sub="Cuéntame tu idea y te enviaré una propuesta personalizada sin compromiso." />
          <ul className="space-y-4">
            <li className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-full border"><Mail className="size-4 text-primary" /></span><a href={`mailto:${company.email}`} className="hover:text-primary">{company.email}</a></li>
            <li className="flex items-center gap-4"><span className="grid size-11 place-items-center rounded-full border"><MapPin className="size-4 text-primary" /></span>{company.location}</li>
          </ul>
        </div>
        <Reveal>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="glass grid gap-5 rounded-3xl p-6 md:grid-cols-2 md:p-10">
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register("website")} />
            <Field label="Nombre" error={errors.name?.message}><input className={field} {...register("name")} autoComplete="name" /></Field>
            <Field label="Email" error={errors.email?.message}><input type="email" className={field} {...register("email")} autoComplete="email" /></Field>
            <Field label="Teléfono (opcional)" error={errors.phone?.message}><input className={field} {...register("phone")} autoComplete="tel" /></Field>
            <Field label="Asunto" error={errors.subject?.message}><input className={field} {...register("subject")} /></Field>
            <Field label="Tipo de proyecto" error={errors.projectType?.message}>
              <select className={field} {...register("projectType")} defaultValue="">
                <option value="" disabled>Selecciona…</option>
                {["Sitio web", "E-commerce", "Aplicación web", "UI/UX", "Mantenimiento", "Otro"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Presupuesto estimado" error={errors.budget?.message}>
              <select className={field} {...register("budget")} defaultValue="">
                <option value="" disabled>Selecciona…</option>
                {["< $1,000", "$1,000 – $3,000", "$3,000 – $8,000", "$8,000 – $20,000", "> $20,000"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2"><Field label="Mensaje" error={errors.message?.message}><textarea rows={5} className={field} {...register("message")} /></Field></div>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-brand px-7 py-4 font-semibold text-primary-foreground shadow-glow transition disabled:opacity-60 md:col-span-2">
              {isSubmitting ? <><Loader2 className="size-4 animate-spin" /> Enviando…</> : <>Enviar mensaje <Send className="size-4" /></>}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
