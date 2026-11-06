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
  | "academic"
  // 15 New Templates
  | "corporate-banking"
  | "tech-bold"
  | "healthcare-medical"
  | "legal-consulting"
  | "sales-marketing"
  | "hospitality-tourism"
  | "remote-work"
  | "startup-pitch"
  | "engineering-industrial"
  | "education-teaching"
  | "nonprofit-ngo"
  | "freelance-contract"
  | "editorial-journalism"
  | "nordic-clean"
  | "classic-vintage";

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
  category: "Resmi / Nasional" | "Tech & Startup" | "Industri Spesifik" | "Internasional";
  recommendedFor: string;
}

export const COVER_LETTER_TEMPLATES: CoverLetterTemplateMeta[] = [
  // 1-10 Original Templates
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
    category: "Industri Spesifik",
    recommendedFor: "Lulusan Baru (S1/D3/SMK), Internship, Management Trainee (MT)",
  },
  {
    id: "career-switch",
    name: "Career Switcher & Transisi",
    nameId: "Pindah Jalur Karier",
    badge: "Transferable Skills",
    description: "Struktur komparasi nilai yang menonjolkan keahlian lintas industri dan motivasi kuat berpindah haluan.",
    category: "Industri Spesifik",
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
    category: "Industri Spesifik",
    recommendedFor: "Manager, VP, Team Lead, Direktur, Senior Specialist",
  },
  {
    id: "academic",
    name: "Academic, Riset & Beasiswa",
    nameId: "Akademisi & Peneliti",
    badge: "Riset & Beasiswa",
    description: "Format institusi akademik dengan fokus bidang penelitian, metodologi riset, publikasi, dan kontribusi keilmuan.",
    category: "Industri Spesifik",
    recommendedFor: "Dosen, Peneliti Laboratorium, Asisten Riset, Beasiswa Master/PhD",
  },

  // 11-25 New Templates
  {
    id: "corporate-banking",
    name: "Corporate & Banking Finance",
    nameId: "Perbankan & Finansial",
    badge: "Perbankan / Bank",
    description: "Format formal perbankan dengan header ganda berwibawa, komitmen GCG, kepatuhan audit, dan mitigasi risiko.",
    category: "Resmi / Nasional",
    recommendedFor: "Bank Mandiri, BCA, BRI, Bank BUMN, Fintech, Akuntan & Lembaga Keuangan",
  },
  {
    id: "tech-bold",
    name: "Tech Bold Terminal Style",
    nameId: "Terminal Developer",
    badge: "DevOps & Cloud",
    description: "Tampilan dark terminal prompt khas engineer dengan prompt command line dan blok kompetensi teknis.",
    category: "Tech & Startup",
    recommendedFor: "DevOps Engineer, Cloud Architect, Linux Sysadmin, Backend Specialist",
  },
  {
    id: "healthcare-medical",
    name: "Kesehatan & Medis Klinis",
    nameId: "Dokter, Perawat & Nakes",
    badge: "Rumah Sakit / Medis",
    description: "Standar institusi kesehatan dengan pencantuman nomor STR aktif, etika pelayanan pasien, dan sertifikasi klinis.",
    category: "Industri Spesifik",
    recommendedFor: "Dokter, Perawat, Apoteker, Ahli Gizi, Tenaga Laboratorium Rumah Sakit",
  },
  {
    id: "legal-consulting",
    name: "Hukum & Corporate Legal",
    nameId: "Advokat & Hukum",
    badge: "Law Firm / Legal",
    description: "Format berwibawa praktisi hukum dengan logo timbangan keadilan, ketajaman legal drafting, dan analisis regulasi.",
    category: "Industri Spesifik",
    recommendedFor: "Advokat, In-House Legal Counsel, Konsultan Hukum, Notaris, Compliance Officer",
  },
  {
    id: "sales-marketing",
    name: "Sales & Revenue Growth",
    nameId: "Sales & Bisnis",
    badge: "Commercial / Target",
    description: "Format berorientasi metrik capaian: pipeline deal, quota attainment, revenue impact, dan retensi klien.",
    category: "Industri Spesifik",
    recommendedFor: "Account Executive, Business Development, Sales Manager, Growth Marketer",
  },
  {
    id: "hospitality-tourism",
    name: "Perhotelan & Pariwisata",
    nameId: "Hospitality Bintang 5",
    badge: "Hotel & Resort",
    description: "Format elegan bernuansa ramah, menonjolkan service excellence, kepuasan tamu, dan etika CHSE.",
    category: "Industri Spesifik",
    recommendedFor: "Front Office, Hotel Manager, F&B Supervisor, Tour & Travel Specialist",
  },
  {
    id: "remote-work",
    name: "Remote-First & Async Work",
    nameId: "Kerja Jarak Jauh",
    badge: "Remote / Nomad",
    description: "Dirancang spesifik untuk lowongan remote: menonjolkan zona waktu (timezone), komunikasi asinkron, dan kemandirian.",
    category: "Tech & Startup",
    recommendedFor: "Remote Software Engineers, Virtual Assistants, Global Freelance Contractors",
  },
  {
    id: "startup-pitch",
    name: "Startup Disruptor Pitch",
    nameId: "Early-Stage Startup",
    badge: "High Execution",
    description: "Format ala pitch deck singkat: menonjolkan mentalitas founder, kecepatan merilis MVP, dan antusiasme tinggi.",
    category: "Tech & Startup",
    recommendedFor: "Early Employee, Growth Hacker, Product Designer, Y-Combinator style startups",
  },
  {
    id: "engineering-industrial",
    name: "Teknik Industri & Manufaktur",
    nameId: "Teknik & Fabrikasi",
    badge: "Pabrik & K3 HSE",
    description: "Format teknis operasional dengan fokus kepatuhan K3/HSE, audit ISO, pemeliharaan preventif, dan efisiensi pabrik.",
    category: "Industri Spesifik",
    recommendedFor: "Insinyur Sipil, Mekanikal, Elektro, QA/QC Inspector, Manajer Produksi",
  },
  {
    id: "education-teaching",
    name: "Pendidikan & Pengajar Guru",
    nameId: "Guru & Pendidik",
    badge: "Sekolah & Kampus",
    description: "Menitikberatkan filosofi pedagogik, manajemen kelas interaktif, kurikulum merdeka, dan pendekatan karakter siswa.",
    category: "Industri Spesifik",
    recommendedFor: "Guru Sekolah, Pengajar Kursus, Tutor Akademik, Dosen Praktisi",
  },
  {
    id: "nonprofit-ngo",
    name: "LSM & Yayasan Kemanusiaan",
    nameId: "NGO & Organisasi Sosial",
    badge: "Social Impact",
    description: "Format berorientasi nilai kemanusiaan, pemberdayaan komunitas, akuntabilitas donor, dan manajemen program sosial.",
    category: "Industri Spesifik",
    recommendedFor: "Program Officer NGO, Petugas Lapangan Bantuan Kemanusiaan, Pengelola Yayasan",
  },
  {
    id: "freelance-contract",
    name: "Freelance & Proposal Jasa",
    nameId: "Konsultan Kontrak",
    badge: "Contractor / B2B",
    description: "Format terstruktur untuk kontraktor mandiri: rincian ruang lingkup kerja (scope of work), deliverables, dan SLA waktu.",
    category: "Tech & Startup",
    recommendedFor: "Freelance Developer, Independent IT Consultant, Creative Freelancer",
  },
  {
    id: "editorial-journalism",
    name: "Editorial Media & Jurnalisme",
    nameId: "Redaksi Surat Kabar",
    badge: "Jurnalis & Media",
    description: "Gaya klasik surat kabar dengan masthead elegan, kutipan editorial, dan penekanan pada ketepatan verifikasi fakta.",
    category: "Industri Spesifik",
    recommendedFor: "Jurnalis, Editor Ruang Berita, Content Strategist, Copywriter, Penulis Kolom",
  },
  {
    id: "nordic-clean",
    name: "Nordic Serene & Clean",
    nameId: "Skandinavia Modern",
    badge: "Tenang & Bersahaja",
    description: "Tipografi lapang bernuansa sejuk Skandinavia, tanpa garis tebal, memancarkan ketenangan dan keteraturan tinggi.",
    category: "Tech & Startup",
    recommendedFor: "Product Manager, UI Specialist, Konsultan Strategi, Brand Architect",
  },
  {
    id: "classic-vintage",
    name: "Vintage Diplomatic Letterhead",
    nameId: "Tradisional Klasik",
    badge: "Formal Bersejarah",
    description: "Gaya korespondensi resmi era diplomatik dengan bingkai ganda klasik, font serif antik, dan tata bahasa khidmat.",
    category: "Resmi / Nasional",
    recommendedFor: "Lembaga Budaya, Organisasi Warisan, Hubungan Diplomatik, Instansi Tradisional",
  },
];
