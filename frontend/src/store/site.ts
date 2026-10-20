import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedCompany, seedExperience, seedProjects, seedSchedule, seedSkills, seedSocial, seedTestimonials } from "@/data/seed";
import type { CompanyInfo, Experience, Message, Project, Schedule, Skill, SocialLink, Testimonial, Theme } from "@/types";

interface SiteState {
  theme: Theme;
  company: CompanyInfo;
  social: SocialLink[];
  schedule: Schedule;
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  testimonials: Testimonial[];
  messages: Message[];
  toggleTheme: () => void;
  addMessage: (m: Omit<Message, "id" | "status" | "createdAt">) => void;
}

/** Store global persistido en localStorage. skipHydration evita desajustes SSR; se rehidrata en el cliente. */
export const useSite = create<SiteState>()(
  persist(
    (set) => ({
      theme: "dark",
      company: seedCompany,
      social: seedSocial,
      schedule: seedSchedule,
      experience: seedExperience,
      skills: seedSkills,
      projects: seedProjects,
      testimonials: seedTestimonials,
      messages: [],
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      addMessage: (m) =>
        set((s) => ({
          messages: [{ ...m, id: crypto.randomUUID(), status: "new", createdAt: new Date().toISOString() }, ...s.messages],
        })),
    }),
    { name: "site-store-v1", skipHydration: true, partialize: (s) => ({ theme: s.theme, messages: s.messages }) },
  ),
);
