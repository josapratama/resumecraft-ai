import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Trash2, Plus, Pencil, Award } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { CustomSection } from "@/types/cv";
import { toast } from "sonner";
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
      toast.success("Section item added!");
      resetForm();
    },
    onError: () => toast.error("Failed to add section item"),
  });

  const updateMutation = trpc.cv.customSections.update.useMutation({
    onSuccess: () => {
      const updated = sections.map(s =>
        s.id === editingId ? { ...s, ...formData } : s
      );
      setSections(updated);
      onDataChange?.(updated);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success("Section item updated!");
      resetForm();
    },
    onError: () => toast.error("Failed to update section item"),
  });

  const deleteMutation = trpc.cv.customSections.delete.useMutation({
    onSuccess: (_, variables) => {
      const updated = sections.filter(s => s.id !== variables.id);
      setSections(updated);
      onDataChange?.(updated);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success("Section item removed!");
    },
    onError: () => toast.error("Failed to remove section item"),
  });

  const reorderMutation = trpc.cv.customSections.reorder.useMutation({
    onError: () => {
      toast.error("Failed to save section order");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <Award className="w-5 h-5" /> Additional Sections
          </h2>
          <p className="text-sm text-gray-500">
            Awards, volunteer work, publications, or organizations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              size="sm"
              className="gap-2 bg-black text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Item" : "Add Section Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={val => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_PRESETS.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemTitle">Title / Award / Role *</Label>
                <Input
                  id="itemTitle"
                  placeholder="e.g. 1st Place National Hackathon, Volunteer Lead"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemSub">Issuer / Organization</Label>
                  <Input
                    id="itemSub"
                    placeholder="e.g. Google, Red Cross, IEEE"
                    value={formData.subtitle}
                    onChange={e =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemDate">Date / Year</Label>
                  <Input
                    id="itemDate"
                    placeholder="e.g. 2024, Aug 2023"
                    value={formData.date}
                    onChange={e =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemDesc">Description (Optional)</Label>
                <Textarea
                  id="itemDesc"
                  placeholder="Briefly describe the significance or key contributions..."
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
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
                  {editingId ? "Save Changes" : "Add Item"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sections.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">No custom items added yet</p>
          <p className="text-xs text-gray-400 mb-4">
            Highlight awards, volunteer work, publications, or campus organizations
          </p>
          <Button
            onClick={() => handleOpenDialog()}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </Card>
      ) : (
        <DraggableList
          items={sections}
          onReorder={handleReorder}
          droppableId="customSections"
          renderItem={item => (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {item.category}
                  </span>
                  <h4 className="font-semibold text-black text-sm">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.subtitle && `${item.subtitle} `}
                  {item.date && `· ${item.date}`}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenDialog(item)}
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
                      <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove &quot;{item.title}&quot;?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate({ id: item.id })}
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
