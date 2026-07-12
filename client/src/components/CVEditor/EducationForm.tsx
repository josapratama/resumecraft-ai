import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Trash2, Plus, Pencil, Calendar } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Education } from "@/types/cv";
import { toast } from "sonner";
import DraggableList from "./DraggableList";

interface EducationFormProps {
  cvId: number;
  initialData: Education[];
  onDataChange?: (educations: Education[]) => void;
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

export default function EducationForm({
  cvId,
  initialData,
  onDataChange,
}: EducationFormProps) {
  const utils = trpc.useUtils();
  const [educations, setEducations] = useState(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    field: "",
    location: "",
    graduationDate: "",
    description: "",
  });

  const createMutation = trpc.cv.education.create.useMutation({
    onSuccess: (result: any) => {
      const newEdu = Array.isArray(result) ? result[0] : result;
      const updated = [...educations, newEdu];
      setEducations(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Education added");
    },
    onError: () => toast.error("Failed to add education"),
  });

  const updateMutation = trpc.cv.education.update.useMutation({
    onSuccess: (result: any, variables) => {
      const updated = educations.map(e =>
        e.id === variables.id ? { ...e, ...variables, ...(result ?? {}) } : e
      );
      setEducations(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Education updated");
    },
    onError: () => toast.error("Failed to update education"),
  });

  const deleteMutation = trpc.cv.education.delete.useMutation({
    onSuccess: (_, v) => {
      const updated = educations.filter(e => e.id !== v.id);
      setEducations(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Education deleted");
    },
    onError: () => toast.error("Failed to delete education"),
  });

  const reorderMutation = trpc.cv.education.reorder.useMutation({
    onSuccess: () => {},
    onError: () => {
      toast.error("Failed to update order");
      utils.cv.loadFull.invalidate();
    },
  });

  const handleReorder = (newOrder: number[]) => {
    const reordered = newOrder.map(id => educations.find(e => e.id === id)!);
    setEducations(reordered);
    onDataChange?.(reordered);
    reorderMutation.mutate({ cvId, ids: newOrder });
  };

  const resetForm = () => {
    setFormData({
      school: "",
      degree: "",
      field: "",
      location: "",
      graduationDate: "",
      description: "",
    });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.school.trim() || !formData.degree.trim()) {
      toast.error("School and degree are required");
      return;
    }
    if (editingId) updateMutation.mutate({ id: editingId, ...formData });
    else createMutation.mutate({ cvId, ...formData });
  };

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id);
    setFormData({
      school: edu.school,
      degree: edu.degree,
      field: edu.field || "",
      location: edu.location || "",
      graduationDate: edu.graduationDate || "",
      description: edu.description || "",
    });
    setIsDialogOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="p-6 border border-black">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Education</h3>
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
            <DialogContent className="border border-black max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Education" : "Add Education"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    School *
                  </Label>
                  <Input
                    value={formData.school}
                    onChange={e =>
                      setFormData({ ...formData, school: e.target.value })
                    }
                    placeholder="e.g., University of California"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Degree *
                    </Label>
                    <Input
                      value={formData.degree}
                      onChange={e =>
                        setFormData({ ...formData, degree: e.target.value })
                      }
                      placeholder="e.g., Bachelor of Science"
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Field of Study
                    </Label>
                    <Input
                      value={formData.field}
                      onChange={e =>
                        setFormData({ ...formData, field: e.target.value })
                      }
                      placeholder="e.g., Computer Science"
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Location
                    </Label>
                    <Input
                      value={formData.location}
                      onChange={e =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g., Berkeley, CA"
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Graduation Date
                    </Label>
                    <Input
                      type="month"
                      value={formData.graduationDate}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          graduationDate: e.target.value,
                        })
                      }
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description / Achievements
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Honors, thesis, relevant coursework..."
                    className="mt-1.5 border-gray-300 focus:border-black min-h-[80px] resize-none"
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
                            Delete this education entry?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            "{formData.degree}" at {formData.school} will be
                            permanently removed.
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

        {educations.length > 0 ? (
          <DraggableList
            items={educations}
            onReorder={handleReorder}
            droppableId="education"
            renderItem={edu => (
              <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black text-sm leading-tight">
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {edu.school}
                    {edu.location ? ` · ${edu.location}` : ""}
                  </p>
                  {edu.graduationDate && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{fmtMonth(edu.graduationDate)}</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleEdit(edu)}
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
            <p className="text-sm text-gray-400">No education yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Click "Add" to get started
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
