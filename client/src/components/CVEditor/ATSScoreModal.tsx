import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface ATSScoreModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

interface ATSResult {
  overallScore: number;
  summaryRating: string;
  breakdown: {
    hardSkills: number;
    experienceMatch: number;
    structureAndFormat: number;
    keywordDensity: number;
  };
  matchingKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  criticalGaps: string[];
  recommendations: string[];
}

export default function ATSScoreModal({
  cvId,
  isOpen,
  onClose,
  defaultRole = "",
}: ATSScoreModalProps) {
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);

  const analyzeMutation = trpc.cvAI.analyzeATS.useMutation({
    onSuccess: data => {
      setResult(data as unknown as ATSResult);
      toast.success("ATS Compatibility analysis complete!");
    },
    onError: err => {
      toast.error(`Analysis failed: ${err.message}`);
    },
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 20) {
      toast.error("Please paste a meaningful Job Description (minimum 20 characters).");
      return;
    }
    analyzeMutation.mutate({
      cvId,
      jobDescription: jobDescription.trim(),
      targetRole: targetRole.trim() || undefined,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 border-emerald-600 bg-emerald-50";
    if (score >= 60) return "text-amber-600 border-amber-600 bg-amber-50";
    return "text-red-600 border-red-600 bg-red-50";
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Target className="w-5 h-5 text-indigo-600" />
            AI ATS Compatibility & Job Matcher
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">
              Paste the vacancy or Job Description (JD) you want to target.
              The AI will parse required skills, quantify keyword overlap, and calculate your exact ATS screening score.
            </p>

            <div className="space-y-2">
              <Label htmlFor="targetRole">Target Job Title (Optional)</Label>
              <Input
                id="targetRole"
                placeholder="e.g. Senior Frontend Engineer / Product Manager"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jd">Job Description / Requirements *</Label>
              <Textarea
                id="jd"
                placeholder="Paste the full job posting requirements and responsibilities here..."
                rows={8}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Analyzing CV vs Job...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Calculate ATS Score
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Overall Score Banner */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl border bg-gray-50">
              <div
                className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-bold flex-shrink-0 ${getScoreColor(
                  result.overallScore
                )}`}
              >
                <span className="text-3xl leading-none">{result.overallScore}%</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold">
                  Match
                </span>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-gray-900 text-lg">
                  {result.overallScore >= 80
                    ? "🎉 Excellent ATS Compatibility!"
                    : result.overallScore >= 60
                    ? "⚖️ Moderate Match — Needs Key Improvements"
                    : "⚠️ Low Match — Critical Keywords Missing"}
                </h4>
                <p className="text-sm text-gray-600">{result.summaryRating}</p>
              </div>
            </div>

            {/* Subscores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg bg-white space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600">Hard Skills & Tools</span>
                  <span>{result.breakdown?.hardSkills ?? 0}%</span>
                </div>
                <Progress value={result.breakdown?.hardSkills ?? 0} />
              </div>
              <div className="p-3 border rounded-lg bg-white space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600">Experience Relevance</span>
                  <span>{result.breakdown?.experienceMatch ?? 0}%</span>
                </div>
                <Progress value={result.breakdown?.experienceMatch ?? 0} />
              </div>
              <div className="p-3 border rounded-lg bg-white space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600">Structure & Section Format</span>
                  <span>{result.breakdown?.structureAndFormat ?? 0}%</span>
                </div>
                <Progress value={result.breakdown?.structureAndFormat ?? 0} />
              </div>
              <div className="p-3 border rounded-lg bg-white space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600">Keyword Density</span>
                  <span>{result.breakdown?.keywordDensity ?? 0}%</span>
                </div>
                <Progress value={result.breakdown?.keywordDensity ?? 0} />
              </div>
            </div>

            {/* Keyword Pills */}
            <div className="space-y-3">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Matched Keywords in CV
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingKeywords?.map(kw => (
                    <span
                      key={kw}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                  {(!result.matchingKeywords || result.matchingKeywords.length === 0) && (
                    <span className="text-xs text-gray-400">None detected</span>
                  )}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Missing Keywords from Job Description
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords?.map(kw => (
                    <span
                      key={kw}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 font-medium"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-600" /> Actionable Recommendations to Pass ATS
                </h5>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResult(null)}
              >
                Analyze Another Job
              </Button>
              <Button onClick={onClose} size="sm" className="bg-black text-white hover:bg-gray-800">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

