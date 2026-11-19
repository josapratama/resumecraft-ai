import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
  SpellCheck,
  ArrowRight,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface GrammarCheckModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface GrammarIssue {
  section: string;
  originalText: string;
  suggestedText: string;
  explanation: string;
}

interface GrammarResult {
  totalIssues: number;
  score: number;
  summary: string;
  issues: GrammarIssue[];
}

export default function GrammarCheckModal({
  cvId,
  isOpen,
  onClose,
}: GrammarCheckModalProps) {
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const checkMutation = trpc.cvAI.checkGrammarAndTypo.useMutation({
    onSuccess: (data: any) => {
      setResult(data);
      if (data.totalIssues === 0) {
        toast.success("Luar biasa! Tidak ditemukan typo atau kesalahan tata bahasa.");
      } else {
        toast.info(`Ditemukan ${data.totalIssues} catatan ejaan/EYD untuk disempurnakan.`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal memeriksa ejaan");
    },
  });

  const handleStartScan = () => {
    checkMutation.mutate({ cvId });
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Teks perbaikan disalin!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-neutral-100 flex-shrink-0 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
              <SpellCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900">
                Pemeriksa Ejaan, Typo & EYD V
              </DialogTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Audit otomatis seluruh teks CV berdasarkan Pedoman Umum Ejaan Bahasa Indonesia & tata bahasa formal.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!result && !checkMutation.isPending && (
            <div className="text-center py-10 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-sm font-bold text-neutral-800">
                  Periksa Kualitas Tata Bahasa CV Anda
                </h4>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  AI akan membaca nama, posisi, ringkasan profil, pengalaman kerja, pendidikan, dan proyek untuk memastikan tidak ada salah ketik (typo), kalimat rancu, atau istilah non-formal.
                </p>
              </div>
              <Button
                onClick={handleStartScan}
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-5 h-10 font-semibold text-xs shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                Mulai Pindai Sekarang
              </Button>
            </div>
          )}

          {checkMutation.isPending && (
            <div className="text-center py-12 space-y-3">
              <Spinner className="w-8 h-8 text-purple-600 mx-auto" />
              <p className="text-sm font-semibold text-neutral-800">
                Menganalisis seluruh konten CV...
              </p>
              <p className="text-xs text-neutral-400">
                Memeriksa ejaan EYD V, akurasi tanda baca, dan konsistensi kata kerja aktif.
              </p>
            </div>
          )}

          {result && !checkMutation.isPending && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Score Card */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Skor Kerapian Bahasa
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        result.score >= 85
                          ? "bg-emerald-100 text-emerald-800"
                          : result.score >= 70
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.score} / 100
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 font-medium">
                    {result.summary}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartScan}
                  className="gap-1.5 text-xs h-8 rounded-lg shrink-0 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Pindai Ulang
                </Button>
              </div>

              {/* No Issues State */}
              {result.totalIssues === 0 ? (
                <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">
                    Dokumen Anda Sangat Rapi & Bebas Typo!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Seluruh struktur kalimat, ejaan, tanda baca, dan istilah formal sudah sesuai dengan standar profesional rekrutmen.
                  </p>
                </div>
              ) : (
                /* Issues List */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold text-neutral-700">
                      Daftar Temuan ({result.issues.length})
                    </span>
                    <span>Klik &apos;Salin&apos; untuk memakai koreksi</span>
                  </div>

                  {result.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-neutral-200 bg-white shadow-2xs space-y-2.5 transition-all hover:border-neutral-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          {issue.section}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(issue.suggestedText, idx)}
                          className="h-6 px-2 text-[11px] gap-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
                        >
                          {copiedIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Before / After */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-red-50/60 border border-red-100">
                          <span className="text-[10px] font-bold text-red-600 uppercase block mb-0.5">
                            Sebelum:
                          </span>
                          <span className="text-red-950 line-through">
                            {issue.originalText}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-0.5">
                            Saran Perbaikan:
                          </span>
                          <span className="text-emerald-950 font-medium">
                            {issue.suggestedText}
                          </span>
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-[11px] text-neutral-500 leading-relaxed flex items-start gap-1.5 pt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{issue.explanation}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end px-5">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 border-neutral-200 text-neutral-700 hover:bg-neutral-100 rounded-lg"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
