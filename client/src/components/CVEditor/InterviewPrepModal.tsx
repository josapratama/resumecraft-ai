import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { HelpCircle, Sparkles, MessageCircle, Code, Briefcase, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface InterviewPrepModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

interface InterviewResult {
  behavioral: Array<{
    question: string;
    whyAsked: string;
    starApproach: string;
  }>;
  technical: Array<{
    question: string;
    whyAsked: string;
    keyPoints: string;
  }>;
  situational: Array<{
    question: string;
    scenario: string;
    idealResponse: string;
  }>;
}

export default function InterviewPrepModal({
  cvId,
  isOpen,
  onClose,
  defaultRole = "",
}: InterviewPrepModalProps) {
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [activeTab, setActiveTab] = useState("behavioral");

  const generateMutation = trpc.cvAI.generateInterviewPrep.useMutation({
    onSuccess: data => {
      setResult(data as unknown as InterviewResult);
      toast.success("Interview questions & coaching points generated!");
    },
    onError: err => {
      toast.error(`Generation failed: ${err.message}`);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      cvId,
      targetRole: targetRole.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <HelpCircle className="w-5 h-5 text-purple-600" />
            AI Interview Coach & Question Simulator
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">
              Anticipate questions recruiters and engineering managers will ask based directly on the achievements, projects, and technologies in your CV.
            </p>

            <div className="space-y-2">
              <Label htmlFor="targetRoleInt">Target Role / Interviewing For (Optional)</Label>
              <Input
                id="targetRoleInt"
                placeholder="e.g. Senior Frontend Engineer, Engineering Lead"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jdInt">Target Job Posting / Requirements (Optional)</Label>
              <Textarea
                id="jdInt"
                placeholder="Paste the job description if you want questions tailored to a specific company/role..."
                rows={5}
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
                className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {generateMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Interview Prep
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="behavioral" className="gap-2 text-xs">
                  <MessageCircle className="w-3.5 h-3.5" /> Behavioral (STAR)
                </TabsTrigger>
                <TabsTrigger value="technical" className="gap-2 text-xs">
                  <Code className="w-3.5 h-3.5" /> Technical / Skills
                </TabsTrigger>
                <TabsTrigger value="situational" className="gap-2 text-xs">
                  <Briefcase className="w-3.5 h-3.5" /> Situational Scenarios
                </TabsTrigger>
              </TabsList>

              {/* Behavioral Questions */}
              <TabsContent value="behavioral" className="space-y-4 pt-4">
                {result.behavioral?.map((item, i) => (
                  <div key={i} className="p-4 border rounded-xl bg-gray-50/50 space-y-2.5">
                    <h4 className="font-bold text-gray-900 text-sm flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <span>{item.question}</span>
                    </h4>
                    <div className="text-xs text-gray-600 pl-7 space-y-1.5">
                      <p>
                        <strong className="text-gray-900">Why Interviewers Ask:</strong> {item.whyAsked}
                      </p>
                      <div className="p-2.5 bg-purple-50/80 rounded-lg border border-purple-200/60 text-purple-950">
                        <strong className="block mb-1 text-purple-900 flex items-center gap-1 font-semibold">
                          <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
                          Recommended STAR Approach (from your CV):
                        </strong>
                        <p className="whitespace-pre-line leading-relaxed">{item.starApproach}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Technical Questions */}
              <TabsContent value="technical" className="space-y-4 pt-4">
                {result.technical?.map((item, i) => (
                  <div key={i} className="p-4 border rounded-xl bg-gray-50/50 space-y-2.5">
                    <h4 className="font-bold text-gray-900 text-sm flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <span>{item.question}</span>
                    </h4>
                    <div className="text-xs text-gray-600 pl-7 space-y-1.5">
                      <p>
                        <strong className="text-gray-900">Key Skill Tested:</strong> {item.whyAsked}
                      </p>
                      <div className="p-2.5 bg-blue-50/80 rounded-lg border border-blue-200/60 text-blue-950">
                        <strong className="block mb-1 text-blue-900 flex items-center gap-1 font-semibold">
                          <ChevronRight className="w-3.5 h-3.5 text-blue-600" /> Key Technical Concepts to Highlight:
                        </strong>
                        <p className="whitespace-pre-line leading-relaxed">{item.keyPoints}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Situational Questions */}
              <TabsContent value="situational" className="space-y-4 pt-4">
                {result.situational?.map((item, i) => (
                  <div key={i} className="p-4 border rounded-xl bg-gray-50/50 space-y-2.5">
                    <h4 className="font-bold text-gray-900 text-sm flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <span>{item.question}</span>
                    </h4>
                    <div className="text-xs text-gray-600 pl-7 space-y-1.5">
                      {item.scenario && (
                        <p>
                          <strong className="text-gray-900">Scenario Context:</strong> {item.scenario}
                        </p>
                      )}
                      <div className="p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-200/60 text-emerald-950">
                        <strong className="block mb-1 text-emerald-900 flex items-center gap-1 font-semibold">
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-600" /> Ideal Strategy:
                        </strong>
                        <p className="whitespace-pre-line leading-relaxed">{item.idealResponse}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResult(null)}
              >
                ← Prepare for Another Role
              </Button>
              <Button onClick={onClose} size="sm" className="bg-black text-white hover:bg-gray-800">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

