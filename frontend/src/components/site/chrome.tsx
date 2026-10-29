import { useShallow } from "zustand/react/shallow";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import {
  AtSign,
  Briefcase,
  Camera,
  Code2,
  Menu,
  MessageCircle,
  Moon,
  Play,
  Sun,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSite } from "@/store/site";
import type { SocialNetwork } from "@/types";
import { Magnetic } from "./effects";
import { daysEs, useOpenStatus } from "./schedule-utils";

export const nav = [
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "empresa", label: "Empresa" },
  { id: "experiencia", label: "Experiencia" },
  { id: "portafolio", label: "Portafolio" },
  { id: "horario", label: "Horario" },
];

export const socialIcons: Record<SocialNetwork, LucideIcon> = {
  linkedin: Briefcase,
  github: Code2,
  instagram: Camera,
  facebook: Users,
  x: AtSign,
  whatsapp: MessageCircle,
  youtube: Play,
};

export function Navbar() {
  const { theme, toggleTheme, company } = useSite();
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    [...nav.map((n) => n.id), "contacto"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <motion.div
        className="fixed inset-x-0 top-0 h-0.5 origin-left bg-gradient-brand"
        style={{ scaleX: scrollYProgress }}
      />
      <nav
        aria-label="Principal"
        className="glass mx-auto flex max-w-5xl items-center justify-between rounded-full py-2 pl-5 pr-2"
      >
        <a href="#inicio" className="font-display text-sm font-bold tracking-tight">
          {company.companyName}
          <span className="text-gradient">.</span>
        </a>
        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                className={`relative rounded-full px-3.5 py-2 text-sm transition-colors ${active === n.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {active === n.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-muted"
                  />
                )}
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="grid size-10 place-items-center rounded-full hover:bg-muted"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
          <Link
            to="/login"
            className="hidden rounded-full border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted sm:inline-block"
          >
            Iniciar sesión
          </Link>
          <a
            href="#contacto"
            className="hidden rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow sm:inline-block"
          >
            Hablemos
          </a>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menú"
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full hover:bg-muted md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass mx-auto mt-2 max-w-5xl rounded-3xl p-3 md:hidden"
          >
            {[...nav, { id: "contacto", label: "Contacto" }].map((n) => (
              <li key={n.id}>
                <a
                  onClick={() => setOpen(false)}
                  href={`#${n.id}`}
                  className="block rounded-2xl px-4 py-3 hover:bg-muted"
                >
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                onClick={() => setOpen(false)}
                to="/login"
                className="block rounded-2xl px-4 py-3 font-semibold text-primary hover:bg-muted"
              >
                Iniciar sesión
              </Link>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SocialLinks({ size = "md" }: { size?: "md" | "lg" }) {
  const social = useSite(useShallow((s) => s.social.filter((x) => x.visible)));
  return (
    <ul className="flex flex-wrap gap-3">
      {social.map((s) => {
        const Icon = socialIcons[s.network];
        return (
          <li key={s.id}>
            <Magnetic>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                aria-label={s.network}
                className={`group grid place-items-center rounded-full border transition-all hover:-translate-y-1 hover:border-primary hover:bg-gradient-brand hover:text-primary-foreground hover:shadow-glow ${size === "lg" ? "size-14" : "size-11"}`}
              >
                <Icon
                  className={`${size === "lg" ? "size-5" : "size-4"} transition-transform group-hover:scale-110`}
                />
              </a>
            </Magnetic>
          </li>
        );
      })}
    </ul>
  );
}

export function Footer() {
  const { company, schedule } = useSite();
  const status = useOpenStatus();
  return (
    <footer className="border-t">
      <div className="container-x grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl font-bold">
            {company.companyName}
            <span className="text-gradient">.</span>
          </p>
          <p className="mt-3 max-w-sm text-muted-foreground">{company.mission}</p>
          <div className="mt-6">
            <SocialLinks />
          </div>
        </div>
        <div>
          <p className="text-eyebrow mb-4">Navegación</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {nav.map((n) => (
              <li key={n.id}>
                <a className="hover:text-foreground" href={`#${n.id}`}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-eyebrow mb-4">Horario</p>
          {status && (
            <p
              className={`mb-3 text-sm font-medium ${status.open ? "text-success" : "text-muted-foreground"}`}
            >
              ● {status.open ? "Abierto ahora" : "Cerrado"}
            </p>
          )}
          <ul className="space-y-1 text-sm text-muted-foreground">
            {[...schedule.days.slice(1), ...schedule.days.slice(0, 1)].map((d) => (
              <li key={d.day} className="flex justify-between gap-4">
                <span>{daysEs[d.day]!.slice(0, 3)}</span>
                <span>
                  {d.enabled
                    ? `${d.slots[0]?.open}–${d.slots[d.slots.length - 1]?.close}`
                    : "Cerrado"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col justify-between gap-2 border-t py-6 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {company.companyName}. Todos los derechos reservados.
        </p>
        <p>Diseñado y desarrollado por {company.ownerName}.</p>
      </div>
    </footer>
  );
}
