import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FileText, Copy, Check, Sparkles, Printer } from "lucide-react";
import { toast } from "sonner";

interface CoverLetterModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

export default function CoverLetterModal({
  cvId,
  isOpen,
  onClose,
  defaultRole = "",
}: CoverLetterModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState(defaultRole);
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"professional" | "confident" | "enthusiastic" | "concise">("professional");
  const [generatedLetter, setGeneratedLetter] = useState<{ subject: string; coverLetter: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = trpc.cvAI.generateCoverLetter.useMutation({
    onSuccess: data => {
      setGeneratedLetter(data);
      toast.success("Cover letter generated!");
    },
    onError: err => {
      toast.error(`Generation failed: ${err.message}`);
    },
  });

  const handleGenerate = () => {
    if (!companyName.trim() || !jobTitle.trim()) {
      toast.error("Please provide both Company Name and Job Title.");
      return;
    }
    generateMutation.mutate({
      cvId,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim() || undefined,
      tone,
    });
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    const textToCopy = `Subject: ${generatedLetter.subject}\n\n${generatedLetter.coverLetter}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Cover Letter copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!generatedLetter) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter - ${companyName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; line-height: 1.6; color: #111; max-width: 700px; margin: 0 auto; font-size: 14px; }
            h2 { font-size: 16px; margin-bottom: 20px; color: #333; }
            p { margin-bottom: 16px; white-space: pre-line; }
          </style>
        </head>
        <body>
          <h2>Subject: ${generatedLetter.subject}</h2>
          <p>${generatedLetter.coverLetter}</p>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="w-5 h-5 text-blue-600" />
            AI Cover Letter Generator
          </DialogTitle>
        </DialogHeader>

        {!generatedLetter ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">
              Generate an impactful, targeted cover letter based directly on your CV achievements and tailored for the company and job role.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Target Company *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Tokopedia, GoTo, Google, Bank Mandiri"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetJob">Job Position *</Label>
                <Input
                  id="targetJob"
                  placeholder="e.g. Full Stack Developer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone of Voice</Label>
              <Select
                value={tone}
                onValueChange={(val: any) => setTone(val)}
              >
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Balanced</SelectItem>
                  <SelectItem value="confident">Confident & High-Impact</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic & Passionate</SelectItem>
                  <SelectItem value="concise">Concise & Direct (Under 250 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clJd">Job Requirements / Key Duties (Optional)</Label>
              <Textarea
                id="clJd"
                placeholder="Paste key responsibilities or values of the target role..."
                rows={4}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {generateMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Crafting Cover Letter...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Cover Letter
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-blue-900">Email Subject Line:</span>
              <p className="font-mono text-gray-800">{generatedLetter.subject}</p>
            </div>

            <div className="space-y-2">
              <Label>Cover Letter Content (Editable)</Label>
              <Textarea
                value={generatedLetter.coverLetter}
                onChange={e =>
                  setGeneratedLetter({
                    ...generatedLetter,
                    coverLetter: e.target.value,
                  })
                }
                rows={14}
                className="font-serif leading-relaxed text-sm text-gray-800"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGeneratedLetter(null)}
              >
                ← Generate Again
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5 bg-black text-white hover:bg-gray-800"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Letter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

