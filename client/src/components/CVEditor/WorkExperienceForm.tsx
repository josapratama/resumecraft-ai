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
import { Trash2, Plus, Wand2, Pencil, MapPin, Calendar } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { WorkExperience } from "@/types/cv";
import { toast } from "sonner";
import DraggableList from "./DraggableList";

interface WorkExperienceFormProps {
  cvId: number;
  initialData: WorkExperience[];
  onDataChange?: (workExperiences: WorkExperience[]) => void;
}

/** Format "2026-01" → "Jan 2026", pass through anything else */
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
      toast.success("Text improved!");
    },
    onError: () => {
      setIsImprovingText(false);
      toast.error("Failed to improve text");
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
    <Card className="p-6 border border-black">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Work Experience</h3>
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
                  {editingId ? "Edit Work Experience" : "Add Work Experience"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                {/* Job title + Company */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Job Title *
                    </Label>
                    <Input
                      value={formData.jobTitle}
                      onChange={e =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      placeholder="e.g., Senior Engineer"
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Company *
                    </Label>
                    <Input
                      value={formData.company}
                      onChange={e =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="e.g., Tech Corp"
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </Label>
                  <Input
                    value={formData.location}
                    onChange={e =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., San Francisco, CA"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Start Date
                    </Label>
                    <Input
                      type="month"
                      value={formData.startDate}
                      onChange={e =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      End Date
                    </Label>
                    <Input
                      type="month"
                      value={formData.endDate}
                      onChange={e =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      disabled={isCurrent}
                      className="mt-1.5 border-gray-300 focus:border-black disabled:opacity-40 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                {/* Current role checkbox */}
                <div className="flex items-center gap-2.5 -mt-1">
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
                    className="text-sm text-gray-600 cursor-pointer font-normal"
                  >
                    I currently work here
                  </Label>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Description
                    </Label>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!formData.description.trim()) {
                            toast.error("Write a description first");
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
                        className="h-7 gap-1.5 text-xs border-gray-300"
                      >
                        {isImprovingText ? (
                          <Spinner className="w-3 h-3" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                        Improve
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
                    placeholder="Describe your key responsibilities and achievements..."
                    className="border-gray-300 focus:border-black min-h-[96px] resize-none"
                  />
                </div>

                {/* Action row */}
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
                            Delete this experience?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            "{formData.jobTitle}" at {formData.company} will be
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

        {/* List */}
        {experiences.length > 0 ? (
          <DraggableList
            items={experiences}
            onReorder={handleReorder}
            droppableId="work-experience"
            renderItem={exp => (
              <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-black text-sm leading-tight">
                      {exp.jobTitle}
                    </span>
                    {!exp.endDate && (
                      <Badge
                        variant="outline"
                        className="text-xs border-green-500 text-green-700 py-0"
                      >
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {fmtMonth(exp.startDate)} –{" "}
                      {exp.endDate ? fmtMonth(exp.endDate) : "Present"}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleEdit(exp)}
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
            <p className="text-sm text-gray-400">No work experience yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Click "Add" to get started
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
