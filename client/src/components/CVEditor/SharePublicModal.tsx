import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Share2, Copy, Check, ExternalLink, Eye, Globe2 } from "lucide-react";
import { toast } from "sonner";

interface SharePublicModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  isPublic?: number;
  shareSlug?: string | null;
  viewsCount?: number;
}

export default function SharePublicModal({
  cvId,
  isOpen,
  onClose,
  isPublic = 0,
  shareSlug = "",
  viewsCount = 0,
}: SharePublicModalProps) {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [enabled, setEnabled] = useState(Boolean(isPublic));
  const [slug, setSlug] = useState(shareSlug || "");
  const [copied, setCopied] = useState(false);

  const toggleMutation = trpc.cv.togglePublicShare.useMutation({
    onSuccess: data => {
      setEnabled(data.isPublic);
      if (data.shareSlug) setSlug(data.shareSlug);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success(
        data.isPublic
          ? t("share_modal.enabled_toast", "Public sharing diaktifkan!")
          : t("share_modal.disabled_toast", "CV kini bersifat privat.")
      );
    },
    onError: err => {
      toast.error(`${t("share_modal.error_toast", "Gagal memperbarui sharing:")} ${err.message}`);
    },
  });

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${slug || cvId}`
    : `/p/${slug || cvId}`;

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate({
      cvId,
      isPublic: checked,
      customSlug: slug.trim() || undefined,
    });
  };

  const handleSaveSlug = () => {
    if (!slug.trim()) return;
    toggleMutation.mutate({
      cvId,
      isPublic: enabled,
      customSlug: slug.trim(),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success(t("share_modal.copied_toast", "Tautan publik berhasil disalin ke clipboard!"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Share2 className="w-5 h-5 text-blue-600" />
            {t("share_modal.modal_title", "Public Web CV & Recruiter Portfolio")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <p className="text-sm text-gray-600">
            {t("share_modal.modal_desc", "Publikasikan versi online interaktif dari CV Anda yang dapat dibuka oleh HRD maupun klien kapan pun melalui browser ponsel atau laptop.")}
          </p>

          <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-600" /> {t("share_modal.enable_toggle", "Aktifkan Tautan Web Publik")}
              </span>
              <p className="text-xs text-gray-500">
                {t("share_modal.toggle_desc", "Siapa pun yang memiliki tautan ini dapat melihat dan mengunduh CV Anda")}
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={toggleMutation.isPending}
            />
          </div>

          {enabled && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="space-y-2">
                <Label htmlFor="slugInput">{t("share_modal.custom_slug_label", "Custom URL Slug")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="slugInput"
                    placeholder="e.g. your-name-frontend"
                    value={slug}
                    onChange={e =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-_]/g, "")
                      )
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={handleSaveSlug}
                    disabled={toggleMutation.isPending || !slug.trim()}
                  >
                    {t("share_modal.save_slug", "Simpan Slug")}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("share_modal.public_link_label", "Tautan Publik Anda")}</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-100 border rounded-lg">
                  <input
                    readOnly
                    value={publicUrl}
                    className="bg-transparent text-xs font-mono text-gray-800 flex-1 outline-none truncate"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-8 w-8 p-0"
                    title={t("actions.copy", "Salin")}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(publicUrl, "_blank")}
                    className="h-8 w-8 p-0"
                    title={t("actions.open", "Buka Tautan")}
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </div>

              {/* Special Integration for Portfolio */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-xs font-bold text-blue-950">{t("share_modal.portfolio_heading", "Gunakan untuk Website Portofolio")}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      toast.success(t("share_modal.portfolio_copied", "Tautan CV berhasil disalin untuk Web Portofolio!"));
                    }}
                    className="h-6 px-2.5 text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md gap-1"
                  >
                    <Copy className="w-3 h-3" /> {t("share_modal.copy_portfolio_link", "Salin Link Portofolio")}
                  </Button>
                </div>
                <p className="text-[11px] text-blue-800/90 leading-relaxed">
                  {t("share_modal.portfolio_instruction", 'Tempelkan link ini di Admin Portofolio > Resume / CV. Tombol "Download CV" di landing page portofolio Anda akan langsung terhubung ke resume ini.')}
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900">
                <Eye className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  {t("share_modal.views_counter", "CV publik ini telah dilihat {count} kali oleh pengunjung/rekruter.")
                    .replace("{count}", String(viewsCount))}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t">
            <Button onClick={onClose} size="sm" className="bg-black text-white hover:bg-gray-800">
              {t("actions.close", "Selesai")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

