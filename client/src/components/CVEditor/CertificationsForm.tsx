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
import { Trash2, Plus, Pencil, ExternalLink, Calendar } from "lucide-react";
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
    const reordered = newOrder.map(
      id => certifications.find(c => c.id === id)!
    );
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
    <Card className="p-6 border border-black">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Certifications</h3>
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
                className="gap-2 bg-black text-white hover:bg-gray-800"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="border border-black max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Certification" : "Add Certification"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                    placeholder="e.g., AWS Solutions Architect"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Issuer *
                  </Label>
                  <Input
                    value={formData.issuer}
                    onChange={e =>
                      setFormData({ ...formData, issuer: e.target.value })
                    }
                    placeholder="e.g., Amazon Web Services"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </Label>
                    <Input
                      type="month"
                      value={formData.issueDate}
                      onChange={e =>
                        setFormData({ ...formData, issueDate: e.target.value })
                      }
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </Label>
                    <Input
                      type="month"
                      value={formData.expiryDate}
                      onChange={e =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Credential Link
                  </Label>
                  <Input
                    value={formData.link}
                    onChange={e =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://example.com/certificate"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    {isSaving ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                  {editingId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5 px-3"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Spinner className="w-3.5 h-3.5" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border border-black">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete this certification?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            "{formData.certificationName}" will be permanently
                            removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-2">
                          <AlertDialogCancel className="border-black">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteMutation.mutate({ id: editingId })
                            }
                            className="bg-red-600 hover:bg-red-700"
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
              <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black text-sm leading-tight">
                    {cert.certificationName}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">{cert.issuer}</p>
                  {cert.issueDate && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {fmtMonth(cert.issueDate)}
                        {cert.expiryDate
                          ? ` – ${fmtMonth(cert.expiryDate)}`
                          : ""}
                      </span>
                    </div>
                  )}
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-700 mt-1"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View credential
                    </a>
                  )}
                </div>
                <Button
                  onClick={() => handleEdit(cert)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0 text-gray-400 hover:text-black hover:bg-gray-100"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-400">No certifications yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Click "Add" to get started
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
