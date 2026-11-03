import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { exportCVToPDF } from "@/lib/pdfExport";
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
import CVPreview from "@/components/CVEditor/CVPreview";
import { AIChatBox } from "@/components/AIChatBox";
import { useAuth } from "@/_core/hooks/useAuth";
import type { FullCVData, TemplateId } from "@/types/cv";

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
];

export default function CVEditor() {
  const { cvId } = useParams<{ cvId: string }>();
  const cvIdNum = parseInt(cvId || "0", 10);
  const [, navigate] = useLocation();

  // Route guard — redirect to login if unauthenticated
  const { isAuthenticated, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const [activeSection, setActiveSection] = useState("personal");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [isExporting, setIsExporting] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Responsive mobile/tablet view switcher: "editor" | "preview" | "chat"
  const [mobileTab, setMobileTab] = useState<"editor" | "preview" | "chat">("editor");

  // Career AI and utility modals
  const [showATSModal, setShowATSModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);

  // Only user/assistant messages — system prompt is injected server-side
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

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
      setPreviewData(cvData);
    }
  }, [cvData]);

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
                <span className="hidden sm:inline font-medium text-xs">Dashboard</span>
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
                    Updated {new Date(cvData.cv.updatedAt).toLocaleDateString()}
                  </span>
                  {cvData.cv.isPublic && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-emerald-300 text-emerald-700 bg-emerald-50">
                      Public
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions & Tools */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* AI Career Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 h-8 sm:h-9 px-2 sm:px-3 rounded-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden md:inline font-semibold text-xs">AI Tools</span>
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
                    onClick={() => setShowCoverLetterModal(true)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-blue-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900">Cover Letter Generator</p>
                      <p className="text-[10px] text-neutral-500">Tailored letter from this resume</p>
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
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme & Typography Customizer */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStyleModal(true)}
                className="gap-1.5 border-neutral-200 text-neutral-700 hover:bg-neutral-100 h-8 sm:h-9 px-2 sm:px-3 rounded-lg"
                title="Customize Accent Color & Typography"
              >
                <Palette className="w-3.5 h-3.5 text-neutral-600" />
                <span className="hidden lg:inline text-xs">Theme</span>
              </Button>

              {/* Share Public Modal */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="gap-1.5 border-neutral-200 text-neutral-700 hover:bg-neutral-100 h-8 sm:h-9 px-2 sm:px-3 rounded-lg"
                title="Share Public Link for Recruiters"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden lg:inline text-xs">Share</span>
              </Button>

              {/* Desktop AI Assistant Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAIChat(v => !v);
                  if (mobileTab === "chat") setMobileTab("editor");
                }}
                className={`hidden lg:inline-flex gap-1.5 h-9 px-3 rounded-lg border-neutral-200 ${
                  showAIChat ? "bg-neutral-900 text-white hover:bg-neutral-800" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {showAIChat ? <X className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                <span className="text-xs font-medium">AI Chat</span>
              </Button>

              {/* Template Picker Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-neutral-200 text-neutral-700 hover:bg-neutral-100 h-8 sm:h-9 px-2 sm:px-3 rounded-lg max-w-[130px] sm:max-w-none"
                  >
                    <Layout className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                    <span className="truncate text-xs font-medium">
                      {ALL_TEMPLATES.find(t => t.id === template)?.label ?? template}
                    </span>
                    <ChevronDown className="w-3 h-3 opacity-50 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 max-h-80 overflow-y-auto rounded-xl p-1 shadow-lg border-neutral-200"
                >
                  {["Classic", "Professional", "Stylish", "Creative", "Unique"].map(cat => {
                    const catTemplates = ALL_TEMPLATES.filter(t => t.category === cat);
                    return (
                      <div key={cat}>
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-1 first:mt-0">
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

              {/* PDF Export Button */}
              <Button
                onClick={async () => {
                  try {
                    setIsExporting(true);
                    await exportCVToPDF(
                      "cv-preview-content",
                      `${cvData.cv.title || "resume"}.pdf`
                    );
                    toast.info("Print dialog opened. Select 'Save as PDF' to download.", {
                      duration: 5000,
                    });
                  } catch (err: any) {
                    toast.error(`Export failed: ${err.message || String(err)}`);
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                size="sm"
                className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 h-8 sm:h-9 px-3 sm:px-4 rounded-lg shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="font-semibold text-xs">
                  {isExporting ? "Exporting..." : "PDF"}
                </span>
              </Button>
            </div>
          </div>

          {/* Mobile / Tablet Segmented View Switcher */}
          <div className="lg:hidden mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-center gap-1">
            <button
              onClick={() => setMobileTab("editor")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mobileTab === "editor"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Form Editor</span>
            </button>

            <button
              onClick={() => setMobileTab("preview")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mobileTab === "preview"
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>

            <button
              onClick={() => setMobileTab("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                mobileTab === "chat"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>
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
          className={`grid gap-6 ${
            showAIChat
              ? "grid-cols-1 lg:grid-cols-12"
              : "grid-cols-1 lg:grid-cols-12"
          }`}
        >
          {/* ========================================================================= */}
          {/* LEFT: FORM EDITOR                                                         */}
          {/* ========================================================================= */}
          <div
            className={`transition-all ${
              mobileTab !== "editor" ? "hidden lg:block" : "block"
            } ${
              showAIChat
                ? "lg:col-span-5"
                : "lg:col-span-7 xl:col-span-7"
            }`}
          >
            {/* Section Horizontal Pill Selector with Counts */}
            <div className="mb-5 overflow-x-auto pb-1.5 no-scrollbar">
              <div className="flex items-center gap-1.5 min-w-max p-1 bg-neutral-200/60 rounded-xl">
                {SECTIONS.map(section => {
                  const Icon = section.icon;
                  const count = sectionCounts[section.id] || 0;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? "bg-white text-neutral-900 shadow-xs font-semibold"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-red-600" : "text-neutral-500"}`} />
                      <span>{section.shortLabel}</span>
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
                  onDataChange={personalInfo =>
                    handleDataChange({ personalInfo })
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
              className={`transition-all ${
                mobileTab === "chat" ? "block lg:hidden" : "hidden lg:block lg:col-span-3"
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
            className={`transition-all ${
              mobileTab !== "preview" ? "hidden lg:block" : "block"
            } ${
              showAIChat
                ? "lg:col-span-4"
                : "lg:col-span-5 xl:col-span-5"
            }`}
          >
            <div className="sticky top-20">
              <div id="cv-preview-content">
                <CVPreview template={template} cvData={displayData} />
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
    </div>
  );
}
