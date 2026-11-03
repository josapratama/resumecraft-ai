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
import { FileText, Copy, Check, Sparkles, Printer, ArrowLeft } from "lucide-react";
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
    toast.success("Cover letter copied to clipboard!");
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
      <DialogContent className="border border-neutral-200 sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-neutral-900">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>AI Cover Letter Generator</span>
          </DialogTitle>
        </DialogHeader>

        {!generatedLetter ? (
          <div className="space-y-4 pt-1">
            <p className="text-xs text-neutral-600 leading-relaxed">
              Generate an impactful, targeted cover letter based directly on your resume achievements and tailored specifically for the target employer.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Target Company *
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Tokopedia, Stripe, Google"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  autoFocus
                  required
                />
              </div>

              <div>
                <Label htmlFor="targetJob" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Job Position / Role *
                </Label>
                <Input
                  id="targetJob"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tone" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Tone of Voice
              </Label>
              <Select
                value={tone}
                onValueChange={(val: any) => setTone(val)}
              >
                <SelectTrigger id="tone" className="mt-1.5 border-neutral-200 rounded-xl">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-neutral-200">
                  <SelectItem value="professional" className="text-xs">Professional & Balanced</SelectItem>
                  <SelectItem value="confident" className="text-xs">Confident & Metric-Driven</SelectItem>
                  <SelectItem value="enthusiastic" className="text-xs">Enthusiastic & Passionate</SelectItem>
                  <SelectItem value="concise" className="text-xs">Concise & Direct (&lt; 250 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clJd" className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Key Requirements or Company Values (Optional)
              </Label>
              <Textarea
                id="clJd"
                placeholder="Paste key responsibilities or special requirements to tailor the pitch..."
                rows={4}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl text-xs sm:text-sm leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button variant="outline" onClick={onClose} className="border-neutral-200 text-xs rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-xs"
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
          <div className="space-y-4 pt-1">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-blue-900">Email Subject Line:</span>
              <p className="font-mono text-neutral-800">{generatedLetter.subject}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Cover Letter Content (Editable)
              </Label>
              <Textarea
                value={generatedLetter.coverLetter}
                onChange={e =>
                  setGeneratedLetter({
                    ...generatedLetter,
                    coverLetter: e.target.value,
                  })
                }
                rows={12}
                className="border-neutral-200 focus:border-neutral-900 rounded-xl font-serif leading-relaxed text-xs sm:text-sm text-neutral-800 p-4"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGeneratedLetter(null)}
                className="text-xs text-neutral-500 hover:text-neutral-900"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Generate Again
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="border-neutral-200 text-xs rounded-xl gap-1.5 h-8 px-3"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 text-xs rounded-xl gap-1.5 h-8 px-3.5 font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Letter</span>
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
