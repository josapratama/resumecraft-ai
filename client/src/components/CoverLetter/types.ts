export type CoverLetterTemplateId =
  | "formal-bumn"
  | "modern-tech"
  | "minimalist"
  | "creative-agency"
  | "fresh-graduate"
  | "career-switch"
  | "international"
  | "email-compact"
  | "executive"
  | "academic";

export interface CoverLetterData {
  // Sender information
  fullName: string;
  email: string;
  phone: string;
  location: string;
  photoUrl?: string | null;
  targetRole?: string;
  portfolioUrl?: string;

  // Recipient information
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  jobTitle: string;
  jobSource: string;
  date: string;
  city: string;

  // Letter content
  subject: string;
  referenceNumber?: string;
  salutation: string;
  opening: string;
  body: string;
  skillsHighlight: string[];
  attachments: string[];
  closing: string;
  signOff: string;
  fullLetterText?: string;

  // Additional metadata for specialized templates
  educationDegree?: string;
  educationSchool?: string;
  educationGpa?: string;
  previousField?: string;
  yearsOfExperience?: string;
  researchInterests?: string;

  // Visual Styling
  accentColor: string;
  fontFamily: string;
  includeSignature: boolean;
}

export interface CoverLetterTemplateMeta {
  id: CoverLetterTemplateId;
  name: string;
  nameId: string;
  badge: string;
  description: string;
  category: "Resmi / Nasional" | "Tech & Startup" | "Internasional" | "Karier Spesifik";
  recommendedFor: string;
}

export const COVER_LETTER_TEMPLATES: CoverLetterTemplateMeta[] = [
  {
    id: "formal-bumn",
    name: "Standar Formal BUMN & Instansi",
    nameId: "Format Baku Indonesia",
    badge: "BUMN / ASN",
    description: "Format resmi standar EYD dengan nomor perihal, tabel biodata pelamar, dan daftar lampiran berkas resmi.",
    category: "Resmi / Nasional",
    recommendedFor: "BUMN, Kementerian, BUMD, Bank BUMN, dan Lembaga Resmi",
  },
  {
    id: "modern-tech",
    name: "Modern Tech & Startup",
    nameId: "Startup & IT",
    badge: "Tech Popular",
    description: "Desain kartu kontemporer dengan badge posisi, pencapaian terukur, dan tautan portofolio/GitHub.",
    category: "Tech & Startup",
    recommendedFor: "Software Engineer, Product Manager, Data Scientist, Tech Startups",
  },
  {
    id: "minimalist",
    name: "Minimalist Clean (Swiss)",
    nameId: "Minimalis Elegan",
    badge: "Clean & High Readability",
    description: "Tipografi presisi gaya Swiss dengan margin lega, garis pemisah 1px halus, dan kesan elegan.",
    category: "Tech & Startup",
    recommendedFor: "Konsultan Manajemen, Firma Hukum, Arsitektur, Media",
  },
  {
    id: "creative-agency",
    name: "Creative & Visual Agency",
    nameId: "Agensi & Desain",
    badge: "Visual / Portfolio",
    description: "Tata letak dua kolom dengan sidebar aksen warna, avatar/foto pelamar, dan pill keahlian visual.",
    category: "Tech & Startup",
    recommendedFor: "UI/UX Designer, Graphic Designer, Content Creator, Creative Marketing",
  },
  {
    id: "fresh-graduate",
    name: "Fresh Graduate & Magang",
    nameId: "Lulusan Baru / Magang",
    badge: "Entry-Level",
    description: "Menitikberatkan prestasi akademik, IPK, kegiatan organisasi, skripsi/proyek kuliah, dan antusiasme belajar.",
    category: "Karier Spesifik",
    recommendedFor: "Lulusan Baru (S1/D3/SMK), Internship, Management Trainee (MT)",
  },
  {
    id: "career-switch",
    name: "Career Switcher & Transisi",
    nameId: "Pindah Jalur Karier",
    badge: "Transferable Skills",
    description: "Struktur komparasi nilai yang menonjolkan keahlian lintas industri dan motivasi kuat berpindah haluan.",
    category: "Karier Spesifik",
    recommendedFor: "Pelamar Lintas Bidang, Bootcamp Alumni, Re-entering Workforce",
  },
  {
    id: "international",
    name: "US/UK International Corporate",
    nameId: "Standar Bahasa Inggris",
    badge: "Global / Remote",
    description: "Standar penulisan Cover Letter multinasional (US/UK) dengan employer address block dan sign-off formal.",
    category: "Internasional",
    recommendedFor: "Perusahaan Global, Lowongan Remote Luar Negeri, NGO Internasional",
  },
  {
    id: "email-compact",
    name: "Email Application (Body Email)",
    nameId: "Ringkas via Email",
    badge: "Quick Direct Pitch",
    description: "Diformat khusus untuk badan email lamaran: to the point (< 200 kata) dengan subjek baku dan lampiran PDF.",
    category: "Resmi / Nasional",
    recommendedFor: "Lamaran via Email Langsung, Fast Hiring, Outreach ke HRD",
  },
  {
    id: "executive",
    name: "Executive & Leadership",
    nameId: "Manajerial & Lead",
    badge: "C-Level / Manager",
    description: "Letterhead prestisius dengan aksen korporat, berfokus pada strategi bisnis, revenue impact, dan tata kelola tim.",
    category: "Karier Spesifik",
    recommendedFor: "Manager, VP, Team Lead, Direktur, Senior Specialist",
  },
  {
    id: "academic",
    name: "Academic, Riset & Beasiswa",
    nameId: "Akademisi & Peneliti",
    badge: "Riset & Beasiswa",
    description: "Format institusi akademik dengan fokus bidang penelitian, metodologi riset, publikasi, dan kontribusi keilmuan.",
    category: "Karier Spesifik",
    recommendedFor: "Dosen, Peneliti Laboratorium, Asisten Riset, Beasiswa Master/PhD",
  },
];
