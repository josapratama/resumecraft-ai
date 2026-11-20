import { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Search,
  Check,
  Sparkles,
  Layers,
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";
import type { TemplateId } from "@/types/cv";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  category: "Classic" | "Professional" | "Stylish" | "Creative" | "Unique";
  tagline: string;
  recommendedFor: string;
  theme: {
    bg: string;
    header: string;
    accent: string;
    text: string;
    isDark?: boolean;
  };
}

export const TEMPLATES_DATA: TemplateMeta[] = [
  // Classic
  {
    id: "modern",
    name: "Modern",
    category: "Classic",
    tagline: "Tata letak 2-kolom bersih dengan bar samping aksen",
    recommendedFor: "Umum, IT, Bisnis, Administrasi",
    theme: { bg: "#ffffff", header: "#dc2626", accent: "#ef4444", text: "#1e293b" },
  },
  {
    id: "classic",
    name: "Classic",
    category: "Classic",
    tagline: "Format formal tradisional hitam-putih yang sangat ATS-friendly",
    recommendedFor: "BUMN, PNS, Perbankan, Hukum, Akademisi",
    theme: { bg: "#ffffff", header: "#171717", accent: "#525252", text: "#0a0a0a" },
  },
  {
    id: "minimal",
    name: "Minimal",
    category: "Classic",
    tagline: "Desain minimalis ramping dengan tipografi presisi tanpa distraksi",
    recommendedFor: "Startup, Desainer, Penulis, Konsultan",
    theme: { bg: "#ffffff", header: "#737373", accent: "#a3a3a3", text: "#262626" },
  },
  {
    id: "swiss",
    name: "Swiss International",
    category: "Classic",
    tagline: "Desain tipografi grid khas Swiss dengan aksen merah internasional",
    recommendedFor: "Arsitek, Desainer Grafis, Brand Strategist",
    theme: { bg: "#ffffff", header: "#b91c1c", accent: "#dc2626", text: "#09090b" },
  },
  {
    id: "monochrome",
    name: "Monochrome",
    category: "Classic",
    tagline: "Gradasi murni skala abu-abu elegan tanpa warna menyolok",
    recommendedFor: "Corporate Executive, Akuntan, Legal",
    theme: { bg: "#ffffff", header: "#404040", accent: "#737373", text: "#171717" },
  },

  // Professional
  {
    id: "executive",
    name: "Executive",
    category: "Professional",
    tagline: "Header navy solid berwibawa untuk posisi manajerial & senior",
    recommendedFor: "Manajer, Direktur, Senior Professional",
    theme: { bg: "#ffffff", header: "#0a1628", accent: "#1e3a8a", text: "#0f172a" },
  },
  {
    id: "corporate",
    name: "Corporate",
    category: "Professional",
    tagline: "Standar perusahaan multinasional dengan hierarki data rapi",
    recommendedFor: "FMCG, Keuangan, Konsultan Manajemen, HR",
    theme: { bg: "#ffffff", header: "#1e3a5f", accent: "#2563eb", text: "#1e293b" },
  },
  {
    id: "academic",
    name: "Academic",
    category: "Professional",
    tagline: "Struktur mendalam untuk publikasi, riset, dan rekam jejak pengajaran",
    recommendedFor: "Dosen, Peneliti, Guru, Pelajar Beasiswa",
    theme: { bg: "#ffffff", header: "#262626", accent: "#404040", text: "#171717" },
  },
  {
    id: "compact",
    name: "Compact",
    category: "Professional",
    tagline: "Kepadatan konten maksimal untuk memuat banyak pengalaman di 1 lembar",
    recommendedFor: "Kandidat dengan pengalaman kerja padat / 5+ tahun",
    theme: { bg: "#ffffff", header: "#525252", accent: "#737373", text: "#262626" },
  },
  {
    id: "two-page",
    name: "Two-Page Executive",
    category: "Professional",
    tagline: "Dirancang optimal untuk rekam jejak panjang multi-halaman",
    recommendedFor: "C-Level, Dokter, Senior Lead Engineer",
    theme: { bg: "#ffffff", header: "#334155", accent: "#475569", text: "#0f172a" },
  },
  {
    id: "split",
    name: "Split Blue",
    category: "Professional",
    tagline: "Banner biru safir tebal dengan bodi terbelah dua warna yang harmonis",
    recommendedFor: "Project Manager, Engineer, Konsultan",
    theme: { bg: "#ffffff", header: "#0f4c75", accent: "#1b98e0", text: "#0f172a" },
  },

  // Stylish
  {
    id: "elegant",
    name: "Elegant Champagne",
    category: "Stylish",
    tagline: "Nuansa hangat mewah dengan aksen emas champagne & tipografi serif",
    recommendedFor: "Hospitality, Fashion, PR, Event Management",
    theme: { bg: "#fffbf5", header: "#c9a87c", accent: "#b08953", text: "#292524" },
  },
  {
    id: "nordic",
    name: "Nordic Clean",
    category: "Stylish",
    tagline: "Minimalisme Skandinavia dengan aksen teal yang tenang dan sejuk",
    recommendedFor: "UI/UX Designer, Product Manager, Creative Lead",
    theme: { bg: "#ffffff", header: "#2d9b8a", accent: "#14b8a6", text: "#134e4a" },
  },
  {
    id: "atlas",
    name: "Atlas Emerald",
    category: "Stylish",
    tagline: "Aksen hijau zamrud tua berkelas untuk profil berkarakter kuat",
    recommendedFor: "ESG, Agribisnis, Arsitek Lingkungan, Keuangan",
    theme: { bg: "#ffffff", header: "#1a3a2a", accent: "#059669", text: "#064e3b" },
  },
  {
    id: "sidebar-light",
    name: "Sidebar Purple",
    category: "Stylish",
    tagline: "Kolom samping warna ungu muda untuk menampilkan keahlian menonjol",
    recommendedFor: "Marketing, Hubungan Masyarakat, Content Creator",
    theme: { bg: "#ffffff", header: "#7c5cbf", accent: "#8b5cf6", text: "#1e1b4b" },
  },
  {
    id: "gradient",
    name: "Indigo Gradient",
    category: "Stylish",
    tagline: "Header gradasi modern bernuansa digital kreatif",
    recommendedFor: "Digital Marketer, Social Media Specialist",
    theme: { bg: "#ffffff", header: "#4f46e5", accent: "#6366f1", text: "#1e1b4b" },
  },
  {
    id: "pastel",
    name: "Pastel Lavender",
    category: "Stylish",
    tagline: "Latar lavender rose lembut dengan tipografi fuchsia elegan",
    recommendedFor: "Pendidikan, Desain, Healthcare, Psikologi",
    theme: { bg: "#fdf4ff", header: "#9333ea", accent: "#c084fc", text: "#4a044e" },
  },

  // Creative
  {
    id: "tech",
    name: "Tech Matrix",
    category: "Creative",
    tagline: "Dirancang khusus software engineer dengan chip teknologi & repo link",
    recommendedFor: "Frontend, Backend, Fullstack, DevOps, QA",
    theme: { bg: "#ffffff", header: "#059669", accent: "#10b981", text: "#064e3b" },
  },
  {
    id: "creative",
    name: "Creative Violet",
    category: "Creative",
    tagline: "Tampilan berani ungu elektrik dengan skill bar dinamis",
    recommendedFor: "Illustrator, Video Editor, Creative Director",
    theme: { bg: "#ffffff", header: "#7c3aed", accent: "#8b5cf6", text: "#2e1065" },
  },
  {
    id: "bold",
    name: "Bold Impact",
    category: "Creative",
    tagline: "Garis tegas dan heading tebal untuk menarik perhatian dalam 3 detik",
    recommendedFor: "Sales Executive, Business Development, Media",
    theme: { bg: "#ffffff", header: "#dc2626", accent: "#b91c1c", text: "#0a0a0a" },
  },
  {
    id: "infographic",
    name: "Infographic",
    category: "Creative",
    tagline: "Elemen visual data, meter keahlian, dan statistik portofolio",
    recommendedFor: "Data Analyst, BI Engineer, Strategist",
    theme: { bg: "#ffffff", header: "#e11d48", accent: "#f43f5e", text: "#1e293b" },
  },
  {
    id: "portfolio",
    name: "Portfolio Visual",
    category: "Creative",
    tagline: "Fokus kuat pada pameran tautan proyek dan karya nyata",
    recommendedFor: "Desainer Produk, Fotografer, Web Developer",
    theme: { bg: "#ffffff", header: "#18181b", accent: "#3f3f46", text: "#09090b" },
  },

  // Unique
  {
    id: "timeline",
    name: "Timeline Journey",
    category: "Unique",
    tagline: "Garis alur waktu vertikal menceritakan perjalanan karier berurutan",
    recommendedFor: "Karier linear, Senior Specialist, Akademisi",
    theme: { bg: "#ffffff", header: "#2563eb", accent: "#3b82f6", text: "#1e293b" },
  },
  {
    id: "newspaper",
    name: "The Chronicle",
    category: "Unique",
    tagline: "Tata letak kolom ala surat kabar New York Times klasik",
    recommendedFor: "Jurnalis, Editor, Copywriter, Riset",
    theme: { bg: "#fafaf9", header: "#292524", accent: "#44403c", text: "#1c1917" },
  },
  {
    id: "retro",
    name: "Retro Warm",
    category: "Unique",
    tagline: "Sentuhan hangat retro tahun 70-an dengan warna amber karamel",
    recommendedFor: "Artis, Musisi, Restoran, FnB, Barista",
    theme: { bg: "#fffbeb", header: "#b45309", accent: "#d97706", text: "#451a03" },
  },
  {
    id: "stealth",
    name: "Stealth Blackout",
    category: "Unique",
    tagline: "Tema serba hitam pekat mewah dengan kontras abu-abu futuristik",
    recommendedFor: "Cybersecurity, Game Dev, Crypto, Cloud Architect",
    theme: { bg: "#111111", header: "#262626", accent: "#525252", text: "#e5e5e5", isDark: true },
  },
  {
    id: "dark",
    name: "Dark Zinc",
    category: "Unique",
    tagline: "Tema gelap Zinc murni (#09090b) dengan aksen ungu violet elegan",
    recommendedFor: "Software Engineer, Web3 Developer, Tech Enthusiast",
    theme: { bg: "#09090b", header: "#18181b", accent: "#a78bfa", text: "#fafafa", isDark: true },
  },
  {
    id: "midnight",
    name: "Midnight Navy",
    category: "Unique",
    tagline: "Nuansa biru malam laut dalam dengan aksen sky-blue bersinar",
    recommendedFor: "Data Scientist, Cloud Engineer, Tech Leader",
    theme: { bg: "#020617", header: "#0f172a", accent: "#38bdf8", text: "#f1f5f9", isDark: true },
  },
  {
    id: "brutalist",
    name: "Neo Brutalist",
    category: "Unique",
    tagline: "Border hitam tebal 2px, shadow tegas, dan estetika anti-mainstream",
    recommendedFor: "Startup Founder, Creative Technologist, Gen-Z Agency",
    theme: { bg: "#ffffff", header: "#000000", accent: "#facc15", text: "#000000" },
  },
];

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export default function TemplateGalleryModal({
  isOpen,
  onClose,
  currentTemplate,
  onSelectTemplate,
}: TemplateGalleryModalProps) {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["Semua", "Classic", "Professional", "Stylish", "Creative", "Unique"];

  const filteredTemplates = useMemo(() => {
    return TEMPLATES_DATA.filter(t => {
      const matchCat = activeCategory === "Semua" || t.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.recommendedFor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-neutral-200">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-neutral-100 bg-white shrink-0">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-neutral-900">
                  {t("template_gallery.modal_title", "Galeri Template Desain CV (29 Pilihan)")}
                </DialogTitle>
                <p className="text-xs text-neutral-500">
                  {t("template_gallery.modal_desc", "Pilih desain yang paling cocok untuk industri dan target karier Anda")}
                </p>
              </div>
            </div>

            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <Input
                placeholder={t("template_gallery.search_ph", "Cari template, profesi...")}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs rounded-lg"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? "bg-neutral-900 text-white shadow-2xs"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat === "Semua" ? t("template_gallery.cat_all", "Semua") : cat}
                {cat === "Semua" ? ` (${TEMPLATES_DATA.length})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-neutral-50/70">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(item => {
              const isActive = item.id === currentTemplate;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectTemplate(item.id);
                    onClose();
                  }}
                  className={`group relative rounded-xl border p-3.5 transition-all cursor-pointer bg-white flex flex-col justify-between hover:shadow-md ${
                    isActive
                      ? "border-red-600 ring-2 ring-red-500/20 shadow-sm"
                      : "border-neutral-200/90 hover:border-neutral-300"
                  }`}
                >
                  <div>
                    {/* Visual Miniature Preview Card */}
                    <div
                      className="w-full h-24 rounded-lg p-2.5 mb-3 border relative overflow-hidden flex flex-col justify-between"
                      style={{
                        backgroundColor: item.theme.bg,
                        borderColor: item.theme.isDark ? "#27272a" : "#e2e8f0",
                      }}
                    >
                      {/* Miniature Header Simulation */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: item.theme.accent }}
                          />
                          <div className="space-y-1">
                            <div
                              className="w-16 h-1.5 rounded-full"
                              style={{ backgroundColor: item.theme.header }}
                            />
                            <div
                              className="w-10 h-1 rounded-full opacity-60"
                              style={{ backgroundColor: item.theme.accent }}
                            />
                          </div>
                        </div>
                        <div
                          className="w-3.5 h-3.5 rounded-xs"
                          style={{ backgroundColor: item.theme.accent, opacity: 0.8 }}
                        />
                      </div>

                      {/* Miniature Body Lines */}
                      <div className="space-y-1.5 opacity-80">
                        <div className="flex gap-2">
                          <div
                            className="w-1/3 h-1 rounded-full"
                            style={{ backgroundColor: item.theme.accent }}
                          />
                          <div
                            className="w-2/3 h-1 rounded-full"
                            style={{ backgroundColor: item.theme.text, opacity: 0.2 }}
                          />
                        </div>
                        <div
                          className="w-full h-1 rounded-full"
                          style={{ backgroundColor: item.theme.text, opacity: 0.15 }}
                        />
                        <div
                          className="w-4/5 h-1 rounded-full"
                          style={{ backgroundColor: item.theme.text, opacity: 0.15 }}
                        />
                      </div>

                      {/* Active Indicator Overlay */}
                      {isActive && (
                        <div className="absolute inset-0 bg-neutral-900/15 backdrop-blur-[0.5px] flex items-center justify-center">
                          <span className="bg-red-600 text-white text-[11px] font-bold py-1 px-3 rounded-full flex items-center gap-1 shadow-md">
                            <Check className="w-3 h-3" /> {t("template_gallery.active_badge", "Sedang Aktif")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm text-neutral-900 group-hover:text-red-600 transition-colors">
                        {item.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="text-[10px] py-0 px-2 font-medium bg-neutral-100 text-neutral-600 shrink-0"
                      >
                        {item.category}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed mb-2">
                      {item.tagline}
                    </p>
                  </div>

                  {/* Recommendation pill & button */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                    <span className="text-neutral-400 truncate max-w-[170px]" title={item.recommendedFor}>
                      🎯 {item.recommendedFor}
                    </span>
                    <Button
                      size="sm"
                      variant={isActive ? "default" : "ghost"}
                      className={`h-6 text-[10px] px-2.5 rounded-md font-semibold ${
                        isActive
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {isActive ? t("template_gallery.selected_btn", "Dipilih") : t("template_gallery.use_btn", "Gunakan")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
