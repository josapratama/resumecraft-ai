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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface DuplicateCVModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  currentTitle?: string;
  currentTargetRole?: string | null;
}

export default function DuplicateCVModal({
  cvId,
  isOpen,
  onClose,
  currentTitle = "CV Baru",
  currentTargetRole = "",
}: DuplicateCVModalProps) {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [newTitle, setNewTitle] = useState(`${currentTitle} (${t("duplicate.new_variant_suffix", "Varian Baru")})`);
  const [targetRole, setTargetRole] = useState(currentTargetRole || "");

  const duplicateMutation = trpc.cv.duplicate.useMutation({
    onSuccess: (newCV: any) => {
      toast.success(t("duplicate.success_toast", "Varian CV baru berhasil dibuat!"));
      onClose();
      if (newCV && newCV.id) {
        navigate(`/cv/${newCV.id}`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || t("duplicate.error_toast", "Gagal menduplikasi CV"));
    },
  });

  const handleDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error(t("duplicate.empty_title_error", "Nama varian CV tidak boleh kosong"));
      return;
    }
    duplicateMutation.mutate({
      cvId,
      newTitle: newTitle.trim(),
      targetRole: targetRole.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6 bg-white border border-neutral-200">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Copy className="w-4 h-4" />
            </div>
            <span>{t("duplicate.modal_title", "Duplikasi & Buat Varian CV Baru")}</span>
          </DialogTitle>
          <p className="text-xs text-neutral-500 leading-relaxed">
            {t("duplicate.modal_desc", "Salin seluruh data CV ini (pengalaman, pendidikan, keahlian, sertifikasi) ke dokumen baru untuk disesuaikan dengan posisi lowongan lain.")}
          </p>
        </DialogHeader>

        <form onSubmit={handleDuplicate} className="space-y-4 pt-2">
          <div>
            <Label className="text-xs font-semibold text-neutral-700">
              {t("duplicate.new_title_label", "Nama Dokumen CV Varian Baru *")}
            </Label>
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder={t("duplicate.new_title_ph", "Contoh: CV Irma Iryani - Guru Kimia")}
              className="mt-1 text-xs border-neutral-200 rounded-xl"
              autoFocus
              required
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-neutral-700">
              {t("duplicate.target_role_label", "Target Posisi / Profesi Spesifik")}
            </Label>
            <Input
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder={t("duplicate.target_role_ph", "Contoh: Guru Kimia SMA / Pengajar Sains")}
              className="mt-1 text-xs border-neutral-200 rounded-xl"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              {t("duplicate.target_role_hint", "Ditampilkan tepat di bawah nama pelamar pada header CV.")}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={duplicateMutation.isPending}
              className="text-xs border-neutral-200 rounded-xl h-8"
            >
              {t("actions.cancel", "Batal")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={duplicateMutation.isPending}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8 gap-1.5 shadow-2xs font-semibold"
            >
              {duplicateMutation.isPending ? (
                <>
                  <Spinner className="w-3.5 h-3.5" />
                  <span>{t("duplicate.duplicating", "Menduplikasi...")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("duplicate.submit_btn", "Buat Varian Sekarang")}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
