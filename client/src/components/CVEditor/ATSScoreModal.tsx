import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Check,
  Plus,
  Camera,
  UploadCloud,
  FileImage,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

interface ATSScoreModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

interface ATSResult {
  overallScore: number;
  summaryRating: string;
  breakdown: {
    hardSkills: number;
    experienceMatch: number;
    structureAndFormat: number;
    keywordDensity: number;
  };
  matchingKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  criticalGaps: string[];
  recommendations: string[];
}

export default function ATSScoreModal({
  cvId,
  isOpen,
  onClose,
  defaultRole = "",
}: ATSScoreModalProps) {
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [isExtractingImage, setIsExtractingImage] = useState(false);
  const utils = trpc.useUtils();

  const addSkillMutation = trpc.cv.skill.create.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Keahlian "${vars.skillName}" berhasil ditambahkan ke CV!`);
      utils.cv.loadFull.invalidate({ cvId });
      if (result) {
        setResult(prev =>
          prev
            ? {
                ...prev,
                missingKeywords: prev.missingKeywords.filter(k => k !== vars.skillName),
                matchingKeywords: [...(prev.matchingKeywords || []), vars.skillName],
              }
            : null
        );
      }
    },
    onError: (err: any) => {
      toast.error(`Gagal menambahkan keahlian: ${err.message}`);
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

  const extractMutation = trpc.cvAI.extractJobVacancyFromImage.useMutation({
    onSuccess: (data: any) => {
      setIsExtractingImage(false);
      if (data.jobTitle) setTargetRole(data.jobTitle);
      if (data.jobDescription) setJobDescription(data.jobDescription);
      toast.success(
        `Poster berhasil di-scan! ${data.companyName ? `(${data.companyName})` : ""}`
      );
    },
    onError: (err: any) => {
      setIsExtractingImage(false);
      toast.error(`Gagal memindai poster: ${err.message}`);
    },
  });

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Pilih file gambar poster (JPG, PNG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setIsExtractingImage(true);
      extractMutation.mutate({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  const analyzeMutation = trpc.cvAI.analyzeATS.useMutation({
    onSuccess: data => {
      setResult(data as unknown as ATSResult);
      toast.success("ATS Compatibility analysis complete!");
    },
    onError: err => {
      toast.error(`Analysis failed: ${err.message}`);
    },
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      toast.error("Please paste a meaningful Job Description (minimum 20 characters).");
      return;
    }
    analyzeMutation.mutate({
      cvId,
      jobDescription: jobDescription.trim(),
      targetRole: targetRole.trim() || undefined,
    });
  };

  const handlePrintReport = () => {
    if (!result) return;
    const printContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Laporan Evaluasi ATS - ${targetRole || "CV"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 30px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
    h1 { font-size: 20px; color: #0f172a; margin-bottom: 4px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 14px; background: #e0e7ff; color: #3730a3; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; }
    .card h4 { margin: 0 0 6px 0; font-size: 12px; color: #64748b; text-transform: uppercase; }
    .card .val { font-size: 18px; font-weight: bold; color: #0f172a; }
    .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin: 20px 0 10px; color: #334155; }
    .tag { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; margin: 2px; }
    .tag-green { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .tag-red { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    ul { padding-left: 20px; font-size: 12px; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <h1>Laporan Analisis & Evaluasi ATS ResumeCraft</h1>
  <p style="font-size: 12px; color: #64748b; margin-top: 0;">Posisi Target: <strong>${targetRole || "Umum"}</strong> · Tanggal Evaluasi: ${new Date().toLocaleDateString("id-ID")}</p>
  <div class="badge">Skor Keseluruhan: ${result.overallScore} / 100 (${result.summaryRating})</div>

  <div class="grid">
    <div class="card">
      <h4>Kecocokan Hard Skills</h4>
      <div class="val">${result.breakdown?.hardSkills || 0}%</div>
    </div>
    <div class="card">
      <h4>Relevansi Pengalaman</h4>
      <div class="val">${result.breakdown?.experienceMatch || 0}%</div>
    </div>
    <div class="card">
      <h4>Struktur & Format ATS</h4>
      <div class="val">${result.breakdown?.structureAndFormat || 0}%</div>
    </div>
    <div class="card">
      <h4>Kepadatan Kata Kunci</h4>
      <div class="val">${result.breakdown?.keywordDensity || 0}%</div>
    </div>
  </div>

  <div class="section-title">Kata Kunci Ditemukan di CV (${result.matchingKeywords?.length || 0}):</div>
  <div>
    ${(result.matchingKeywords || []).map(k => `<span class="tag tag-green">✓ ${k}</span>`).join(" ")}
  </div>

  <div class="section-title">Kata Kunci yang Perlu Ditambahkan (${result.missingKeywords?.length || 0}):</div>
  <div>
    ${(result.missingKeywords || []).map(k => `<span class="tag tag-red">+ ${k}</span>`).join(" ")}
  </div>

  <div class="section-title">Rekomendasi Tindakan Nyata Lolos Skrining:</div>
  <ul>
    ${(result.recommendations || []).map(r => `<li>${r}</li>`).join("")}
  </ul>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    const printWin = window.open("", "_blank", "width=850,height=750");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printContent);
      printWin.document.close();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-300";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-300";
    return "text-red-700 bg-red-50 border-red-300";
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="border border-neutral-200 max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
            <Target className="w-5 h-5 text-indigo-600" />
            <span>AI ATS Compatibility & Benchmark</span>
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 pt-1">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Paste the vacancy or Job Description (JD) you want to target.
              The AI parses required qualifications, measures keyword overlap, and computes your screening pass rate.
            </p>

            {/* Poster / Screenshot OCR Vision Scan */}
            <div className="p-3 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    {isExtractingImage ? (
                      <Spinner className="w-4 h-4 text-white" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 leading-tight">
                      Punya Foto / Poster Lowongan Kerja?
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {isExtractingImage
                        ? "AI sedang membaca seluruh teks poster loker..."
                        : "Unggah gambar poster loker, AI langsung mengekstrak kualifikasi otomatis."}
                    </p>
                  </div>
                </div>

                <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isExtractingImage ? "Memindai..." : "Scan Poster Loker"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isExtractingImage}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="targetRole" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Target Role / Title (Optional)
              </Label>
              <Input
                id="targetRole"
                placeholder="e.g. Senior Frontend Engineer or Product Lead"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="jd" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Job Description & Key Requirements *
              </Label>
              <Textarea
                id="jd"
                placeholder="Paste the job requirements, responsibilities, and required qualifications..."
                rows={7}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button variant="outline" onClick={onClose} className="border-neutral-200 text-xs rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-xs"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Analyzing CV vs Job...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run ATS Screening
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-1">
            {/* Overall Score Banner */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50">
              <div
                className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-black flex-shrink-0 shadow-xs ${getScoreColor(
                  result.overallScore
                )}`}
              >
                <span className="text-2xl leading-none">{result.overallScore}%</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">
                  Score
                </span>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-neutral-900 text-base">
                  {result.overallScore >= 80
                    ? "Excellent ATS Match — High Interview Probability"
                    : result.overallScore >= 60
                    ? "Moderate Match — Needs Targeted Keywords"
                    : "Low Match — Critical Requirements Missing"}
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">{result.summaryRating}</p>
              </div>
            </div>

            {/* Subscores Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 border border-neutral-200 rounded-xl bg-white space-y-1.5 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-600">Hard Skills & Tools</span>
                  <span className="text-neutral-900 font-bold">{result.breakdown?.hardSkills ?? 0}%</span>
                </div>
                <Progress value={result.breakdown?.hardSkills ?? 0} className="h-1.5" />
              </div>

              <div className="p-3.5 border border-neutral-200 rounded-xl bg-white space-y-1.5 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-600">Experience Alignment</span>
                  <span className="text-neutral-900 font-bold">{result.breakdown?.experienceMatch ?? 0}%</span>
                </div>
                <Progress value={result.breakdown?.experienceMatch ?? 0} className="h-1.5" />
              </div>

              <div className="p-3.5 border border-neutral-200 rounded-xl bg-white space-y-1.5 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-600">Section Format & Headings</span>
                  <span className="text-neutral-900 font-bold">{result.breakdown?.structureAndFormat ?? 0}%</span>
                </div>
                <Progress value={result.breakdown?.structureAndFormat ?? 0} className="h-1.5" />
              </div>

              <div className="p-3.5 border border-neutral-200 rounded-xl bg-white space-y-1.5 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-600">Job Keyword Density</span>
                  <span className="text-neutral-900 font-bold">{result.breakdown?.keywordDensity ?? 0}%</span>
                </div>
                <Progress value={result.breakdown?.keywordDensity ?? 0} className="h-1.5" />
              </div>
            </div>

            {/* Matched vs Missing Keywords */}
            <div className="space-y-3 pt-1">
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Matched Keywords in Your CV
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingKeywords?.map(kw => (
                    <span
                      key={kw}
                      className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium inline-flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-600" /> {kw}
                    </span>
                  ))}
                  {(!result.matchingKeywords || result.matchingKeywords.length === 0) && (
                    <span className="text-xs text-neutral-400">None detected</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Missing Keywords from Vacancy
                  </h5>
                  <span className="text-[10px] text-neutral-400">
                    💡 Klik kata kunci untuk langsung memasukkannya ke CV
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords?.map(kw => (
                    <button
                      key={kw}
                      type="button"
                      disabled={addSkillMutation.isPending}
                      onClick={() => handleAddMissingKeyword(kw)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-800 hover:bg-red-100 hover:border-red-300 border border-red-200 font-medium inline-flex items-center gap-1 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                      title="Klik untuk langsung sisipkan ke daftar keahlian CV"
                    >
                      <Plus className="w-3 h-3 text-red-600" />
                      <span>{kw}</span>
                    </button>
                  ))}
                  {(!result.missingKeywords || result.missingKeywords.length === 0) && (
                    <span className="text-xs text-emerald-600 font-medium">
                      Luar biasa! Tidak ada kata kunci penting yang terlewat.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/60 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-600" /> Actionable Fixes to Pass ATS
                </h5>
                <ul className="space-y-1.5 text-xs text-neutral-700">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResult(null)}
                className="text-xs rounded-xl"
              >
                ← Test Another Vacancy
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintReport}
                  className="gap-1.5 text-xs rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-medium"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Unduh Laporan ATS (PDF)</span>
                </Button>
                <Button onClick={onClose} size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold px-4">
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
