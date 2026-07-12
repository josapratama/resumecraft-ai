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
import { Trash2, Plus, Pencil, ExternalLink } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Project } from "@/types/cv";
import { toast } from "sonner";
import DraggableList from "./DraggableList";

interface ProjectsFormProps {
  cvId: number;
  initialData: Project[];
  onDataChange?: (projects: Project[]) => void;
}

export default function ProjectsForm({
  cvId,
  initialData,
  onDataChange,
}: ProjectsFormProps) {
  const utils = trpc.useUtils();
  const [projects, setProjects] = useState(initialData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    technologies: "",
    link: "",
    startDate: "",
    endDate: "",
  });

  const createMutation = trpc.cv.project.create.useMutation({
    onSuccess: (result: any) => {
      const newProject = Array.isArray(result) ? result[0] : result;
      const updated = [...projects, newProject];
      setProjects(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Project added");
    },
    onError: () => toast.error("Failed to add project"),
  });

  const updateMutation = trpc.cv.project.update.useMutation({
    onSuccess: (result: any, variables) => {
      const updated = projects.map(p =>
        p.id === variables.id ? { ...p, ...variables, ...(result ?? {}) } : p
      );
      setProjects(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Project updated");
    },
    onError: () => toast.error("Failed to update project"),
  });

  const deleteMutation = trpc.cv.project.delete.useMutation({
    onSuccess: (_, v) => {
      const updated = projects.filter(p => p.id !== v.id);
      setProjects(updated);
      onDataChange?.(updated);
      resetForm();
      setIsDialogOpen(false);
      toast.success("Project deleted");
    },
    onError: () => toast.error("Failed to delete project"),
  });

  const reorderMutation = trpc.cv.project.reorder.useMutation({
    onSuccess: () => {},
    onError: () => {
      toast.error("Failed to update order");
      utils.cv.loadFull.invalidate();
    },
  });

  const handleReorder = (newOrder: number[]) => {
    const reordered = newOrder.map(id => projects.find(p => p.id === id)!);
    setProjects(reordered);
    onDataChange?.(reordered);
    reorderMutation.mutate({ cvId, ids: newOrder });
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      description: "",
      technologies: "",
      link: "",
      startDate: "",
      endDate: "",
    });
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (editingId) updateMutation.mutate({ id: editingId, ...formData });
    else createMutation.mutate({ cvId, ...formData });
  };

  const handleEdit = (proj: Project) => {
    setEditingId(proj.id);
    setFormData({
      projectName: proj.projectName,
      description: proj.description || "",
      technologies: proj.technologies || "",
      link: proj.link || "",
      startDate: proj.startDate || "",
      endDate: proj.endDate || "",
    });
    setIsDialogOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="p-6 border border-black">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">Projects</h3>
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
                  {editingId ? "Edit Project" : "Add Project"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Project Name *
                  </Label>
                  <Input
                    value={formData.projectName}
                    onChange={e =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    placeholder="e.g., E-Commerce Platform"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="What did you build and what impact did it have?"
                    className="mt-1.5 border-gray-300 focus:border-black min-h-[80px] resize-none"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Technologies
                  </Label>
                  <Input
                    value={formData.technologies}
                    onChange={e =>
                      setFormData({ ...formData, technologies: e.target.value })
                    }
                    placeholder="React, Node.js, PostgreSQL (comma separated)"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Project Link
                  </Label>
                  <Input
                    value={formData.link}
                    onChange={e =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="mt-1.5 border-gray-300 focus:border-black"
                  />
                </div>
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
                      className="mt-1.5 border-gray-300 focus:border-black"
                    />
                  </div>
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
                            Delete "{formData.projectName}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This project will be permanently removed.
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

        {projects.length > 0 ? (
          <DraggableList
            items={projects}
            onReorder={handleReorder}
            droppableId="projects"
            renderItem={proj => (
              <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black text-sm leading-tight">
                    {proj.projectName}
                  </p>
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies
                        .split(",")
                        .slice(0, 4)
                        .map(t => (
                          <span
                            key={t.trim()}
                            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                          >
                            {t.trim()}
                          </span>
                        ))}
                      {proj.technologies.split(",").length > 4 && (
                        <span className="text-xs text-gray-400">
                          +{proj.technologies.split(",").length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-xs text-blue-500 hover:text-blue-700 mt-1"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {
                        proj.link
                          .replace(/^https?:\/\/(www\.)?/, "")
                          .split("/")[0]
                      }
                    </a>
                  )}
                </div>
                <Button
                  onClick={() => handleEdit(proj)}
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
            <p className="text-sm text-gray-400">No projects yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Click "Add" to get started
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
