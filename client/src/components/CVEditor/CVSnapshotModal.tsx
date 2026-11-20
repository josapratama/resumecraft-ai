import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  History,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { FullCVData } from "@/types/cv";

interface SnapshotItem {
  id: string;
  name: string;
  timestamp: number;
  data: FullCVData;
}

interface CVSnapshotModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  currentCVData: FullCVData;
  onRestoreSuccess: () => void;
}

export default function CVSnapshotModal({
  cvId,
  isOpen,
  onClose,
  currentCVData,
  onRestoreSuccess,
}: CVSnapshotModalProps) {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const storageKey = `resumecraft_snapshots_${cvId}`;

  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
  const [newSnapshotName, setNewSnapshotName] = useState("");
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Load snapshots from localStorage
  const loadSnapshots = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSnapshots(parsed);
          return;
        }
      }
    } catch {
      // Ignore parse errors
    }
    setSnapshots([]);
  };

  useEffect(() => {
    if (isOpen) {
      loadSnapshots();
      setNewSnapshotName("");
      setSelectedSnapshot(null);
    }
  }, [isOpen, cvId]);

  const handleCreateSnapshot = () => {
    const name = newSnapshotName.trim() || `${t("snapshot.default_name", "Versi")} ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const newSnap: SnapshotItem = {
      id: `snap_${Date.now()}`,
      name,
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(currentCVData)),
    };
    const updated = [newSnap, ...snapshots].slice(0, 15); // keep max 15 snapshots
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSnapshots(updated);
    setNewSnapshotName("");
    toast.success(t("snapshot.created_success", "Snapshot versi CV berhasil disimpan!"));
  };

  const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = snapshots.filter(s => s.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setSnapshots(updated);
    if (selectedSnapshot?.id === id) {
      setSelectedSnapshot(null);
    }
    toast.info(t("snapshot.deleted_success", "Snapshot versi CV dihapus."));
  };

  const handleRestore = async (snap: SnapshotItem) => {
    if (!confirm(t("snapshot.confirm_restore", `Apakah Anda yakin ingin memulihkan versi "${snap.name}"? Data CV aktif saat ini akan diperbarui.`))) {
      return;
    }

    setIsRestoring(true);
    try {
      const snapData = snap.data;

      // 1. Update personal info
      if (snapData.personalInfo) {
        await utils.client.cv.personalInfo.update.mutate({
          cvId,
          fullName: snapData.personalInfo.fullName || "",
          email: snapData.personalInfo.email || "",
          phone: snapData.personalInfo.phone || "",
          location: snapData.personalInfo.location || "",
          professionalSummary: snapData.personalInfo.professionalSummary || "",
          photoUrl: snapData.personalInfo.photoUrl || "",
        });
      }

      // 2. Update CV template
      await utils.client.cv.update.mutate({
        cvId,
        template: snapData.cv.template,
      });

      // 3. Update CV design & metadata
      await utils.client.cv.updateDesign.mutate({
        cvId,
        accentColor: snapData.cv.accentColor || undefined,
        targetRole: snapData.cv.targetRole || undefined,
        portfolioUrl: snapData.cv.portfolioUrl || undefined,
      });

      // Refetch full data
      await utils.cv.loadFull.invalidate({ cvId });
      toast.success(t("snapshot.restored_toast", `Versi "${snap.name}" berhasil dipulihkan!`));
      onRestoreSuccess();
      onClose();
    } catch (err: any) {
      toast.error(`${t("snapshot.restore_failed", "Gagal memulihkan snapshot:")} ${err.message || String(err)}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xl">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            <span>{t("snapshot.modal_title", "Riwayat & Snapshot Versi CV")}</span>
          </DialogTitle>
          <p className="text-xs text-neutral-500">
            {t("snapshot.modal_desc", "Simpan titik cadangan CV Anda sebelum melakukan perubahan besar atau pulihkan versi sebelumnya kapan saja.")}
          </p>
        </DialogHeader>

        {/* Create New Snapshot Input */}
        <div className="flex gap-2 p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl">
          <div className="flex-1">
            <Input
              value={newSnapshotName}
              onChange={e => setNewSnapshotName(e.target.value)}
              placeholder={t("snapshot.input_placeholder", "Nama versi (cth: Versi BUMN, Revisi Review AI, Draft 1 Hal)")}
              className="text-xs h-9 bg-white border-purple-200 focus:border-purple-600 rounded-lg"
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateSnapshot();
                }
              }}
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleCreateSnapshot}
            className="text-xs rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold gap-1.5 h-9 shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("snapshot.btn_save", "Simpan Versi Saat Ini")}</span>
          </Button>
        </div>

        {/* Snapshots List */}
        <div className="space-y-2 mt-1 max-h-[360px] overflow-y-auto pr-1">
          {snapshots.length === 0 ? (
            <div className="text-center py-10 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 space-y-2">
              <History className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs font-semibold text-neutral-700">
                {t("snapshot.empty_title", "Belum Ada Snapshot Versi")}
              </p>
              <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                {t("snapshot.empty_desc", "Ketik nama versi di atas dan klik 'Simpan Versi Saat Ini' untuk mencadangkan kondisi CV Anda.")}
              </p>
            </div>
          ) : (
            snapshots.map(snap => {
              const d = new Date(snap.timestamp);
              const isSelected = selectedSnapshot?.id === snap.id;
              const expCount = snap.data.workExperiences?.length || 0;
              const eduCount = snap.data.educations?.length || 0;
              const skillCount = snap.data.skills?.length || 0;

              return (
                <div
                  key={snap.id}
                  onClick={() => setSelectedSnapshot(snap)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? "border-purple-500 bg-purple-50/40 shadow-xs"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900 truncate">
                        {snap.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize bg-neutral-100 text-neutral-600">
                        {snap.data.cv.template || "modern"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <span>{d.toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </span>
                      <span className="text-neutral-400">•</span>
                      <span>{expCount} Pengalaman</span>
                      <span>•</span>
                      <span>{eduCount} Edukasi</span>
                      <span>•</span>
                      <span>{skillCount} Keahlian</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleRestore(snap)}
                      disabled={isRestoring}
                      className="text-xs h-7 px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white gap-1 shadow-2xs font-semibold"
                    >
                      {isRestoring ? (
                        <Spinner className="w-3 h-3" />
                      ) : (
                        <RotateCcw className="w-3 h-3 text-emerald-400" />
                      )}
                      <span>{t("snapshot.btn_restore", "Pulihkan")}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={e => handleDeleteSnapshot(snap.id, e)}
                      className="text-xs h-7 w-7 p-0 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-neutral-100 flex justify-between items-center sm:justify-between">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t("snapshot.auto_safe_note", "Tersimpan aman di peramban Anda.")}</span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs rounded-xl"
          >
            {t("common.close", "Tutup")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
