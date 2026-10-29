import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  seedCompany,
  seedExperience,
  seedProjects,
  seedSchedule,
  seedSkills,
  seedSocial,
  seedTestimonials,
} from "@/data/seed";
import { api } from "@/lib/api";
import type {
  CompanyInfo,
  Experience,
  Message,
  Project,
  Schedule,
  Skill,
  SocialLink,
  Testimonial,
  Theme,
} from "@/types";

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
  updateCompany: (company: CompanyInfo) => void;
  loadCompany: () => Promise<void>;
  updateExperience: (experience: Experience[]) => void;
  updateSkills: (skills: Skill[]) => void;
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
      updateCompany: (company) => set({ company }),
      updateExperience: (experience) => set({ experience }),
      updateSkills: (skills) => set({ skills }),
      loadCompany: async () => {
        try {
          const remote = await api.company();
          const currentExperience = useSite.getState().experience;
          const currentSkills = useSite.getState().skills;
          set({
            company: {
              ownerName: remote.owner_name,
              companyName: remote.company_name,
              role: remote.role,
              heroTitle: remote.hero_title,
              heroRotating: remote.hero_rotating,
              heroSubtitle: remote.hero_subtitle,
              mission: remote.mission,
              vision: remote.vision,
              email: remote.email,
              whatsapp: remote.whatsapp,
              location: remote.location,
            },
            experience: (remote.experience ?? currentExperience).map((item) => ({
              id: String(item.id),
              kind: item.kind,
              title: item.title,
              org: item.org,
              start: item.start,
              end: item.end,
              description: item.description,
              visible: item.visible,
            })),
            skills: (remote.skills ?? currentSkills).map((item) => ({
              id: String(item.id),
              name: item.name,
              level: item.level,
              visible: item.visible,
            })),
          });
        } catch (error) {
          console.error("No se pudo cargar la configuración de empresa.", error);
        }
      },
      addMessage: (m) =>
        set((s) => ({
          messages: [
            { ...m, id: crypto.randomUUID(), status: "new", createdAt: new Date().toISOString() },
            ...s.messages,
          ],
        })),
    }),
    {
      name: "site-store-v1",
      skipHydration: true,
      partialize: (s) => ({
        theme: s.theme,
        company: s.company,
        experience: s.experience,
        skills: s.skills,
        messages: s.messages,
      }),
    },
  ),
);
