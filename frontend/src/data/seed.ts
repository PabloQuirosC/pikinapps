import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import type { CompanyInfo, Experience, Project, Schedule, Skill, SocialLink, Testimonial } from "@/types";

export const seedCompany: CompanyInfo = {
  ownerName: "Pablo Quirós Cortes",
  companyName: "PikinApps",
  role: "Fundador & Desarrollador Full-Stack",
  heroTitle: "Construyo productos digitales que",
  heroRotating: ["venden más.", "se sienten premium.", "escalan sin miedo.", "enamoran a tus clientes."],
  heroSubtitle:
    "Diseño y desarrollo sitios web, e-commerce y aplicaciones a medida para marcas que quieren destacar — con código impecable y obsesión por el detalle.",
  mission: "Convertir ideas ambiciosas en productos digitales rápidos, bellos y rentables.",
  vision: "Ser el estudio de referencia en Latinoamérica para marcas que compiten a nivel global.",
  email: "hola@miempresa.com",
  whatsapp: "+50600000000",
  location: "San José, Costa Rica",
};

export const seedSocial: SocialLink[] = [
  { id: "s1", network: "linkedin", url: "https://linkedin.com", visible: true },
  { id: "s2", network: "github", url: "https://github.com", visible: true },
  { id: "s3", network: "instagram", url: "https://instagram.com", visible: true },
  { id: "s4", network: "x", url: "https://x.com", visible: true },
  { id: "s5", network: "whatsapp", url: "https://wa.me/50600000000", visible: true },
  { id: "s6", network: "youtube", url: "https://youtube.com", visible: true },
  { id: "s7", network: "facebook", url: "https://facebook.com", visible: false },
];

const weekday = { enabled: true, slots: [{ open: "08:00", close: "12:00" }, { open: "13:00", close: "18:00" }] };
export const seedSchedule: Schedule = {
  timezone: "America/Costa_Rica",
  days: [
    { day: 0, enabled: false, slots: [] },
    { day: 1, ...weekday },
    { day: 2, ...weekday },
    { day: 3, ...weekday },
    { day: 4, ...weekday },
    { day: 5, enabled: true, slots: [{ open: "08:00", close: "16:00" }] },
    { day: 6, enabled: true, slots: [{ open: "09:00", close: "12:00" }] },
  ],
  exceptions: [
    { date: "2026-12-25", label: "Navidad", closed: true },
    { date: "2027-01-01", label: "Año Nuevo", closed: true },
  ],
};

export const seedExperience: Experience[] = [
  { id: "e1", kind: "work", title: "Fundador & Lead Developer", org: "PikinApps", start: "2019", end: "Actualidad", description: "Dirijo un estudio boutique que ha lanzado más de 120 productos para clientes en 9 países.", visible: true },
  { id: "e2", kind: "work", title: "Senior Frontend Engineer", org: "Agencia Global Digital", start: "2016", end: "2019", description: "Lideré el frontend de plataformas e-commerce con millones de visitas mensuales.", visible: true },
  { id: "e3", kind: "work", title: "Desarrollador Web", org: "Startup Fintech", start: "2013", end: "2016", description: "Construí desde cero el dashboard de clientes y el sistema de diseño.", visible: true },
  { id: "e4", kind: "education", title: "Ingeniería en Sistemas", org: "Universidad de Costa Rica", start: "2009", end: "2013", description: "Énfasis en ingeniería de software e interacción humano-computadora.", visible: true },
  { id: "e5", kind: "certification", title: "AWS Certified Developer", org: "Amazon Web Services", start: "2022", end: "2025", description: "Arquitecturas serverless y despliegues escalables.", visible: true },
];

export const seedSkills: Skill[] = [
  { id: "k1", name: "React / Next.js", level: 96, visible: true },
  { id: "k2", name: "TypeScript", level: 93, visible: true },
  { id: "k3", name: "UI / UX Design", level: 88, visible: true },
  { id: "k4", name: "Node.js", level: 85, visible: true },
  { id: "k5", name: "E-commerce (Shopify)", level: 90, visible: true },
  { id: "k6", name: "Performance & SEO", level: 92, visible: true },
];

export const seedProjects: Project[] = [
  { id: "pr1", title: "Vélora", client: "Vélora Fashion", url: "https://example.com", category: "E-commerce", technologies: ["Shopify", "React", "Tailwind"], description: "Tienda de moda de lujo con experiencia editorial.", caseStudy: "Rediseñamos el embudo de compra completo. Resultado: +68% en conversión y -40% en tasa de rebote en 3 meses.", images: [p1], featured: true, status: "published", order: 1 },
  { id: "pr2", title: "InsightPro", client: "InsightPro Inc.", url: "https://example.com", category: "SaaS", technologies: ["Next.js", "TypeScript", "Recharts"], description: "Landing y dashboard para plataforma de analítica.", caseStudy: "Sistema de diseño escalable y landing optimizada: Lighthouse 99 y +3.2x registros de prueba.", images: [p2], featured: true, status: "published", order: 2 },
  { id: "pr3", title: "Ember & Bean", client: "Ember & Bean Roasters", url: "https://example.com", category: "Web corporativa", technologies: ["Astro", "React", "Stripe"], description: "Sitio y tienda para tostaduría artesanal.", caseStudy: "Suscripciones de café con Stripe que hoy representan el 45% de los ingresos recurrentes.", images: [p3], featured: false, status: "published", order: 3 },
];

export const seedTestimonials: Testimonial[] = [
  { id: "t1", name: "Laura Méndez", role: "CEO, Vélora", quote: "No solo entregaron un sitio hermoso: duplicaron nuestras ventas online. El nivel de detalle es otra liga." },
  { id: "t2", name: "Diego Ramírez", role: "CTO, InsightPro", quote: "Código limpio, comunicación impecable y plazos cumplidos. Es raro encontrar ese balance." },
  { id: "t3", name: "Sofía Castro", role: "Fundadora, Ember & Bean", quote: "Entendieron nuestra marca mejor que nosotros. Cada cliente nos felicita por la web." },
];

export const techStack = ["React", "TypeScript", "Next.js", "Node.js", "Tailwind", "Framer Motion", "Shopify", "Figma", "PostgreSQL", "AWS", "Stripe", "Vercel"];
