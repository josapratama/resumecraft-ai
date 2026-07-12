import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

interface AIAssistantProps {
  cvId: number;
  onTextGenerated: (text: string) => void;
  type: "summary" | "description";
}

export default function AIAssistant({
  cvId,
  onTextGenerated,
  type,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [context, setContext] = useState("");

  const resetFields = () => {
    setJobTitle("");
    setCompany("");
    setContext("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Reset fields whenever the dialog closes (whether by generating or cancelling)
    if (!open) resetFields();
  };

  const generateSummaryMutation =
    trpc.cvAI.generateProfessionalSummary.useMutation({
      onSuccess: (data: any) => {
        const text =
          typeof data.summary === "string"
            ? data.summary
            : String(data.summary);
        onTextGenerated(text);
        setIsOpen(false);
      },
      onError: () => {
        toast.error("Failed to generate summary. Please try again.");
      },
    });

  const generateDescriptionMutation =
    trpc.cvAI.generateJobDescription.useMutation({
      onSuccess: (data: any) => {
        const text =
          typeof data.description === "string"
            ? data.description
            : String(data.description);
        onTextGenerated(text);
        setIsOpen(false);
      },
      onError: () => {
        toast.error("Failed to generate description. Please try again.");
      },
    });

  const handleGenerate = () => {
    if (type === "summary") {
      generateSummaryMutation.mutate({
        cvId,
        jobTitle,
        experience: context,
      });
    } else {
      generateDescriptionMutation.mutate({
        cvId,
        jobTitle,
        company,
        keyResponsibilities: context,
      });
    }
  };

  const isLoading =
    generateSummaryMutation.isPending || generateDescriptionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-black">
          <Wand2 className="w-4 h-4" />
          AI Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="border border-black">
        <DialogHeader>
          <DialogTitle>
            {type === "summary"
              ? "Generate Professional Summary"
              : "Generate Job Description"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-black font-semibold">Job Title</Label>
            <Input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="mt-2 border-black"
            />
          </div>

          {type === "description" && (
            <div>
              <Label className="text-black font-semibold">Company</Label>
              <Input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g., Tech Company Inc"
                className="mt-2 border-black"
              />
            </div>
          )}

          <div>
            <Label className="text-black font-semibold">
              {type === "summary"
                ? "Experience & Background"
                : "Key Responsibilities"}
            </Label>
            <Textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder={
                type === "summary"
                  ? "Describe your experience and background..."
                  : "List key responsibilities and achievements..."
              }
              className="mt-2 border-black min-h-24"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !jobTitle.trim()}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            {isLoading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Generating...
              </>
            ) : (
              "Generate with AI"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
