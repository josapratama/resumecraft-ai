import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Share2, Copy, Check, ExternalLink, Eye, Globe2 } from "lucide-react";
import { toast } from "sonner";

interface SharePublicModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  isPublic?: number;
  shareSlug?: string | null;
  viewsCount?: number;
}

export default function SharePublicModal({
  cvId,
  isOpen,
  onClose,
  isPublic = 0,
  shareSlug = "",
  viewsCount = 0,
}: SharePublicModalProps) {
  const utils = trpc.useUtils();
  const [enabled, setEnabled] = useState(Boolean(isPublic));
  const [slug, setSlug] = useState(shareSlug || "");
  const [copied, setCopied] = useState(false);

  const toggleMutation = trpc.cv.togglePublicShare.useMutation({
    onSuccess: data => {
      setEnabled(data.isPublic);
      if (data.shareSlug) setSlug(data.shareSlug);
      utils.cv.loadFull.invalidate({ cvId });
      toast.success(
        data.isPublic
          ? "Public sharing enabled!"
          : "CV is now private."
      );
    },
    onError: err => {
      toast.error(`Failed to update sharing: ${err.message}`);
    },
  });

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${slug || cvId}`
    : `/p/${slug || cvId}`;

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate({
      cvId,
      isPublic: checked,
      customSlug: slug.trim() || undefined,
    });
  };

  const handleSaveSlug = () => {
    if (!slug.trim()) return;
    toggleMutation.mutate({
      cvId,
      isPublic: enabled,
      customSlug: slug.trim(),
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Public link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Share2 className="w-5 h-5 text-blue-600" />
            Public Web CV & Recruiter Portfolio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <p className="text-sm text-gray-600">
            Publish an interactive, responsive online web version of your CV that HR recruiters or clients can view anytime from any phone or browser.
          </p>

          <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-600" /> Enable Public Web Link
              </span>
              <p className="text-xs text-gray-500">
                Anyone with this link can view and download your CV
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={toggleMutation.isPending}
            />
          </div>

          {enabled && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="space-y-2">
                <Label htmlFor="slugInput">Custom URL Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slugInput"
                    placeholder="e.g. your-name-frontend"
                    value={slug}
                    onChange={e =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-_]/g, "")
                      )
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={handleSaveSlug}
                    disabled={toggleMutation.isPending || !slug.trim()}
                  >
                    Save Slug
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Your Public Shareable Link</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-100 border rounded-lg">
                  <input
                    readOnly
                    value={publicUrl}
                    className="bg-transparent text-xs font-mono text-gray-800 flex-1 outline-none truncate"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-8 w-8 p-0"
                    title="Copy Link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(publicUrl, "_blank")}
                    className="h-8 w-8 p-0"
                    title="Open Link"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900">
                <Eye className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  This public CV has been viewed <strong>{viewsCount}</strong> times by visitors/recruiters.
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t">
            <Button onClick={onClose} size="sm" className="bg-black text-white hover:bg-gray-800">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

