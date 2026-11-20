import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  FileSearch,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface JobMatcherModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

export default function JobMatcherModal({
  cvId,
  isOpen,
  onClose,
  defaultRole = "",
}: JobMatcherModalProps) {
  const { t } = useI18n();
  const [jobDescription, setJobDescription] = useState("");
  const [copiedSummary, setCopiedSummary] = useState(false);
  const utils = trpc.useUtils();

  const applySummaryMutation = trpc.cv.personalInfo.update.useMutation({
    onSuccess: () => {
      utils.cv.loadFull.invalidate({ cvId });
      toast.success(t("job_matcher.summary_applied", "Ringkasan profil berhasil diperbarui langsung ke CV Anda!"));
    },
    onError: err => {
      toast.error(err.message || t("job_matcher.summary_apply_failed", "Gagal memperbarui ringkasan CV"));
    },
  });

  const addSkillMutation = trpc.cv.skill.create.useMutation({
    onSuccess: (_: any, vars: any) => {
      utils.cv.loadFull.invalidate({ cvId });
      toast.success(t("job_matcher.skill_added", `Keahlian "${vars.skillName}" berhasil disisipkan ke CV!`));
    },
    onError: (err: any) => {
      toast.error(err.message || t("job_matcher.skill_add_failed", "Gagal menyisipkan keahlian"));
    },
  });

  const handleAddMissingKeyword = (kw: string) => {
    addSkillMutation.mutate({
      cvId,
      skillName: kw,
      category: "Technical & Core Skills",
      proficiency: "intermediate",
    });
  };

  const matchMutation = trpc.cvAI.matchJobDescription.useMutation({
    onSuccess: () => {
      toast.success(t("job_matcher.analysis_success", "Analisis kecocokan lowongan berhasil!"));
    },
    onError: err => {
      toast.error(err.message || t("job_matcher.analysis_failed", "Gagal menganalisis lowongan kerja"));
    },
  });

  const handleAnalyze = () => {
    if (jobDescription.trim().length < 20) {
      toast.error(t("job_matcher.min_chars_error", "Mohon tempelkan deskripsi lowongan kerja minimal 20 karakter."));
      return;
    }
    matchMutation.mutate({
      cvId,
      jobDescription: jobDescription.trim(),
    });
  };

  const result = matchMutation.data;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-neutral-200">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-neutral-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
                {t("job_matcher.modal_title", "ATS Job Description Matcher & Keyword Scanner")}
              </DialogTitle>
              <p className="text-xs text-neutral-500">
                {t("job_matcher.modal_desc", "Pindai kecocokan profil CV Anda dengan kualifikasi lowongan kerja target")}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-neutral-50/60">
          {/* Input Job Description Card */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-blue-600" />
                {t("job_matcher.input_label", "Tempel Deskripsi Lowongan Kerja (Job Vacancy / Job Desc)")}
              </label>
              {defaultRole && (
                <span className="text-[11px] text-neutral-500">
                  {t("job_matcher.target_role", "Target Posisi:")} <strong>{defaultRole}</strong>
                </span>
              )}
            </div>

            <Textarea
              placeholder={t("job_matcher.placeholder", "Contoh: We are looking for a Senior Frontend Engineer with 3+ years experience in React, TypeScript, Tailwind CSS, REST APIs, state management, and CI/CD pipelines...")}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={4}
              className="text-xs resize-y rounded-lg font-mono leading-relaxed"
            />

            <div className="flex justify-end">
              <Button
                onClick={handleAnalyze}
                disabled={matchMutation.isPending || jobDescription.trim().length < 20}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg h-8 px-4"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {matchMutation.isPending
                    ? t("job_matcher.analyzing", "Menganalisis dengan AI...")
                    : t("job_matcher.scan_btn", "Pindai Kecocokan ATS")}
                </span>
              </Button>
            </div>
          </div>

          {/* Analysis Results */}
          {result && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              {/* Score Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${getScoreColor(
                  result.matchScore || 0
                )}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black">{result.matchScore}%</span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {t("job_matcher.match_rate", "Tingkat Kecocokan ATS")}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">{result.verdict}</p>
                </div>
              </div>

              {/* Matched vs Missing Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched Keywords */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {t("job_matcher.matched_keywords", "Kata Kunci Cocok")} ({result.matchedKeywords?.length || 0})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords?.map((kw: string, i: number) => (
                      <Badge
                        key={i}
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-medium"
                      >
                        ✓ {kw}
                      </Badge>
                    ))}
                    {(!result.matchedKeywords || result.matchedKeywords.length === 0) && (
                      <p className="text-xs text-neutral-400">
                        {t("job_matcher.no_matched", "Tidak ada kata kunci yang cocok secara spesifik.")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>
                        {t("job_matcher.missing_keywords", "Kata Kunci Hilang")} ({result.missingKeywords?.length || 0})
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-normal">
                      {t("job_matcher.click_insert_hint", "💡 Klik kata kunci untuk sisipkan ke CV")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords?.map((kw: string, i: number) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddMissingKeyword(kw)}
                        disabled={addSkillMutation.isPending}
                        className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 hover:border-rose-300 border border-rose-200 font-medium inline-flex items-center gap-1 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                        title={t("job_matcher.insert_tooltip", "Klik untuk langsung sisipkan ke daftar keahlian CV")}
                      >
                        <Plus className="w-3 h-3 text-rose-600" />
                        <span>{kw}</span>
                      </button>
                    ))}
                    {(!result.missingKeywords || result.missingKeywords.length === 0) && (
                      <p className="text-xs text-emerald-600 font-medium">
                        {t("job_matcher.all_covered", "Luar biasa! Semua kata kunci penting telah tercakup.")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Strengths & ATS Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.keyStrengths && result.keyStrengths.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-2">
                    <p className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      {t("job_matcher.strengths", "Kekuatan Profil Anda")}
                    </p>
                    <ul className="space-y-1.5 text-xs text-neutral-600">
                      {result.keyStrengths.map((str: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.atsGaps && result.atsGaps.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-2">
                    <p className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      {t("job_matcher.gaps", "Kesenjangan / Hal yang Perlu Diperhatikan")}
                    </p>
                    <ul className="space-y-1.5 text-xs text-neutral-600">
                      {result.atsGaps.map((gap: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actionable Recommendations */}
              {result.actionableRecommendations && result.actionableRecommendations.length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-2.5">
                  <p className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    {t("job_matcher.recommendations", "Langkah Konkret Perbaikan CV untuk Lowongan Ini")}
                  </p>
                  <div className="space-y-2">
                    {result.actionableRecommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 p-2 bg-amber-50/50 rounded-lg border border-amber-200/40 text-xs text-neutral-700">
                        <span className="w-5 h-5 rounded-full bg-amber-200/70 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailored Summary Suggestion */}
              {result.tailoredSummarySuggestion && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/70 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      {t("job_matcher.tailored_summary_title", "Usulan Ringkasan Profil (About Me) yang Disesuaikan")}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(result.tailoredSummarySuggestion);
                          setCopiedSummary(true);
                          toast.success(t("job_matcher.summary_copied", "Ringkasan profil berhasil disalin!"));
                          setTimeout(() => setCopiedSummary(false), 2000);
                        }}
                        className="h-6 text-[10px] gap-1 rounded-md bg-white border-blue-300 text-blue-700"
                      >
                        {copiedSummary ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSummary ? t("actions.copied", "Tersalin") : t("actions.copy", "Salin")}</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          applySummaryMutation.mutate({
                            cvId,
                            professionalSummary: result.tailoredSummarySuggestion,
                          });
                        }}
                        disabled={applySummaryMutation.isPending}
                        className="h-6 text-[10px] gap-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {applySummaryMutation.isPending
                            ? t("job_matcher.applying", "Menerapkan...")
                            : t("job_matcher.apply_btn", "Terapkan ke CV")}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-blue-900/90 leading-relaxed italic bg-white/70 p-3 rounded-lg border border-blue-200/50">
                    "{result.tailoredSummarySuggestion}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
