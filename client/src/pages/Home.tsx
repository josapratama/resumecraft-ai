import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Copy, Trash2, Plus, Clock, FileText, Layers } from "lucide-react";
import { toast } from "sonner";
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
  classic: "bg-black",
  minimal: "bg-gray-400",
  swiss: "bg-red-700",
  monochrome: "bg-gray-700",
  // Professional
  executive: "bg-[#0a1628]",
  corporate: "bg-[#1e3a5f]",
  academic: "bg-gray-800",
  compact: "bg-gray-600",
  "two-page": "bg-gray-500",
  // Stylish
  elegant: "bg-[#c9a87c]",
  nordic: "bg-[#2d9b8a]",
  atlas: "bg-[#1a3a2a]",
  "sidebar-light": "bg-[#7c5cbf]",
  gradient: "bg-indigo-600",
  // Creative
  tech: "bg-green-700",
  creative: "bg-violet-600",
  bold: "bg-red-600",
  infographic: "bg-rose-600",
  portfolio: "bg-gray-900",
  // Unique
  timeline: "bg-blue-600",
  newspaper: "bg-gray-800",
  retro: "bg-amber-700",
  stealth: "bg-gray-950",
  brutalist: "bg-black",
};

export default function Home() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCVTitle, setNewCVTitle] = useState("");

  // Get utils at component scope — not inside callbacks
  const utils = trpc.useUtils();

  const { data: cvs, isLoading } = trpc.cv.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.cv.create.useMutation({
    onSuccess: result => {
      setNewCVTitle("");
      setIsCreateDialogOpen(false);
      if (result?.id) navigate(`/cv/${result.id}`);
    },
  });

  const duplicateMutation = trpc.cv.duplicate.useMutation({
    onSuccess: () => {
      toast.success("CV duplicated successfully!");
      utils.cv.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to duplicate CV");
    },
  });

  const deleteMutation = trpc.cv.delete.useMutation({
    onSuccess: () => {
      toast.success("CV deleted successfully!");
      utils.cv.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete CV");
    },
  });

  const handleCreateCV = () => {
    if (newCVTitle.trim()) {
      createMutation.mutate({ title: newCVTitle });
    }
  };

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Nav */}
        <nav className="border-b border-black px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-600" />
            <span className="font-bold text-black tracking-tight">
              ResumeAI
            </span>
          </div>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white"
          >
            Sign In
          </Button>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 px-8 py-16 max-w-6xl mx-auto w-full">
          {/* Left — copy */}
          <div className="flex-1 space-y-8 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-red-600 rounded-full" />
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                AI-Powered
              </span>
            </div>
            <h1 className="text-5xl font-bold text-black leading-tight">
              Build your perfect
              <br />
              <span className="text-red-600">CV in minutes</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Professional templates, AI writing assistance, and instant PDF
              export. Everything you need to land your next role.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                "25 professionally designed templates",
                "AI assistant to improve every section",
                "6 structured sections with drag-to-reorder",
                "Export to PDF with one click",
              ].map(feature => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-black text-white hover:bg-gray-800 text-base px-8 py-6"
            >
              Get Started — it's free
            </Button>
          </div>

          {/* Right — CV mockup preview */}
          <div className="flex-1 max-w-md w-full">
            <div className="relative">
              {/* Shadow card behind */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 bg-red-600 rounded" />
              {/* Main mockup */}
              <div className="relative bg-white border-2 border-black rounded p-6 shadow-xl">
                {/* Mockup header */}
                <div className="flex items-start justify-between mb-5 pb-4 border-b-2 border-black">
                  <div>
                    <div className="h-4 w-32 bg-black rounded mb-2" />
                    <div className="h-2.5 w-24 bg-gray-300 rounded mb-1" />
                    <div className="h-2 w-40 bg-gray-200 rounded" />
                  </div>
                  <div className="w-10 h-10 bg-red-600 flex-shrink-0" />
                </div>
                {/* Summary */}
                <div className="mb-4">
                  <div className="h-2 w-28 bg-gray-800 rounded mb-2" />
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-gray-200 rounded" />
                    <div className="h-2 w-5/6 bg-gray-200 rounded" />
                    <div className="h-2 w-4/6 bg-gray-200 rounded" />
                  </div>
                </div>
                {/* Experience */}
                <div className="mb-4">
                  <div className="h-2 w-24 bg-gray-800 rounded mb-2" />
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="border-l-2 border-red-600 pl-3">
                        <div className="flex justify-between mb-1">
                          <div className="h-2.5 w-28 bg-gray-700 rounded" />
                          <div className="h-2 w-16 bg-gray-300 rounded" />
                        </div>
                        <div className="h-2 w-20 bg-gray-400 rounded mb-1" />
                        <div className="h-2 w-full bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Skills */}
                <div>
                  <div className="h-2 w-14 bg-gray-800 rounded mb-2" />
                  <div className="flex flex-wrap gap-1.5">
                    {[60, 80, 48, 72, 56, 88, 44].map(w => (
                      <div
                        key={w}
                        className="h-5 bg-gray-100 border border-gray-300 rounded-full"
                        style={{ width: w }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template strip */}
        <div className="border-t border-black bg-gray-50 py-10 px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
            Choose from 3 templates
          </p>
          <div className="flex justify-center gap-6 max-w-3xl mx-auto">
            {[
              {
                name: "Modern",
                color: "bg-red-600",
                desc: "Two-column sidebar layout",
              },
              {
                name: "Classic",
                color: "bg-black",
                desc: "Traditional formal style",
              },
              {
                name: "Minimal",
                color: "bg-gray-400",
                desc: "Clean, distraction-free",
              },
            ].map(t => (
              <div
                key={t.name}
                className="flex-1 border-2 border-black bg-white p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className={`w-8 h-8 ${t.color} mx-auto mb-2`} />
                <p className="font-bold text-sm text-black">{t.name}</p>
                <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const CreateCVDialog = () => (
    <DialogContent className="border border-black">
      <DialogHeader>
        <DialogTitle>Create New CV</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label className="text-black font-semibold">CV Title</Label>
          <Input
            value={newCVTitle}
            onChange={e => setNewCVTitle(e.target.value)}
            placeholder="e.g., Software Engineer CV"
            className="mt-2 border-black"
            onKeyDown={e => {
              if (e.key === "Enter") handleCreateCV();
            }}
          />
        </div>
        <Button
          onClick={handleCreateCV}
          disabled={createMutation.isPending || !newCVTitle.trim()}
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          {createMutation.isPending ? "Creating..." : "Create CV"}
        </Button>
      </div>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-black">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-red-600" />
              <div>
                <h1 className="text-xl font-bold text-black leading-none">
                  ResumeAI
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-black text-white hover:bg-gray-800 gap-2">
                    <Plus className="w-4 h-4" />
                    New CV
                  </Button>
                </DialogTrigger>
                <CreateCVDialog />
              </Dialog>
              <Button
                variant="outline"
                onClick={logout}
                className="border-black text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Page title row */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-black">My CVs</h2>
            {cvs && (
              <p className="text-sm text-gray-500 mt-1">
                {cvs.length} {cvs.length === 1 ? "document" : "documents"}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : cvs && cvs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cvs.map(cv => {
              const { filled, total, pct } = completionInfo(cv as any);
              const accentColor = TEMPLATE_COLORS[cv.template] ?? "bg-gray-400";
              return (
                <Card
                  key={cv.id}
                  className="border-2 border-black bg-white hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden"
                  onClick={() => navigate(`/cv/${cv.id}`)}
                >
                  {/* Top accent stripe */}
                  <div className={`h-1 w-full ${accentColor}`} />

                  <div className="p-5">
                    {/* Title row */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-bold text-black leading-tight flex-1 pr-2 group-hover:text-red-600 transition-colors">
                        {cv.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border-black text-xs capitalize flex-shrink-0"
                      >
                        {cv.template}
                      </Badge>
                    </div>

                    {/* Completion bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {filled}/{total} sections filled
                        </span>
                        <span className="text-xs font-semibold text-black">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                        <div
                          className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : pct > 50 ? "bg-black" : "bg-red-600"}`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                      <Clock className="w-3 h-3" />
                      Updated{" "}
                      {new Date(cv.updatedAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                    {/* Actions */}
                    <div
                      className="flex gap-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <Button
                        onClick={() => navigate(`/cv/${cv.id}`)}
                        className="flex-1 bg-black text-white hover:bg-gray-800 text-sm h-8"
                      >
                        <FileText className="w-3 h-3 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() =>
                          duplicateMutation.mutate({ cvId: cv.id })
                        }
                        disabled={duplicateMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="border-black h-8"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border border-black">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete CV</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{cv.title}"? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex gap-2">
                            <AlertDialogCancel className="border-black">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteMutation.mutate({ cvId: cv.id })
                              }
                              disabled={deleteMutation.isPending}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteMutation.isPending
                                ? "Deleting..."
                                : "Delete"}
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Create new card */}
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Card className="border-2 border-dashed border-gray-300 bg-white hover:border-black hover:shadow-md transition-all cursor-pointer flex items-center justify-center min-h-[180px] group">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 group-hover:border-black flex items-center justify-center mx-auto mb-2 transition-colors">
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-400 group-hover:text-black transition-colors">
                      New CV
                    </p>
                  </div>
                </Card>
              </DialogTrigger>
              <CreateCVDialog />
            </Dialog>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-black mb-1">No CVs yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Create your first CV and start crafting your professional story.
            </p>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-gray-800 gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First CV
                </Button>
              </DialogTrigger>
              <CreateCVDialog />
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
