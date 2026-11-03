import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Palette, Check } from "lucide-react";
import { toast } from "sonner";

interface StyleCustomizerModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  currentAccent?: string | null;
  currentFont?: string | null;
  onStyleChange?: (style: { accentColor?: string; fontFamily?: string }) => void;
}

const ACCENT_COLORS = [
  { name: "Crimson Red", hex: "#ef4444" },
  { name: "Classic Navy", hex: "#1e3a8a" },
  { name: "Royal Indigo", hex: "#4f46e5" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Teal Cyan", hex: "#0d9488" },
  { name: "Amethyst Violet", hex: "#7c3aed" },
  { name: "Amber Ochre", hex: "#d97706" },
  { name: "Slate Charcoal", hex: "#334155" },
  { name: "Rose Pink", hex: "#e11d48" },
];

const FONT_OPTIONS = [
  { name: "Inter (Modern Sans)", value: "font-sans", css: "'Inter', sans-serif" },
  { name: "Merriweather (Executive Serif)", value: "font-serif", css: "'Merriweather', serif" },
  { name: "Roboto (Clean Corporate)", value: "font-sans-roboto", css: "'Roboto', sans-serif" },
  { name: "Playfair Display (Elegant Editorial)", value: "font-playfair", css: "'Playfair Display', serif" },
];

export default function StyleCustomizerModal({
  cvId,
  isOpen,
  onClose,
  currentAccent = "#ef4444",
  currentFont = "font-sans",
  onStyleChange,
}: StyleCustomizerModalProps) {
  const utils = trpc.useUtils();
  const [accent, setAccent] = useState(currentAccent || "#ef4444");
  const [font, setFont] = useState(currentFont || "font-sans");

  const updateMutation = trpc.cv.updateDesign.useMutation({
    onSuccess: () => {
      utils.cv.loadFull.invalidate({ cvId });
      toast.success("Theme and styling updated!");
      onClose();
    },
    onError: err => {
      toast.error(`Failed to save styling: ${err.message}`);
    },
  });

  const handleSelectColor = (hex: string) => {
    setAccent(hex);
    onStyleChange?.({ accentColor: hex, fontFamily: font });
  };

  const handleSelectFont = (fontValue: string) => {
    setFont(fontValue);
    onStyleChange?.({ accentColor: accent, fontFamily: fontValue });
  };

  const handleSave = () => {
    updateMutation.mutate({
      cvId,
      accentColor: accent,
      fontFamily: font,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Palette className="w-5 h-5 text-indigo-600" />
            Theme Colors & Typography
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Accent Color */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Primary Accent Color</Label>
            <div className="grid grid-cols-3 gap-2.5">
              {ACCENT_COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => handleSelectColor(c.hex)}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                    accent === c.hex
                      ? "border-black shadow-sm ring-1 ring-black"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white"
                    style={{ backgroundColor: c.hex }}
                  >
                    {accent === c.hex && <Check className="w-3 h-3" />}
                  </span>
                  <span className="text-xs font-medium text-gray-800 truncate">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Document Typography</Label>
            <div className="space-y-2">
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleSelectFont(f.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    font === f.value
                      ? "border-black bg-gray-50 font-semibold"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm text-gray-900">{f.name}</span>
                  {font === f.value && (
                    <Check className="w-4 h-4 text-black" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-black text-white hover:bg-gray-800"
            >
              Apply & Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

