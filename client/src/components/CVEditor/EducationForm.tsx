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
import { Trash2, Plus, Pencil, Calendar, GraduationCap } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Education } from "@/types/cv";
import { toast } from "sonner";
import { formatEducationTitle } from "@/lib/cvFormatters";
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
    onError: () => {
      toast.error("Failed to add education");
    },
  });

  const updateMutation = trpc.cv.education.update.useMutation({
    onSuccess: (result: any, variables) => {
      const serverData = result ?? {};
      const updated = educations.map(edu =>
        edu.id === variables.id ? { ...edu, ...variables, ...serverData } : edu
      );
      setEducations(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Education updated");
    },
    onError: () => {
      toast.error("Failed to update education");
    },
  });

  const deleteMutation = trpc.cv.education.delete.useMutation({
    onSuccess: (_, variables) => {
      const updated = educations.filter(edu => edu.id !== variables.id);
      setEducations(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Education deleted");
    },
    onError: () => {
      toast.error("Failed to delete education");
    },
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
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate({ cvId, ...formData });
    }
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
    <Card className="p-5 sm:p-6 border border-neutral-200 bg-white rounded-2xl shadow-xs">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              Education
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Degrees, universities, and academic accomplishments
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
                <span>Add Degree</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="border border-neutral-200 max-w-xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-neutral-900">
                  {editingId ? "Edit Education" : "Add Education"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    School / University *
                  </Label>
                  <Input
                    value={formData.school}
                    onChange={e =>
                      setFormData({ ...formData, school: e.target.value })
                    }
                    placeholder="e.g. Stanford University or ITB"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Degree *
                    </Label>
                    <Input
                      value={formData.degree}
                      onChange={e =>
                        setFormData({ ...formData, degree: e.target.value })
                      }
                      placeholder="e.g. Bachelor of Science"
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Field of Study
                    </Label>
                    <Input
                      value={formData.field}
                      onChange={e =>
                        setFormData({ ...formData, field: e.target.value })
                      }
                      placeholder="e.g. Computer Science"
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Location
                    </Label>
                    <Input
                      value={formData.location}
                      onChange={e =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g. Stanford, CA"
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
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
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Honors & Activities
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g. GPA 3.9/4.0, Dean's List, Head of Robotics Society, published research..."
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl min-h-[90px] text-xs sm:text-sm leading-relaxed"
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
                      "Save Education"
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
                            Delete this education entry?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs text-neutral-600">
                            "{formData.degree}" at {formData.school} will be permanently removed.
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

        {educations.length > 0 ? (
          <DraggableList
            items={educations}
            onReorder={handleReorder}
            droppableId="education"
            renderItem={edu => (
              <div className="flex items-start justify-between gap-3 flex-1 min-w-0 py-1">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 text-sm leading-tight">
                    {formatEducationTitle(edu.degree, edu.field)}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                    {edu.school}
                    {edu.location ? ` • ${edu.location}` : ""}
                  </p>
                  {edu.graduationDate && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{fmtMonth(edu.graduationDate)}</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleEdit(edu)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex-shrink-0"
                  title="Edit education"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <GraduationCap className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-700">No education entries yet</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Add your university degrees, diplomas, or certifications.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
