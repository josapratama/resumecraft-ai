import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Upload, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportResumeModal({
  isOpen,
  onClose,
}: ImportResumeModalProps) {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [rawText, setRawText] = useState("");
  const [cvTitle, setCvTitle] = useState("");
  const [parsedResult, setParsedResult] = useState<any | null>(null);

  const parseMutation = trpc.cvAI.parseResumeText.useMutation({
    onSuccess: data => {
      setParsedResult(data);
      setCvTitle(data.suggestedTitle || "Imported Professional CV");
      toast.success("Resume parsed successfully!");
    },
    onError: err => {
      toast.error(`Parsing failed: ${err.message}`);
    },
  });

  const createMutation = trpc.cvAI.createFromParsed.useMutation({
    onSuccess: newCV => {
      utils.cv.list.invalidate();
      toast.success("CV created from parsed resume!");
      onClose();
      navigate(`/cv/${newCV.id}`);
    },
    onError: err => {
      toast.error(`Failed to create CV: ${err.message}`);
    },
  });

  const handleParse = () => {
    if (!rawText.trim() || rawText.trim().length < 30) {
      toast.error("Please paste enough text from your resume (minimum 30 characters).");
      return;
    }
    parseMutation.mutate({ rawText: rawText.trim() });
  };

  const handleSave = () => {
    if (!parsedResult) return;
    createMutation.mutate({
      title: cvTitle.trim() || "Imported CV",
      template: "modern",
      parsedData: parsedResult,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Upload className="w-5 h-5 text-indigo-600" />
            AI Resume / CV Importer & Parser
          </DialogTitle>
        </DialogHeader>

        {!parsedResult ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">
              Skip typing manually! Paste your existing resume text, CV draft, or LinkedIn About & Experience sections below.
              Our AI parser will automatically extract your contact details, work history, education, skills, and projects into structured form fields.
            </p>

            <div className="space-y-2">
              <Label htmlFor="rawResume">Paste Resume / CV Content *</Label>
              <Textarea
                id="rawResume"
                placeholder="Copy and paste text from your PDF, Word document, or LinkedIn profile..."
                rows={12}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleParse}
                disabled={parseMutation.isPending}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {parseMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Parsing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Parse & Extract CV
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="cvTitle">Name this CV</Label>
              <Input
                id="cvTitle"
                value={cvTitle}
                onChange={e => setCvTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer CV"
              />
            </div>

            <div className="p-4 border rounded-xl bg-gray-50/70 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Successfully Extracted:
              </div>

              {parsedResult.personalInfo && (
                <div className="pl-6 border-l-2 border-emerald-500 space-y-1">
                  <p className="font-semibold text-gray-900">
                    {parsedResult.personalInfo.fullName}
                    {parsedResult.personalInfo.email && ` · ${parsedResult.personalInfo.email}`}
                    {parsedResult.personalInfo.location && ` · ${parsedResult.personalInfo.location}`}
                  </p>
                  {parsedResult.personalInfo.professionalSummary && (
                    <p className="text-gray-600 italic line-clamp-2">
                      &ldquo;{parsedResult.personalInfo.professionalSummary}&rdquo;
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <span className="font-semibold text-gray-700">
                    Work Experiences: {parsedResult.workExperiences?.length ?? 0}
                  </span>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600">
                    {parsedResult.workExperiences?.slice(0, 3).map((e: any, i: number) => (
                      <li key={i} className="truncate">
                        {e.jobTitle} at {e.company}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">
                    Education & Degrees: {parsedResult.educations?.length ?? 0}
                  </span>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5 text-gray-600">
                    {parsedResult.educations?.slice(0, 2).map((edu: any, i: number) => (
                      <li key={i} className="truncate">
                        {edu.degree} - {edu.school}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {parsedResult.skills && parsedResult.skills.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="font-semibold text-gray-700 block mb-1">
                    Skills ({parsedResult.skills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {parsedResult.skills.slice(0, 15).map((s: any, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-white border rounded text-[11px]">
                        {s.skillName}
                      </span>
                    ))}
                    {parsedResult.skills.length > 15 && (
                      <span className="text-[11px] text-gray-500 self-center">
                        +{parsedResult.skills.length - 15} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setParsedResult(null)}
              >
                ← Paste Different Text
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {createMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Creating CV...
                  </>
                ) : (
                  <>
                    Create & Edit CV <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

