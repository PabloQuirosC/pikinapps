import { useShallow } from "zustand/react/shallow";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Code2,
  Compass,
  Gauge,
  HeartHandshake,
  Layers,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useRef } from "react";
import avatar from "@/assets/avatar.jpg";
import { techStack } from "@/data/seed";
import { useSite } from "@/store/site";
import { Counter, Magnetic, Reveal, SpotlightCard, Typewriter } from "./effects";

export function Hero() {
  const company = useSite((s) => s.company);
  const skills = useSite(useShallow((s) => s.skills.filter((skill) => skill.visible)));
  const marqueeSkills = skills.length > 0 ? skills.map((skill) => skill.name) : techStack;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const HERO_IMAGE_PARALLAX = 120;
  const y = useTransform(scrollYProgress, [0, 1], [0, HERO_IMAGE_PARALLAX]);

  return (
    <section id="inicio" ref={ref} className="relative overflow-hidden pt-36 pb-20 md:pt-44">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-aurora absolute -left-1/4 top-0 size-[60vw] rounded-full bg-ember/25 blur-[120px]" />
        <div className="animate-aurora absolute -right-1/4 top-1/4 size-[50vw] rounded-full bg-magenta/25 blur-[120px] [animation-delay:-6s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>

      <div className="container-x grid items-start gap-14 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Disponible para nuevos proyectos · 2026
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-xl font-bold"
          >
            {company.heroTitle}
            <br />
            <span className="block min-h-[2.1em]">
              <Typewriter words={company.heroRotating} />
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 max-w-xl text-lg text-muted-foreground"
          >
            Soy <strong className="text-foreground">{company.ownerName}</strong>,{" "}
            {company.role.toLowerCase()} en {company.companyName}. {company.heroSubtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Magnetic>
              <a
                href="#portafolio"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-4 font-semibold text-primary-foreground shadow-glow"
              >
                Ver proyectos{" "}
                <ArrowDownRight className="size-4 transition-transform group-hover:rotate-[-45deg]" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contacto"
                className="glass inline-flex items-center gap-2 rounded-full px-7 py-4 font-semibold hover:bg-muted"
              >
                Contáctame
              </a>
            </Magnetic>
          </motion.div>
          <div className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t pt-8">
            {[
              { n: 120, s: "+", l: "Proyectos" },
              { n: 12, s: "", l: "Años de experiencia" },
              { n: 85, s: "+", l: "Clientes felices" },
            ].map((k) => (
              <div key={k.l}>
                <p className="font-display text-3xl font-bold md:text-4xl">
                  <Counter to={k.n} suffix={k.s} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{k.l}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div style={{ y }} className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-brand opacity-40 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border shadow-card">
            <img
              src={avatar}
              alt={`Retrato de ${company.ownerName}`}
              width={800}
              height={1008}
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="glass absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{company.ownerName}</p>
                <p className="text-xs text-muted-foreground">{company.location}</p>
              </div>
              <div className="flex -space-x-1 text-primary">★★★★★</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-24 overflow-hidden border-y py-6 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="animate-marquee flex w-max gap-12">
          {[...marqueeSkills, ...marqueeSkills].map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-12 font-display text-2xl font-semibold text-muted-foreground/70"
            >
              {t} <Sparkles className="size-4 text-primary" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <Reveal className="mb-14 max-w-3xl">
      <p className="text-eyebrow mb-4">{eyebrow}</p>
      <h2 className="text-display-lg font-bold">{title}</h2>
      {sub && <p className="mt-5 text-lg text-muted-foreground">{sub}</p>}
    </Reveal>
  );
}
export { SectionHead };

export function About() {
  const company = useSite((s) => s.company);
  const values = [
    {
      Icon: Gauge,
      t: "Rendimiento obsesivo",
      d: "Cada milisegundo cuenta. Sitios que cargan antes de que parpadees.",
    },
    {
      Icon: HeartHandshake,
      t: "Relación honesta",
      d: "Comunicación directa, plazos reales y cero sorpresas.",
    },
    {
      Icon: Compass,
      t: "Diseño con propósito",
      d: "Belleza que convierte: cada píxel responde a un objetivo.",
    },
  ];
  return (
    <section id="sobre-mi" className="section-y">
      <div className="container-x">
        <SectionHead
          eyebrow="01 — Sobre mí"
          title={
            <>
              Código con criterio, <span className="text-gradient">diseño con alma.</span>
            </>
          }
        />
        <div className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4 md:row-span-2">
            <SpotlightCard tilt={false} className="h-full p-8 md:p-10">
              <p className="text-eyebrow mb-4">Mi historia</p>
              <p className="text-xl leading-relaxed md:text-2xl">
                Empecé escribiendo código a los 15 años en un cibercafé. Hoy, {company.ownerName}{" "}
                lidera <span className="text-gradient font-semibold">{company.companyName}</span>,
                un estudio boutique que construye productos para marcas que no se conforman con
                "suficientemente bueno".
              </p>
              <p className="mt-6 text-muted-foreground">
                Creo en equipos pequeños, decisiones rápidas y en tratar cada proyecto como si fuera
                mío. Esa filosofía nos ha llevado a trabajar con startups, pymes y empresas en 9
                países.
              </p>
            </SpotlightCard>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-2">
            <SpotlightCard className="flex h-full flex-col justify-between p-8">
              <Rocket className="size-7 text-primary" />
              <div>
                <p className="font-display text-5xl font-bold">
                  <Counter to={98} suffix="%" />
                </p>
                <p className="text-sm text-muted-foreground">clientes que repiten</p>
              </div>
            </SpotlightCard>
          </Reveal>
          <Reveal delay={0.2} className="md:col-span-2">
            <SpotlightCard className="flex h-full flex-col justify-between bg-gradient-brand p-8 text-primary-foreground">
              <p className="font-display text-2xl font-bold leading-tight">
                "Lo simple es lo más difícil de construir."
              </p>
              <p className="text-sm opacity-80">— Mi filosofía</p>
            </SpotlightCard>
          </Reveal>
          {values.map((v, i) => (
            <Reveal key={v.t} delay={0.1 * i} className="md:col-span-2">
              <SpotlightCard className="h-full p-8">
                <v.Icon className="mb-6 size-7 text-accent" />
                <h3 className="text-lg font-semibold">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Company() {
  const company = useSite((s) => s.company);
  const services = [
    { Icon: Code2, t: "Desarrollo web", d: "Sitios corporativos y landing pages de alto impacto." },
    { Icon: ShoppingBag, t: "E-commerce", d: "Tiendas que venden 24/7 con checkout optimizado." },
    { Icon: Smartphone, t: "Aplicaciones", d: "Web apps y PWAs a medida, rápidas y escalables." },
    { Icon: Layers, t: "UI / UX", d: "Sistemas de diseño e interfaces que se sienten premium." },
    { Icon: Wrench, t: "Mantenimiento", d: "Soporte, seguridad y mejoras continuas." },
    {
      Icon: ShieldCheck,
      t: "Performance & SEO",
      d: "Core Web Vitals en verde y visibilidad orgánica.",
    },
  ];
  const steps = [
    "Descubrimiento",
    "Estrategia & diseño",
    "Desarrollo",
    "Lanzamiento",
    "Crecimiento",
  ];
  return (
    <section id="empresa" className="section-y relative">
      <div className="container-x">
        <SectionHead
          eyebrow={`02 — ${company.companyName}`}
          title={
            <>
              Un estudio pequeño <span className="text-gradient">con ambición enorme.</span>
            </>
          }
        />
        <div className="mb-16 grid gap-4 md:grid-cols-2">
          {[
            { l: "Misión", t: company.mission },
            { l: "Visión", t: company.vision },
          ].map((m, i) => (
            <Reveal key={m.l} delay={i * 0.1}>
              <div className="h-full rounded-3xl border p-8">
                <p className="text-eyebrow mb-3">{m.l}</p>
                <p className="font-display text-2xl font-semibold leading-snug">{m.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.t} delay={(i % 3) * 0.08}>
              <SpotlightCard className="group h-full p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div className="grid size-12 place-items-center rounded-2xl bg-muted">
                    <s.Icon className="size-5 text-primary" />
                  </div>
                  <ArrowUpRight className="size-5 text-muted-foreground transition-all group-hover:rotate-45 group-hover:text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
        <div className="mt-24">
          <Reveal>
            <p className="text-eyebrow mb-8">Nuestro proceso</p>
          </Reveal>
          <ol className="grid gap-6 md:grid-cols-5">
            {steps.map((s, i) => (
              <Reveal key={s} delay={i * 0.12}>
                <li className="relative border-t-2 border-border pt-6">
                  <motion.span
                    className="absolute -top-0.5 left-0 h-0.5 bg-gradient-brand"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.2, duration: 0.8 }}
                  />
                  <span className="font-display text-sm text-primary">0{i + 1}</span>
                  <p className="mt-2 font-display text-lg font-semibold">{s}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
