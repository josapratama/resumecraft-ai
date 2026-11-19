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
import {
  HelpCircle,
  Sparkles,
  MessageCircle,
  Code,
  Briefcase,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Award,
  PenLine,
} from "lucide-react";
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

interface EvaluationResult {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  enhancedAnswer: string;
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

  // Practice Simulator State
  const [practiceQuestion, setPracticeQuestion] = useState(
    "Ceritakan tentang diri Anda dan mengapa Anda tertarik dengan posisi ini?"
  );
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const generateMutation = trpc.cvAI.generateInterviewPrep.useMutation({
    onSuccess: data => {
      setResult(data as unknown as InterviewResult);
      toast.success("Interview questions & coaching points generated!");
    },
    onError: err => {
      toast.error(`Generation failed: ${err.message}`);
    },
  });

  const evaluateMutation = trpc.cvAI.evaluateMockInterviewAnswer.useMutation({
    onSuccess: (data: any) => {
      setEvaluation(data as EvaluationResult);
      toast.success("Evaluasi jawaban wawancara selesai!");
    },
    onError: (err: any) => {
      toast.error(`Evaluasi gagal: ${err.message}`);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      cvId,
      targetRole: targetRole.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
    });
  };

  const handleStartPractice = (q: string) => {
    setPracticeQuestion(q);
    setActiveTab("practice");
  };

  const handleEvaluate = () => {
    if (!userAnswer.trim() || userAnswer.trim().length < 10) {
      toast.error("Tuliskan jawaban Anda terlebih dahulu (minimal 10 karakter).");
      return;
    }
    evaluateMutation.mutate({
      question: practiceQuestion,
      userAnswer: userAnswer.trim(),
      targetRole: targetRole || undefined,
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
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="behavioral" className="gap-1.5 text-xs">
                  <MessageCircle className="w-3.5 h-3.5" /> Behavioral (STAR)
                </TabsTrigger>
                <TabsTrigger value="technical" className="gap-1.5 text-xs">
                  <Code className="w-3.5 h-3.5" /> Technical
                </TabsTrigger>
                <TabsTrigger value="situational" className="gap-1.5 text-xs">
                  <Briefcase className="w-3.5 h-3.5" /> Situational
                </TabsTrigger>
                <TabsTrigger value="practice" className="gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50/70 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  <PenLine className="w-3.5 h-3.5" /> Simulasi Latihan
                </TabsTrigger>
              </TabsList>

              {/* Behavioral Questions */}
              <TabsContent value="behavioral" className="space-y-4 pt-4">
                {result.behavioral?.map((item, i) => (
                  <div key={i} className="p-4 border rounded-xl bg-gray-50/50 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-gray-900 text-sm flex items-start gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        <span>{item.question}</span>
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartPractice(item.question)}
                        className="text-xs h-7 px-2.5 rounded-lg border-purple-200 text-purple-700 hover:bg-purple-50 shrink-0"
                      >
                        <PenLine className="w-3 h-3 mr-1" /> Latih Jawaban
                      </Button>
                    </div>
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
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-gray-900 text-sm flex items-start gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        <span>{item.question}</span>
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartPractice(item.question)}
                        className="text-xs h-7 px-2.5 rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 shrink-0"
                      >
                        <PenLine className="w-3 h-3 mr-1" /> Latih Jawaban
                      </Button>
                    </div>
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
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-gray-900 text-sm flex items-start gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        <span>{item.question}</span>
                      </h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartPractice(item.question)}
                        className="text-xs h-7 px-2.5 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 shrink-0"
                      >
                        <PenLine className="w-3 h-3 mr-1" /> Latih Jawaban
                      </Button>
                    </div>
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

              {/* Interactive Mock Interview Practice Tab */}
              <TabsContent value="practice" className="space-y-4 pt-4">
                <div className="p-4 border border-purple-200 rounded-2xl bg-purple-50/40 space-y-3.5">
                  <div>
                    <Label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Pertanyaan yang Sedang Dilatih
                    </Label>
                    <Input
                      value={practiceQuestion}
                      onChange={e => setPracticeQuestion(e.target.value)}
                      placeholder="Masukkan pertanyaan wawancara kerja..."
                      className="mt-1 bg-white border-neutral-300 font-medium text-xs rounded-xl"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                        Draft Jawaban Anda
                      </Label>
                      <span className="text-[11px] text-neutral-400">
                        Ketik apa yang akan Anda katakan secara jujur
                      </span>
                    </div>
                    <Textarea
                      rows={5}
                      value={userAnswer}
                      onChange={e => setUserAnswer(e.target.value)}
                      placeholder="Contoh: Selama 2 tahun terakhir, saya memimpin proyek peningkatan efisiensi data... Saya menggunakan metode STAR dengan situasi..."
                      className="bg-white border-neutral-300 text-xs rounded-xl leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleEvaluate}
                      disabled={evaluateMutation.isPending}
                      className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold h-8 px-4"
                    >
                      {evaluateMutation.isPending ? (
                        <>
                          <Spinner className="w-3.5 h-3.5" /> Mengevaluasi Jawaban...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Uji & Evaluasi Jawaban Saya
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Evaluation Results */}
                {evaluation && (
                  <div className="p-5 border border-neutral-200 rounded-2xl bg-white space-y-4 shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-neutral-900">{evaluation.score}</span>
                          <span className="text-xs text-neutral-400 font-semibold">/ 100 Skor Kesiapan</span>
                        </div>
                        <p className="text-xs font-bold text-purple-700 mt-0.5">{evaluation.verdict}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1.5">
                        <h6 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kelebihan Jawaban
                        </h6>
                        <ul className="text-xs text-emerald-800 space-y-1">
                          {evaluation.strengths.map((s, idx) => (
                            <li key={idx}>• {s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl space-y-1.5">
                        <h6 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Saran Penyempurnaan
                        </h6>
                        <ul className="text-xs text-amber-800 space-y-1">
                          {evaluation.improvements.map((imp, idx) => (
                            <li key={idx}>• {imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3.5 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-xl space-y-1.5">
                      <h6 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Rekomendasi Jawaban Sempurna (Formula STAR)
                      </h6>
                      <p className="text-xs text-neutral-200 leading-relaxed whitespace-pre-line font-serif italic">
                        "{evaluation.enhancedAnswer}"
                      </p>
                    </div>
                  </div>
                )}
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

