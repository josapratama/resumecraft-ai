import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Trash2, Plus, Pencil, Layers, Calendar } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { CustomSection } from "@/types/cv";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import DraggableList from "./DraggableList";

interface CustomSectionsFormProps {
  cvId: number;
  initialData?: CustomSection[];
  onDataChange?: (sections: CustomSection[]) => void;
}

const CATEGORY_PRESETS = [
  "Awards & Honors",
  "Volunteer Experience",
  "Leadership & Organizations",
  "Publications & Research",
  "Speaking & Conferences",
  "Other Activities",
];

export default function CustomSectionsForm({
  cvId,
  initialData = [],
  onDataChange,
}: CustomSectionsFormProps) {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [sections, setSections] = useState<CustomSection[]>(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "Awards & Honors",
    title: "",
    subtitle: "",
    date: "",
    description: "",
  });

  const createMutation = trpc.cv.customSections.create.useMutation({
    onSuccess: newItem => {
      const updated = [...sections, newItem as unknown as CustomSection];
      setSections(updated);
      onDataChange?.(updated);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success("Item added!");
      resetForm();
    },
    onError: () => toast.error("Failed to add item"),
  });

  const updateMutation = trpc.cv.customSections.update.useMutation({
    onSuccess: () => {
      const updated = sections.map(s =>
        s.id === editingId ? { ...s, ...formData } : s
      );
      setSections(updated);
      onDataChange?.(updated);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success("Item updated!");
      resetForm();
    },
    onError: () => toast.error("Failed to update item"),
  });

  const deleteMutation = trpc.cv.customSections.delete.useMutation({
    onSuccess: (_, variables) => {
      const updated = sections.filter(s => s.id !== variables.id);
      setSections(updated);
      onDataChange?.(updated);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success("Item removed!");
    },
    onError: () => toast.error("Failed to remove item"),
  });

  const reorderMutation = trpc.cv.customSections.reorder.useMutation({
    onError: () => {
      toast.error("Failed to save order");
      utils.cv.loadFull.invalidate({ cvId });
    },
  });

  const resetForm = () => {
    setFormData({
      category: "Awards & Honors",
      title: "",
      subtitle: "",
      date: "",
      description: "",
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = (item?: CustomSection) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        category: item.category || "Awards & Honors",
        title: item.title,
        subtitle: item.subtitle || "",
        date: item.date || "",
        description: item.description || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
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
      .map(id => sections.find(s => s.id === id))
      .filter(Boolean) as CustomSection[];
    setSections(reordered);
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
              {t("custom_section.title", "Additional Sections")}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {t("custom_section.subtitle", "Awards, volunteer work, research publications, or speaking engagements")}
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
                <span>{t("custom_section.add_section", "Add Item")}</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="border border-neutral-200 sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-neutral-900">
                  {editingId ? t("custom_section.edit_section", "Edit Section Item") : t("custom_section.add_section", "Add Section Item")}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                <div>
                  <Label htmlFor="category" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={val => setFormData({ ...formData, category: val })}
                  >
                    <SelectTrigger id="category" className="mt-1.5 border-neutral-200 rounded-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-neutral-200">
                      {CATEGORY_PRESETS.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-xs">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="itemTitle" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Title / Award / Role *
                  </Label>
                  <Input
                    id="itemTitle"
                    placeholder="e.g. 1st Place National Hackathon or Volunteer Team Lead"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemSub" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Issuer / Organization
                    </Label>
                    <Input
                      id="itemSub"
                      placeholder="e.g. Google, IEEE, Red Cross"
                      value={formData.subtitle}
                      onChange={e =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemDate" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Date / Year
                    </Label>
                    <Input
                      id="itemDate"
                      placeholder="e.g. 2024, Aug 2023"
                      value={formData.date}
                      onChange={e =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="itemDesc" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Description / Impact (Optional)
                  </Label>
                  <Textarea
                    id="itemDesc"
                    placeholder="Briefly describe the significance, competition scale, or key contributions..."
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl min-h-[80px] text-xs sm:text-sm leading-relaxed"
                  />
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
                    {editingId ? "Save Changes" : "Add Item"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <Layers className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-700">{t("custom_section.no_sections", "No additional sections added yet")}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {t("custom_section.no_sections_desc", "Customize your CV with volunteering, publications, or custom achievements.")}
            </p>
          </div>
        ) : (
          <DraggableList
            items={sections}
            onReorder={handleReorder}
            droppableId="custom-sections"
            renderItem={item => (
              <div className="flex items-start justify-between gap-3 flex-1 min-w-0 py-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-neutral-900 text-sm leading-tight">
                      {item.title}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-2 font-medium border-neutral-200 text-neutral-600 bg-neutral-50">
                      {item.category}
                    </Badge>
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                      {item.subtitle}
                    </p>
                  )}
                  {item.date && (
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(item)}
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
                          Delete Section Item?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-neutral-600">
                          Are you sure you want to remove "{item.title}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex justify-end gap-2 pt-2">
                        <AlertDialogCancel className="border-neutral-200 text-xs font-semibold">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate({ id: item.id })}
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
