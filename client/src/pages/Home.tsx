import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Copy,
  Trash2,
  Plus,
  Clock,
  FileText,
  Layers,
  Sparkles,
  Upload,
  Search,
  CheckCircle2,
  TrendingUp,
  Layout,
  ArrowRight,
  ExternalLink,
  Shield,
  Zap,
  Award,
  Check,
  X,
  FileCheck2,
  Mail,
  ChevronDown,
  HelpCircle,
  QrCode,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import ImportResumeModal from "@/components/ImportResumeModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/** How "complete" a CV is based on section counts returned by the list endpoint */
function completionInfo(cv: {
  sectionCounts?: {
    personalInfo?: number;
    workExperiences?: number;
    educations?: number;
    skills?: number;
    projects?: number;
    certifications?: number;
  };
}) {
  const counts = cv.sectionCounts ?? {};
  const filled = [
    counts.personalInfo ?? 0,
    counts.workExperiences ?? 0,
    counts.educations ?? 0,
    counts.skills ?? 0,
    counts.projects ?? 0,
    counts.certifications ?? 0,
  ].filter((n) => n > 0).length;
  const pct = Math.round((filled / 6) * 100);
  return { filled, total: 6, pct };
}

const TEMPLATE_COLORS: Record<string, string> = {
  modern: "bg-red-600",
  classic: "bg-neutral-900",
  minimal: "bg-neutral-500",
  swiss: "bg-red-700",
  monochrome: "bg-neutral-700",
  executive: "bg-[#0a1628]",
  corporate: "bg-[#1e3a5f]",
  academic: "bg-neutral-800",
  compact: "bg-neutral-600",
  "two-page": "bg-neutral-500",
  elegant: "bg-[#c9a87c]",
  nordic: "bg-[#2d9b8a]",
  atlas: "bg-[#1a3a2a]",
  "sidebar-light": "bg-[#7c5cbf]",
  gradient: "bg-indigo-600",
  tech: "bg-emerald-600",
  creative: "bg-violet-600",
  bold: "bg-red-600",
  infographic: "bg-rose-600",
  portfolio: "bg-neutral-900",
  timeline: "bg-blue-600",
  newspaper: "bg-neutral-800",
  retro: "bg-amber-700",
  stealth: "bg-neutral-950",
  brutalist: "bg-black",
  dark: "bg-zinc-900",
  midnight: "bg-slate-950",
  pastel: "bg-purple-600",
  split: "bg-[#0f4c75]",
};

const TEMPLATE_LIST = [
  { id: "modern", name: "Modern Red", category: "Classic", desc: "Dual kolom bersih dengan sidebar kontras dan barcode header." },
  { id: "classic", name: "Classic Corporate", category: "Classic", desc: "Format standar emas perbankan dan BUMN." },
  { id: "minimal", name: "Minimalist Clean", category: "Classic", desc: "Spasi lapang, tipografi murni tanpa elemen distraksi." },
  { id: "executive", name: "Executive Navy", category: "Professional", desc: "Header mewah untuk Senior Manager, Direktur, & Lead." },
  { id: "corporate", name: "Corporate Deep Blue", category: "Professional", desc: "Sangat disukai konsultan, finance, dan law firm." },
  { id: "academic", name: "Academic CV", category: "Professional", desc: "Fokus riset ilmiah, publikasi jurnal, dan gelar akademik." },
  { id: "nordic", name: "Nordic Pine", category: "Stylish", desc: "Estetika Skandinavia modern dengan warna teal lembut." },
  { id: "elegant", name: "Warm Gold", category: "Stylish", desc: "Aksen emas mewah untuk perhotelan, luxury brand, & PR." },
  { id: "tech", name: "Tech Monospace", category: "Creative", desc: "Format favorit software engineer, DevOps, dan data analyst." },
  { id: "creative", name: "Creative Violet", category: "Creative", desc: "Layout dinamis untuk UI/UX designer dan content creator." },
  { id: "timeline", name: "Timeline Pathway", category: "Unique", desc: "Alur riwayat karir visual berkesinambungan." },
  { id: "split", name: "Split Ocean", category: "Unique", desc: "Dua panel seimbang dengan aksen biru laut tajam." },
];

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  isPending: boolean;
}

function CreateResumeModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
}: CreateResumeModalProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isPending) return;
    onSubmit(trimmed);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border border-neutral-200 rounded-2xl shadow-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-neutral-900">
            Buat CV / Resume Baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Judul CV / Posisi Target
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: CV Fullstack Developer - 2026"
              className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || isPending}
              className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl gap-2 font-semibold"
            >
              {isPending && <Spinner className="w-4 h-4" />}
              <span>Buat CV Sekarang</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useI18n();
  const [, navigate] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "complete" | "draft">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [templateFilter, setTemplateFilter] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const cvListQuery = trpc.cv.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const utils = trpc.useUtils();

  const createCVMutation = trpc.cv.create.useMutation({
    onSuccess: (data) => {
      utils.cv.list.invalidate();
      setIsCreateDialogOpen(false);
      navigate(`/cv/${data.id}`);
    },
    onError: (err) => {
      toast.error(`Gagal membuat CV: ${err.message}`);
    },
  });

  const deleteCVMutation = trpc.cv.delete.useMutation({
    onSuccess: () => {
      utils.cv.list.invalidate();
      toast.success("CV berhasil dihapus");
    },
    onError: (err) => {
      toast.error(`Gagal menghapus CV: ${err.message}`);
    },
  });

  const duplicateCVMutation = trpc.cv.duplicate.useMutation({
    onSuccess: (data) => {
      utils.cv.list.invalidate();
      toast.success("CV berhasil diduplikasi");
      navigate(`/cv/${data.id}`);
    },
    onError: (err) => {
      toast.error(`Gagal menduplikasi CV: ${err.message}`);
    },
  });

  const handleCreateResume = (title: string) => {
    createCVMutation.mutate({ title });
  };

  const cvList = cvListQuery.data ?? [];

  const filteredCVs = useMemo(() => {
    return cvList.filter((cv) => {
      const matchSearch =
        !searchQuery ||
        (cv.title ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      const { pct } = completionInfo(cv);
      if (filterType === "complete") return pct >= 80;
      if (filterType === "draft") return pct < 80;
      return true;
    });
  }, [cvList, searchQuery, filterType]);

  const stats = useMemo(() => {
    if (!cvList.length) return { total: 0, avgPct: 0, publicCount: 0 };
    const total = cvList.length;
    const avgPct = Math.round(
      cvList.reduce((acc, cv) => acc + completionInfo(cv).pct, 0) / total
    );
    const publicCount = cvList.filter((cv) => cv.isPublic).length;
    return { total, avgPct, publicCount };
  }, [cvList]);

  // =========================================================================
  // UNAUTHENTICATED LANDING PAGE
  // =========================================================================
  if (!isAuthenticated) {
    const displayedTemplates =
      templateFilter === "All"
        ? TEMPLATE_LIST
        : TEMPLATE_LIST.filter((t) => t.category === templateFilter);

    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-red-600 selection:text-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-red-600/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                  ResumeCraft <span className="text-red-500">AI</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
                  ATS Studio Suite
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-400">
              <a href="#fitur" className="hover:text-white transition-colors">
                {t("landing.features", "Fitur Unggulan")}
              </a>
              <a href="#template" className="hover:text-white transition-colors">
                {t("dashboard.templates_count", "29 Template ATS")}
              </a>
              <a href="#komparasi" className="hover:text-white transition-colors">
                {t("landing_page.comparison_tag", "Perbandingan")}
              </a>
              <a href="#carakerja" className="hover:text-white transition-colors">
                {t("landing_page.how_it_works_tag", "Cara Kerja")}
              </a>
              <a href="#faq" className="hover:text-white transition-colors">
                {t("landing_page.faq_tag", "FAQ")}
              </a>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl"
              >
                {t("auth.login", "Masuk")}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/login")}
                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm px-4 rounded-xl shadow-md shadow-red-600/30 gap-1.5"
              >
                <span>{t("landing.start_free", "Buat CV Gratis")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-red-600/15 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left Pitch */}
              <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-neutral-900/90 border border-neutral-700/80 rounded-full px-4 py-1.5 shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    {t("landing_page.tagline", "✨ Pembuat CV Standar ATS No. 1 di Indonesia")}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
                  {t("landing_page.hero_title_1", "Buat CV Standar ATS & Lolos Screening HRD dalam")}{" "}
                  <span className="bg-gradient-to-r from-red-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                    {t("landing_page.hero_title_2", "Hitungan Menit.")}
                  </span>
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-neutral-400 leading-relaxed">
                  {t("landing_page.hero_desc", "Tingkatkan peluang panggilan interview hingga 3.8x lebih tinggi. Ditenagai 29 template teruji ATS, formula STAR berbasis AI, integrasi Surat Lamaran Kerja otomatis, dan ekspor PDF vektor tajam tanpa watermark.")}
                </p>

                {/* Value Checkpoints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {[
                    "29 Template Format Standar ATS Teruji",
                    "Formula STAR AI untuk Poin Pengalaman Kerja",
                    "Surat Lamaran Kerja & Draf Email/WA HRD",
                    "Verifikasi QR Code Portofolio & LinkedIn",
                    "Visual Page-Break Guide (Batas Cetak A4)",
                    "100% Gratis & Tanpa Watermark",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate("/login")}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-black text-sm px-8 py-6 rounded-2xl shadow-xl shadow-red-600/30 gap-2"
                  >
                    <span>{t("landing_page.btn_start", "Mulai Buat CV Sekarang")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <a
                    href="#template"
                    className="w-full sm:w-auto text-center px-6 py-3.5 rounded-2xl border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold transition-all"
                  >
                    {t("landing_page.btn_browse_templates", "Jelajahi 29 Desain Template")}
                  </a>
                </div>
              </div>

          {/* Right Live Interactive Mockup Card */}
          <div className="flex-1 w-full max-w-lg">
            <div className="relative">
              {/* Glow backdrop */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 to-amber-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

              {/* Card Container */}
              <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
                {/* Header Mockup */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-black text-base shadow-md">
                      JS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">Josa Pratama</h3>
                        <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] py-0 px-1.5">
                          Terverifikasi
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400">Senior Fullstack Software Engineer</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-black text-xs">
                      98% ATS Skor
                    </span>
                    <span className="block text-[10px] text-neutral-500 mt-0.5">Sangat Siap Kerja</span>
                  </div>
                </div>

                {/* Work Experience Item with STAR indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <span>Pengalaman Kerja (Formula STAR)</span>
                    <span className="text-[10px] text-amber-400 font-semibold">AI Optimized</span>
                  </div>

                  <div className="p-3.5 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Lead Distributed Systems Engineer</span>
                      <span className="text-neutral-500 text-[11px]">2022 - Sekarang</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      • Merancang arsitektur microservices terdistribusi dengan Go & PostgreSQL yang memproses 120M+ event/hari dengan latensi p99 &lt; 45ms.
                    </p>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      • Mengoptimalkan pipeline CI/CD Kubernetes yang memangkas waktu build sebesar 64% dan meningkatkan deployment frekuensi 3x.
                    </p>
                  </div>
                </div>

                {/* Skills Matrix */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Keahlian Kunci Terdeteksi Mesin ATS
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["TypeScript", "Go", "Kubernetes", "PostgreSQL", "Docker", "Kafka", "Redis", "CI/CD"].map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-neutral-800/90 border border-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Integrated Documents Strip */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                    <FileCheck2 className="w-3.5 h-3.5 text-purple-400" />
                    Surat Lamaran Kerja Terhubung
                  </span>
                  <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                    <QrCode className="w-3.5 h-3.5 text-blue-400" />
                    QR Code Portofolio
                  </span>
                </div>
              </div>
            </div>
          </div>
      </div>
          </div >
        </section >

      {/* COMPARISON SECTION: Mengapa Berbeda */ }
      < section id = "komparasi" className = "py-20 bg-neutral-900/60 border-y border-neutral-800/80" >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge className="bg-red-950 text-red-400 border border-red-800 font-bold uppercase text-[10px]">
              Perbandingan Nyata
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Mengapa ResumeCraft AI Lebih Unggul?
            </h2>
            <p className="text-sm text-neutral-400">
              Banyak pelamar gugur bukan karena kurang kompeten, melainkan karena file CV gagal dibaca oleh robot ATS (Applicant Tracking System) perusahaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Template Biasa Canva / Word */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-900/40 text-red-400 flex items-center justify-center font-bold">
                <X className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Canva / Word Standar</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Desain grafis warna-warni yang sering menggunakan format tabel rumit, ikon terpisah, dan font non-standar yang sering dibaca sebagai teks acak atau blank oleh ATS.
              </p>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-3.5 h-3.5" /> Kolom sering tertukar saat di-parse
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-3.5 h-3.5" /> Tidak ada panduan formula STAR
                </li>
                <li className="flex items-center gap-2 text-red-400">
                  <X className="w-3.5 h-3.5" /> Terpisah dari surat lamaran kerja
                </li>
              </ul>
            </div>

            {/* Card 2: ResumeCraft AI (Featured) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-red-600 shadow-xl shadow-red-600/10 space-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                Direkomendasikan HRD
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-600/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">ResumeCraft AI Studio</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Struktur hierarki semantik 100% ramah ATS dengan ekspor teks vektor tajam, ukuran A4 & Letter presisi, plus integrasi surat lamaran dan draf pesan HRD.
              </p>
              <ul className="space-y-2 text-xs text-neutral-200 font-medium">
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> 29 Template lolos screening sistem ATS
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> AI Polish & Koreksi Ejaan EYD Baku
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> 25 Format Surat Lamaran Kerja terhubung
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> Garis pembatas cetak A4 anti-terpotong
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" /> QR Code portofolio langsung tercetak
                </li>
              </ul>
            </div>

            {/* Card 3: Jasa Pembuatan CV Manual */}
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-900/40 text-amber-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Jasa CV Manual Berbayar</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Memerlukan biaya ratusan ribu rupiah setiap kali ingin memperbarui satu atau dua kalimat saat melamar ke lowongan pekerjaan yang berbeda.
              </p>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-center gap-2 text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> Waktu tunggu 1–3 hari kerja
                </li>
                <li className="flex items-center gap-2 text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> Biaya revisi tambahan
                </li>
                <li className="flex items-center gap-2 text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> Privasi data tidak terjamin di cloud
                </li>
              </ul>
            </div>
          </div>
        </div>
        </section >

      {/* TEMPLATE SHOWCASE SECTION */ }
      < section id = "template" className = "py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10" >
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge className="bg-neutral-800 text-neutral-300 font-bold uppercase text-[10px]">
              Koleksi Desain Terlengkap
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              29 Template Standar Industri Siap Kerja
            </h2>
            <p className="text-sm text-neutral-400">
              Pilih dari format korporat klasik, eksekutif elegan, hingga tata letak modern berorientasi teknologi. Semua dirancang lolos sistem ATS.
            </p>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {["All", "Classic", "Professional", "Stylish", "Creative", "Unique"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    templateFilter === cat
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                  }`}
                >
                  {cat === "All" ? "Semua Desain (29)" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate("/login")}
                className="group p-4 bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-32 rounded-xl bg-neutral-950 border border-neutral-800/80 p-3 flex flex-col justify-between mb-3 relative overflow-hidden group-hover:border-neutral-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className={`w-3.5 h-3.5 rounded-full ${TEMPLATE_COLORS[t.id] ?? "bg-neutral-700"}`} />
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                      {t.category}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-3/4 bg-neutral-800 rounded" />
                    <div className="h-2 w-1/2 bg-neutral-850 rounded" />
                    <div className="h-2 w-2/3 bg-neutral-850 rounded" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-500">
                    <span>A4 / Letter</span>
                    <span className="text-emerald-400 font-semibold">100% ATS</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                  {t.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-2xl text-xs sm:text-sm font-bold gap-2 px-6"
            >
              <span>Gunakan Semua 29 Template Gratis di Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section >

      {/* HOW IT WORKS SECTION */ }
      < section id = "carakerja" className = "py-20 bg-neutral-900/40 border-t border-neutral-800/80" >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge className="bg-neutral-800 text-neutral-300 font-bold uppercase text-[10px]">
              Langkah Sederhana
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              3 Langkah Cepat Menuju CV Siap Kerja
            </h2>
            <p className="text-sm text-neutral-400">
              Dari lembar kosong hingga resume siap lamar dalam hitungan beberapa menit saja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 relative">
              <span className="text-4xl font-black text-neutral-800 absolute top-5 right-6">01</span>
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Isi Data atau Impor CV</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Ketik informasi profil, pengalaman kerja, pendidikan, dan sertifikasi pada formulir terstruktur, atau unggah resume lama Anda untuk diimpor instan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 relative">
              <span className="text-4xl font-black text-neutral-800 absolute top-5 right-6">02</span>
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Poles dengan AI & Skor ATS</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Gunakan asisten AI untuk menyempurnakan tata bahasa, merapikan formula STAR, memperbaiki ejaan EYD, dan mencocokkan kata kunci lowongan target.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 relative">
              <span className="text-4xl font-black text-neutral-800 absolute top-5 right-6">03</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Ekspor PDF & Lamar Kerja</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Cetak PDF vektor jernih dalam standar A4 atau Letter, buat surat lamaran kerja terhubung, dan bagikan tautan portofolio online kepada HRD.
              </p>
            </div>
          </div>
        </div>
        </section >

      {/* FAQ ACCORDION SECTION */ }
      < section id = "faq" className = "py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10" >
          <div className="text-center space-y-3">
            <Badge className="bg-neutral-800 text-neutral-300 font-bold uppercase text-[10px]">
              Tanya Jawab
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-sm text-neutral-400">
              Pelajari mengapa ResumeCraft AI dirancang khusus untuk memenangkan persaingan karir modern.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Apa itu sistem ATS dan mengapa CV biasa sering gagal lolos?",
                a: "ATS (Applicant Tracking System) adalah perangkat lunak yang digunakan HRD perusahaan untuk menyaring dan membaca ribuan berkas pelamar secara otomatis. Template dengan tabel bertingkat, ikon terpisah, atau layout grafis berantakan di Canva seringkali tidak terbaca oleh ATS sehingga pelamar langsung tereliminasi sebelum dilihat oleh manusia.",
              },
              {
                q: "Apakah format ResumeCraft AI benar-benar lolos screening ATS?",
                a: "Ya, 100%. Setiap dari 29 template di ResumeCraft AI dibangun menggunakan struktur hierarki semantik HTML/CSS standar teks stream yang dapat diurai (parsed) dengan sempurna oleh mesin ATS seperti Workday, Greenhouse, Lever, Taleo, dan Jobstreet.",
              },
              {
                q: "Apakah ekspor PDF di ResumeCraft AI gratis dan tanpa watermark?",
                a: "Benar, Anda dapat mengunduh file PDF beresolusi tinggi maupun dokumen Microsoft Word (.docx) secara gratis tanpa watermark apapun selamanya.",
              },
              {
                q: "Bagaimana cara kerja fitur Visual Page-Break Guide (Garis Batas Cetak)?",
                a: "Di studio editor, terdapat garis penanda batas halaman kertas fisik (A4 maupun Letter) yang otomatis mengukur tinggi konten Anda. Anda bisa memantau apakah isi CV muat dalam 1 halaman atau 2 halaman agar tidak ada teks yang terpotong canggung saat dicetak oleh HRD.",
              },
              {
                q: "Apakah data pribadi saya aman dan terenkripsi?",
                a: "Keamanan dan privasi data Anda adalah prioritas utama kami. Seluruh data CV tersimpan di server aman dengan enkripsi modern dan tidak pernah diperjualbelikan kepada pihak ketiga manapun.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-neutral-800 bg-neutral-900/60 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-red-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-4 ${
                      openFaq === idx ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section >

      {/* FINAL CTA BANNER */ }
      < section className = "py-16 bg-gradient-to-r from-red-950 via-neutral-950 to-neutral-950 border-t border-neutral-800 relative overflow-hidden" >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {t("landing_page.final_cta_title", "Siap Raih Karir Impian Anda Sekarang?")}
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            {t("landing_page.final_cta_desc", "Bergabunglah dengan ribuan profesional dan fresh graduate yang berhasil lolos wawancara kerja dengan ResumeCraft AI.")}
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/login")}
            className="bg-red-600 hover:bg-red-500 text-white font-black text-sm px-8 py-6 rounded-2xl shadow-xl shadow-red-600/30 gap-2"
          >
            <span>{t("landing_page.final_cta_btn", "Mulai Buat Resume Gratis Sekarang")}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        </section >

      {/* FOOTER */ }
      < footer className = "border-t border-neutral-800 py-8 bg-neutral-950 text-neutral-500 text-xs" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="font-bold text-white">ResumeCraft AI</span> — {t("landing_page.footer_tagline", "Standar Keunggulan Karir Profesional.")}
          </div>
          <div>
            © {new Date().getFullYear()} {t("landing_page.footer_copyright", "ResumeCraft AI. Dilindungi Hak Cipta.")}
          </div>
        </div>
        </footer >
      </div >
    );
  }

  // =========================================================================
  // AUTHENTICATED DASHBOARD (Untuk pengguna yang sudah login)
  // =========================================================================
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
        <div className="container mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-neutral-900 leading-tight truncate">
                  ResumeCraft <span className="text-red-600">AI</span>
                </h1>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate hidden sm:block">
                  Selamat datang kembali,{" "}
                  <span className="font-semibold text-neutral-700">{user?.name || user?.username || "Pengguna"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Import Resume with AI */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportDialogOpen(true)}
                className="gap-1 border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 rounded-xl text-xs font-semibold h-8 sm:h-9 px-2 sm:px-3"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">{t("dashboard.btn_import", "Impor CV Otomatis")}</span>
                <span className="sm:hidden">{t("dashboard.btn_import_short", "Impor")}</span>
              </Button>

              {/* New CV Button Trigger */}
              <Button
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-neutral-900 text-white hover:bg-neutral-800 gap-1 rounded-xl text-xs font-semibold h-8 sm:h-9 px-2.5 sm:px-3.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t("dashboard.btn_new_cv", "Buat CV Baru")}</span>
                <span className="sm:hidden">{t("dashboard.btn_new_cv_short", "Buat CV")}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-neutral-500 hover:text-neutral-900 text-xs h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl"
              >
                {t("auth.logout", "Keluar")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Quick Stats Overview Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2.5 text-neutral-500 text-xs font-semibold mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>{t("dashboard.total_resumes", "Total Dokumen CV")}</span>
            </div>
            <div className="text-2xl font-black text-neutral-900">{stats.total}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2.5 text-neutral-500 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{t("dashboard.avg_strength", "Rata-Rata Kelengkapan")}</span>
            </div>
            <div className="text-2xl font-black text-neutral-900">{stats.avgPct}%</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2.5 text-neutral-500 text-xs font-semibold mb-1">
              <Layout className="w-4 h-4 text-purple-600" />
              <span>{t("dashboard.ready_templates", "Pilihan Desain")}</span>
            </div>
            <div className="text-2xl font-black text-neutral-900">{t("dashboard.templates_count", "29 Template ATS")}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2.5 text-neutral-500 text-xs font-semibold mb-1">
              <ExternalLink className="w-4 h-4 text-amber-600" />
              <span>{t("dashboard.public_resumes", "Tautan Publik")}</span>
            </div>
            <div className="text-2xl font-black text-neutral-900">
              {stats.publicCount} {t("dashboard.active_count", "Aktif")}
            </div>
          </div>
        </div>

        {/* Toolbar: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("dashboard.search_placeholder", "Cari berdasarkan nama CV atau posisi...")}
              className="pl-9 h-10 border-neutral-200 rounded-xl text-xs bg-white"
            />
          </div>

          <div className="flex p-1 bg-neutral-100 rounded-xl self-start sm:self-auto border border-neutral-200/60">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterType === "all" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-900"
                }`}
            >
              {t("dashboard.filter_all", "Semua")} ({cvList.length})
            </button>
            <button
              onClick={() => setFilterType("complete")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterType === "complete" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-900"
                }`}
            >
              {t("dashboard.filter_complete", "Lengkap (≥80%)")}
            </button>
            <button
              onClick={() => setFilterType("draft")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterType === "draft" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-900"
                }`}
            >
              {t("dashboard.filter_draft", "Draf (<80%)")}
            </button>
          </div>
        </div>

        {/* CV Grid List */}
        {cvListQuery.isLoading ? (
          <div className="text-center py-20">
            <Spinner className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="text-xs text-neutral-400 mt-2 font-medium">{t("dashboard.loading", "Memuat daftar CV...")}</p>
          </div>
        ) : filteredCVs.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center max-w-md mx-auto my-12 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 mx-auto flex items-center justify-center text-neutral-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">{t("dashboard.empty_title", "Belum ada CV yang sesuai")}</h3>
              <p className="text-xs text-neutral-500 mt-1">
                {searchQuery ? "Coba kata kunci pencarian lain" : t("dashboard.empty_desc", "Mulai rancang CV ATS pertama Anda sekarang.")}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t("dashboard.btn_new_cv", "Buat CV Sekarang")}</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCVs.map((cv) => {
              const { pct } = completionInfo(cv);
              return (
                <div
                  key={cv.id}
                  className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => navigate(`/cv/${cv.id}`)}
                          className="font-bold text-sm text-neutral-900 truncate hover:text-red-600 cursor-pointer transition-colors"
                          title={cv.title || "Untitled Resume"}
                        >
                          {cv.title || "CV Tanpa Judul"}
                        </h3>
                        <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {t("status.updated_at", "Diperbarui")} {new Date(cv.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0.5 px-2 rounded-md font-semibold ${pct >= 80
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                      >
                        {t("dashboard.ready_pct", "{pct}% Siap").replace("{pct}", String(pct))}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${TEMPLATE_COLORS[cv.template] ?? "bg-neutral-800"}`} />
                      <span className="text-xs text-neutral-600 font-medium capitalize">
                        Template: {cv.template}
                      </span>
                      {cv.isPublic && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                          {t("dashboard.public_badge", "Publik")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/cv/${cv.id}`)}
                      className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl h-8 px-3.5"
                    >
                      {t("dashboard.btn_open_studio", "Buka Studio CV")}
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => duplicateCVMutation.mutate({ cvId: cv.id })}
                        className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-900 rounded-lg"
                        title={t("dashboard.duplicate_tooltip", "Duplikasi CV ini")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600 rounded-lg"
                            title={t("dashboard.delete_tooltip", "Hapus CV")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl max-w-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base font-bold text-neutral-900">
                              {t("dashboard.delete_title", "Hapus CV ini?")}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-xs text-neutral-500">
                              {t("dashboard.delete_desc", "Tindakan ini permanen dan tidak dapat dibatalkan.")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex justify-end gap-2 pt-3">
                            <AlertDialogCancel className="text-xs rounded-xl">
                              {t("dashboard.delete_cancel", "Batal")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCVMutation.mutate({ cvId: cv.id })}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
                            >
                              {t("dashboard.delete_confirm", "Ya, Hapus")}
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Standalone Modals */}
      <CreateResumeModal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateResume}
        isPending={createCVMutation.isPending}
      />

      <ImportResumeModal
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </div>
  );
}
