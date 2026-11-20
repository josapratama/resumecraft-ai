import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  DollarSign,
  TrendingUp,
  Globe2,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Building,
} from "lucide-react";
import { toast } from "sonner";

interface SalaryBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
  defaultLocation?: string;
}

interface BenchmarkResult {
  role: string;
  seniority: string;
  indonesia: {
    min: string;
    median: string;
    max: string;
    formatted: string;
  };
  remoteGlobalUSD: {
    min: string;
    median: string;
    max: string;
    formatted: string;
  };
  marketInsights: string;
  highPayingSkills: string[];
  negotiationTips: string[];
}

export default function SalaryBenchmarkModal({
  isOpen,
  onClose,
  defaultRole = "",
  defaultLocation = "Indonesia",
}: SalaryBenchmarkModalProps) {
  const { t } = useI18n();
  const [jobTitle, setJobTitle] = useState(defaultRole || "Software Engineer");
  const [experienceYears, setExperienceYears] = useState(2);
  const [location, setLocation] = useState(defaultLocation || "Indonesia");
  const [result, setResult] = useState<BenchmarkResult | null>(null);

  const benchmarkMutation = trpc.cvAI.getSalaryBenchmark.useMutation({
    onSuccess: (data: any) => {
      setResult(data as BenchmarkResult);
      toast.success(t("salary_benchmark.success_toast", "Estimasi benchmark gaji pasar berhasil dihitung!"));
    },
    onError: (err: any) => {
      toast.error(`${t("salary_benchmark.error_toast", "Gagal menghitung benchmark:")} ${err.message}`);
    },
  });

  const handleCalculate = () => {
    if (!jobTitle.trim()) {
      toast.error(t("salary_benchmark.empty_role", "Masukkan nama posisi pekerjaan"));
      return;
    }
    benchmarkMutation.mutate({
      jobTitle: jobTitle.trim(),
      experienceYears: Number(experienceYears) || 1,
      location: location.trim() || "Indonesia",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-y-auto p-5 sm:p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <span>{t("salary_benchmark.modal_title", "Kalkulator & Estimasi Gaji Pasar (Salary Benchmark)")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-neutral-500 leading-relaxed">
            {t("salary_benchmark.modal_desc", "Dapatkan estimasi standar kompensasi pasar di Indonesia (IDR) dan Remote Global (USD) berdasarkan pengalaman kerja Anda agar siap bernegosiasi dengan percaya diri.")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                {t("salary_benchmark.position_label", "Posisi / Bidang Pekerjaan")}
              </Label>
              <Input
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder={t("salary_benchmark.position_ph", "e.g. Guru Kimia, Fullstack Developer, Data Analyst")}
                className="mt-1 text-xs border-neutral-200 focus:border-neutral-900 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                {t("salary_benchmark.experience_label", "Pengalaman (Tahun)")}
              </Label>
              <Input
                type="number"
                min={0}
                max={30}
                value={experienceYears}
                onChange={e => setExperienceYears(Number(e.target.value))}
                className="mt-1 text-xs border-neutral-200 focus:border-neutral-900 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleCalculate}
              disabled={benchmarkMutation.isPending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-xs"
            >
              {benchmarkMutation.isPending ? (
                <>
                  <Spinner className="w-3.5 h-3.5" /> {t("salary_benchmark.calculating", "Menghitung Estimasi Pasar...")}
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5" /> {t("salary_benchmark.calculate_btn", "Hitung Benchmark Gaji")}
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="space-y-4 pt-2 border-t border-neutral-100 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{result.role}</h4>
                  <p className="text-xs text-neutral-500">
                    {t("salary_benchmark.seniority_label", "Tingkat Senioritas:")} {result.seniority}
                  </p>
                </div>
              </div>

              {/* Salary Bracket Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Indonesia Bracket */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t("salary_benchmark.indonesia_market", "Pasar Indonesia (IDR)")}</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-emerald-800">
                    {result.indonesia.formatted}
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-700 pt-1 border-t border-emerald-200/60">
                    <span>Min: {result.indonesia.min}</span>
                    <span className="font-bold">Median: {result.indonesia.median}</span>
                    <span>Max: {result.indonesia.max}</span>
                  </div>
                </div>

                {/* Remote Global Bracket */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t("salary_benchmark.remote_market", "Remote / Global (USD)")}</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-blue-800">
                    {result.remoteGlobalUSD.formatted}
                  </div>
                  <div className="flex justify-between text-[11px] text-blue-700 pt-1 border-t border-blue-200/60">
                    <span>Min: {result.remoteGlobalUSD.min}</span>
                    <span className="font-bold">Median: {result.remoteGlobalUSD.median}</span>
                    <span>Max: {result.remoteGlobalUSD.max}</span>
                  </div>
                </div>
              </div>

              {/* Market Insights */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                <h5 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {t("salary_benchmark.trend_insights", "Wawasan Tren Pasar")}
                </h5>
                <p className="text-xs text-neutral-600 leading-relaxed">{result.marketInsights}</p>
              </div>

              {/* High Paying Skills */}
              {result.highPayingSkills && result.highPayingSkills.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    {t("salary_benchmark.high_impact_skills", "Keahlian yang Menaikkan Nilai Tawar (High-Impact Skills):")}
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {result.highPayingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-100/70 text-emerald-800 font-medium"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Negotiation Tips */}
              {result.negotiationTips && result.negotiationTips.length > 0 && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                  <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> {t("salary_benchmark.negotiation_tips", "Tips Negosiasi Gaji")}
                  </h5>
                  <ul className="text-xs text-amber-800 space-y-1">
                    {result.negotiationTips.map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
