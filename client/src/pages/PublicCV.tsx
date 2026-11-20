import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { exportCVToPDF } from "@/lib/pdfExport";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Download, Globe, Sparkles, Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import CVPreview from "@/components/CVEditor/CVPreview";
import type { FullCVData, TemplateId, PaperSize } from "@/types/cv";
import { toast } from "sonner";

export default function PublicCV() {
  const { t } = useI18n();
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const slug = params.slug || "";
  const [isExporting, setIsExporting] = useState(false);
  const [paperSize, setPaperSize] = useState<PaperSize>("a4");

  const { data, isLoading, error } = trpc.cv.getPublic.useQuery(
    { identifier: slug },
    {
      enabled: Boolean(slug),
      retry: 1,
    }
  );

  // Sync paperSize when CV loads
  useEffect(() => {
    if (data?.cv && (data.cv as any).paperSize) {
      setPaperSize((data.cv as any).paperSize as PaperSize);
    }
  }, [data]);

  const handleDownload = async () => {
    if (!data) return;
    try {
      setIsExporting(true);
      await exportCVToPDF(
        "public-cv-content",
        `${data.cv.title || "resume"}.pdf`,
        paperSize
      );
      toast.info(t("public_cv.print_dialog_info", "Pilih 'Save as PDF' pada dialog cetak untuk mengunduh PDF."));
    } catch (err: any) {
      toast.error(`${t("public_cv.export_failed", "Export failed:")} ${err.message || String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 gap-3">
        <Spinner className="w-8 h-8 text-neutral-900" />
        <p className="text-xs text-neutral-500 font-medium">{t("public_cv.loading", "Memuat Resume Kandidat...")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto font-bold text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-neutral-900">{t("public_cv.not_found_title", "Resume Tidak Ditemukan atau Privat")}</h2>
          <p className="text-xs text-neutral-600">
            {t("public_cv.not_found_desc", "Resume ini mungkin bersifat privat, telah kedaluwarsa, atau tautan yang dibagikan tidak tepat.")}
          </p>
          <Button onClick={() => navigate("/")} variant="outline" className="text-xs rounded-xl">
            {t("public_cv.back_home", "Ke Beranda ResumeCraft AI")}
          </Button>
        </div>
      </div>
    );
  }

  const cvData = data as unknown as FullCVData;
  const template = (cvData.cv.template || "modern") as TemplateId;

  return (
    <div className="min-h-screen bg-neutral-100/90 flex flex-col">
      {/* Recruiter Floating Action Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight truncate">
                  {cvData.personalInfo?.fullName || cvData.cv.title}
                </h1>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-300 text-emerald-700 bg-emerald-50 hidden sm:inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {t("public_cv.verified_badge", "Profil Terverifikasi")}
                </Badge>
              </div>
              <p className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <Globe className="w-3 h-3" /> {t("public_cv.public_resume_label", "Public Candidate Resume")}
                </span>
                {cvData.personalInfo?.email && (
                  <span className="hidden md:inline text-neutral-400">
                    • {cvData.personalInfo.email}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleDownload}
              disabled={isExporting}
              size="sm"
              className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? t("actions.downloading", "Mengunduh...") : t("public_cv.download_pdf", "Unduh PDF")}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main CV Document View */}
      <main className="max-w-5xl mx-auto py-6 sm:py-10 px-3 sm:px-6 flex-1 w-full">
        <div id="public-cv-content">
          <CVPreview
            template={template}
            cvData={cvData}
            paperSize={paperSize}
            onPaperSizeChange={setPaperSize}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400 bg-white">
        Crafted with <strong className="text-neutral-700">ResumeCraft AI</strong> • {t("public_cv.candidate_verified", "Candidate Verified Profile")}
      </footer>
    </div>
  );
}
