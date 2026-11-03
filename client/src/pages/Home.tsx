import { useAuth } from "@/_core/hooks/useAuth";
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
  ].filter(n => n > 0).length;
  const pct = Math.round((filled / 6) * 100);
  return { filled, total: 6, pct };
}

const TEMPLATE_COLORS: Record<string, string> = {
  // Classic
  modern: "bg-red-600",
  classic: "bg-neutral-900",
  minimal: "bg-neutral-400",
  swiss: "bg-red-700",
  monochrome: "bg-neutral-700",
  // Professional
  executive: "bg-[#0a1628]",
  corporate: "bg-[#1e3a5f]",
  academic: "bg-neutral-800",
  compact: "bg-neutral-600",
  "two-page": "bg-neutral-500",
  // Stylish
  elegant: "bg-[#c9a87c]",
  nordic: "bg-[#2d9b8a]",
  atlas: "bg-[#1a3a2a]",
  "sidebar-light": "bg-[#7c5cbf]",
  gradient: "bg-indigo-600",
  // Creative
  tech: "bg-emerald-600",
  creative: "bg-violet-600",
  bold: "bg-red-600",
  infographic: "bg-rose-600",
  portfolio: "bg-neutral-900",
  // Unique
  timeline: "bg-blue-600",
  newspaper: "bg-neutral-800",
  retro: "bg-amber-700",
  stealth: "bg-neutral-950",
  brutalist: "bg-black",
};

const SHOWCASE_TEMPLATES = [
  { id: "modern", name: "Modern", category: "Classic", desc: "Clean dual-column layout with accent bar" },
  { id: "executive", name: "Executive", category: "Professional", desc: "Corporate header tailored for senior leaders" },
  { id: "nordic", name: "Nordic", category: "Stylish", desc: "Minimalist Scandinavian typography and spacing" },
  { id: "tech", name: "Tech", category: "Creative", desc: "Developer-focused skills matrix and project showcase" },
  { id: "timeline", name: "Timeline", category: "Unique", desc: "Visual career progression journey" },
];

