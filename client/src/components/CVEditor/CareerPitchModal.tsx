import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Mic,
  Copy,
  Check,
  Sparkles,
  Share2,
  MessageCircle,
  Linkedin,
  Send,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface CareerPitchModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
}

interface PitchResult {
  elevatorPitch30s: string;
  linkedinAbout: string;
  whatsappQuickIntro: string;
  networkingColdMessage: string;
}

export default function CareerPitchModal({
  cvId,
  isOpen,
  onClose,
  candidateName = "Kandidat",
}: CareerPitchModalProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("elevator");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [result, setResult] = useState<PitchResult | null>(null);

  const generateMutation = trpc.cvAI.generateCareerPitch.useMutation({
    onSuccess: (data: any) => {
      setResult(data as PitchResult);
      toast.success(t("career_pitch.generate_success", "Career Pitch & ringkasan profesional berhasil dibuat!"));
    },
    onError: (err: any) => {
      toast.error(`${t("career_pitch.generate_failed", "Gagal membuat pitch:")} ${err.message}`);
    },
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(t("career_pitch.copy_success", "Teks berhasil disalin ke clipboard!"));
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = () => {
    generateMutation.mutate({ cvId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto p-5 sm:p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <span>{t("career_pitch.modal_title", "AI Elevator Pitch 30 Detik & LinkedIn Summary")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-neutral-500 leading-relaxed">
            {t("career_pitch.modal_desc", "Otomatis merangkum pencapaian dan keahlian CV Anda menjadi naskah perkenalan diri lisan (saat wawancara kerja), bio profil LinkedIn, pesan WhatsApp ke HRD, dan pesan networking.")}
          </p>

          {!result && (
            <div className="p-6 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">
                  {t("career_pitch.ready_title", "Siap Memukau Pewawancara & Rekruter?")}
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                  {t("career_pitch.ready_desc", "AI akan membaca profil CV Anda dan merancang naskah perkenalan diri yang lugas, percaya diri, dan berbobot.")}
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold h-9 px-5 shadow-xs"
              >
                {generateMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> {t("career_pitch.generating", "Merancang Personal Pitch...")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> {t("career_pitch.generate_btn", "Buat Personal Pitch Sekarang")}
                  </>
                )}
              </Button>
            </div>
          )}

          {result && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="elevator" className="gap-1.5 text-xs">
                    <Mic className="w-3.5 h-3.5" /> {t("career_pitch.tab_interview", "30s Interview")}
                  </TabsTrigger>
                  <TabsTrigger value="linkedin" className="gap-1.5 text-xs">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn
                  </TabsTrigger>
                  <TabsTrigger value="wa" className="gap-1.5 text-xs">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                  </TabsTrigger>
                  <TabsTrigger value="cold" className="gap-1.5 text-xs">
                    <Send className="w-3.5 h-3.5 text-indigo-600" /> {t("career_pitch.tab_outreach", "Outreach")}
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Elevator Pitch 30 Detik */}
                <TabsContent value="elevator" className="space-y-2.5 pt-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1 font-semibold text-neutral-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" /> {t("career_pitch.speech_estimate", "Estimasi Bicara: 35–45 Detik")}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(result.elevatorPitch30s, "elevator")}
                      className="text-xs h-7 gap-1 border-neutral-300"
                    >
                      {copiedKey === "elevator" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "elevator" ? t("actions.copied", "Tersalin!") : t("career_pitch.copy_script", "Salin Naskah")}</span>
                    </Button>
                  </div>
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 leading-relaxed font-serif whitespace-pre-line italic">
                    "{result.elevatorPitch30s}"
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    💡 <strong>Tips:</strong> {t("career_pitch.tips_pitch", "Ucapkan dengan nada santai, percaya diri, kontak mata, dan tersenyum ramah di awal sesi wawancara.")}
                  </p>
                </TabsContent>

                {/* Tab 2: LinkedIn About Summary */}
                <TabsContent value="linkedin" className="space-y-2.5 pt-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold text-blue-700">{t("career_pitch.linkedin_format", 'Format LinkedIn "About / Bio"')}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(result.linkedinAbout, "linkedin")}
                      className="text-xs h-7 gap-1 border-neutral-300"
                    >
                      {copiedKey === "linkedin" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "linkedin" ? t("actions.copied", "Tersalin!") : t("career_pitch.copy_linkedin", "Salin untuk LinkedIn")}</span>
                    </Button>
                  </div>
                  <div className="p-4 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 leading-relaxed whitespace-pre-line font-mono max-h-64 overflow-y-auto">
                    {result.linkedinAbout}
                  </div>
                </TabsContent>

                {/* Tab 3: WhatsApp Intro */}
                <TabsContent value="wa" className="space-y-2.5 pt-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold text-emerald-700">{t("career_pitch.wa_format", "Teks Chat WhatsApp ke Rekruter")}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(result.whatsappQuickIntro, "wa")}
                      className="text-xs h-7 gap-1 border-neutral-300"
                    >
                      {copiedKey === "wa" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "wa" ? t("actions.copied", "Tersalin!") : t("career_pitch.copy_chat", "Salin Chat")}</span>
                    </Button>
                  </div>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-neutral-800 leading-relaxed whitespace-pre-line font-mono">
                    {result.whatsappQuickIntro}
                  </div>
                </TabsContent>

                {/* Tab 4: Cold Outreach Message */}
                <TabsContent value="cold" className="space-y-2.5 pt-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-semibold text-indigo-700">{t("career_pitch.outreach_format", "LinkedIn Connection Note (< 300 char)")}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(result.networkingColdMessage, "cold")}
                      className="text-xs h-7 gap-1 border-neutral-300"
                    >
                      {copiedKey === "cold" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "cold" ? t("actions.copied", "Tersalin!") : t("career_pitch.copy_message", "Salin Pesan")}</span>
                    </Button>
                  </div>
                  <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs text-neutral-800 leading-relaxed whitespace-pre-line font-mono">
                    {result.networkingColdMessage}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="text-xs text-neutral-500"
                >
                  <Sparkles className="w-3 h-3 mr-1" /> {t("career_pitch.regenerate", "Buat Ulang Pitch")}
                </Button>
                <Button size="sm" onClick={onClose} className="text-xs rounded-lg">
                  {t("actions.close", "Tutup")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
