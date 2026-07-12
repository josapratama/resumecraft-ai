import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Wand2, Circle } from "lucide-react";
import AIAssistant from "./AIAssistant";
import { toast } from "sonner";
import type { PersonalInfo } from "@/types/cv";

interface PersonalInfoFormProps {
  cvId: number;
  initialData: PersonalInfo | null;
  onDataChange?: (personalInfo: PersonalInfo) => void;
}

export default function PersonalInfoForm({
  cvId,
  initialData,
  onDataChange,
}: PersonalInfoFormProps) {
  // Snapshot of what's actually saved — used to compute dirty state
  const [savedData] = useState({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "",
    professionalSummary: initialData?.professionalSummary || "",
  });

  const [formData, setFormData] = useState({ ...savedData });
  const [isImprovingText, setIsImprovingText] = useState(false);

  // True when any field differs from the last saved value
  const isDirty = useMemo(
    () =>
      (Object.keys(formData) as (keyof typeof formData)[]).some(
        k => formData[k] !== savedData[k]
      ),
    [formData, savedData]
  );

  const updateMutation = trpc.cv.personalInfo.update.useMutation({
    onSuccess: result => {
      toast.success("Personal info saved");
      if (onDataChange && result) {
        onDataChange(result as PersonalInfo);
      }
    },
    onError: () => {
      toast.error("Failed to save personal info");
    },
  });

  const improveTextMutation = trpc.cvAI.improveText.useMutation({
    onSuccess: (data: any) => {
      const improved =
        typeof data.improvedText === "string"
          ? data.improvedText
          : String(data.improvedText);
      setFormData(prev => ({ ...prev, professionalSummary: improved }));
      setIsImprovingText(false);
      toast.success("Text improved!");
    },
    onError: () => {
      setIsImprovingText(false);
      toast.error("Failed to improve text");
    },
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate({ cvId, ...formData });
  };

  const handleImproveText = () => {
    if (!formData.professionalSummary.trim()) {
      toast.error("Write a summary first before improving it");
      return;
    }
    setIsImprovingText(true);
    improveTextMutation.mutate({
      cvId,
      text: formData.professionalSummary,
      context: "summary",
    });
  };

  return (
    <Card className="p-6 border border-black">
      <div className="space-y-4">
        <div>
          <Label className="text-black font-semibold">Full Name</Label>
          <Input
            value={formData.fullName}
            onChange={e => handleChange("fullName", e.target.value)}
            placeholder="John Doe"
            className="mt-2 border-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-black font-semibold">Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={e => handleChange("email", e.target.value)}
              placeholder="john@example.com"
              className="mt-2 border-black"
            />
          </div>
          <div>
            <Label className="text-black font-semibold">Phone</Label>
            <Input
              value={formData.phone}
              onChange={e => handleChange("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="mt-2 border-black"
            />
          </div>
        </div>

        <div>
          <Label className="text-black font-semibold">Location</Label>
          <Input
            value={formData.location}
            onChange={e => handleChange("location", e.target.value)}
            placeholder="San Francisco, CA"
            className="mt-2 border-black"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-black font-semibold">
              Professional Summary
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImproveText}
                disabled={
                  isImprovingText || !formData.professionalSummary.trim()
                }
                className="gap-2 border-black text-xs"
              >
                {isImprovingText ? (
                  <Spinner className="w-3 h-3" />
                ) : (
                  <Wand2 className="w-3 h-3" />
                )}
                Improve
              </Button>
              <AIAssistant
                cvId={cvId}
                type="summary"
                onTextGenerated={text =>
                  handleChange("professionalSummary", text)
                }
              />
            </div>
          </div>
          <Textarea
            value={formData.professionalSummary}
            onChange={e => handleChange("professionalSummary", e.target.value)}
            placeholder="Write a brief professional summary..."
            className="mt-2 border-black min-h-24"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || !isDirty}
          className="w-full bg-black text-white hover:bg-gray-800 gap-2"
        >
          {updateMutation.isPending ? (
            <>
              <Spinner className="w-4 h-4" />
              Saving...
            </>
          ) : (
            <>
              {isDirty && (
                <Circle
                  className="w-2 h-2 fill-amber-400 text-amber-400"
                  aria-label="Unsaved changes"
                />
              )}
              {isDirty ? "Save Changes" : "Saved"}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
