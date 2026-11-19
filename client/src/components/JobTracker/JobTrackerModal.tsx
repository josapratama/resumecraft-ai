import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Briefcase,
  Building,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface JobTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCvId?: number;
}

const STATUS_COLUMNS = [
  { id: "applied", label: "Terkirim", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "screening", label: "Skrining / Tes", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "interview", label: "Wawancara", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "offer", label: "Tawaran Kerja (Offer)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "rejected", label: "Belum Berhasil", color: "bg-slate-100 text-slate-600 border-slate-200" },
];

export default function JobTrackerModal({
  isOpen,
  onClose,
  defaultCvId,
}: JobTrackerModalProps) {
  const utils = trpc.useUtils();
  const { data: applications = [], isLoading } = trpc.jobTracker.list.useQuery(undefined, {
    enabled: isOpen,
  });

  const [isAdding, setIsAdding] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState<"applied" | "screening" | "interview" | "offer" | "rejected">("applied");
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = trpc.jobTracker.create.useMutation({
    onSuccess: () => {
      utils.jobTracker.list.invalidate();
      setIsAdding(false);
      setCompanyName("");
      setJobTitle("");
      setLocation("");
      setJobUrl("");
      setSalaryExpectation("");
      setNotes("");
      toast.success("Lamaran berhasil ditambahkan ke pelacak!");
    },
    onError: err => {
      toast.error(err.message || "Gagal menyimpan lamaran");
    },
  });

  const updateMutation = trpc.jobTracker.update.useMutation({
    onSuccess: () => {
      utils.jobTracker.list.invalidate();
      toast.success("Status lamaran diperbarui");
    },
    onError: err => {
      toast.error(err.message || "Gagal memperbarui");
    },
  });

  const deleteMutation = trpc.jobTracker.delete.useMutation({
    onSuccess: () => {
      utils.jobTracker.list.invalidate();
      toast.info("Lamaran dihapus");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      toast.error("Nama perusahaan dan posisi wajib diisi");
      return;
    }
    createMutation.mutate({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      location: location.trim() || undefined,
      jobUrl: jobUrl.trim() || undefined,
      status,
      salaryExpectation: salaryExpectation.trim() || undefined,
      notes: notes.trim() || undefined,
      cvId: defaultCvId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b border-neutral-100 bg-neutral-50/60 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-neutral-900">
                  Pelacak Lamaran Kerja (Job Application Tracker)
                </DialogTitle>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Pantau dan kelola seluruh status lowongan yang sudah Anda lamar dalam satu tempat.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAdding(v => !v)}
              className="gap-1.5 text-xs h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? "Batal" : "Tambah Lamaran Baru"}</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Form Tambah Baru (Collapsible) */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="p-4 bg-indigo-50/40 border-b border-indigo-100 space-y-3 animate-in fade-in slide-in-from-top duration-200"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] font-semibold text-neutral-700">Nama Perusahaan / Sekolah *</Label>
                <Input
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="cth: SMP Angelly Prabumulih"
                  className="h-8 text-xs bg-white mt-1 border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <Label className="text-[11px] font-semibold text-neutral-700">Posisi Pekerjaan *</Label>
                <Input
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="cth: Guru Kimia / IPA"
                  className="h-8 text-xs bg-white mt-1 border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <Label className="text-[11px] font-semibold text-neutral-700">Status Saat Ini</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="h-8 text-xs bg-white mt-1 border-neutral-200 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Terkirim</SelectItem>
                    <SelectItem value="screening">Skrining / Tes</SelectItem>
                    <SelectItem value="interview">Wawancara</SelectItem>
                    <SelectItem value="offer">Tawaran Kerja (Offer)</SelectItem>
                    <SelectItem value="rejected">Belum Berhasil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] font-semibold text-neutral-700">Lokasi / Domisili</Label>
                <Input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="cth: Prabumulih / Palembang"
                  className="h-8 text-xs bg-white mt-1 border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <Label className="text-[11px] font-semibold text-neutral-700">Link Lowongan (URL)</Label>
                <Input
                  value={jobUrl}
                  onChange={e => setJobUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs bg-white mt-1 border-neutral-200 rounded-lg"
                />
              </div>

              <div>
                <Label className="text-[11px] font-semibold text-neutral-700">Ekspektasi Gaji (Opsional)</Label>
                <Input
                  value={salaryExpectation}
                  onChange={e => setSalaryExpectation(e.target.value)}
                  placeholder="cth: Rp 4.500.000 / bln"
                  className="h-8 text-xs bg-white mt-1 border-neutral-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-neutral-700">Catatan Tambahan (Kontak HRD, Jadwal Wawancara, dll)</Label>
              <Input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="cth: Interview tanggal 25 Nov via Zoom dengan Bu Rina"
                className="h-8 text-xs bg-white mt-1 border-neutral-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs h-8"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
                className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4"
              >
                {createMutation.isPending ? <Spinner className="w-3.5 h-3.5" /> : "Simpan Lamaran"}
              </Button>
            </div>
          </form>
        )}

        {/* Content Body: Kanban Columns */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-16 text-center space-y-2">
              <Spinner className="w-8 h-8 text-indigo-600 mx-auto" />
              <p className="text-xs text-neutral-500">Memuat daftar lamaran...</p>
            </div>
          ) : applications.length === 0 && !isAdding ? (
            <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
                <Briefcase className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-neutral-800">Belum Ada Lamaran yang Dicatat</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Mulai catat setiap lamaran yang Anda kirim ke perusahaan atau sekolah agar proses rekrutmen terorganisir rapi.
              </p>
              <Button
                onClick={() => setIsAdding(true)}
                className="text-xs gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                Catat Lamaran Pertama
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 min-w-[760px]">
              {STATUS_COLUMNS.map(col => {
                const colApps = applications.filter(a => a.status === col.id);
                return (
                  <div key={col.id} className="bg-neutral-50/80 rounded-xl p-2.5 border border-neutral-200/80 flex flex-col gap-2">
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200">
                      <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                        {col.label}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700">
                        {colApps.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2 flex-1">
                      {colApps.map(app => (
                        <div
                          key={app.id}
                          className="p-2.5 bg-white rounded-lg border border-neutral-200 shadow-2xs space-y-2 hover:border-neutral-300 transition-all text-xs"
                        >
                          <div>
                            <h5 className="font-bold text-neutral-900 leading-tight">
                              {app.jobTitle}
                            </h5>
                            <p className="text-[11px] text-neutral-600 font-medium mt-0.5 flex items-center gap-1">
                              <Building className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span className="truncate">{app.companyName}</span>
                            </p>
                          </div>

                          {app.location && (
                            <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span className="truncate">{app.location}</span>
                            </p>
                          )}

                          {app.notes && (
                            <p className="text-[10px] text-neutral-600 bg-neutral-50 p-1.5 rounded border border-neutral-100 leading-relaxed">
                              {app.notes}
                            </p>
                          )}

                          {/* Quick Status Dropdown & Actions */}
                          <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                            <select
                              value={app.status}
                              onChange={e =>
                                updateMutation.mutate({
                                  id: app.id,
                                  status: e.target.value as any,
                                })
                              }
                              className="text-[10px] font-semibold bg-neutral-100 border border-neutral-200 rounded px-1 py-0.5 text-neutral-700 cursor-pointer"
                            >
                              <option value="applied">Terkirim</option>
                              <option value="screening">Skrining</option>
                              <option value="interview">Wawancara</option>
                              <option value="offer">Offering</option>
                              <option value="rejected">Ditolak</option>
                            </select>

                            <div className="flex items-center gap-1">
                              {app.jobUrl && (
                                <a
                                  href={app.jobUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
                                  title="Buka Link Lowongan"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <button
                                onClick={() => deleteMutation.mutate({ id: app.id })}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-neutral-400 hover:text-red-600"
                                title="Hapus Lamaran"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between px-5">
          <span className="text-xs text-neutral-500">
            Total Lamaran Aktif: <strong>{applications.length}</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8 border-neutral-200 rounded-lg"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
