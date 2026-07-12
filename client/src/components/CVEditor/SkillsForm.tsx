import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Trash2, Plus, Pencil } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Skill } from "@/types/cv";
import { toast } from "sonner";
import DraggableList from "./DraggableList";

interface SkillsFormProps {
  cvId: number;
  initialData: Skill[];
  onDataChange?: (skills: Skill[]) => void;
}

const PROFICIENCY_OPTIONS = [
  { value: "none", label: "Not specified" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
] as const;

const PROFICIENCY_COLORS: Record<string, string> = {
  beginner: "bg-gray-100 text-gray-600",
  intermediate: "bg-blue-50 text-blue-700",
  advanced: "bg-green-50 text-green-700",
  expert: "bg-purple-50 text-purple-700",
};

type ProficiencyValue =
  | "none"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export default function SkillsForm({
  cvId,
  initialData,
  onDataChange,
}: SkillsFormProps) {
  const utils = trpc.useUtils();
  const [skills, setSkills] = useState(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    skillName: "",
    category: "",
    proficiency: "none" as ProficiencyValue,
  });

  const createMutation = trpc.cv.skill.create.useMutation({
    onSuccess: (result: any) => {
      const newSkill = Array.isArray(result) ? result[0] : result;
      const updated = [...skills, newSkill];
      setSkills(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Skill added");
    },
    onError: () => toast.error("Failed to add skill"),
  });

  const updateMutation = trpc.cv.skill.update.useMutation({
    onSuccess: (result: any, variables) => {
      const updated = skills.map(s =>
        s.id === variables.id ? { ...s, ...variables, ...(result ?? {}) } : s
      );
      setSkills(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Skill updated");
    },
    onError: () => toast.error("Failed to update skill"),
  });

  const deleteMutation = trpc.cv.skill.delete.useMutation({
    onSuccess: (_, v) => {
      const updated = skills.filter(s => s.id !== v.id);
      setSkills(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Skill deleted");
    },
    onError: () => toast.error("Failed to delete skill"),
  });

  const reorderMutation = trpc.cv.skill.reorder.useMutation({
    onSuccess: () => {},
    onError: () => {
      toast.error("Failed to update order");
      utils.cv.loadFull.invalidate();
    },
  });

  const handleReorder = (newOrder: number[]) => {
    const reordered = newOrder.map(id => skills.find(s => s.id === id)!);
    setSkills(reordered);
    onDataChange?.(reordered);
    reorderMutation.mutate({ cvId, ids: newOrder });
  };

  const resetForm = () => {
    setFormData({ skillName: "", category: "", proficiency: "none" });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.skillName.trim() || !formData.category.trim()) {
      toast.error("Skill name and category are required");
      return;
    }
    const payload = {
      skillName: formData.skillName,
      category: formData.category,
      ...(formData.proficiency !== "none"
        ? { proficiency: formData.proficiency }
        : {}),
    };
    if (editingId) updateMutation.mutate({ id: editingId, ...payload });
    else createMutation.mutate({ cvId, ...payload });
  };

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setFormData({
      skillName: skill.skillName,
      category: skill.category,
      proficiency: (skill.proficiency as ProficiencyValue) || "none",
    });
    setIsDialogOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Group skills by category for display
  const grouped = skills.reduce(
    (acc, skill) => {
      (acc[skill.category] = acc[skill.category] || []).push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  return (
    <Card className="p-6 border border-black">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Skills</h3>
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
            <DialogContent className="border border-black max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Skill" : "Add Skill"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Skill Name *
                  </Label>
                  <Input
                    value={formData.skillName}
                    onChange={e =>
                      setFormData({ ...formData, skillName: e.target.value })
                    }
                    placeholder="e.g., TypeScript, Leadership"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category *
                  </Label>
                  <Input
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Programming, Soft Skills"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Proficiency
                  </Label>
                  <Select
                    value={formData.proficiency}
                    onValueChange={val =>
                      setFormData({
                        ...formData,
                        proficiency: val as ProficiencyValue,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1.5 border-gray-300">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFICIENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                            Delete "{formData.skillName}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This skill will be permanently removed.
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

        {skills.length > 0 ? (
          <DraggableList
            items={skills}
            onReorder={handleReorder}
            droppableId="skills"
            renderItem={skill => (
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="font-medium text-black text-sm">
                    {skill.skillName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {skill.category}
                  </span>
                  {skill.proficiency && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${PROFICIENCY_COLORS[skill.proficiency] || "bg-gray-100 text-gray-600"}`}
                    >
                      {skill.proficiency}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => handleEdit(skill)}
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
            <p className="text-sm text-gray-400">No skills yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Click "Add" to get started
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
