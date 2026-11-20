import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Timer,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  FileCheck,
  Sparkles,
  Copy,
  Check,
  Eye,
} from "lucide-react";
import type { FullCVData } from "@/types/cv";
import { toast } from "sonner";

interface HRScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: FullCVData;
}

const POWER_ACTION_VERBS = [
  "Mengembangkan", "Memimpin", "Mengoptimalkan", "Merancang", "Meningkatkan",
  "Mengotomatiskan", "Mengintegrasikan", "Menganalisis", "Mengeksekusi", "Mendirikan",
  "Spearheaded", "Engineered", "Orchestrated", "Scaled", "Optimized",
  "Accelerated", "Streamlined", "Architected", "Pioneered", "Maximized"
];

export default function HRScreeningModal({
  isOpen,
  onClose,
  cvData,
}: HRScreeningModalProps) {
  const { t } = useI18n();
  const [copiedVerbs, setCopiedVerbs] = useState(false);

  const audit = useMemo(() => {
    let score = 50;
    const findings: Array<{ type: "success" | "warning" | "info"; title: string; desc: string }> = [];

    // 1. Text corpus
    const expText = cvData.workExperiences.map(w => `${w.jobTitle} ${w.description || ""}`).join(" ");
    const summaryText = cvData.personalInfo?.professionalSummary || "";
    const allText = `${summaryText} ${expText}`;

    // 2. Metrics & Numbers density
    const numberMatches = allText.match(/\b\d+(\.\d+)?%?|\b(Rp|\$|USD|IDR)\s?\d+|\b\d+\s*(orang|user|klien|k|jt|miliar|juta|x)\b/gi) || [];
    const metricCount = numberMatches.length;
    if (metricCount >= 4) {
      score += 15;
      findings.push({
        type: "success",
        title: t("hr_screen.metric_strong_title", "Kepadatan Metrik & Angka Sangat Kuat"),
        desc: t("hr_screen.metric_strong_desc", "Ditemukan {n} bukti kuantitatif. Recruiter menyukai angka nyata karena langsung membuktikan dampak kerja.").replace("{n}", String(metricCount)),
      });
    } else if (metricCount >= 1) {
      score += 8;
      findings.push({
        type: "warning",
        title: t("hr_screen.metric_avg_title", "Metrik Terukur Masih Cukup Sedikit"),
        desc: t("hr_screen.metric_avg_desc", "Ditemukan {n} angka hasil. Tingkatkan menjadi minimal 4 (contoh: 'Meningkatkan konversi 25%', 'Memimpin 5 anggota tim').").replace("{n}", String(metricCount)),
      });
    } else {
      findings.push({
        type: "warning",
        title: t("hr_screen.metric_low_title", "Belum Ada Angka / Metrik Terukur"),
        desc: t("hr_screen.metric_low_desc", "Recruiter menilai CV berbasis hasil. Ubah tugas harian menjadi pencapaian dengan persentase atau nominal angka."),
      });
    }

    // 3. Action Verbs
    const foundVerbs = POWER_ACTION_VERBS.filter(v => new RegExp(`\\b${v}\\b`, "i").test(allText));
    if (foundVerbs.length >= 3) {
      score += 15;
      findings.push({
        type: "success",
        title: t("hr_screen.verbs_strong_title", "Kata Kerja Aksi (Action Verbs) Dominan"),
        desc: t("hr_screen.verbs_strong_desc", "Menggunakan kata kerja kuat ({verbs}). Ini membuat profil Anda berkesan proaktif.").replace("{verbs}", foundVerbs.slice(0, 4).join(", ")),
      });
    } else {
      findings.push({
        type: "warning",
        title: t("hr_screen.verbs_low_title", "Perlu Lebih Banyak Action Verbs"),
        desc: t("hr_screen.verbs_low_desc", "Mulai setiap poin pengalaman kerja dengan kata kerja aksi tegas seperti 'Merancang', 'Mengembangkan', atau 'Memimpin'."),
      });
    }

    // 4. Summary word count
    const summaryWords = summaryText.trim().split(/\s+/).filter(Boolean).length;
    if (summaryWords >= 25 && summaryWords <= 70) {
      score += 10;
      findings.push({
        type: "success",
        title: t("hr_screen.summary_ideal_title", "Panjang Ringkasan Profesional Ideal"),
        desc: t("hr_screen.summary_ideal_desc", "Ringkasan terdiri dari {n} kata (ideal 30-60 kata). Tuntas dibaca recruiter dalam 2 detik pertama.").replace("{n}", String(summaryWords)),
      });
    } else if (summaryWords > 70) {
      findings.push({
        type: "warning",
        title: t("hr_screen.summary_long_title", "Ringkasan Terlalu Panjang"),
        desc: t("hr_screen.summary_long_desc", "Ringkasan Anda memiliki {n} kata. Persingkat menjadi maksimal 3-4 kalimat padat agar tidak di-skip oleh HRD.").replace("{n}", String(summaryWords)),
      });
    }

    // 5. Structure & Completeness
    if (cvData.skills.length >= 6) score += 5;
    if (cvData.projects.length >= 1) score += 5;

    const finalScore = Math.min(100, Math.max(35, score));
    const scanTimeSec = (4.5 + (allText.split(/\s+/).length / 55)).toFixed(1);

    return {
      score: finalScore,
      scanTimeSec,
      metricCount,
      verbsFound: foundVerbs,
      findings,
    };
  }, [cvData, t]);

  const handleCopyVerbs = () => {
    navigator.clipboard.writeText(POWER_ACTION_VERBS.join(", "));
    setCopiedVerbs(true);
    toast.success(t("hr_screen.verbs_copied", "Daftar 20 Action Verbs populer disalin!"));
    setTimeout(() => setCopiedVerbs(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-neutral-200">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-neutral-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
                {t("hr_screen.modal_title", "Audit Keterbacaan HRD 6 Detik (6-Second Screening)")}
              </DialogTitle>
              <p className="text-xs text-neutral-500">
                {t("hr_screen.modal_desc", "Simulasi kecepatan scan mata recruiter saat menyeleksi ratusan CV kandidat")}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-50/60">
          {/* Top Score Banner */}
          <div className="bg-white p-4.5 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-amber-900 leading-none">{audit.score}</span>
                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-0.5">/ 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-neutral-900">
                    {audit.score >= 80
                      ? t("hr_screen.verdict_excellent", "Sangat Siap Tembus HR Screening!")
                      : audit.score >= 65
                      ? t("hr_screen.verdict_good", "Keterbacaan Cukup Baik, Ada Ruang Optimasi")
                      : t("hr_screen.verdict_needs_work", "Perlu Dioptimalkan Agar Menarik dalam 6 Detik")}
                  </h4>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {t("hr_screen.est_scan_time", "Estimasi Waktu Pindai HRD:")} <strong className="text-neutral-800">{audit.scanTimeSec} detik</strong>
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-xs py-1 px-3 rounded-full border-amber-300 bg-amber-50 text-amber-800 font-semibold self-stretch sm:self-auto text-center justify-center">
              {audit.score >= 80 ? "High Impact" : audit.score >= 65 ? "Moderate Impact" : "Low Impact"}
            </Badge>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-xl border border-neutral-200 text-center">
              <span className="text-lg font-bold text-blue-600">{audit.metricCount}</span>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{t("hr_screen.card_metrics", "Metrik / Angka Hasil")}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-neutral-200 text-center">
              <span className="text-lg font-bold text-emerald-600">{audit.verbsFound.length}</span>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{t("hr_screen.card_verbs", "Action Verbs Kuat")}</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-neutral-200 text-center col-span-2 sm:col-span-1">
              <span className="text-lg font-bold text-purple-600">6 - 8s</span>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">{t("hr_screen.card_standard", "Standar Industri HR")}</p>
            </div>
          </div>

          {/* Detailed Findings List */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              {t("hr_screen.findings_title", "Catatan Evaluasi Keterbacaan:")}
            </h5>
            {audit.findings.map((f, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  f.type === "success"
                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                    : "bg-amber-50/60 border-amber-200 text-amber-950"
                }`}
              >
                {f.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h6 className="text-xs font-bold leading-tight">{f.title}</h6>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recruiter Power Verbs Toolbox */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{t("hr_screen.verbs_arsenal", "Koleksi Action Verbs Populer untuk Disisipkan:")}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyVerbs}
                className="h-7 px-2 text-[11px] gap-1 text-neutral-600 hover:text-neutral-900"
              >
                {copiedVerbs ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedVerbs ? t("common.copied", "Tersalin") : t("common.copy", "Salin")}</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POWER_ACTION_VERBS.slice(0, 10).map(v => (
                <span
                  key={v}
                  className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-medium border border-neutral-200/80"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-neutral-100 flex justify-end shrink-0">
          <Button
            onClick={onClose}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl h-9 px-5"
          >
            {t("common.understand", "Mengerti, Kembali ke Editor")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
