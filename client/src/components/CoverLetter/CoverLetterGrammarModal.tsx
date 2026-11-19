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
  SpellCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface CoverLetterGrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullLetterText: string;
  onApplyPolished: (polishedText: string) => void;
}

interface GrammarResult {
  score: number;
  toneVerdict: string;
  errors: Array<{
    originalText: string;
    suggestedCorrection: string;
    explanation: string;
    type: string;
  }>;
  polishedContent: string;
}

export default function CoverLetterGrammarModal({
  isOpen,
  onClose,
  fullLetterText,
  onApplyPolished,
}: CoverLetterGrammarModalProps) {
  const [result, setResult] = useState<GrammarResult | null>(null);

  const checkMutation = trpc.cvAI.checkCoverLetterGrammar.useMutation({
    onSuccess: (data: any) => {
      setResult(data as GrammarResult);
      toast.success("Pemeriksaan EYD & etika surat selesai!");
    },
    onError: (err: any) => {
      toast.error(`Gagal memeriksa EYD: ${err.message}`);
    },
  });

  const handleRunCheck = () => {
    if (!fullLetterText || fullLetterText.trim().length < 20) {
      toast.error("Teks surat lamaran belum lengkap untuk diperiksa.");
      return;
    }
    checkMutation.mutate({ content: fullLetterText });
  };

  const handleApply = () => {
    if (!result?.polishedContent) return;
    onApplyPolished(result.polishedContent);
    toast.success("Teks surat yang disempurnakan berhasil diterapkan!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto p-5 sm:p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <SpellCheck className="w-4 h-4" />
            </div>
            <span>Pemeriksa EYD V & Etika Surat Lamaran Kerja</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-neutral-500 leading-relaxed">
            AI memeriksa kesopanan salam, penghapusan kata mubazir (seperti <em>Kepada Yth.</em>),
            kapitalisasi sapaan <em>Bapak/Ibu</em>, dan perbaikan ejaan baku formal sesuai standar PUEBI / EYD V.
          </p>

          {!result && (
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Pratinjau Teks Surat yang Akan Diperiksa:</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-neutral-200 text-xs text-neutral-600 max-h-40 overflow-y-auto leading-relaxed font-serif">
                {fullLetterText.slice(0, 350)}...
              </div>
              <Button
                onClick={handleRunCheck}
                disabled={checkMutation.isPending}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold h-9 shadow-xs"
              >
                {checkMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Memeriksa Kaidah EYD V & Etika Surat...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Jalankan Pemeriksaan EYD Sekarang
                  </>
                )}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Score Header */}
              <div className="flex items-center justify-between p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-purple-900">{result.score}</span>
                    <span className="text-xs text-purple-700 font-semibold">/ 100 Skor Kerapian Bahasa</span>
                  </div>
                  <p className="text-xs font-bold text-purple-800 mt-0.5">{result.toneVerdict}</p>
                </div>
                <Button
                  size="sm"
                  onClick={handleApply}
                  className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Terapkan Hasil Koreksi</span>
                </Button>
              </div>

              {/* Errors list */}
              {result.errors && result.errors.length > 0 ? (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Catatan Koreksi ({result.errors.length} Temuan):
                  </h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-medium line-through">
                            {err.originalText}
                          </span>
                          <ArrowRight className="w-3 h-3 text-neutral-400" />
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                            {err.suggestedCorrection}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-1">{err.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Luar biasa! Surat lamaran Anda sudah sangat baku, santun, dan sesuai kaidah EYD V.</span>
                </div>
              )}

              {/* Polished Preview */}
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Versi Sempurna Siap Pakai:
                </h5>
                <div className="p-3.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-700 leading-relaxed font-serif max-h-48 overflow-y-auto whitespace-pre-line">
                  {result.polishedContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
