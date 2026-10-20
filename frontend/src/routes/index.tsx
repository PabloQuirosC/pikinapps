import { createFileRoute } from "@tanstack/react-router";
import { Footer, Navbar } from "@/components/site/chrome";
import { SmoothScroll } from "@/components/site/effects";
import { About, Company, Hero } from "@/components/site/top";
import { ExperienceSection, Portfolio, Testimonials } from "@/components/site/middle";
import { Contact, ScheduleSection } from "@/components/site/bottom";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "[MI NOMBRE] — Desarrollo web premium | PikinApps" },
      { name: "description", content: "Diseño y desarrollo de sitios web, e-commerce y aplicaciones a medida para marcas que quieren destacar." },
      { property: "og:title", content: "PikinApps — Desarrollo web premium" },
      { property: "og:description", content: "Sitios web, e-commerce y apps a medida con diseño de estudio y código impecable." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="grain overflow-x-clip">
      <a href="#sobre-mi" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-card focus:px-4 focus:py-2">Saltar al contenido</a>
      <SmoothScroll />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Company />
        <ExperienceSection />
        <Portfolio />
        <Testimonials />
        <ScheduleSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
