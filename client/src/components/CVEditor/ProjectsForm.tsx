import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { Trash2, Plus, Pencil, ExternalLink, FolderGit2 } from "lucide-react";
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
    <Card className="p-5 sm:p-6 border border-neutral-200 bg-white rounded-2xl shadow-xs">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              Projects & Portfolios
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Highlight side projects, open-source work, and key deliverables
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
                <span>Add Project</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="border border-neutral-200 max-w-xl rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-neutral-900">
                  {editingId ? "Edit Project" : "Add Project"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-1">
                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Project Name *
                  </Label>
                  <Input
                    value={formData.projectName}
                    onChange={e =>
                      setFormData({ ...formData, projectName: e.target.value })
                    }
                    placeholder="e.g. Distributed Task Queue Platform"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Description & Key Deliverables
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Built high-performance queue processing 10k jobs/sec with Kafka and Go..."
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl min-h-[90px] text-xs sm:text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Technologies Used (comma separated)
                  </Label>
                  <Input
                    value={formData.technologies}
                    onChange={e =>
                      setFormData({ ...formData, technologies: e.target.value })
                    }
                    placeholder="e.g. React, Node.js, PostgreSQL, Docker"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                    Project / Demo URL
                  </Label>
                  <Input
                    value={formData.link}
                    onChange={e =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="https://github.com/yourname/project"
                    className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  />
                </div>

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
                      className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                    />
                  </div>
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
                      "Save Project"
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
                            Delete "{formData.projectName}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-xs text-neutral-600">
                            This project will be permanently removed from your resume.
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

        {projects.length > 0 ? (
          <DraggableList
            items={projects}
            onReorder={handleReorder}
            droppableId="projects"
            renderItem={proj => (
              <div className="flex items-start justify-between gap-3 flex-1 min-w-0 py-1">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 text-sm leading-tight">
                    {proj.projectName}
                  </p>
                  {proj.description && (
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {proj.technologies
                        .split(",")
                        .slice(0, 5)
                        .map(t => (
                          <span
                            key={t.trim()}
                            className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {t.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1.5 font-medium"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {proj.link.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                    </a>
                  )}
                </div>

                <Button
                  onClick={() => handleEdit(proj)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg flex-shrink-0"
                  title="Edit project"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <FolderGit2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-700">No projects added yet</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Showcase projects, open-source repositories, or business ventures.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
