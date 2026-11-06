import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Trash2, Plus, Pencil, Wrench, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Skill } from "@/types/cv";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { formatProficiency, formatCategory } from "@/lib/cvFormatters";
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
  beginner: "bg-neutral-100 text-neutral-600 border-neutral-200",
  intermediate: "bg-blue-50 text-blue-700 border-blue-200",
  advanced: "bg-emerald-50 text-emerald-700 border-emerald-200",
  expert: "bg-purple-50 text-purple-700 border-purple-200",
};

type ProficiencyValue =
  | "none"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

const COMMON_CATEGORIES = [
  "Technical Skills",
  "Programming Languages",
  "Frameworks & Libraries",
  "Tools & Platforms",
  "Cloud & DevOps",
  "Leadership & Management",
  "Soft Skills",
];

export default function SkillsForm({
  cvId,
  initialData,
  onDataChange,
}: SkillsFormProps) {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [skills, setSkills] = useState(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    skillName: "",
    category: "Technical Skills",
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
    const reordered = newOrder.map(id => skills.find(e => e.id === id)!);
    setSkills(reordered);
    onDataChange?.(reordered);
    reorderMutation.mutate({ cvId, ids: newOrder });
  };

  const resetForm = () => {
    setFormData({ skillName: "", category: "Technical Skills", proficiency: "none" });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.skillName.trim() || !formData.category.trim()) {
      toast.error("Skill name and category are required");
      return;
    }
    const payload = {
      skillName: formData.skillName.trim(),
      category: formData.category.trim(),
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

  return (
    <Card className="p-5 sm:p-6 border border-neutral-200 bg-white rounded-2xl shadow-xs">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              {t("skills_section.title", "Skills & Competencies")}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {t("skills_section.subtitle", "Highlight key technologies, tools, and professional strengths")}
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
                <span>{t("skills_section.add_skill", "Add Skill")}</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="border border-neutral-200 max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-neutral-900">
                  {editingId ? t("skills_section.edit_skill", "Edit Skill") : t("skills_section.add_skill", "Add Skill")}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    {t("skills_section.skill_name", "Skill Name")} *
                  </Label>
                  <Input
                    value={formData.skillName}
                    onChange={e =>
                      setFormData({ ...formData, skillName: e.target.value })
                    }
                    placeholder="e.g. React.js, Kubernetes, System Design"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    autoFocus
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    {t("skills_section.category", "Category")} *
                  </Label>
                  <Input
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g. Programming, Tools, Cloud"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  />
                  {/* Quick category pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {COMMON_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                          formData.category === cat
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        {formatCategory(cat, t)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    {t("skills_section.proficiency", "Proficiency (Optional)")}
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
                    <SelectTrigger className="mt-1.5 border-neutral-200 rounded-xl">
                      <SelectValue placeholder={t("skills_section.select_level", "Select level")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-neutral-200">
                      {PROFICIENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.value === "none" ? t("proficiency.none", opt.label) : formatProficiency(opt.value, t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      t("skills_section.save_skill", "Save Skill")
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
                            Delete "{formData.skillName}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs text-neutral-600">
                            This skill will be removed from your resume.
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

        {skills.length > 0 ? (
          <DraggableList
            items={skills}
            onReorder={handleReorder}
            droppableId="skills"
            renderItem={skill => (
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="font-bold text-neutral-900 text-sm">
                    {skill.skillName}
                  </span>
                  <span className="text-[11px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md font-medium">
                    {formatCategory(skill.category, t)}
                  </span>
                  {skill.proficiency && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] py-0 px-2 rounded-full capitalize font-semibold border ${
                        PROFICIENCY_COLORS[skill.proficiency] || "bg-neutral-50 text-neutral-600"
                      }`}
                    >
                      {formatProficiency(skill.proficiency, t)}
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={() => handleEdit(skill)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex-shrink-0"
                  title="Edit skill"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <Wrench className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-700">{t("skills_section.no_skills", "No skills added yet")}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {t("skills_section.no_skills_desc", "List your hard skills, tools, and technical proficiencies.")}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
