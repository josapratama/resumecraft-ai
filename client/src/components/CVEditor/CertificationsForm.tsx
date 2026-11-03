import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Plus, Pencil, ExternalLink, Calendar, Award } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Certification } from "@/types/cv";
import { toast } from "sonner";
import DraggableList from "./DraggableList";

interface CertificationsFormProps {
  cvId: number;
  initialData: Certification[];
  onDataChange?: (certifications: Certification[]) => void;
}

function fmtMonth(val: string | null | undefined): string {
  if (!val) return "";
  const [year, month] = val.split("-");
  if (!year || !month) return val;
  return new Date(Number(year), Number(month) - 1).toLocaleDateString(
    undefined,
    { month: "short", year: "numeric" }
  );
}

export default function CertificationsForm({
  cvId,
  initialData,
  onDataChange,
}: CertificationsFormProps) {
  const utils = trpc.useUtils();
  const [certifications, setCertifications] = useState(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    certificationName: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    link: "",
  });

  const createMutation = trpc.cv.certification.create.useMutation({
    onSuccess: (result: any) => {
      const newCert = Array.isArray(result) ? result[0] : result;
      const updated = [...certifications, newCert];
      setCertifications(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Certification added");
    },
    onError: () => toast.error("Failed to add certification"),
  });

  const updateMutation = trpc.cv.certification.update.useMutation({
    onSuccess: (result: any, variables) => {
      const updated = certifications.map(c =>
        c.id === variables.id ? { ...c, ...variables, ...(result ?? {}) } : c
      );
      setCertifications(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Certification updated");
    },
    onError: () => toast.error("Failed to update certification"),
  });

  const deleteMutation = trpc.cv.certification.delete.useMutation({
    onSuccess: (_, v) => {
      const updated = certifications.filter(c => c.id !== v.id);
      setCertifications(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Certification deleted");
    },
    onError: () => toast.error("Failed to delete certification"),
  });

  const reorderMutation = trpc.cv.certification.reorder.useMutation({
    onSuccess: () => {},
    onError: () => {
      toast.error("Failed to update order");
      utils.cv.loadFull.invalidate();
    },
  });

  const handleReorder = (newOrder: number[]) => {
    const reordered = newOrder.map(id => certifications.find(c => c.id === id)!);
    setCertifications(reordered);
    onDataChange?.(reordered);
    reorderMutation.mutate({ cvId, ids: newOrder });
  };

  const resetForm = () => {
    setFormData({
      certificationName: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      link: "",
    });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.certificationName.trim() || !formData.issuer.trim()) {
      toast.error("Certification name and issuer are required");
      return;
    }
    if (editingId) updateMutation.mutate({ id: editingId, ...formData });
    else createMutation.mutate({ cvId, ...formData });
  };

  const handleEdit = (cert: Certification) => {
    setEditingId(cert.id);
    setFormData({
      certificationName: cert.certificationName,
      issuer: cert.issuer,
      issueDate: cert.issueDate || "",
      expiryDate: cert.expiryDate || "",
      link: cert.link || "",
    });
    setIsDialogOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="p-5 sm:p-6 border border-neutral-200 bg-white rounded-2xl shadow-xs">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              Certifications & Licenses
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Accreditations, professional credentials, and honors
            </p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={open => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => resetForm()}
                className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold h-8 sm:h-9 px-3 shadow-xs"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certification</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="border border-neutral-200 max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-neutral-900">
                  {editingId ? "Edit Certification" : "Add Certification"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Certification Name *
                  </Label>
                  <Input
                    value={formData.certificationName}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        certificationName: e.target.value,
                      })
                    }
                    placeholder="e.g. AWS Certified Solutions Architect - Associate"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Issuing Organization *
                  </Label>
                  <Input
                    value={formData.issuer}
                    onChange={e =>
                      setFormData({ ...formData, issuer: e.target.value })
                    }
                    placeholder="e.g. Amazon Web Services (AWS) or Google Cloud"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Issue Date
                    </Label>
                    <Input
                      type="month"
                      value={formData.issueDate}
                      onChange={e =>
                        setFormData({ ...formData, issueDate: e.target.value })
                      }
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Expiry Date (Optional)
                    </Label>
                    <Input
                      type="month"
                      value={formData.expiryDate}
                      onChange={e =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Credential Link / Verification URL
                  </Label>
                  <Input
                    value={formData.link}
                    onChange={e =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://credly.com/your-badge"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-semibold text-xs h-9"
                  >
                    {isSaving ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Certification"
                    )}
                  </Button>

                  {editingId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-9 px-3 rounded-xl text-xs font-semibold"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border border-neutral-200 rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base font-bold text-neutral-900">
                            Delete "{formData.certificationName}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs text-neutral-600">
                            This certification will be permanently removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex justify-end gap-2 pt-2">
                          <AlertDialogCancel className="border-neutral-200 text-xs font-semibold">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteMutation.mutate({ id: editingId })
                            }
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {certifications.length > 0 ? (
          <DraggableList
            items={certifications}
            onReorder={handleReorder}
            droppableId="certifications"
            renderItem={cert => (
              <div className="flex items-start justify-between gap-3 flex-1 min-w-0 py-1">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 text-sm leading-tight">
                    {cert.certificationName}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                    {cert.issuer}
                  </p>
                  {cert.issueDate && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Issued {fmtMonth(cert.issueDate)}
                        {cert.expiryDate ? ` - Expires ${fmtMonth(cert.expiryDate)}` : ""}
                      </span>
                    </div>
                  )}
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1 font-medium"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Credential
                    </a>
                  )}
                </div>

                <Button
                  onClick={() => handleEdit(cert)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex-shrink-0"
                  title="Edit certification"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <Award className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-700">No certifications added yet</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Add professional credentials, cloud badges, or industry licenses.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
