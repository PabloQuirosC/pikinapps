import { useShallow } from "zustand/react/shallow";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  ExternalLink,
  GraduationCap,
  Quote,
  SearchX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSite } from "@/store/site";
import type { Project } from "@/types";
import { Reveal, SpotlightCard } from "./effects";
import { SectionHead } from "./top";

const kindIcon = { work: Briefcase, education: GraduationCap, certification: Award };
const kindLabel = { work: "Laboral", education: "Educación", certification: "Certificación" };
const experienceTabs = [
  { kind: "work", label: "Laboral" },
  { kind: "certification", label: "Certificaciones" },
  { kind: "education", label: "Educación" },
] as const;

export function ExperienceSection() {
  const experience = useSite(useShallow((s) => s.experience.filter((e) => e.visible)));
  const skills = useSite(useShallow((s) => s.skills.filter((k) => k.visible)));
  const [activeKind, setActiveKind] = useState<(typeof experienceTabs)[number]["kind"]>("work");
  const filteredExperience = experience.filter((item) => item.kind === activeKind);

  return (
    <section id="experiencia" className="section-y">
      <div className="container-x">
        <SectionHead
          eyebrow="03 — Experiencia"
          title={
            <>
              Una década <span className="text-gradient">construyendo.</span>
            </>
          }
        />
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div
              role="tablist"
              aria-label="Categorías de experiencia"
              className="mb-5 flex flex-wrap gap-2"
            >
              {experienceTabs.map((tab) => (
                <button
                  key={tab.kind}
                  type="button"
                  role="tab"
                  aria-selected={activeKind === tab.kind}
                  onClick={() => setActiveKind(tab.kind)}
                  className={`relative rounded-full border px-4 py-2 text-sm transition-colors ${
                    activeKind === tab.kind
                      ? "border-transparent text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {activeKind === tab.kind && (
                    <motion.span
                      layoutId="experience-tab"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-brand"
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
            {filteredExperience.length === 0 ? (
              <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed bg-card/20 p-6 text-center text-sm text-muted-foreground">
                Aún no hay experiencias en esta categoría.
              </div>
            ) : (
              <ol className="grid gap-4 sm:grid-cols-2">
                {filteredExperience.map((e, i) => {
                  const Icon = kindIcon[e.kind];
                  return (
                    <Reveal key={e.id} delay={i * 0.08}>
                      <li className="h-full rounded-2xl border bg-card/40 p-4 transition-colors hover:border-primary/40">
                        <div className="flex items-start gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full border bg-card">
                            <Icon className="size-3.5 text-primary" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[0.68rem] text-muted-foreground">
                              {e.start} — {e.end} · {kindLabel[e.kind]}
                            </p>
                            <h3 className="mt-1 text-base font-semibold leading-tight">
                              {e.title}
                            </h3>
                            <p className="mt-1 text-sm text-primary">{e.org}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {e.description}
                        </p>
                      </li>
                    </Reveal>
                  );
                })}
              </ol>
            )}
          </div>
          <div>
            <p className="text-eyebrow mb-6">Habilidades</p>
            <ul className="space-y-4">
              {skills.map((k, i) => (
                <li key={k.id}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{k.name}</span>
                    <span className="text-muted-foreground">{k.level}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gradient-brand"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${k.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrowserFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex items-center gap-1.5 border-b px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/70" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-success/70" />
        <span className="ml-3 h-5 flex-1 rounded-md bg-muted" />
      </div>
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={1280}
          height={800}
          className="size-full object-cover object-top transition-transform duration-[2.5s] ease-out group-hover:scale-105"
        />
      </div>
    </div>
  );
}

export function Portfolio() {
  const projects = useSite(
    useShallow((s) =>
      s.projects.filter((p) => p.status === "published").sort((a, b) => a.order - b.order),
    ),
  );
  const cats = useMemo(() => ["Todos", ...new Set(projects.map((p) => p.category))], [projects]);
  const [cat, setCat] = useState("Todos");
  const [sel, setSel] = useState<Project | null>(null);
  const list = cat === "Todos" ? projects : projects.filter((p) => p.category === cat);

  useEffect(() => {
    if (!sel) return;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", k);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", k);
    };
  }, [sel]);

  return (
    <section id="portafolio" className="section-y">
      <div className="container-x">
        <SectionHead
          eyebrow="04 — Portafolio"
          title={
            <>
              Páginas que <span className="text-gradient">hablan por mí.</span>
            </>
          }
        />
        <div role="tablist" className="mb-10 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`relative rounded-full border px-5 py-2 text-sm transition-colors ${cat === c ? "border-transparent text-primary-foreground" : "hover:bg-muted"}`}
            >
              {cat === c && (
                <motion.span
                  layoutId="cat"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-brand"
                />
              )}
              {c}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-dashed py-20 text-center text-muted-foreground">
            <SearchX className="mb-3 size-8" />
            No hay proyectos en esta categoría.
          </div>
        ) : (
          <motion.div layout className="grid gap-8 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {list.map((p, i) => (
                <motion.button
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSel(p)}
                  className={`group text-left ${p.featured && i === 0 ? "md:col-span-2" : ""}`}
                >
                  <BrowserFrame src={p.images[0] ?? ""} alt={p.title} />
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold">{p.title}</h3>
                      <p className="mt-1 text-muted-foreground">{p.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {p.technologies.map((t) => (
                          <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                      {p.category}
                    </span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {sel && (
          <motion.div
            className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setSel(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={sel.title}
              initial={{ y: 40, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative my-8 w-full max-w-4xl rounded-3xl border bg-card p-6 shadow-card md:p-10"
              data-lenis-prevent
            >
              <button
                onClick={() => setSel(null)}
                aria-label="Cerrar"
                className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted"
              >
                <X className="size-5" />
              </button>
              <p className="text-eyebrow">
                {sel.category} · {sel.client}
              </p>
              <h3 className="mt-2 text-display-lg font-bold">{sel.title}</h3>
              <div className="group mt-8">
                <BrowserFrame src={sel.images[0] ?? ""} alt={sel.title} />
              </div>
              <div className="mt-8 grid gap-8 md:grid-cols-[2fr_1fr]">
                <div>
                  <p className="text-eyebrow mb-3">Caso de estudio</p>
                  <p className="text-lg leading-relaxed">{sel.caseStudy}</p>
                </div>
                <div>
                  <p className="text-eyebrow mb-3">Tecnologías</p>
                  <div className="flex flex-wrap gap-2">
                    {sel.technologies.map((t) => (
                      <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                  <a
                    href={sel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Ver en vivo <ExternalLink className="size-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function Testimonials() {
  const items = useSite((s) => s.testimonials);
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);
  const t = items[i]!;
  return (
    <section className="section-y">
      <div className="container-x">
        <SpotlightCard tilt={false} className="relative overflow-hidden p-8 md:p-16">
          <Quote className="mb-8 size-12 text-primary" />
          <div className="min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.figure
                key={t.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
              >
                <blockquote className="font-display text-2xl font-medium leading-snug md:text-4xl">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-8">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <button
              aria-label="Anterior"
              onClick={() => setI((i - 1 + items.length) % items.length)}
              className="grid size-11 place-items-center rounded-full border hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              aria-label="Siguiente"
              onClick={() => setI((i + 1) % items.length)}
              className="grid size-11 place-items-center rounded-full border hover:bg-muted"
            >
              <ArrowRight className="size-4" />
            </button>
            <div className="ml-4 flex gap-2">
              {items.map((x, n) => (
                <span
                  key={x.id}
                  className={`h-1 rounded-full transition-all ${n === i ? "w-8 bg-gradient-brand" : "w-3 bg-muted"}`}
                />
              ))}
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
