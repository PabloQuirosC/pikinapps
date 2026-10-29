export type Theme = "dark" | "light";

export interface CompanyInfo {
  ownerName: string;
  companyName: string;
  role: string;
  heroTitle: string;
  heroRotating: string[];
  heroSubtitle: string;
  mission: string;
  vision: string;
  email: string;
  whatsapp: string;
  location: string;
}

export type SocialNetwork =
  "linkedin" | "github" | "instagram" | "facebook" | "x" | "whatsapp" | "youtube";
export interface SocialLink {
  id: string;
  network: SocialNetwork;
  url: string;
  visible: boolean;
}

export interface TimeSlot {
  open: string;
  close: string;
}
export interface DaySchedule {
  day: number;
  enabled: boolean;
  slots: TimeSlot[];
}
export interface ScheduleException {
  date: string;
  label: string;
  closed: boolean;
}
export interface Schedule {
  timezone: string;
  days: DaySchedule[];
  exceptions: ScheduleException[];
}

export type ExperienceKind = "work" | "education" | "certification";
export interface Experience {
  id: string;
  kind: ExperienceKind;
  title: string;
  org: string;
  start: string;
  end: string;
  description: string;
  visible: boolean;
}
export interface Skill {
  id: string;
  name: string;
  level: number;
  visible: boolean;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  url: string;
  category: string;
  technologies: string[];
  description: string;
  caseStudy: string;
  images: string[];
  featured: boolean;
  status: "draft" | "published";
  order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export type Role = "admin" | "editor" | "lector";
export interface Account {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  active: boolean;
}
export interface Session {
  userId: string;
  name: string;
  email: string;
  role: Role;
  at: string;
}

export type MessageStatus = "new" | "read" | "replied" | "archived" | "spam";
export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string | undefined;
  subject: string;
  message: string;
  projectType: string;
  budget: string;
  status: MessageStatus;
  createdAt: string;
}
