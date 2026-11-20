import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { exportCVToPDF } from "@/lib/pdfExport";
import { exportCVToDOCX } from "@/lib/docxExport";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import {
  Download,
  ArrowLeft,
  MessageSquare,
  X,
  ChevronDown,
  Layout,
  Pencil,
  Check,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Globe,
  Layers,
  Sparkles,
  Share2,
  Palette,
  FileText,
  Target,
  HelpCircle,
  Languages as LanguagesIcon,
  Eye,
  SlidersHorizontal,
  Bot,
  SpellCheck,
  Mail,
  FileCheck2,
  DollarSign,
  FileCode2,
  Mic,
  MoreHorizontal,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PersonalInfoForm from "@/components/CVEditor/PersonalInfoForm";
import WorkExperienceForm from "@/components/CVEditor/WorkExperienceForm";
import EducationForm from "@/components/CVEditor/EducationForm";
import SkillsForm from "@/components/CVEditor/SkillsForm";
import ProjectsForm from "@/components/CVEditor/ProjectsForm";
import CertificationsForm from "@/components/CVEditor/CertificationsForm";
import LanguagesForm from "@/components/CVEditor/LanguagesForm";
import CustomSectionsForm from "@/components/CVEditor/CustomSectionsForm";
import ATSScoreModal from "@/components/CVEditor/ATSScoreModal";
import CoverLetterModal from "@/components/CVEditor/CoverLetterModal";
import InterviewPrepModal from "@/components/CVEditor/InterviewPrepModal";
import TranslateCVModal from "@/components/CVEditor/TranslateCVModal";
import SharePublicModal from "@/components/CVEditor/SharePublicModal";
import StyleCustomizerModal from "@/components/CVEditor/StyleCustomizerModal";
import GrammarCheckModal from "@/components/CVEditor/GrammarCheckModal";
import EmailDraftModal from "@/components/CVEditor/EmailDraftModal";
import JobTrackerModal from "@/components/JobTracker/JobTrackerModal";
import DocumentChecklistModal from "@/components/CVEditor/DocumentChecklistModal";
import SalaryBenchmarkModal from "@/components/CVEditor/SalaryBenchmarkModal";
import CareerPitchModal from "@/components/CVEditor/CareerPitchModal";
import JobMatcherModal from "@/components/CVEditor/JobMatcherModal";
import TemplateGalleryModal from "@/components/CVEditor/TemplateGalleryModal";
import ATSReadinessBadge from "@/components/CVEditor/ATSReadinessBadge";
import DuplicateCVModal from "@/components/CVEditor/DuplicateCVModal";
import CVPreview from "@/components/CVEditor/CVPreview";
import { AIChatBox } from "@/components/AIChatBox";
import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { FullCVData, TemplateId, PaperSize } from "@/types/cv";

/** Narrows AIChatBox Message to the roles the AI endpoint actually accepts. */
type ChatMessage = { role: "user" | "assistant"; content: string };

const SECTIONS = [
  {
    id: "personal",
    label: "Personal Info",
    shortLabel: "Personal",
    icon: User,
  },
  {
    id: "experience",
    label: "Work Experience",
    shortLabel: "Experience",
    icon: Briefcase,
  },
  {
    id: "education",
    label: "Education",
    shortLabel: "Education",
    icon: GraduationCap,
  },
  {
    id: "skills",
    label: "Skills",
    shortLabel: "Skills",
    icon: Wrench,
  },
  {
    id: "projects",
    label: "Projects",
    shortLabel: "Projects",
    icon: FolderGit2,
  },
  {
    id: "certifications",
    label: "Certifications",
    shortLabel: "Certs",
    icon: Award,
  },
  {
    id: "languages",
    label: "Languages",
    shortLabel: "Languages",
    icon: Globe,
  },
  {
    id: "custom",
    label: "Additional Sections",
    shortLabel: "Additional",
    icon: Layers,
  },
];

const ALL_TEMPLATES: { id: TemplateId; label: string; category: string }[] = [
  { id: "modern", label: "Modern", category: "Classic" },
  { id: "classic", label: "Classic", category: "Classic" },
  { id: "minimal", label: "Minimal", category: "Classic" },
  { id: "swiss", label: "Swiss", category: "Classic" },
  { id: "monochrome", label: "Monochrome", category: "Classic" },
  { id: "executive", label: "Executive", category: "Professional" },
  { id: "corporate", label: "Corporate", category: "Professional" },
  { id: "academic", label: "Academic", category: "Professional" },
  { id: "compact", label: "Compact", category: "Professional" },
  { id: "two-page", label: "Two-Page", category: "Professional" },
  { id: "elegant", label: "Elegant", category: "Stylish" },
  { id: "nordic", label: "Nordic", category: "Stylish" },
  { id: "atlas", label: "Atlas", category: "Stylish" },
  { id: "sidebar-light", label: "Sidebar Light", category: "Stylish" },
  { id: "gradient", label: "Gradient", category: "Stylish" },
  { id: "tech", label: "Tech", category: "Creative" },
  { id: "creative", label: "Creative", category: "Creative" },
  { id: "bold", label: "Bold", category: "Creative" },
  { id: "infographic", label: "Infographic", category: "Creative" },
  { id: "portfolio", label: "Portfolio", category: "Creative" },
  { id: "timeline", label: "Timeline", category: "Unique" },
  { id: "newspaper", label: "Newspaper", category: "Unique" },
  { id: "retro", label: "Retro", category: "Unique" },
  { id: "stealth", label: "Stealth", category: "Unique" },
  { id: "brutalist", label: "Brutalist", category: "Unique" },
  { id: "dark", label: "Dark Zinc", category: "Unique" },
  { id: "midnight", label: "Midnight Navy", category: "Unique" },
  { id: "pastel", label: "Pastel Lavender", category: "Stylish" },
  { id: "split", label: "Split Blue", category: "Professional" },
];

export default function CVEditor() {
  const { t } = useI18n();
  const { cvId } = useParams<{ cvId: string }>();
  const cvIdNum = parseInt(cvId || "0", 10);
  const [, navigate] = useLocation();

  // Route guard — redirect to login if unauthenticated
  const { isAuthenticated, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const [activeSection, setActiveSection] = useState("personal");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [paperSize, setPaperSize] = useState<PaperSize>("a4");
  const [isExporting, setIsExporting] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Responsive mobile/tablet view switcher: "editor" | "preview" | "chat"
  const [mobileTab, setMobileTab] = useState<"editor" | "preview" | "chat">("editor");

  const handleSetMobileTab = (tab: "editor" | "preview" | "chat") => {
    setMobileTab(tab);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Career AI and utility modals
  const [showATSModal, setShowATSModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showGrammarModal, setShowGrammarModal] = useState(false);
  const [showEmailDraftModal, setShowEmailDraftModal] = useState(false);
  const [showJobTrackerModal, setShowJobTrackerModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showJobMatcherModal, setShowJobMatcherModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handleBackupCV = () => {
    if (!cvData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `Backup_${(cvData.cv.title || "CV").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`);
    dlAnchor.click();
    toast.success("Cadangan CV (.json) berhasil diunduh!");
  };

  // Only user/assistant messages — system prompt is injected server-side
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Section custom ordering state
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`resumecraft_order_${cvIdNum}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SECTIONS.map(s => s.id);
  });

  const orderedSections = useMemo(() => {
    return sectionOrder
      .map(id => SECTIONS.find(s => s.id === id))
      .filter((s): s is (typeof SECTIONS)[0] => Boolean(s));
  }, [sectionOrder]);

  const moveSection = (id: string, dir: -1 | 1) => {
    setSectionOrder(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(target, 0, item);
      try {
        localStorage.setItem(`resumecraft_order_${cvIdNum}`, JSON.stringify(copy));
      } catch {}
      toast.success("Urutan bagian CV diperbarui!");
      return copy;
    });
  };

  // Inline title editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // Live preview state — updated whenever any form saves.
  const [previewData, setPreviewData] = useState<FullCVData | null>(null);
  const seeded = useRef(false);

  const {
    data: cvData,
    isLoading,
    error,
  } = trpc.cv.loadFull.useQuery(
    { cvId: cvIdNum },
    { enabled: cvIdNum > 0 && isAuthenticated }
  );

  const updateCVMutation = trpc.cv.update.useMutation({
    onError: () => {
      toast.error("Failed to save template. Please try again.");
    },
  });

  const renameMutation = trpc.cv.update.useMutation({
    onSuccess: () => {
      setIsEditingTitle(false);
      toast.success("Title updated");
    },
    onError: () => {
      toast.error("Failed to rename CV");
    },
  });

  const duplicateMutation = trpc.cv.duplicate.useMutation({
    onSuccess: (newCV: any) => {
      toast.success("CV berhasil diduplikasi menjadi varian baru!");
      if (newCV && newCV.id) {
        navigate(`/cv/${newCV.id}`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal menduplikasi CV");
    },
  });

  const handleTitleSave = () => {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      toast.error("Title cannot be empty");
      return;
    }
    if (trimmed === cvData?.cv.title) {
      setIsEditingTitle(false);
      return;
    }
    renameMutation.mutate({ cvId: cvIdNum, title: trimmed });
  };

  const chatMutation = trpc.cvAI.chat.useMutation({
    onSuccess: (data: any) => {
      setChatMessages(prev => [
        ...prev,
        { role: "assistant" as const, content: data.reply as string },
      ]);
    },
    onError: () => {
      toast.error("AI chat failed. Please try again.");
    },
  });

  // Seed template + preview from DB exactly once on first successful load
  useEffect(() => {
    if (cvData && !seeded.current) {
      seeded.current = true;
      setTemplate(cvData.cv.template);
      if (cvData.cv.paperSize) {
        setPaperSize(cvData.cv.paperSize as PaperSize);
      }
      setPreviewData(cvData);
    }
  }, [cvData]);

  const handlePaperSizeChange = (newSize: PaperSize) => {
    setPaperSize(newSize);
    updateCVMutation.mutate({
      cvId: cvIdNum,
      paperSize: newSize,
    });
    toast.success(`Ukuran kertas disimpan: ${newSize.toUpperCase()}`);
  };

  const handleQuickExportPDF = async () => {
    if (!cvData) return;
    try {
      setIsExporting(true);
      await exportCVToPDF(
        "cv-preview-content",
        `${cvData.cv.title || "resume"}.pdf`,
        paperSize
      );
      toast.info("Pilih 'Save as PDF' pada dialog cetak untuk mengunduh PDF.", {
        duration: 5000,
      });
    } catch (err: any) {
      toast.error(`Export PDF gagal: ${err.message || String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Callback passed to forms so they can push updated data to preview
  const handleDataChange = useCallback((updated: Partial<FullCVData>) => {
    setPreviewData(prev => {
      if (!prev) return prev;
      return { ...prev, ...updated };
    });
  }, []);

  const handleSendChatMessage = (content: string) => {
    const newMessages: ChatMessage[] = [
      ...chatMessages,
      { role: "user", content },
    ];
    setChatMessages(newMessages);
    chatMutation.mutate({ cvId: cvIdNum, messages: newMessages });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-neutral-50">
        <Spinner className="w-8 h-8 text-neutral-900" />
        <p className="text-xs font-medium text-neutral-500">Loading CV Studio...</p>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-neutral-50 p-4">
        <Card className="p-8 text-center max-w-md w-full shadow-sm border border-neutral-200">
          <p className="text-red-600 font-semibold mb-4">
            {error ? "Failed to load CV. Please try again." : "CV not found"}
          </p>
          <Button
            onClick={() => navigate("/")}
            className="gap-2 bg-neutral-900 text-white hover:bg-neutral-800 w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const displayData = previewData || cvData;

  // Helper count badge per section
  const sectionCounts: Record<string, number> = {
    personal: displayData.personalInfo?.fullName ? 1 : 0,
    experience: displayData.workExperiences?.length || 0,
    education: displayData.educations?.length || 0,
    skills: displayData.skills?.length || 0,
    projects: displayData.projects?.length || 0,
    certifications: displayData.certifications?.length || 0,
    languages: displayData.languages?.length || 0,
    custom: displayData.customSections?.length || 0,
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 h-9 px-2.5 rounded-lg flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline font-medium text-xs">{t("topbar.dashboard", "Dashboard")}</span>
              </Button>

              <div className="min-w-0">
                {isEditingTitle ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={titleDraft}
                      onChange={e => setTitleDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleTitleSave();
                        if (e.key === "Escape") setIsEditingTitle(false);
                      }}
                      className="h-7 text-sm font-bold border-neutral-300 w-36 sm:w-56"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTitleSave}
                      disabled={renameMutation.isPending}
                      className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                    >
                      {renameMutation.isPending ? (
                        <Spinner className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingTitle(false)}
                      className="h-7 w-7 p-0 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group">
                    <h1 className="text-sm sm:text-base font-bold text-neutral-900 truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                      {cvData.cv.title}
                    </h1>
                    <button
                      onClick={() => {
                        setTitleDraft(cvData.cv.title);
                        setIsEditingTitle(true);
                      }}
                      className="h-6 w-6 inline-flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                      title="Rename Resume"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <span className="hidden sm:inline">
                    {t("topbar.updated", "Updated")} {new Date(cvData.cv.updatedAt).toLocaleDateString()}
                  </span>
                  {cvData.cv.isPublic && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-emerald-300 text-emerald-700 bg-emerald-50">
                      {t("topbar.public", "Public")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Clean Compact Document Type Dropdown (Desktop xl) */}
            <div className="hidden xl:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8.5 px-3 rounded-xl border-neutral-200 bg-neutral-50/80 hover:bg-neutral-100 text-neutral-800 font-semibold text-xs shadow-2xs whitespace-nowrap"
                    title={t("doc_switcher.switch_title", "Ganti Dokumen (CV, Surat Lamaran, Draf Email)")}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate max-w-[150px] sm:max-w-none">{t("doc_switcher.cv", "Curriculum Vitae")}</span>
                    <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-64 rounded-xl shadow-xl border-neutral-200 p-1.5">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {t("doc_switcher.package_title", "Paket Dokumen Lamaran")}
                  </div>
                  <DropdownMenuItem className="gap-2.5 p-2 rounded-lg cursor-default bg-blue-50/70 text-blue-900 font-semibold text-xs">
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-900 flex items-center justify-between">
                        {t("doc_switcher.cv", "Curriculum Vitae")}
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                      </p>
                      <p className="text-[10px] text-neutral-500 font-normal">{t("doc_switcher.badge_active", "Sedang aktif diedit")}</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowCoverLetterModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-neutral-100 text-xs"
                  >
                    <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <FileCode2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{t("doc_switcher.cover_letter", "Surat Lamaran Kerja")}</p>
                      <p className="text-[10px] text-neutral-500">{t("doc_switcher.subtitle_cl", "25 format surat standar")}</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowEmailDraftModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-neutral-100 text-xs"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{t("doc_switcher.email_draft", "Draf Email & WA HRD")}</p>
                      <p className="text-[10px] text-neutral-500">{t("doc_switcher.subtitle_email", "Pengantar lamaran siap kirim")}</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right: Actions & Tools (Bersih, Rapi, Terorganisir) */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Live ATS Readiness Score Badge (Tablet / Desktop) */}
              <div className="hidden sm:inline-flex">
                <ATSReadinessBadge
                  cvData={cvData}
                  onClick={() => setShowATSModal(true)}
                />
              </div>

              {/* AI Career Tools Dropdown (Desktop) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-semibold text-xs">{t("topbar.ai_tools", "Alat AI")}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-lg border-neutral-200 p-1.5">
                  <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    AI Career Suite
                  </div>
                  <DropdownMenuItem
                    onClick={() => setShowATSModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-indigo-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">ATS Match Score</p>
                      <p className="text-[10px] text-neutral-500">Benchmark against job vacancy</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowJobMatcherModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-blue-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Job Description Matcher</p>
                      <p className="text-[10px] text-neutral-500">Pindai kata kunci yang cocok & hilang</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowCoverLetterModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-blue-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Studio Surat Lamaran</p>
                      <p className="text-[10px] text-neutral-500">25 format surat lamaran siap kirim</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowEmailDraftModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-emerald-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Draf Email & WA HRD</p>
                      <p className="text-[10px] text-neutral-500">Teks pengantar lamaran profesional</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowInterviewModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-purple-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Interview Prep Coach</p>
                      <p className="text-[10px] text-neutral-500">STAR questions & role hints</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowTranslateModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-emerald-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <LanguagesIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Translate Resume</p>
                      <p className="text-[10px] text-neutral-500">EN ↔ ID Professional localized copy</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowGrammarModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-purple-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                      <SpellCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Periksa Ejaan & EYD Baku</p>
                      <p className="text-[10px] text-neutral-500">Koreksi typo & tata bahasa formal</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowJobTrackerModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-indigo-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Pelacak Lamaran Kerja</p>
                      <p className="text-[10px] text-neutral-500">Papan Kanban status & catatan wawancara</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowChecklistModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-emerald-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Checklist Berkas Lamaran</p>
                      <p className="text-[10px] text-neutral-500">Kesiapan ijazah, SKCK & backup CV</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowSalaryModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-emerald-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Benchmark Gaji Pasar</p>
                      <p className="text-[10px] text-neutral-500">Estimasi gaji IDR & USD</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setShowPitchModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-indigo-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Elevator Pitch 30 Detik</p>
                      <p className="text-[10px] text-neutral-500">Naskah lisan wawancara & LinkedIn</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Unified Design & Template Picker (Tablet / Desktop) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:inline-flex gap-1.5 border-neutral-200 text-neutral-700 hover:bg-neutral-100 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl"
                    title="Pilih Desain & Kustomisasi CV"
                  >
                    <Layout className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span className="truncate text-xs font-semibold">
                      {ALL_TEMPLATES.find(t => t.id === template)?.label ?? template}
                    </span>
                    <ChevronDown className="w-3 h-3 opacity-50 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 max-h-96 overflow-y-auto rounded-xl p-1.5 shadow-xl border-neutral-200"
                >
                  {/* Visual Template Showcase Gallery Modal */}
                  <DropdownMenuItem
                    onClick={() => setShowGalleryModal(true)}
                    className="gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer bg-gradient-to-r from-red-50 to-amber-50 text-red-900 font-semibold text-xs mb-1 border border-red-200/60"
                  >
                    <div className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-red-950">Galeri 29 Template</p>
                      <p className="text-[10px] text-red-700/80 font-normal">Lihat kartu preview warna & rekomendasi</p>
                    </div>
                  </DropdownMenuItem>

                  {/* Quick Color Accent & Font setting */}
                  <DropdownMenuItem
                    onClick={() => setShowStyleModal(true)}
                    className="gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer bg-slate-50 text-slate-900 font-semibold text-xs mb-1"
                  >
                    <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Palette className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Ubah Tema & Font</p>
                      <p className="text-[10px] text-neutral-500 font-normal">Warna aksen, tipografi, dan spasi</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Ganti Cepat Template ({ALL_TEMPLATES.length} Format)
                  </div>

                  {["Classic", "Professional", "Stylish", "Creative", "Unique"].map(cat => {
                    const catTemplates = ALL_TEMPLATES.filter(t => t.category === cat);
                    return (
                      <div key={cat}>
                        <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 mt-1">
                          {cat}
                        </div>
                        {catTemplates.map(t => (
                          <DropdownMenuItem
                            key={t.id}
                            onClick={() => {
                              setTemplate(t.id);
                              updateCVMutation.mutate({
                                cvId: cvIdNum,
                                template: t.id,
                              });
                            }}
                            className={`cursor-pointer rounded-md text-xs py-1.5 px-2.5 flex items-center justify-between ${
                              template === t.id ? "font-semibold bg-neutral-100 text-neutral-900" : "text-neutral-600"
                            }`}
                          >
                            <span>{t.label}</span>
                            {template === t.id && (
                              <Check className="w-3.5 h-3.5 text-red-600 ml-2" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Primary Action: Unified Export Dropdown (PDF, Word DOCX, Backup JSON) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isExporting}
                    size="sm"
                    className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 h-8 sm:h-9 px-3 sm:px-4 rounded-xl shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="font-semibold text-xs">
                      {isExporting ? "Mengunduh..." : "Unduh"}
                    </span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-xl shadow-xl border-neutral-200">
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        setIsExporting(true);
                        await exportCVToPDF(
                          "cv-preview-content",
                          `${cvData.cv.title || "resume"}.pdf`,
                          paperSize
                        );
                        toast.info("Pilih 'Save as PDF' pada dialog cetak untuk mengunduh PDF.", {
                          duration: 5000,
                        });
                      } catch (err: any) {
                        toast.error(`Export PDF gagal: ${err.message || String(err)}`);
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                    className="flex items-center gap-2.5 text-xs font-medium cursor-pointer rounded-lg py-2"
                  >
                    <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">Format PDF ({paperSize.toUpperCase()})</p>
                      <p className="text-[10px] text-neutral-500">Tajam, vektor, standar cetak</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        setIsExporting(true);
                        await exportCVToDOCX(
                          cvData,
                          `${cvData.cv.title || "CV"}.docx`
                        );
                        toast.success("Dokumen Microsoft Word (.docx) berhasil diunduh!");
                      } catch (err: any) {
                        toast.error(`Export Word gagal: ${err.message || String(err)}`);
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                    className="flex items-center gap-2.5 text-xs font-medium cursor-pointer rounded-lg py-2"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileCode2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">Format Word (.docx)</p>
                      <p className="text-[10px] text-neutral-500">Bisa diedit di Word / WPS</p>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleBackupCV}
                    className="flex items-center gap-2.5 text-xs font-medium cursor-pointer rounded-lg py-2"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">Backup Data (JSON)</p>
                      <p className="text-[10px] text-neutral-500">Simpan arsip data untuk restore</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Master More Menu (...) Menampung Alat Pendukung Agar Header Bersih */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 w-8 sm:w-9 p-0 text-neutral-600 border-neutral-200 hover:bg-neutral-100 rounded-xl"
                    title="Menu Alat & Opsi Tambahan"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-xl border-neutral-200 p-1.5 max-h-[85vh] overflow-y-auto">
                  {/* Chatbot Toggle */}
                  <DropdownMenuItem
                    onClick={() => {
                      setShowAIChat(v => !v);
                      if (mobileTab === "chat") setMobileTab("editor");
                    }}
                    className="gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer text-xs font-medium"
                  >
                    <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900">
                        {showAIChat ? "Tutup Obrolan AI" : "Buka Obrolan AI"}
                      </p>
                      <p className="text-[10px] text-neutral-500">Asisten pembuat konten karir</p>
                    </div>
                  </DropdownMenuItem>

                  {/* Public Link Share */}
                  <DropdownMenuItem
                    onClick={() => setShowShareModal(true)}
                    className="gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer text-xs"
                  >
                    <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-neutral-900">Bagikan Tautan Online & QR</p>
                      <p className="text-[10px] text-neutral-500">Link CV publik untuk HRD</p>
                    </div>
                  </DropdownMenuItem>

                  {/* Duplicate CV */}
                  <DropdownMenuItem
                    onClick={() => setShowDuplicateModal(true)}
                    className="gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer text-xs"
                  >
                    <Copy className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-neutral-900">Duplikasi CV (Varian)</p>
                      <p className="text-[10px] text-neutral-500">Targetkan ke posisi lowongan lain</p>
                    </div>
                  </DropdownMenuItem>

                  {/* Mobile-only tools shortcut */}
                  <div className="lg:hidden border-t border-neutral-100 my-1 pt-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Menu Mobile Tambahan
                    </div>
                    <DropdownMenuItem
                      onClick={() => setShowGalleryModal(true)}
                      className="gap-2.5 py-1.5 px-2.5 rounded-lg cursor-pointer text-xs"
                    >
                      <Layout className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Galeri 29 Template</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowStyleModal(true)}
                      className="gap-2.5 py-1.5 px-2.5 rounded-lg cursor-pointer text-xs"
                    >
                      <Palette className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ubah Tema & Font</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowCoverLetterModal(true)}
                      className="gap-2.5 py-1.5 px-2.5 rounded-lg cursor-pointer text-xs"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-purple-600" />
                      <span>Surat Lamaran Kerja</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowEmailDraftModal(true)}
                      className="gap-2.5 py-1.5 px-2.5 rounded-lg cursor-pointer text-xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Draf Email & WA HRD</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowATSModal(true)}
                      className="gap-2.5 py-1.5 px-2.5 rounded-lg cursor-pointer text-xs"
                    >
                      <Target className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Evaluasi Skor ATS</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleBackupCV}
                    className="gap-2.5 py-2 px-2.5 rounded-lg cursor-pointer text-xs"
                  >
                    <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-neutral-900">Backup Data (JSON)</p>
                      <p className="text-[10px] text-neutral-500">Ekspor file arsip data</p>
                    </div>
                  </DropdownMenuItem>

                  {/* Language Switcher */}
                  <div className="p-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-500">Bahasa Dokumen</span>
                    <LanguageSwitcher />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile / Tablet Document Switcher & View Switcher */}
          <div className="lg:hidden mt-2 pt-2 border-t border-neutral-100 flex flex-col gap-1.5">
            {/* Quick Document Navigation Strip for Mobile - only show on editor tab to avoid cluttering preview */}
            {mobileTab === "editor" && (
              <div className="flex items-center justify-between bg-blue-50/70 border border-blue-200/60 px-2.5 py-1.5 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold truncate">
                  <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{t("doc_switcher.doc_cv_label", "Dokumen: CV")}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCoverLetterModal(true)}
                    className="px-2.5 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                  >
                    <FileCode2 className="w-3 h-3 text-purple-600 shrink-0" />
                    <span>{t("doc_switcher.cover_letter_short", "Surat Lamaran")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailDraftModal(true)}
                    className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors"
                  >
                    <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{t("doc_switcher.email_short", "Email")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Segmented View Switcher */}
            <div className="flex items-center justify-center gap-1.5 bg-neutral-100/70 p-1 rounded-xl">
              <button
                onClick={() => handleSetMobileTab("editor")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  mobileTab === "editor"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{t("topbar.tab_form", "Formulir")}</span>
              </button>

              <button
                onClick={() => handleSetMobileTab("preview")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  mobileTab === "preview"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>{t("topbar.tab_preview", "Pratinjau CV")}</span>
              </button>

              <button
                onClick={() => handleSetMobileTab("chat")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  mobileTab === "chat"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-indigo-600 hover:bg-white/60"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{t("topbar.tab_chat", "Obrolan AI")}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="container mx-auto px-4 py-6 flex-1">
        {/*
          Responsive Grid:
          - Desktop (lg): Side-by-side Editor (7 cols) + Sticky Preview (5 cols), or 5/3/4 when AI Chat open
          - Mobile / Tablet (< lg): Driven by mobileTab switcher (only one visible at a time)
        */}
        <div
          className={`grid gap-6 ${showAIChat
            ? "grid-cols-1 lg:grid-cols-12"
            : "grid-cols-1 lg:grid-cols-12"
            }`}
        >
          {/* ========================================================================= */}
          {/* LEFT: FORM EDITOR                                                         */}
          {/* ========================================================================= */}
          <div
            className={`transition-all ${mobileTab !== "editor" ? "hidden lg:block" : "block"
              } ${showAIChat
                ? "lg:col-span-5"
                : "lg:col-span-7 xl:col-span-7"
              }`}
          >
            {/* Section Horizontal Pill Selector with Counts and Reorder */}
            <div className="mb-5 overflow-x-auto pb-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-1.5 min-w-max p-1 bg-neutral-100/90 border border-neutral-200/70 rounded-xl shadow-2xs">
                {orderedSections.map((section: (typeof SECTIONS)[0], idx: number) => {
                  const Icon = section.icon;
                  const count = sectionCounts[section.id] || 0;
                  const isActive = activeSection === section.id;
                  const tabKey = section.id === "certifications" ? "certs" : section.id;
                  const sectionLabel = t(`tabs.${tabKey}`, section.shortLabel);
                  return (
                    <div
                      key={section.id}
                      className={`inline-flex items-center rounded-lg transition-all ${
                        isActive
                          ? "bg-white text-neutral-900 shadow-xs font-semibold"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer"
                      >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-red-600" : "text-neutral-500"}`} />
                        <span>{sectionLabel}</span>
                        {count > 0 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              isActive
                                ? "bg-neutral-100 text-neutral-900"
                                : "bg-neutral-300/70 text-neutral-700"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>

                      {/* Mini reorder control for active section */}
                      {isActive && (
                        <div className="flex items-center pr-1.5 gap-0.5 border-l border-neutral-200/80 ml-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, -1);
                            }}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-800 disabled:opacity-20 text-[9px] leading-none"
                            title="Geser urutan ke kiri"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            disabled={idx === orderedSections.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, 1);
                            }}
                            className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-800 disabled:opacity-20 text-[9px] leading-none"
                            title="Geser urutan ke kanan"
                          >
                            ▶
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Panels */}
            <div className="space-y-4">
              {activeSection === "personal" && (
                <PersonalInfoForm
                  cvId={cvIdNum}
                  initialData={cvData.personalInfo}
                  initialTargetRole={cvData.cv.targetRole}
                  initialPortfolioUrl={cvData.cv.portfolioUrl}
                  initialShowQrCode={cvData.cv.showQrCode}
                  onDataChange={personalInfo =>
                    handleDataChange({ personalInfo })
                  }
                  onTargetRoleChange={role =>
                    handleDataChange({ cv: { ...cvData.cv, targetRole: role } })
                  }
                  onPortfolioUrlChange={url =>
                    handleDataChange({ cv: { ...cvData.cv, portfolioUrl: url } })
                  }
                  onShowQrCodeChange={show =>
                    handleDataChange({ cv: { ...cvData.cv, showQrCode: show } })
                  }
                />
              )}

              {activeSection === "experience" && (
                <WorkExperienceForm
                  cvId={cvIdNum}
                  initialData={cvData.workExperiences}
                  onDataChange={workExperiences =>
                    handleDataChange({ workExperiences })
                  }
                />
              )}

              {activeSection === "education" && (
                <EducationForm
                  cvId={cvIdNum}
                  initialData={cvData.educations}
                  onDataChange={educations => handleDataChange({ educations })}
                />
              )}

              {activeSection === "skills" && (
                <SkillsForm
                  cvId={cvIdNum}
                  initialData={cvData.skills}
                  onDataChange={skills => handleDataChange({ skills })}
                />
              )}

              {activeSection === "projects" && (
                <ProjectsForm
                  cvId={cvIdNum}
                  initialData={cvData.projects}
                  onDataChange={projects => handleDataChange({ projects })}
                />
              )}

              {activeSection === "certifications" && (
                <CertificationsForm
                  cvId={cvIdNum}
                  initialData={cvData.certifications}
                  onDataChange={certifications =>
                    handleDataChange({ certifications })
                  }
                />
              )}

              {activeSection === "languages" && (
                <LanguagesForm
                  cvId={cvIdNum}
                  initialData={cvData.languages}
                  onDataChange={languages => handleDataChange({ languages })}
                />
              )}

              {activeSection === "custom" && (
                <CustomSectionsForm
                  cvId={cvIdNum}
                  initialData={cvData.customSections}
                  onDataChange={customSections =>
                    handleDataChange({ customSections })
                  }
                />
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MIDDLE: AI CHAT ASSISTANT                                                 */}
          {/* ========================================================================= */}
          {((showAIChat && mobileTab !== "preview") || mobileTab === "chat") && (
            <div
              className={`transition-all ${mobileTab === "chat" ? "block lg:hidden" : "hidden lg:block lg:col-span-3"
                }`}
            >
              <Card className="p-3.5 border border-neutral-200 bg-white rounded-2xl shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900">AI Assistant</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAIChat(false);
                      if (mobileTab === "chat") setMobileTab("editor");
                    }}
                    className="h-6 w-6 p-0 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <AIChatBox
                  messages={chatMessages}
                  onSendMessage={handleSendChatMessage}
                  isLoading={chatMutation.isPending}
                  height="calc(100vh - 250px)"
                  emptyStateMessage="Ask me anything about tailoring or improving your CV"
                  suggestedPrompts={[
                    "Review my professional summary",
                    "Suggest high-impact action verbs",
                    "How can I improve my skills section?",
                    "Make my job descriptions quantifiable",
                  ]}
                />
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* RIGHT: LIVE PREVIEW                                                       */}
          {/* ========================================================================= */}
          <div
            className={`transition-all ${mobileTab !== "preview" ? "hidden lg:block" : "block"
              } ${showAIChat
                ? "lg:col-span-4"
                : "lg:col-span-5 xl:col-span-5"
              }`}
          >
            <div className="lg:sticky lg:top-20">
              <div id="cv-preview-content">
                <CVPreview
                  template={template}
                  cvData={displayData}
                  paperSize={paperSize}
                  onPaperSizeChange={handlePaperSizeChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career AI & Feature Modals */}
      <ATSScoreModal
        cvId={cvIdNum}
        isOpen={showATSModal}
        onClose={() => setShowATSModal(false)}
        defaultRole={cvData.cv.targetRole || cvData.cv.title}
      />

      <CoverLetterModal
        cvId={cvIdNum}
        isOpen={showCoverLetterModal}
        onClose={() => setShowCoverLetterModal(false)}
        defaultRole={cvData.cv.targetRole || cvData.cv.title}
        cvData={cvData}
      />

      <InterviewPrepModal
        cvId={cvIdNum}
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        defaultRole={cvData.cv.targetRole || cvData.cv.title}
      />

      <TranslateCVModal
        cvId={cvIdNum}
        isOpen={showTranslateModal}
        onClose={() => setShowTranslateModal(false)}
        currentTitle={cvData.cv.title}
      />

      <SharePublicModal
        cvId={cvIdNum}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        isPublic={cvData.cv.isPublic}
        shareSlug={cvData.cv.shareSlug}
        viewsCount={cvData.cv.viewsCount}
      />

      <StyleCustomizerModal
        cvId={cvIdNum}
        isOpen={showStyleModal}
        onClose={() => setShowStyleModal(false)}
        currentAccent={cvData.cv.accentColor}
        currentFont={cvData.cv.fontFamily}
        onStyleChange={style => {
          setPreviewData(prev =>
            prev
              ? {
                ...prev,
                cv: {
                  ...prev.cv,
                  ...(style.accentColor ? { accentColor: style.accentColor } : {}),
                  ...(style.fontFamily ? { fontFamily: style.fontFamily } : {}),
                },
              }
              : prev
          );
        }}
      />

      <GrammarCheckModal
        cvId={cvIdNum}
        isOpen={showGrammarModal}
        onClose={() => setShowGrammarModal(false)}
      />

      <EmailDraftModal
        isOpen={showEmailDraftModal}
        onClose={() => setShowEmailDraftModal(false)}
        cvData={cvData}
      />

      <JobTrackerModal
        isOpen={showJobTrackerModal}
        onClose={() => setShowJobTrackerModal(false)}
        defaultCvId={cvIdNum}
      />

      <DocumentChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        cvId={cvIdNum}
        onBackupCV={handleBackupCV}
      />

      <SalaryBenchmarkModal
        isOpen={showSalaryModal}
        onClose={() => setShowSalaryModal(false)}
        defaultRole={cvData.cv.targetRole || ""}
        defaultLocation={cvData.personalInfo?.location || "Indonesia"}
      />

      <CareerPitchModal
        isOpen={showPitchModal}
        onClose={() => setShowPitchModal(false)}
        cvId={cvIdNum}
        candidateName={cvData.personalInfo?.fullName || "Kandidat"}
      />

      <TemplateGalleryModal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        currentTemplate={template}
        onSelectTemplate={(newTemplate) => {
          setTemplate(newTemplate);
          updateCVMutation.mutate({
            cvId: cvIdNum,
            template: newTemplate,
          });
          toast.success(`Template berhasil diubah ke: ${newTemplate}`);
        }}
      />

      <JobMatcherModal
        isOpen={showJobMatcherModal}
        onClose={() => setShowJobMatcherModal(false)}
        cvId={cvIdNum}
        defaultRole={cvData.cv.targetRole || cvData.cv.title}
      />

      <DuplicateCVModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        cvId={cvIdNum}
        currentTitle={cvData.cv.title || "CV"}
        currentTargetRole={cvData.cv.targetRole}
      />

      {/* Mobile Sticky Floating Navigation & Quick Action Bar */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-neutral-900/90 backdrop-blur-md text-white border border-neutral-700/80 shadow-2xl rounded-full p-1.5 flex items-center gap-2">
          {mobileTab === "editor" ? (
            <button
              type="button"
              onClick={() => handleSetMobileTab("preview")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t("topbar.tab_preview", "Lihat Pratinjau")}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSetMobileTab("editor")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-neutral-100 text-neutral-900 rounded-full text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-red-600" />
              <span>{t("topbar.tab_form", "Sunting Formulir")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleQuickExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full text-xs font-semibold transition-all active:scale-95 border border-neutral-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>{isExporting ? t("status.saving", "Menyiapkan...") : t("topbar.download", "Unduh PDF")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
