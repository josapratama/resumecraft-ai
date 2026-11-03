import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Wand2, Circle, User, Mail, Phone, MapPin, Check, Save } from "lucide-react";
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
  const [savedData, setSavedData] = useState({
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
      setSavedData({ ...formData });
      toast.success("Personal information saved");
      if (onDataChange && result) {
        onDataChange(result as PersonalInfo);
      }
    },
    onError: () => {
      toast.error("Failed to save personal information");
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
      toast.success("Summary enhanced with AI!");
    },
    onError: () => {
      setIsImprovingText(false);
      toast.error("Failed to improve summary");
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
      toast.error("Write a summary first before enhancing it");
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
    <Card className="p-5 sm:p-6 border border-neutral-200 bg-white rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-bold text-neutral-900 leading-tight">
            Personal Information
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Your name, contact details, and career overview
          </p>
        </div>
        {isDirty && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Unsaved changes
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            Full Name
          </Label>
          <Input
            value={formData.fullName}
            onChange={e => handleChange("fullName", e.target.value)}
            placeholder="e.g. Johnathan Doe"
            className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
          />
        </div>

        {/* Email & Phone Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              Email Address
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={e => handleChange("email", e.target.value)}
              placeholder="e.g. john@example.com"
              className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              Phone Number
            </Label>
            <Input
              value={formData.phone}
              onChange={e => handleChange("phone", e.target.value)}
              placeholder="e.g. +1 (555) 123-4567"
              className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            Location (City, Country)
          </Label>
          <Input
            value={formData.location}
            onChange={e => handleChange("location", e.target.value)}
            placeholder="e.g. San Francisco, CA or Jakarta, Indonesia"
            className="mt-1.5 border-neutral-200 focus:border-neutral-900 rounded-xl"
          />
        </div>

        {/* Professional Summary */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <Label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Professional Summary
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleImproveText}
                disabled={isImprovingText || !formData.professionalSummary.trim()}
                className="gap-1.5 border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-xs h-7 px-2.5 rounded-lg"
              >
                {isImprovingText ? (
                  <Spinner className="w-3 h-3" />
                ) : (
                  <Wand2 className="w-3 h-3 text-indigo-600" />
                )}
                <span>Enhance with AI</span>
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
            placeholder="Write 2-4 sentences highlighting your years of experience, core expertise, and notable career achievements..."
            className="border-neutral-200 focus:border-neutral-900 rounded-xl min-h-28 text-sm leading-relaxed"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || !isDirty}
          className={`w-full gap-2 rounded-xl h-10 font-semibold text-xs sm:text-sm transition-all shadow-xs ${
            isDirty
              ? "bg-neutral-900 text-white hover:bg-neutral-800"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed hover:bg-neutral-100"
          }`}
        >
          {updateMutation.isPending ? (
            <>
              <Spinner className="w-4 h-4" />
              <span>Saving Changes...</span>
            </>
          ) : isDirty ? (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Saved & Up to Date</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
