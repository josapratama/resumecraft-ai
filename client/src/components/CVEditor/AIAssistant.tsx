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
import { Wand2, Sparkles } from "lucide-react";
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
        toast.success("Professional summary generated!");
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
        toast.success("Job description generated!");
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
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-xs h-7 px-2.5 rounded-lg font-medium"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>AI Generate</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="border border-neutral-200 max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {type === "summary"
                ? "Generate Professional Summary"
                : "Generate Job Responsibilities"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div>
            <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Target Role / Job Title *
            </Label>
            <Input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
              autoFocus
            />
          </div>

          {type === "description" && (
            <div>
              <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Company Name
              </Label>
              <Input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Stripe, Tokopedia, Google"
                className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
              />
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              {type === "summary"
                ? "Key Background & Expertise (Keywords or brief notes)"
                : "Key Projects or Daily Duties"}
            </Label>
            <Textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder={
                type === "summary"
                  ? "e.g. 7 years in fintech, led migration to microservices, AWS certified..."
                  : "e.g. built payment gateway, reduced latency by 30%, mentored juniors..."
              }
              className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl min-h-24 text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !jobTitle.trim()}
            className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl h-10 font-semibold text-xs sm:text-sm shadow-xs"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
                <span>Crafting with AI...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Content</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
