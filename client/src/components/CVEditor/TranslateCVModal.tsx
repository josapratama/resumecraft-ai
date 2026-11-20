import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Languages, Sparkles, CopyPlus } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface TranslateCVModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  currentTitle: string;
}

export default function TranslateCVModal({
  cvId,
  isOpen,
  onClose,
  currentTitle,
}: TranslateCVModalProps) {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [targetLang, setTargetLang] = useState<"en" | "id">("en");
  const [translatedData, setTranslatedData] = useState<any | null>(null);

  const translateMutation = trpc.cvAI.translateCV.useMutation({
    onSuccess: data => {
      setTranslatedData(data);
      toast.success(t("translate_modal.success_toast", "CV berhasil diterjemahkan dan disesuaikan secara profesional!"));
    },
    onError: err => {
      toast.error(`${t("translate_modal.error_toast", "Penerjemahan gagal:")} ${err.message}`);
    },
  });

  const saveAsNewMutation = trpc.cvAI.createFromParsed.useMutation({
    onSuccess: newCV => {
      utils.cv.list.invalidate();
      toast.success(t("translate_modal.created_toast", "Dokumen CV hasil terjemahan baru berhasil dibuat!"));
      onClose();
      navigate(`/cv/${newCV.id}`);
    },
    onError: err => {
      toast.error(`${t("translate_modal.save_error_toast", "Gagal menyimpan CV baru:")} ${err.message}`);
    },
  });

  const handleTranslate = () => {
    translateMutation.mutate({
      cvId,
      targetLanguage: targetLang,
    });
  };

  const handleSaveAsNew = () => {
    if (!translatedData) return;
    const langLabel = targetLang === "en" ? "English" : "Bahasa Indonesia";
    const newTitle = translatedData.title || `${currentTitle} (${langLabel})`;

    saveAsNewMutation.mutate({
      title: newTitle,
      parsedData: translatedData,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Languages className="w-5 h-5 text-emerald-600" />
            {t("translate_modal.modal_title", "AI Multi-Language CV Localization")}
          </DialogTitle>
        </DialogHeader>

        {!translatedData ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">
              {t("translate_modal.modal_desc", "Terjemahkan dan adaptasikan seluruh CV Anda antara Bahasa Indonesia dan Bahasa Inggris secara profesional dengan kata kerja aktif industri.")}
            </p>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">
                {t("translate_modal.choose_lang", "Pilih Bahasa Sasaran:")}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTargetLang("en")}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    targetLang === "en"
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg mb-1 block">🇺🇸 / 🇬🇧</span>
                  <strong className="block text-sm text-gray-900">
                    English (US / UK)
                  </strong>
                  <span className="text-xs text-gray-500">
                    {t("translate_modal.en_desc", "Standard action verbs for global & multinational job applications")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetLang("id")}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    targetLang === "id"
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg mb-1 block">🇮🇩</span>
                  <strong className="block text-sm text-gray-900">
                    Bahasa Indonesia
                  </strong>
                  <span className="text-xs text-gray-500">
                    {t("translate_modal.id_desc", "Bahasa baku profesional untuk BUMN, instansi, dan korporasi lokal")}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                {t("actions.cancel", "Batal")}
              </Button>
              <Button
                onClick={handleTranslate}
                disabled={translateMutation.isPending}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {translateMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> {t("translate_modal.translating", "Menerjemahkan & Mengadaptasi...")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> {t("translate_modal.translate_btn", "Terjemahkan CV")}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-emerald-900">
                ✓ {t("translate_modal.preview_title", "Pratinjau Hasil Terjemahan")} ({targetLang === "en" ? "English" : "Bahasa Indonesia"})
              </p>
              <p className="text-gray-700">
                {t("translate_modal.cv_title_label", "Judul:")} <strong>{translatedData.title || currentTitle}</strong>
              </p>
              {translatedData.personalInfo?.professionalSummary && (
                <p className="italic text-gray-600 mt-1 line-clamp-3">
                  &ldquo;{translatedData.personalInfo.professionalSummary}&rdquo;
                </p>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-3 p-3 border rounded-lg bg-gray-50 text-xs">
              <div>
                <h5 className="font-bold text-gray-900 mb-1">{t("translate_modal.work_exp_heading", "Pengalaman Kerja:")}</h5>
                <ul className="space-y-2 list-disc pl-4 text-gray-700">
                  {translatedData.workExperiences?.map((exp: any, i: number) => (
                    <li key={i}>
                      <strong>{exp.jobTitle}</strong> at {exp.company}
                      {exp.description && (
                        <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                          {exp.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {translatedData.skills && (
                <div>
                  <h5 className="font-bold text-gray-900 mb-1">{t("translate_modal.skills_heading", "Keahlian:")}</h5>
                  <div className="flex flex-wrap gap-1">
                    {translatedData.skills.map((s: any, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-white border rounded text-[11px]">
                        {s.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTranslatedData(null)}
              >
                ← {t("actions.back", "Kembali")}
              </Button>

              <Button
                onClick={handleSaveAsNew}
                disabled={saveAsNewMutation.isPending}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {saveAsNewMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> {t("translate_modal.saving_new", "Membuat CV Terjemahan Baru...")}
                  </>
                ) : (
                  <>
                    <CopyPlus className="w-4 h-4" /> {t("translate_modal.save_as_new_btn", "Simpan Sebagai CV Baru")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

