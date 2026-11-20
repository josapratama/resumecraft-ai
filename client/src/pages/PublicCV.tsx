import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { exportCVToPDF } from "@/lib/pdfExport";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Download,
  Globe,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  FolderKanban,
  FileText,
  LayoutGrid,
  MessageCircle,
  Calendar,
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"paper" | "portfolio">("paper");

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
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto font-bold text-2xl shadow-xs">
            !
          </div>
          <h2 className="text-lg font-bold text-neutral-900">{t("public_cv.not_found_title", "Resume Tidak Ditemukan atau Privat")}</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {t("public_cv.not_found_desc", "Resume ini mungkin bersifat privat, telah kedaluwarsa, atau tautan yang dibagikan tidak tepat.")}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate("/")} variant="outline" className="text-xs rounded-xl">
              {t("public_cv.back_home", "Ke Beranda ResumeCraft AI")}
            </Button>
            <Button onClick={() => navigate("/login")} className="text-xs rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">
              {t("public_cv.create_own", "Buat CV Anda Sendiri Gratis")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cvData = data as unknown as FullCVData;
  const template = (cvData.cv.template || "modern") as TemplateId;
  const p = cvData.personalInfo;
  const fullName = p?.fullName || cvData.cv.title || "Kandidat Profesional";
  const targetRole = cvData.cv.targetRole || "";

  // Skill categorization
  const skillCategories = new Map<string, string[]>();
  cvData.skills.forEach(s => {
    const cat = s.category || "General";
    if (!skillCategories.has(cat)) skillCategories.set(cat, []);
    skillCategories.get(cat)!.push(s.skillName);
  });

  return (
    <div className="min-h-screen bg-neutral-100/80 flex flex-col">
      {/* Top Floating Recruiter Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-3 sm:px-8 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-neutral-900 to-neutral-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight truncate">
                  {fullName}
                </h1>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-300 text-emerald-700 bg-emerald-50 hidden sm:inline-flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" />
                  {t("public_cv.verified_badge", "Terverifikasi")}
                </Badge>
              </div>
              <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 truncate">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <Globe className="w-3 h-3" /> {t("public_cv.public_resume_label", "Public Resume")}
                </span>
                {targetRole && <span className="text-neutral-400 hidden md:inline">• {targetRole}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle Pill: Paper View vs Web Portfolio */}
            <div className="inline-flex rounded-full bg-neutral-100 p-0.5 border border-neutral-200">
              <button
                type="button"
                onClick={() => setViewMode("paper")}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === "paper"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
                title="Tampilan Lembaran Kertas Dokumen"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("public_cv.view_paper", "Dokumen CV")}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("portfolio")}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === "portfolio"
                    ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
                title="Tampilan Web Portofolio Interaktif"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("public_cv.view_portfolio", "Web Portofolio")}</span>
              </button>
            </div>

            <Button
              onClick={handleDownload}
              disabled={isExporting}
              size="sm"
              className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold h-8.5 px-3 sm:px-4 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? t("actions.downloading", "Menyiapkan...") : t("public_cv.download_pdf", "Unduh PDF")}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto py-5 sm:py-8 px-3 sm:px-6 flex-1 w-full">
        {/* Paper View Container - Keep mounted so exportCVToPDF always finds #public-cv-content */}
        <div
          id="public-cv-content"
          className={viewMode === "paper" ? "animate-in fade-in-50 duration-200" : "hidden"}
        >
          <CVPreview
            template={template}
            cvData={cvData}
            paperSize={paperSize}
            onPaperSizeChange={setPaperSize}
          />
        </div>

        {viewMode === "portfolio" && (
          /* Modern Interactive Web Portfolio Mode */
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Hero Profile Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
                {p?.photoUrl ? (
                  <img
                    src={p.photoUrl}
                    alt={fullName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-neutral-100 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-950 text-white flex items-center justify-center text-3xl font-bold shadow-sm shrink-0">
                    {fullName.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                      {fullName}
                    </h2>
                    <Badge variant="outline" className="text-xs py-0.5 px-2 rounded-full border-blue-200 bg-blue-50 text-blue-700 font-semibold">
                      {targetRole || t("public_cv.role_placeholder", "Profesional")}
                    </Badge>
                  </div>

                  {p?.professionalSummary && (
                    <p className="text-xs sm:text-sm text-neutral-600 mt-2.5 leading-relaxed max-w-3xl">
                      "{p.professionalSummary}"
                    </p>
                  )}

                  {/* Contact Chips */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-4">
                    {p?.email && (
                      <a
                        href={`mailto:${p.email}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{p.email}</span>
                      </a>
                    )}
                    {p?.phone && (
                      <a
                        href={`tel:${p.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{p.phone}</span>
                      </a>
                    )}
                    {p?.phone && (
                      <a
                        href={`https://wa.me/${p.phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(fullName)},%20saya%20melihat%20profil%20Anda%20di%20ResumeCraft`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium text-emerald-800 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {p?.location && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{p.location}</span>
                      </span>
                    )}
                    {cvData.cv.portfolioUrl && (
                      <a
                        href={cvData.cv.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-medium text-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span>Portfolio Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Work Experiences */}
            {cvData.workExperiences.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                    {t("public_cv.sec_experience", "Pengalaman Kerja")}
                  </h3>
                </div>
                <div className="space-y-4">
                  {cvData.workExperiences.map(w => (
                    <div key={w.id} className="relative pl-4 border-l-2 border-neutral-200 pb-2">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-600" />
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-sm font-bold text-neutral-900">{w.jobTitle}</h4>
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {w.startDate} - {!w.endDate || w.endDate === "Now" || w.endDate === "Present" ? "Saat Ini" : w.endDate}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">{w.company}</p>
                      {w.description && (
                        <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed whitespace-pre-line">
                          {w.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Technologies */}
            {cvData.skills.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                    {t("public_cv.sec_skills", "Keahlian & Kompetensi")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from(skillCategories.entries()).map(([cat, skills]) => (
                    <div key={cat} className="p-3.5 bg-neutral-50/70 rounded-2xl border border-neutral-200/80">
                      <h5 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                        {cat}
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map(s => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Showcase */}
            {cvData.projects.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <FolderKanban className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                    {t("public_cv.sec_projects", "Proyek Unggulan")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cvData.projects.map(pr => (
                    <div key={pr.id} className="p-4 rounded-2xl border border-neutral-200 hover:border-neutral-300 transition-all bg-neutral-50/40 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-neutral-900">{pr.projectName}</h4>
                        {pr.link && (
                          <a
                            href={pr.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>Live</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {pr.description && (
                        <p className="text-xs text-neutral-600 leading-relaxed">{pr.description}</p>
                      )}
                      {pr.technologies && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {pr.technologies.split(",").map(t => (
                            <span key={t} className="px-1.5 py-0.5 bg-neutral-100 text-[10px] font-medium text-neutral-600 rounded">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education & Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cvData.educations.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-2.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      {t("public_cv.sec_education", "Pendidikan")}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {cvData.educations.map(e => (
                      <div key={e.id} className="text-xs space-y-0.5">
                        <p className="font-bold text-neutral-900">{e.degree} {e.field && `- ${e.field}`}</p>
                        <p className="text-neutral-600 font-medium">{e.school}</p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                          {e.graduationDate && <span>Lulus {e.graduationDate}</span>}
                          {e.description && <span>• {e.description}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cvData.certifications.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-neutral-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-2.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      {t("public_cv.sec_certifications", "Sertifikasi & Lisensi")}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {cvData.certifications.map(c => (
                      <div key={c.id} className="text-xs space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-neutral-900">{c.certificationName}</p>
                          {c.link && (
                            <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-[11px]">
                              Kredensial ↗
                            </a>
                          )}
                        </div>
                        <p className="text-neutral-600">{c.issuer}</p>
                        {c.issueDate && <p className="text-[11px] text-neutral-400">{c.issueDate}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Recruiter Verified Footer */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500 bg-white">
        <div className="max-w-md mx-auto px-4 space-y-1.5">
          <p>
            Crafted with <strong className="text-neutral-800">ResumeCraft AI</strong> • {t("public_cv.candidate_verified", "Candidate Verified Profile")}
          </p>
          <a
            href="https://resumecraft-ai.josapratama.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-blue-600 hover:underline font-medium inline-block"
          >
            {t("public_cv.create_own_cta", "Ingin CV & Web Portofolio seperti ini? Buat sekarang gratis →")}
          </a>
        </div>
      </footer>
    </div>
  );
}
