import type { FullCVData } from "@/types/cv";

/**
 * Standard JSON Resume (v1.0.0) Schema representation
 * Compatible with https://jsonresume.org/schema/
 */
export interface JSONResumeSchema {
  $schema?: string;
  basics: {
    name: string;
    label?: string;
    image?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryCode?: string;
      region?: string;
    };
    profiles?: Array<{
      network: string;
      username?: string;
      url: string;
    }>;
  };
  work?: Array<{
    name: string;
    position: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    institution: string;
    url?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
    courses?: string[];
  }>;
  skills?: Array<{
    name: string;
    level?: string;
    keywords?: string[];
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    roles?: string[];
    entity?: string;
    type?: string;
  }>;
  certificates?: Array<{
    name: string;
    date?: string;
    issuer?: string;
    url?: string;
  }>;
  languages?: Array<{
    language: string;
    fluency?: string;
  }>;
  awards?: Array<{
    title: string;
    date?: string;
    awarder?: string;
    summary?: string;
  }>;
  meta?: {
    canonical?: string;
    version?: string;
    lastModified?: string;
  };
}

/**
 * Converts ResumeCraft FullCVData to standard JSON Resume v1.0.0 format.
 */
export function exportToJSONResume(cvData: FullCVData): JSONResumeSchema {
  const p = cvData.personalInfo;
  const skills = cvData.skills || [];
  const works = cvData.workExperiences || [];
  const edus = cvData.educations || [];
  const projs = cvData.projects || [];
  const certs = cvData.certifications || [];
  const langs = cvData.languages || [];
  const customs = cvData.customSections || [];

  // Group skills by category
  const skillCategories = new Map<string, string[]>();
  skills.forEach(s => {
    const cat = s.category || "General";
    if (!skillCategories.has(cat)) {
      skillCategories.set(cat, []);
    }
    skillCategories.get(cat)!.push(s.skillName);
  });

  const skillsList = Array.from(skillCategories.entries()).map(([cat, keywords]) => ({
    name: cat,
    keywords,
  }));

  const jsonResume: JSONResumeSchema = {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: p?.fullName || cvData.cv.title || "Candidate",
      label: cvData.cv?.targetRole || undefined,
      image: p?.photoUrl || undefined,
      email: p?.email || undefined,
      phone: p?.phone || undefined,
      url: cvData.cv?.portfolioUrl || undefined,
      summary: p?.professionalSummary || undefined,
      location: p?.location ? { address: p.location, city: p.location } : undefined,
      profiles: cvData.cv?.portfolioUrl
        ? [
            {
              network: "Portfolio / Website",
              url: cvData.cv.portfolioUrl,
            },
          ]
        : [],
    },
    work: works.map(w => ({
      name: w.company,
      position: w.jobTitle,
      startDate: w.startDate || undefined,
      endDate: w.endDate || "Present",
      summary: w.description || undefined,
      highlights: w.description ? w.description.split("\n").filter(Boolean) : [],
    })),
    education: edus.map(e => ({
      institution: e.school,
      area: e.field || undefined,
      studyType: e.degree || undefined,
      endDate: e.graduationDate || undefined,
      summary: e.description || undefined,
    })),
    skills: skillsList,
    projects: projs.map(pr => ({
      name: pr.projectName,
      description: pr.description || undefined,
      url: pr.link || undefined,
      keywords: pr.technologies ? pr.technologies.split(",").map(t => t.trim()).filter(Boolean) : [],
      startDate: pr.startDate || undefined,
      endDate: pr.endDate || undefined,
    })),
    certificates: certs.map(c => ({
      name: c.certificationName,
      issuer: c.issuer || undefined,
      date: c.issueDate || undefined,
      url: c.link || undefined,
    })),
    languages: langs.map(l => ({
      language: l.language,
      fluency: l.proficiency || undefined,
    })),
    awards: customs.map(cs => ({
      title: cs.title,
      awarder: cs.subtitle || undefined,
      date: cs.date || undefined,
      summary: cs.description || undefined,
    })),
    meta: {
      canonical: "https://resumecraft-ai.josapratama.com",
      version: "v1.0.0",
      lastModified: new Date().toISOString(),
    },
  };

  return jsonResume;
}

/**
 * Downloads standard JSON Resume (.json)
 */
export function downloadJSONResumeFile(cvData: FullCVData): void {
  const jsonResume = exportToJSONResume(cvData);
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonResume, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  const safeName = (cvData.personalInfo?.fullName || cvData.cv.title || "resume")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  dlAnchor.setAttribute("download", `${safeName}_resume.json`);
  dlAnchor.click();
}
