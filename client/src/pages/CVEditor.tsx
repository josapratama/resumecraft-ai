import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { exportCVToPDF } from "@/lib/pdfExport";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Sparkles,
  Share2,
  Palette,
  FileText,
  Target,
  HelpCircle,
  Languages as LanguagesIcon,
} from "lucide-react";

/** Narrows AIChatBox Message to the roles the AI endpoint actually accepts. */
type ChatMessage = { role: "user" | "assistant"; content: string };

const SECTIONS = [
  {
    id: "personal",
    label: "Personal Info",
    shortLabel: "Personal",
    icon: "👤",
  },
  {
    id: "experience",
    label: "Work Experience",
    shortLabel: "Experience",
    icon: "💼",
  },
  { id: "education", label: "Education", shortLabel: "Education", icon: "🎓" },
  { id: "skills", label: "Skills", shortLabel: "Skills", icon: "⚡" },
  { id: "projects", label: "Projects", shortLabel: "Projects", icon: "🚀" },
  {
    id: "certifications",
    label: "Certifications",
    shortLabel: "Certs",
    icon: "🏆",
  },
  {
    id: "languages",
    label: "Languages",
    shortLabel: "Langs",
    icon: "🌐",
  },
  {
    id: "custom",
    label: "Additional",
    shortLabel: "Custom",
    icon: "⭐",
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
  // Seeded from cvData only once on first non-null load (ref guard prevents
  // re-seeding on background refetches, which would wipe user-typed changes).
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

  // Seed template + preview from DB exactly once — on first successful load.
  // Using a ref guard instead of [cvData] dependency prevents the effect from
  // overwriting live preview data whenever React Query does a background refetch.
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
    // Pass cvId so server can inject the user's CV data into the system prompt
    chatMutation.mutate({ cvId: cvIdNum, messages: newMessages });
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Card className="p-8 text-center">
          <p className="text-red-600 font-semibold mb-4">
            {error ? "Failed to load CV. Please try again." : "CV not found"}
          </p>
          <Button
            onClick={() => navigate("/")}
            className="gap-2 bg-black text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const displayData = previewData || cvData;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2 text-gray-600 hover:text-black"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={titleDraft}
                      onChange={e => setTitleDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleTitleSave();
                        if (e.key === "Escape") setIsEditingTitle(false);
                      }}
                      className="h-8 text-base font-bold border-black w-48"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTitleSave}
                      disabled={renameMutation.isPending}
                      className="h-8 w-8 p-0"
                    >
                      {renameMutation.isPending ? (
                        <Spinner className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingTitle(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group">
                    <h1 className="text-2xl font-bold text-black">
                      {cvData.cv.title}
                    </h1>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTitleDraft(cvData.cv.title);
                        setIsEditingTitle(true);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Rename CV"
                    >
                      <Pencil className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Last updated{" "}
                  {new Date(cvData.cv.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* AI Career Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-indigo-600 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline font-semibold">AI Tools</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => setShowATSModal(true)}
                    className="gap-2.5 cursor-pointer font-medium"
                  >
                    <Target className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs font-semibold">ATS Compatibility Score</p>
                      <p className="text-[10px] text-gray-500">Match against job vacancies</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowCoverLetterModal(true)}
                    className="gap-2.5 cursor-pointer font-medium"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-semibold">Generate Cover Letter</p>
                      <p className="text-[10px] text-gray-500">Auto-tailored from this CV</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowInterviewModal(true)}
                    className="gap-2.5 cursor-pointer font-medium"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-xs font-semibold">Interview Question Prep</p>
                      <p className="text-[10px] text-gray-500">STAR questions & tips</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowTranslateModal(true)}
                    className="gap-2.5 cursor-pointer font-medium"
                  >
                    <LanguagesIcon className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold">Translate CV (EN ⇄ ID)</p>
                      <p className="text-[10px] text-gray-500">Professional localization</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme & Style */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStyleModal(true)}
                className="gap-1.5 border-gray-300"
                title="Customize Accent Color & Typography"
              >
                <Palette className="w-3.5 h-3.5 text-gray-700" />
                <span className="hidden md:inline">Theme</span>
              </Button>

              {/* Share Public Link */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="gap-1.5 border-gray-300"
                title="Share Public Link"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Share</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIChat(v => !v)}
                className="gap-2 border-black"
              >
                {showAIChat ? (
                  <X className="w-4 h-4" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">AI Chat</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-black min-w-[130px] justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5" />
                      {ALL_TEMPLATES.find(t => t.id === template)?.label ??
                        template}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 max-h-80 overflow-y-auto"
                >
                  {[
                    "Classic",
                    "Professional",
                    "Stylish",
                    "Creative",
                    "Unique",
                  ].map(cat => {
                    const catTemplates = ALL_TEMPLATES.filter(
                      t => t.category === cat
                    );
                    return (
                      <div key={cat}>
                        <div className="px-2 py-1 text-xs font-bold uppercase tracking-widest text-gray-400 border-t border-gray-100 first:border-t-0 mt-1 first:mt-0">
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
                            className={`cursor-pointer pl-4 ${template === t.id ? "font-semibold bg-gray-50" : ""}`}
                          >
                            {template === t.id && (
                              <span className="mr-1.5 text-red-600">✓</span>
                            )}
                            {t.label}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={async () => {
                  try {
                    setIsExporting(true);
                    await exportCVToPDF(
                      "cv-preview-content",
                      `${cvData.cv.title}.pdf`
                    );
                    // Print window opened successfully — inform user to use Save as PDF
                    toast.info(
                      "Print dialog opened. Select 'Save as PDF' to download.",
                      {
                        duration: 5000,
                      }
                    );
                  } catch (err) {
                    const msg =
                      err instanceof Error
                        ? err.message +
                          (err.cause
                            ? ` (${(err.cause as Error)?.message ?? err.cause})`
                            : "")
                        : String(err);
                    console.error("Export failed:", err);
                    toast.error(`Export failed: ${msg}`);
                  } finally {
                    setIsExporting(false);
                  }
                }}
                disabled={isExporting}
                className="gap-2 bg-black text-white hover:bg-gray-800"
                size="sm"
              >
                <Download className="w-4 h-4" />
                {isExporting ? "Exporting..." : "Export PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div
          className={`grid gap-8 ${showAIChat ? "grid-cols-5" : "grid-cols-3"}`}
        >
          {/* Editor — takes 2 cols in both layouts */}
          <div className="col-span-2">
            <Tabs
              value={activeSection}
              onValueChange={setActiveSection}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 mb-8 bg-white border border-black h-auto p-1">
                {SECTIONS.map(section => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="text-xs py-2 data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    <span className="hidden xl:inline">{section.label}</span>
                    <span className="hidden sm:inline xl:hidden">
                      {section.shortLabel}
                    </span>
                    <span className="sm:hidden flex items-center gap-1">
                      {section.icon} <span className="text-[11px]">{section.shortLabel}</span>
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="personal">
                <PersonalInfoForm
                  cvId={cvIdNum}
                  initialData={cvData.personalInfo}
                  onDataChange={personalInfo =>
                    handleDataChange({ personalInfo })
                  }
                />
              </TabsContent>

              <TabsContent value="experience">
                <WorkExperienceForm
                  cvId={cvIdNum}
                  initialData={cvData.workExperiences}
                  onDataChange={workExperiences =>
                    handleDataChange({ workExperiences })
                  }
                />
              </TabsContent>

              <TabsContent value="education">
                <EducationForm
                  cvId={cvIdNum}
                  initialData={cvData.educations}
                  onDataChange={educations => handleDataChange({ educations })}
                />
              </TabsContent>

              <TabsContent value="skills">
                <SkillsForm
                  cvId={cvIdNum}
                  initialData={cvData.skills}
                  onDataChange={skills => handleDataChange({ skills })}
                />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectsForm
                  cvId={cvIdNum}
                  initialData={cvData.projects}
                  onDataChange={projects => handleDataChange({ projects })}
                />
              </TabsContent>

              <TabsContent value="certifications">
                <CertificationsForm
                  cvId={cvIdNum}
                  initialData={cvData.certifications}
                  onDataChange={certifications =>
                    handleDataChange({ certifications })
                  }
                />
              </TabsContent>

              <TabsContent value="languages">
                <LanguagesForm
                  cvId={cvIdNum}
                  initialData={cvData.languages}
                  onDataChange={languages => handleDataChange({ languages })}
                />
              </TabsContent>

              <TabsContent value="custom">
                <CustomSectionsForm
                  cvId={cvIdNum}
                  initialData={cvData.customSections}
                  onDataChange={customSections =>
                    handleDataChange({ customSections })
                  }
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Chat Panel — takes 2 cols, only visible in 5-col layout */}
          {showAIChat && (
            <div className="col-span-2">
              <h2 className="text-lg font-bold text-black mb-4">
                AI Assistant
              </h2>
              <AIChatBox
                messages={chatMessages}
                onSendMessage={handleSendChatMessage}
                isLoading={chatMutation.isPending}
                height="calc(100vh - 220px)"
                emptyStateMessage="Ask me anything about your CV"
                suggestedPrompts={[
                  "Review my professional summary",
                  "Suggest better action verbs",
                  "How can I improve my skills section?",
                  "Make my job descriptions more impactful",
                ]}
              />
            </div>
          )}

          {/* Preview */}
          <div className="col-span-1">
            <div className="sticky top-8">
              <h2 className="text-lg font-bold text-black mb-4">Preview</h2>
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
                  cv: { ...prev.cv, ...style },
                }
              : prev
          );
        }}
      />
    </div>
  );
}
