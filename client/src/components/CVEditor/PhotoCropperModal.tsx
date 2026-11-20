import { useState, useRef, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Move,
  Crop,
  Sparkles,
} from "lucide-react";

interface PhotoCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
}

export default function PhotoCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: PhotoCropperModalProps) {
  const { t } = useI18n();
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset transform when new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen, imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch support for mobile dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStartRef.current.x,
      y: touch.clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleConfirmCrop = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement("canvas");
    const outputSize = 400; // Standard crisp square avatar
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Viewport box is 260px x 260px
    const viewSize = 260;
    const scaleFactor = outputSize / viewSize;

    // Background fill
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Save context, translate to center of output, apply offset and zoom, draw image centered
    ctx.save();
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);
    ctx.scale(zoom * scaleFactor, zoom * scaleFactor);

    const img = imgRef.current;
    // Calculate aspect ratio fit
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawWidth = viewSize;
    let drawHeight = viewSize;
    if (imgAspect > 1) {
      drawWidth = viewSize * imgAspect;
      drawHeight = viewSize;
    } else {
      drawWidth = viewSize;
      drawHeight = viewSize / imgAspect;
    }

    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(dataUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white border border-neutral-200 shadow-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Crop className="w-4 h-4 text-blue-600" />
            <span>{t("photo_cropper.title", "Atur & Paskan Foto Profil")}</span>
          </DialogTitle>
          <p className="text-xs text-neutral-500">
            {t("photo_cropper.subtitle", "Geser dan perbesar agar posisi wajah tepat di tengah bingkai CV.")}
          </p>
        </DialogHeader>

        {/* Interactive Viewport Area */}
        <div className="flex flex-col items-center justify-center gap-3 py-2">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-[260px] h-[260px] rounded-full border-4 border-blue-500/80 shadow-inner relative overflow-hidden bg-neutral-900 cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
          >
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-full border border-white/30 z-10" />

            {/* Target Image */}
            {imageSrc && (
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                draggable={false}
                className="max-w-none transition-transform pointer-events-none"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
              />
            )}

            {/* Center Hint */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
              <div className="w-12 h-12 border border-dashed border-white rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
            <Move className="w-3.5 h-3.5 text-blue-500" />
            <span>{t("photo_cropper.drag_hint", "Klik dan geser gambar untuk mengatur posisi")}</span>
          </div>
        </div>

        {/* Zoom Slider Control */}
        <div className="space-y-2 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5 text-neutral-500" />
              <span>{t("photo_cropper.zoom", "Perbesaran")}</span>
            </span>
            <span className="font-mono text-neutral-500 text-[11px]">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-neutral-400 shrink-0" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={vals => setZoom(vals[0] || 1)}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-neutral-400 shrink-0" />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between items-center sm:justify-between gap-2 pt-2 border-t border-neutral-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="text-xs text-neutral-600 gap-1 rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("photo_cropper.reset", "Reset")}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-xl"
            >
              {t("common.cancel", "Batal")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmCrop}
              className="text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t("photo_cropper.apply", "Terapkan Foto")}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
