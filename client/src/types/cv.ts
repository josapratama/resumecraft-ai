export interface PersonalInfo {
  id: number;
  cvId: number;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  professionalSummary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkExperience {
  id: number;
  cvId: number;
  position: number;
  jobTitle: string;
  company: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Education {
  id: number;
  cvId: number;
  position: number;
  degree: string;
  field: string;
  school: string;
  location: string | null;
  graduationDate: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: number;
  cvId: number;
  position: number;
  category: string;
  skillName: string;
  proficiency: "beginner" | "intermediate" | "advanced" | "expert" | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: number;
  cvId: number;
  position: number;
  projectName: string;
  description: string | null;
  technologies: string | null;
  link: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: number;
  cvId: number;
  position: number;
  certificationName: string;
  issuer: string;
  issueDate: string | null;
  expiryDate: string | null;
  link: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateId =
  | "modern"
  | "classic"
  | "minimal"
  | "executive"
  | "tech"
  | "creative"
  | "elegant"
  | "bold"
  | "corporate"
  | "academic"
  | "compact"
  | "timeline"
  | "infographic"
  | "newspaper"
  | "nordic"
  | "retro"
  | "stealth"
  | "gradient"
  | "brutalist"
  | "sidebar-light"
  | "two-page"
  | "portfolio"
  | "monochrome"
  | "atlas"
  | "swiss";

export interface CV {
  id: number;
  userId: number;
  title: string;
  template: TemplateId;
  createdAt: Date;
  updatedAt: Date;
}

export interface FullCVData {
  cv: CV;
  personalInfo: PersonalInfo | null;
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
}
