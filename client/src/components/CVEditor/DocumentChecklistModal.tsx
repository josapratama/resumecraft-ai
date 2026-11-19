import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckSquare,
  Square,
  FileCheck2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvId: number;
  onBackupCV: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  category: "wajib" | "pendukung";
  hint: string;
}

const DEFAULT_DOCUMENTS: ChecklistItem[] = [
  {
    id: "cv",
    label: "Curriculum Vitae (CV) Terkini",
    category: "wajib",
    hint: "Sudah diunduh dalam format PDF bersih dari ResumeCraft AI.",
  },
  {
    id: "cover_letter",
    label: "Surat Lamaran Pekerjaan Formal",
    category: "wajib",
    hint: "Nama perusahaan, posisi, dan tanggal surat sudah disesuaikan.",
  },
  {
    id: "photo",
    label: "Pas Foto Berwarna Terbaru",
    category: "wajib",
    hint: "Pakaian formal/kemeja rapi, ukuran 3x4 atau 4x6 dengan latar merah/biru.",
  },
  {
    id: "ijazah",
    label: "Salinan Ijazah Terlegalisir",
    category: "wajib",
    hint: "Scan PDF resolusi tajam (bukan foto miring/buram).",
  },
  {
    id: "transkrip",
    label: "Salinan Transkrip Nilai Akademik",
    category: "wajib",
    hint: "Memperlihatkan IPK dan daftar mata kuliah resmi.",
  },
  {
    id: "ktp",
    label: "Salinan KTP & Dokumen Kependudukan",
    category: "wajib",
    hint: "NIK dan domisili terbaca jelas untuk verifikasi data HRD.",
  },
  {
    id: "sertifikat",
    label: "Sertifikat Pelatihan / Kompetensi",
    category: "pendukung",
    hint: "Sertifikat webinar, kursus, atau keahlian teknis yang relevan.",
  },
  {
    id: "skck",
    label: "Surat Keterangan Catatan Kepolisian (SKCK)",
    category: "pendukung",
    hint: "Masa berlaku masih aktif (umumnya disyaratkan BUMN / ASN / Sekolah).",
  },
  {
    id: "surat_sehat",
    label: "Surat Keterangan Sehat dari Dokter / Puskesmas",
    category: "pendukung",
    hint: "Menyatakan kondisi fisik sehat untuk bekerja.",
  },
];

export default function DocumentChecklistModal({
  isOpen,
  onClose,
  cvId,
  onBackupCV,
}: DocumentChecklistModalProps) {
  const storageKey = `cv_checklist_${cvId}`;
  const [checkedIds, setCheckedIds] = useState<string[]>(["cv", "cover_letter"]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setCheckedIds(JSON.parse(saved));
        } catch {
          // fallback
        }
      }
    }
  }, [storageKey]);

  const toggleCheck = (id: string) => {
    const updated = checkedIds.includes(id)
      ? checkedIds.filter(item => item !== id)
      : [...checkedIds, id];
    setCheckedIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const handleSelectAll = () => {
    const all = DEFAULT_DOCUMENTS.map(d => d.id);
    setCheckedIds(all);
    localStorage.setItem(storageKey, JSON.stringify(all));
    toast.success("Semua berkas ditandai siap!");
  };

  const handleReset = () => {
    const initial = ["cv", "cover_letter"];
    setCheckedIds(initial);
    localStorage.setItem(storageKey, JSON.stringify(initial));
    toast.info("Checklist di-reset");
  };

  const completedCount = checkedIds.length;
  const totalCount = DEFAULT_DOCUMENTS.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b border-neutral-100 bg-neutral-50/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900">
                Checklist Berkas Lamaran Kerja Indonesia
              </DialogTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Pastikan seluruh berkas administrasi siap sebelum dikirim agar tidak gugur di tahap awal.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress bar */}
        <div className="p-4 bg-emerald-50/40 border-b border-emerald-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-emerald-950">
              Kesiapan Berkas Administrasi:
            </span>
            <span className="font-bold text-emerald-700">
              {completedCount} dari {totalCount} Berkas ({percentage}%)
            </span>
          </div>
          <Progress value={percentage} className="h-2 bg-emerald-200" />
        </div>

        {/* Checklist items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {DEFAULT_DOCUMENTS.map(doc => {
            const isChecked = checkedIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => toggleCheck(doc.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-white border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <button type="button" className="mt-0.5 shrink-0 text-emerald-600">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isChecked ? "text-emerald-950 line-through opacity-85" : "text-neutral-900"
                      }`}
                    >
                      {doc.label}
                    </span>
                    <span
                      className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        doc.category === "wajib"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {doc.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    {doc.hint}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-[11px] h-7 px-2 text-neutral-600 hover:bg-neutral-100"
            >
              Tandai Semua
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-[11px] h-7 px-2 text-neutral-500 hover:bg-neutral-100"
            >
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackupCV}
              className="gap-1.5 text-xs h-8 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              title="Unduh file backup data CV dalam format .json"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup Data CV (.json)</span>
            </Button>
            <Button
              onClick={onClose}
              size="sm"
              className="text-xs h-8 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg"
            >
              Selesai
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
