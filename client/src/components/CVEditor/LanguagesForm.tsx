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
import { Trash2, Plus, Pencil, Globe } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Language } from "@/types/cv";
import { toast } from "sonner";
import DraggableList from "./DraggableList";

interface LanguagesFormProps {
  cvId: number;
  initialData?: Language[];
  onDataChange?: (languages: Language[]) => void;
}

const PROFICIENCY_OPTIONS = [
  "Native / Bilingual",
  "Professional Working",
  "Full Professional",
  "Fluent",
  "Intermediate",
  "Elementary",
];

const COMMON_LANGUAGES = [
  "English",
  "Indonesian",
  "Mandarin Chinese",
  "Japanese",
  "Spanish",
  "German",
  "French",
  "Arabic",
];

export default function LanguagesForm({
  cvId,
  initialData = [],
  onDataChange,
}: LanguagesFormProps) {
  const utils = trpc.useUtils();
  const [languages, setLanguages] = useState<Language[]>(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    language: "",
    proficiency: "Professional Working",
  });

  const createMutation = trpc.cv.languages.create.useMutation({
    onSuccess: newLang => {
      const updated = [...languages, newLang as unknown as Language];
      setLanguages(updated);
      onDataChange?.(updated);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success("Language added!");
      resetForm();
    },
    onError: () => toast.error("Failed to add language"),
  });

  const updateMutation = trpc.cv.languages.update.useMutation({
    onSuccess: () => {
      const updated = languages.map(l =>
        l.id === editingId ? { ...l, ...formData } : l
      );
      setLanguages(updated);
      onDataChange?.(updated);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success("Language updated!");
      resetForm();
    },
    onError: () => toast.error("Failed to update language"),
  });

  const deleteMutation = trpc.cv.languages.delete.useMutation({
    onSuccess: (_, variables) => {
      const updated = languages.filter(l => l.id !== variables.id);
      setLanguages(updated);
      onDataChange?.(updated);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success("Language removed!");
    },
    onError: () => toast.error("Failed to remove language"),
  });

  const reorderMutation = trpc.cv.languages.reorder.useMutation({
    onError: () => {
      toast.error("Failed to save language order");
      utils.cv.loadFull.invalidate({ cvId });
    },
  });

  const resetForm = () => {
    setFormData({ language: "", proficiency: "Professional Working" });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (lang?: Language) => {
    if (lang) {
      setEditingId(lang.id);
      setFormData({
        language: lang.language,
        proficiency: lang.proficiency || "Professional Working",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.language.trim()) {
      toast.error("Language name is required");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate({ cvId, ...formData });
    }
  };

  const handleReorder = (newOrder: number[]) => {
    const reordered = newOrder
      .map(id => languages.find(l => l.id === id))
      .filter(Boolean) as Language[];
    setLanguages(reordered);
    onDataChange?.(reordered);
    reorderMutation.mutate({
      cvId,
      ids: newOrder,
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="p-5 sm:p-6 border border-neutral-200 bg-white rounded-2xl shadow-xs">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              Languages
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Languages you speak and your proficiency level
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold h-8 sm:h-9 px-3 shadow-xs"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Language</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="border border-neutral-200 sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-neutral-900">
                  {editingId ? "Edit Language" : "Add Language"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                <div>
                  <Label htmlFor="langName" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Language *
                  </Label>
                  <Input
                    id="langName"
                    placeholder="e.g. English, Indonesian, Japanese"
                    value={formData.language}
                    onChange={e =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    autoFocus
                    required
                  />

                  {/* Quick language suggestions */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {COMMON_LANGUAGES.map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, language: l }))}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                          formData.language === l
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="langProf" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Proficiency Level
                  </Label>
                  <Select
                    value={formData.proficiency}
                    onValueChange={val =>
                      setFormData({ ...formData, proficiency: val })
                    }
                  >
                    <SelectTrigger id="langProf" className="mt-1.5 border-neutral-200 rounded-xl">
                      <SelectValue placeholder="Select proficiency" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-neutral-200">
                      {PROFICIENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt} className="text-xs">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSaving}
                    className="border-neutral-200 text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-semibold text-xs h-9"
                  >
                    {isSaving && <Spinner className="w-4 h-4 mr-2" />}
                    {editingId ? "Save Changes" : "Add Language"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {languages.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <Globe className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-700">No languages added yet</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Highlight your spoken and written language competencies for global roles.
            </p>
          </div>
        ) : (
          <DraggableList
            items={languages}
            onReorder={handleReorder}
            droppableId="languages"
            renderItem={lang => (
              <div className="flex items-center justify-between gap-3 flex-1 min-w-0 py-1">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="font-bold text-neutral-900 text-sm">
                    {lang.language}
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 px-2 font-medium border-neutral-200 text-neutral-600 bg-neutral-50">
                    {lang.proficiency}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(lang)}
                    className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex-shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border border-neutral-200 rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-bold text-neutral-900">
                          Delete Language?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-neutral-600">
                          Are you sure you want to remove {lang.language}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex justify-end gap-2 pt-2">
                        <AlertDialogCancel className="border-neutral-200 text-xs font-semibold">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate({ id: lang.id })}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </Card>
  );
}
