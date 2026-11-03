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
  "Fluent",
  "Intermediate",
  "Elementary",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Globe className="w-5 h-5" /> Languages
          </h2>
          <p className="text-sm text-gray-500">
            Languages you speak and your proficiency level
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              size="sm"
              className="gap-2 bg-black text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" /> Add Language
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Language" : "Add Language"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="langName">Language Name *</Label>
                <Input
                  id="langName"
                  placeholder="e.g. English, Indonesian, Japanese"
                  value={formData.language}
                  onChange={e =>
                    setFormData({ ...formData, language: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="langProf">Proficiency Level</Label>
                <Select
                  value={formData.proficiency}
                  onValueChange={val =>
                    setFormData({ ...formData, proficiency: val })
                  }
                >
                  <SelectTrigger id="langProf">
                    <SelectValue placeholder="Select proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-black text-white hover:bg-gray-800"
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
        <Card className="p-8 text-center border-dashed">
          <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">No languages added yet</p>
          <p className="text-xs text-gray-400 mb-4">
            Showcase your linguistic capabilities to prospective employers
          </p>
          <Button
            onClick={() => handleOpenDialog()}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add Language
          </Button>
        </Card>
      ) : (
        <DraggableList
          items={languages}
          onReorder={handleReorder}
          droppableId="languages"
          renderItem={lang => (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <div>
                <h4 className="font-semibold text-black text-sm">
                  {lang.language}
                </h4>
                <p className="text-xs text-gray-500">{lang.proficiency}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(lang)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="w-3.5 h-3.5 text-gray-600" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Language?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {lang.language}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate({ id: lang.id })}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
