import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { exportCVToPDF } from "@/lib/pdfExport";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Download, Globe, Sparkles } from "lucide-react";
import CVPreview from "@/components/CVEditor/CVPreview";
import type { FullCVData, TemplateId } from "@/types/cv";
import { toast } from "sonner";

export default function PublicCV() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const slug = params.slug || "";
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = trpc.cv.getPublic.useQuery(
    { identifier: slug },
    { enabled: Boolean(slug), retry: 1 }
  );

  const handleDownload = async () => {
    if (!data) return;
    try {
      setIsExporting(true);
      await exportCVToPDF("public-cv-content", `${data.cv.title || "resume"}.pdf`);
      toast.info("Select 'Save as PDF' in the print dialog to download.");
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <Spinner className="w-8 h-8 text-black" />
        <p className="text-xs text-gray-500 font-medium">Loading CV...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900">CV Not Available</h2>
          <p className="text-sm text-gray-600">
            This CV is either private, has been removed, or the link is incorrect.
          </p>
          <Button onClick={() => navigate("/")} variant="outline" className="text-xs">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const cvData = data as unknown as FullCVData;
  const template = (cvData.cv.template || "modern") as TemplateId;

  return (
    <div className="min-h-screen bg-neutral-100/80">
      {/* Top Floating Recruiter Action Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                {cvData.personalInfo?.fullName || cvData.cv.title}
              </h1>
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-600" /> Public Resume Profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownload}
              disabled={isExporting}
              size="sm"
              className="gap-2 bg-black text-white hover:bg-gray-800 shadow-sm"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Preparing..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main CV Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div id="public-cv-content" className="shadow-lg rounded-lg overflow-hidden border border-gray-200 bg-white">
          <CVPreview template={template} cvData={cvData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        Created with ResumeCraft AI • Candidate Verified Profile
      </footer>
    </div>
  );
}