/**
 * Standalone Dialog Component defined outside the parent to prevent
 * unmounting and losing input focus on every keystroke.
 */
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

  // Reset input when dialog opens
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
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="border border-neutral-200 rounded-2xl shadow-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-neutral-900">
            Create New Resume
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Resume Title
            </Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer - FAANG"
              className="mt-1.5 border-neutral-300 focus:border-neutral-900 rounded-xl"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !title.trim()}
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl h-10 font-semibold text-xs sm:text-sm shadow-xs"
          >
            {isPending ? "Creating Resume..." : "Create & Start Editing"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState("all");

  const utils = trpc.useUtils();

  const { data: cvs, isLoading } = trpc.cv.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.cv.create.useMutation({
    onSuccess: result => {
      setIsCreateDialogOpen(false);
      if (result?.id) navigate(`/cv/${result.id}`);
    },
    onError: err => {
      toast.error(`Failed to create resume: ${err.message || String(err)}`);
    },
  });

  const duplicateMutation = trpc.cv.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Resume duplicated successfully!");
      utils.cv.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to duplicate resume");
    },
  });

  const deleteMutation = trpc.cv.delete.useMutation({
    onSuccess: () => {
      toast.success("Resume deleted successfully!");
      utils.cv.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete resume");
    },
  });

  const handleCreateSubmit = (title: string) => {
    createMutation.mutate({ title });
  };

  // Filtered CV list based on search query & template
  const filteredCVs = useMemo(() => {
    if (!cvs) return [];
    return cvs.filter(cv => {
      const matchesSearch =
        cv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cv.template.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTemplate =
        selectedTemplateFilter === "all" || cv.template === selectedTemplateFilter;
      return matchesSearch && matchesTemplate;
    });
  }, [cvs, searchQuery, selectedTemplateFilter]);

  // Dashboard Stats summary
  const stats = useMemo(() => {
    if (!cvs || cvs.length === 0) {
      return { total: 0, avgPct: 0, publicCount: 0 };
    }
    const total = cvs.length;
    const totalPct = cvs.reduce((acc, cv) => acc + completionInfo(cv as any).pct, 0);
    const avgPct = Math.round(totalPct / total);
    const publicCount = cvs.filter(c => c.isPublic).length;
    return { total, avgPct, publicCount };
  }, [cvs]);

  // Loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-neutral-50">
        <Spinner className="w-8 h-8 text-neutral-900" />
        <p className="text-xs text-neutral-500 font-medium">Preparing dashboard...</p>
      </div>
    );
  }

  // =========================================================================
  // UNAUTHENTICATED LANDING PAGE
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-6 sm:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-neutral-950 tracking-tight text-lg">
                ResumeCraft <span className="text-red-600">AI</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/login")}
              variant="outline"
              className="border-neutral-300 text-neutral-800 hover:bg-neutral-100 font-medium text-xs sm:text-sm"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-neutral-900 text-white hover:bg-neutral-800 font-semibold text-xs sm:text-sm shadow-sm"
            >
              Get Started Free
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 px-6 sm:px-12 py-12 lg:py-20 max-w-7xl mx-auto w-full">
          {/* Left: Headline & Pitch */}
          <div className="flex-1 space-y-6 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3.5 py-1 shadow-xs">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Next-Gen Career Intelligence
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 leading-[1.1] tracking-tight">
              Build your ATS-beating resume in{" "}
              <span className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                minutes.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
              25 professionally designed templates, intelligent ATS scoring benchmarked against live job vacancies, one-click PDF export, and instant multilingual translation.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "25 Curated ATS-Friendly Templates",
                "Instant ATS Compatibility Score",
                "AI Cover Letter & Interview Prep",
                "Verified Recruiter Public Sharing Link",
              ].map(feat => (
                <div key={feat} className="flex items-center gap-2.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200/80 rounded-xl p-2.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto bg-neutral-900 text-white hover:bg-neutral-800 text-sm font-bold px-8 py-6 rounded-xl shadow-md gap-2"
              >
                Start Crafting Free
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto border-neutral-300 text-neutral-700 hover:bg-white text-sm font-semibold px-6 py-6 rounded-xl"
              >
                View Live Demo
              </Button>
            </div>
          </div>

          {/* Right: Mockup Card */}
          <div className="flex-1 max-w-lg w-full">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl blur-lg opacity-25" />
              <div className="relative bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm">
                      JD
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm leading-tight">Johnathan Doe</h4>
                      <p className="text-xs text-neutral-500">Principal Software Engineer</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-xs">
                    95% ATS Match
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Work Experience
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-neutral-800">Lead Distributed Systems Engineer</span>
                        <span className="text-[10px] text-neutral-500">2022 - Present</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 line-clamp-2">
                        Architected high-throughput microservices handling 120M+ daily events with 99.99% uptime.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Featured Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {["TypeScript", "Go", "Kubernetes", "PostgreSQL", "Kafka", "AWS"].map(skill => (
                        <span key={skill} className="px-2.5 py-1 bg-white border border-neutral-200 text-neutral-700 rounded-md text-[11px] font-medium shadow-2xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Showcase Strip */}
        <div className="border-t border-neutral-200 bg-white py-12 px-6 sm:px-12">
          <div className="max-w-6xl mx-auto text-center space-y-4 mb-8">
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
              25 Handcrafted ATS-Friendly Styles
            </h3>
            <p className="text-sm text-neutral-500 max-w-xl mx-auto">
              From corporate executives to creative tech portfolios, select from battle-tested layouts engineered to pass applicant tracking systems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {SHOWCASE_TEMPLATES.map(t => (
              <div
                key={t.id}
                onClick={() => navigate("/login")}
                className="group border border-neutral-200 hover:border-neutral-900 rounded-2xl bg-neutral-50/50 p-4 transition-all duration-150 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`w-8 h-8 rounded-lg ${TEMPLATE_COLORS[t.id] ?? "bg-neutral-800"} mb-3 shadow-xs`} />
                <h4 className="font-bold text-sm text-neutral-900 group-hover:text-red-600 transition-colors">
                  {t.name}
                </h4>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} ResumeCraft AI. Engineered for career excellence.
        </footer>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                  ResumeCraft <span className="text-red-600">AI</span>
                </h1>
                <p className="text-[11px] text-neutral-500">
                  Welcome back, <span className="font-semibold text-neutral-700">{user?.name || "Professional"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Import Resume with AI */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportDialogOpen(true)}
                className="gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 rounded-lg text-xs font-semibold h-9"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Import Resume</span>
                <span className="sm:hidden">Import</span>
              </Button>

              {/* New CV Button Trigger */}
              <Button
                size="sm"
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-neutral-900 text-white hover:bg-neutral-800 gap-1.5 rounded-lg text-xs font-semibold h-9 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Resume</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-neutral-500 hover:text-neutral-900 text-xs h-9 px-2.5 rounded-lg"
              >
                Sign Out
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
              <span>Total Resumes</span>
            </div>
            <div className="text-2xl font-black text-neutral-900">{stats.total}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2.5 text-neutral-500 text-xs font-semibold mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Avg Profile Strength</span>
            </div>
            <div className="text-2xl font-black text-neutral-900">{stats.avgPct}%</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2.5 text-neutral-500 text-xs font-semibold mb-1">
              <Layout className="w-4 h-4 text-purple-600" />
              <span>Ready Templates</span>
            </div>
            <div className="text-2xl font-black text-neutral-900">25 Styles</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2.5 text-neutral-500 text-xs font-semibold mb-1">
              <ExternalLink className="w-4 h-4 text-amber-600" />
              <span>Public Resumes</span>
            </div>
            <div className="text-2xl font-black text-neutral-900">{stats.publicCount} Active</div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search resumes by title or template..."
              className="pl-9 h-9 text-xs sm:text-sm bg-white border-neutral-200 rounded-xl"
            />
          </div>

          {/* Quick count indicator */}
          <div className="text-xs text-neutral-500 font-medium">
            Showing <span className="font-bold text-neutral-800">{filteredCVs.length}</span> of {cvs?.length || 0} resumes
          </div>
        </div>

        {/* CV Grid or Empty State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner className="w-8 h-8 text-neutral-900" />
            <p className="text-xs text-neutral-500 font-medium">Loading your resumes...</p>
          </div>
        ) : filteredCVs && filteredCVs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCVs.map(cv => {
              const { filled, total, pct } = completionInfo(cv as any);
              const accentColor = TEMPLATE_COLORS[cv.template] ?? "bg-neutral-800";
              return (
                <Card
                  key={cv.id}
                  className="border border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-md transition-all duration-150 cursor-pointer group overflow-hidden rounded-2xl flex flex-col justify-between"
                  onClick={() => navigate(`/cv/${cv.id}`)}
                >
                  <div>
                    {/* Top Accent Strip */}
                    <div className={`h-1.5 w-full ${accentColor}`} />

                    <div className="p-5">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-base font-bold text-neutral-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-1">
                          {cv.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[11px] py-0.5 px-2 capitalize border-neutral-200 font-semibold text-neutral-700 bg-neutral-50"
                        >
                          {cv.template}
                        </Badge>
                      </div>

                      {/* Completion Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-neutral-500 flex items-center gap-1 text-[11px]">
                            <Layers className="w-3 h-3 text-neutral-400" />
                            {filled}/{total} sections completed
                          </span>
                          <span className="font-bold text-neutral-800 text-[11px]">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/60">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              pct === 100
                                ? "bg-emerald-500"
                                : pct > 50
                                ? "bg-neutral-900"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </div>

                      {/* Meta Information */}
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-100">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(cv.updatedAt).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {cv.isPublic && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Public ({cv.viewsCount || 0} views)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div
                    className="p-3 bg-neutral-50/60 border-t border-neutral-100 flex items-center gap-2"
                    onClick={e => e.stopPropagation()}
                  >
                    <Button
                      onClick={() => navigate(`/cv/${cv.id}`)}
                      size="sm"
                      className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold h-8 rounded-lg"
                    >
                      <FileText className="w-3 h-3 mr-1.5" />
                      Open Studio
                    </Button>

                    <Button
                      onClick={() => duplicateMutation.mutate({ cvId: cv.id })}
                      disabled={duplicateMutation.isPending}
                      variant="outline"
                      size="sm"
                      className="border-neutral-200 text-neutral-700 hover:bg-neutral-100 h-8 px-2.5 rounded-lg"
                      title="Duplicate Resume"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border border-neutral-200 rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base font-bold text-neutral-900">
                            Delete Resume
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs text-neutral-600">
                            Are you sure you want to permanently delete "{cv.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-2 pt-2">
                          <AlertDialogCancel className="border-neutral-200 text-xs font-semibold">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate({ cvId: cv.id })}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                          >
                            {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              );
            })}

            {/* Quick Add Card */}
            <Card
              onClick={() => setIsCreateDialogOpen(true)}
              className="border-2 border-dashed border-neutral-300 bg-white hover:border-neutral-900 hover:bg-neutral-50/50 transition-all duration-150 cursor-pointer flex flex-col items-center justify-center p-8 min-h-[220px] rounded-2xl group text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white text-neutral-500 flex items-center justify-center mb-3 transition-colors shadow-2xs">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-neutral-800 group-hover:text-neutral-900">
                Create New Resume
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Start from an empty template or scratch
              </p>
            </Card>
          </div>
        ) : (
          /* Empty Search / Empty List State */
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              {searchQuery ? "No matching resumes found" : "No resumes crafted yet"}
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              {searchQuery
                ? `No resumes found matching "${searchQuery}". Try clearing search.`
                : "Create your first ATS-ready resume and take the next step in your career."}
            </p>
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="text-xs rounded-xl"
              >
                Clear Search
              </Button>
            ) : (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-neutral-900 text-white hover:bg-neutral-800 gap-2 rounded-xl text-xs font-semibold h-10 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Your First Resume
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Standalone Create Resume Dialog */}
      <CreateResumeModal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isPending={createMutation.isPending}
      />

      {/* AI Resume Importer Modal */}
      <ImportResumeModal
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </div>
  );
}
