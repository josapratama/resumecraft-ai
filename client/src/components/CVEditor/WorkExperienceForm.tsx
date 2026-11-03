import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import AIAssistant from "./AIAssistant";
import { Trash2, Plus, Wand2, Pencil, MapPin, Calendar, Briefcase } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { WorkExperience } from "@/types/cv";
import { toast } from "sonner";
import DraggableList from "./DraggableList";

interface WorkExperienceFormProps {
  cvId: number;
  initialData: WorkExperience[];
  onDataChange?: (workExperiences: WorkExperience[]) => void;
}

/** Format "2026-01" -> "Jan 2026", pass through anything else */
function fmtMonth(val: string | null | undefined): string {
  if (!val) return "";
  const [year, month] = val.split("-");
  if (!year || !month) return val;
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export default function WorkExperienceForm({
  cvId,
  initialData,
  onDataChange,
}: WorkExperienceFormProps) {
  const utils = trpc.useUtils();
  const [experiences, setExperiences] = useState(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImprovingText, setIsImprovingText] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const improveTextMutation = trpc.cvAI.improveText.useMutation({
    onSuccess: (data: any) => {
      const improved =
        typeof data.improvedText === "string"
          ? data.improvedText
          : String(data.improvedText);
      setFormData(prev => ({ ...prev, description: improved }));
      setIsImprovingText(false);
      toast.success("Description enhanced with AI!");
    },
    onError: () => {
      setIsImprovingText(false);
      toast.error("Failed to improve description");
    },
  });

  const createMutation = trpc.cv.workExperience.create.useMutation({
    onSuccess: (result: any) => {
      const newExp = Array.isArray(result) ? result[0] : result;
      const updated = [...experiences, newExp];
      setExperiences(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Work experience added");
    },
    onError: () => {
      toast.error("Failed to add work experience");
    },
  });

  const updateMutation = trpc.cv.workExperience.update.useMutation({
    onSuccess: (result: any, variables) => {
      const serverData = result ?? {};
      const updated = experiences.map(exp =>
        exp.id === variables.id ? { ...exp, ...variables, ...serverData } : exp
      );
      setExperiences(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Work experience updated");
    },
    onError: () => {
      toast.error("Failed to update work experience");
    },
  });

  const deleteMutation = trpc.cv.workExperience.delete.useMutation({
    onSuccess: (_, variables) => {
      const updated = experiences.filter(exp => exp.id !== variables.id);
      setExperiences(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Work experience deleted");
    },
    onError: () => {
      toast.error("Failed to delete work experience");
    },
  });

  const reorderMutation = trpc.cv.workExperience.reorder.useMutation({
    onSuccess: () => {},
    onError: () => {
      toast.error("Failed to update order");
      utils.cv.loadFull.invalidate();
    },
  });

  const handleReorder = (newOrder: number[]) => {
    const reordered = newOrder.map(id => experiences.find(e => e.id === id)!);
    setExperiences(reordered);
    onDataChange?.(reordered);
    reorderMutation.mutate({ cvId, ids: newOrder });
  };

  const resetForm = () => {
    setFormData({
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    setEditingId(null);
    setIsCurrent(false);
  };

  const handleSave = () => {
    if (!formData.jobTitle.trim() || !formData.company.trim()) {
      toast.error("Job title and company are required");
      return;
    }
    const payload = { ...formData, endDate: isCurrent ? "" : formData.endDate };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate({ cvId, ...payload });
    }
  };

  const handleEdit = (exp: WorkExperience) => {
    setEditingId(exp.id);
    setIsCurrent(!exp.endDate);
    setFormData({
      jobTitle: exp.jobTitle,
      company: exp.company,
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      description: exp.description || "",
    });
    setIsDialogOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="p-5 sm:p-6 border border-neutral-200 bg-white rounded-2xl shadow-xs">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              Work Experience
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Drag to reorder your career history chronologically
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
                <span>Add Role</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="border border-neutral-200 max-w-xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-neutral-900">
                  {editingId ? "Edit Work Experience" : "Add Work Experience"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                {/* Job title + Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Job Title *
                    </Label>
                    <Input
                      value={formData.jobTitle}
                      onChange={e =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      placeholder="e.g. Senior Backend Engineer"
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Company *
                    </Label>
                    <Input
                      value={formData.company}
                      onChange={e =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="e.g. Acme Corporation"
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Location
                  </Label>
                  <Input
                    value={formData.location}
                    onChange={e =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g. San Francisco, CA (or Remote)"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Start Date
                    </Label>
                    <Input
                      type="month"
                      value={formData.startDate}
                      onChange={e =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      End Date
                    </Label>
                    <Input
                      type="month"
                      value={formData.endDate}
                      onChange={e =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      disabled={isCurrent}
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl disabled:opacity-40 disabled:bg-neutral-50"
                    />
                  </div>
                </div>

                {/* Current role checkbox */}
                <div className="flex items-center gap-2 -mt-1">
                  <Checkbox
                    id="current-role"
                    checked={isCurrent}
                    onCheckedChange={checked => {
                      setIsCurrent(!!checked);
                      if (checked)
                        setFormData(prev => ({ ...prev, endDate: "" }));
                    }}
                  />
                  <Label
                    htmlFor="current-role"
                    className="text-xs text-neutral-600 cursor-pointer font-medium"
                  >
                    I currently work in this role
                  </Label>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Key Responsibilities & Achievements
                    </Label>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!formData.description.trim()) {
                            toast.error("Write a description first before improving");
                            return;
                          }
                          setIsImprovingText(true);
                          improveTextMutation.mutate({
                            cvId,
                            text: formData.description,
                            context: "description",
                          });
                        }}
                        disabled={
                          isImprovingText || !formData.description.trim()
                        }
                        className="h-7 gap-1.5 text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-100 rounded-lg px-2"
                      >
                        {isImprovingText ? (
                          <Spinner className="w-3 h-3" />
                        ) : (
                          <Wand2 className="w-3 h-3 text-indigo-600" />
                        )}
                        <span>Improve</span>
                      </Button>
                      <AIAssistant
                        cvId={cvId}
                        type="description"
                        onTextGenerated={text =>
                          setFormData(prev => ({ ...prev, description: text }))
                        }
                      />
                    </div>
                  </div>
                  <Textarea
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="• Spearheaded the migration to microservices, reducing p99 latency by 42%&#10;• Mentored 5 junior engineers and established automated CI/CD pipelines"
                    className="border-neutral-200 focus:border-neutral-900 rounded-xl min-h-[110px] text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                {/* Action row */}
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
                      "Save Experience"
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
                            Delete this experience?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs text-neutral-600">
                            "{formData.jobTitle}" at {formData.company} will be permanently removed.
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

        {/* List */}
        {experiences.length > 0 ? (
          <DraggableList
            items={experiences}
            onReorder={handleReorder}
            droppableId="work-experience"
            renderItem={exp => (
              <div className="flex items-start justify-between gap-3 flex-1 min-w-0 py-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-neutral-900 text-sm leading-tight">
                      {exp.jobTitle}
                    </span>
                    {!exp.endDate && (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 border-emerald-300 text-emerald-700 bg-emerald-50 font-semibold"
                      >
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                    {exp.company}
                    {exp.location ? ` • ${exp.location}` : ""}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {fmtMonth(exp.startDate)} - {exp.endDate ? fmtMonth(exp.endDate) : "Present"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(exp)}
                  className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex-shrink-0"
                  title="Edit this role"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <Briefcase className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-700">No work experience added yet</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Add your past roles and achievements to boost your ATS match score.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
