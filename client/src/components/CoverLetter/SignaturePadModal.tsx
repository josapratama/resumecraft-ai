import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  PenTool,
  Upload,
  Type,
  Trash2,
  Undo2,
  Check,
  X,
  Palette,
  Sparkles,
  Info,
} from "lucide-react";

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string, type: "draw" | "upload" | "font") => void;
  initialSignature?: string;
  fullName: string;
}

const PEN_COLORS = [
  { label: "Hitam Formal", value: "#0f172a", bg: "bg-slate-900" },
  { label: "Biru Tinta Pulpen", value: "#1d4ed8", bg: "bg-blue-700" },
  { label: "Biru Navy Formal", value: "#1e3a8a", bg: "bg-blue-950" },
  { label: "Tinta Hijau", value: "#047857", bg: "bg-emerald-700" },
];

const PEN_WIDTHS = [
  { label: "Halus", value: 1.8 },
  { label: "Standar", value: 2.8 },
  { label: "Tebal", value: 4.2 },
];

const CALLIGRAPHY_STYLES = [
  {
    id: "style1",
    name: "Classic Cursive",
    fontFamily: "'Brush Script MT', 'Dancing Script', cursive, sans-serif",
    italic: true,
  },
  {
    id: "style2",
    name: "Elegant Signature",
    fontFamily: "'Great Vibes', 'Allura', 'Segoe Script', cursive, sans-serif",
    italic: true,
  },
  {
    id: "style3",
    name: "Executive Formal",
    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    italic: true,
  },
  {
    id: "style4",
    name: "Modern Handwritten",
    fontFamily: "'Caveat', 'Segoe Print', cursive, sans-serif",
    italic: false,
  },
];

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSignature,
  fullName,
}) => {
  const [activeTab, setActiveTab] = useState<"draw" | "upload" | "font">("draw");

  // Draw Tab State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<string>("#0f172a");
  const [penWidth, setPenWidth] = useState<number>(2.8);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Upload Tab State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Font Tab State
  const [typedName, setTypedName] = useState<string>(fullName || "Nama Lengkap");
  const [selectedFontStyle, setSelectedFontStyle] = useState<string>("style2");
  const [fontColor, setFontColor] = useState<string>("#0f172a");

  // Keep typed name synced with fullName if not manually edited
  useEffect(() => {
    if (fullName) {
      setTypedName(fullName);
    }
  }, [fullName]);

  // Canvas Initialization with 2x High-DPI Resolution
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;

    // Set internal resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale context to match css pixels
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clear background
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Save blank state in history
    try {
      const blankData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([blankData]);
    } catch {
      // Ignore initial capture errors
    }
    setHasDrawn(false);
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === "draw") {
      // Small timeout to let modal DOM paint and measure client rect correctly
      const timer = setTimeout(() => {
        initCanvas();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, initCanvas]);

  if (!isOpen) return null;

  // Drawing event handlers using Pointer Events (touch, mouse, stylus)
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already released
    }
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev.slice(-15), snap]);
    } catch {
      // Ignore snap errors
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) {
      handleClearCanvas();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);
    setHasDrawn(newHistory.length > 1);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    try {
      const blankData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([blankData]);
    } catch {
      setHistory([]);
    }
    setHasDrawn(false);
  };

  // Crop / Trim transparent borders from canvas for clean rendering
  const cropSignatureCanvas = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas.toDataURL("image/png");

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width,
      minY = height,
      maxX = 0,
      maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 10) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) {
      return canvas.toDataURL("image/png");
    }

    // Add small padding around the signature (approx 15px)
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width, maxX + padding);
    maxY = Math.min(height, maxY + padding);

    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return canvas.toDataURL("image/png");

    tempCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    return tempCanvas.toDataURL("image/png");
  };

  // Image Upload with Auto Background Removal (turns white paper background into transparent PNG)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    const reader = new FileReader();
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setIsProcessingUpload(false);
        return;
      }

      if (!removeBg) {
        setUploadedImage(dataUrl);
        setIsProcessingUpload(false);
        return;
      }

      // Process image to make white background transparent
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement("canvas");
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const offCtx = offCanvas.getContext("2d");
        if (!offCtx) {
          setUploadedImage(dataUrl);
          setIsProcessingUpload(false);
          return;
        }

        offCtx.drawImage(img, 0, 0);
        const imgData = offCtx.getImageData(0, 0, img.width, img.height);
        const d = imgData.data;

        // Loop pixels: If pixel is nearly white / paper tone, make transparent
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          // Brightness threshold: if lighter than 215, make transparent
          if (r > 215 && g > 215 && b > 215) {
            d[i + 3] = 0; // Alpha 0
          } else {
            // Darken ink stroke slightly for crispness
            d[i] = Math.max(0, r - 30);
            d[i + 1] = Math.max(0, g - 30);
            d[i + 2] = Math.max(0, b - 30);
          }
        }

        offCtx.putImageData(imgData, 0, 0);
        const processedUrl = cropSignatureCanvas(offCanvas);
        setUploadedImage(processedUrl);
        setIsProcessingUpload(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Generate Font Signature to PNG Canvas
  const generateFontSignature = (): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const styleObj = CALLIGRAPHY_STYLES.find(s => s.id === selectedFontStyle) || CALLIGRAPHY_STYLES[1];

    ctx.font = `${styleObj.italic ? "italic " : ""}54px ${styleObj.fontFamily}`;
    ctx.fillStyle = fontColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(typedName || fullName || "Tanda Tangan", canvas.width / 2, canvas.height / 2);
    return cropSignatureCanvas(canvas);
  };

  const handleSave = () => {
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const signaturePng = cropSignatureCanvas(canvas);
      onSave(signaturePng, "draw");
    } else if (activeTab === "upload") {
      if (!uploadedImage) return;
      onSave(uploadedImage, "upload");
    } else if (activeTab === "font") {
      const fontPng = generateFontSignature();
      if (!fontPng) return;
      onSave(fontPng, "font");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tanda Tangan Digital</h3>
              <p className="text-xs text-slate-500">
                Gunakan coretan tangan asli, upload foto, atau gaya kaligrafi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("draw")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "draw"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Gambar di Layar (Canvas)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "upload"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Foto / PNG
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("font")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "font"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Font Kaligrafi
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === "draw" && (
            <div className="space-y-4">
              {/* Toolbar Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                {/* Color Chooser */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
                    Warna:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {PEN_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setPenColor(c.value)}
                        className={`w-6 h-6 rounded-full transition-all ${c.bg} ${
                          penColor === c.value
                            ? "ring-2 ring-offset-2 ring-blue-600 scale-110"
                            : "opacity-80 hover:opacity-100"
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Stroke Width Chooser */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-medium">Ketebalan:</span>
                  {PEN_WIDTHS.map(w => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => setPenWidth(w.value)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                        penWidth === w.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                {/* Undo & Clear */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={history.length <= 1}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded border border-transparent hover:border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Undo goresan terakhir"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded border border-transparent hover:border-rose-100 transition-colors"
                    title="Bersihkan area gambar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawing Board */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner group">
                <canvas
                  ref={canvasRef}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  className="w-full h-56 cursor-crosshair touch-none select-none"
                  style={{ touchAction: "none" }}
                />

                {/* Guideline line at bottom 30% */}
                <div className="absolute left-10 right-10 bottom-12 border-b border-dashed border-slate-200 pointer-events-none flex justify-between">
                  <span className="text-[10px] text-slate-400 select-none pb-0.5">
                    Goreskan tanda tangan di sini (gunakan mouse / sentuhan jari)
                  </span>
                  <span className="text-[10px] text-slate-300 select-none">Area Tanda Tangan</span>
                </div>

                {!hasDrawn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 opacity-60">
                    <PenTool className="w-8 h-8 mb-1 animate-bounce" />
                    <span className="text-xs font-medium">
                      Silakan gambar tanda tangan Anda di area putih ini
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Hasil goresan otomatis dipangkas (auto-crop) secara proporsional dan tersimpan
                  dengan latar belakang transparan beresolusi tinggi saat dicetak ke PDF.
                </span>
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-800 text-sm">
                  Klik untuk Memilih File Gambar Tanda Tangan
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mendukung PNG transparan, JPG foto kertas, atau WEBP (Maks 5MB)
                </p>
              </div>

              {/* Auto Background Removal Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeBg}
                  onChange={e => setRemoveBg(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 block">
                    Hapus Latar Kertas Putih Otomatis (Auto Transparent PNG)
                  </span>
                  <span className="text-slate-500">
                    Otomatis membersihkan background kertas putih agar tanda tangan menyatu sempurna
                    dengan dokumen surat lamaran.
                  </span>
                </div>
              </label>

              {/* Upload Preview */}
              {uploadedImage && (
                <div className="border rounded-xl p-3 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Pratinjau Gambar:</p>
                  <div className="h-28 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-3 shadow-inner">
                    <img
                      src={uploadedImage}
                      alt="Pratinjau Tanda Tangan"
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>
                </div>
              )}

              {isProcessingUpload && (
                <div className="text-center text-xs text-blue-600 font-medium py-2">
                  Memproses & memfilter gambar...
                </div>
              )}
            </div>
          )}

          {activeTab === "font" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Teks Tanda Tangan (Nama Pemohon):
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={e => setTypedName(e.target.value)}
                  placeholder="Ketik nama untuk dibuatkan tanda tangan..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Color Chooser */}
              <div className="flex items-center gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Warna Tinta:</span>
                <div className="flex items-center gap-1.5">
                  {PEN_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setFontColor(c.value)}
                      className={`w-6 h-6 rounded-full transition-all ${c.bg} ${
                        fontColor === c.value
                          ? "ring-2 ring-offset-2 ring-blue-600 scale-110"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Font Style Selection Cards */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Pilih Gaya Kaligrafi:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CALLIGRAPHY_STYLES.map(style => {
                    const isSelected = selectedFontStyle === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => setSelectedFontStyle(style.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/40 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {style.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div
                          className="h-12 flex items-center justify-center text-center overflow-hidden"
                          style={{
                            fontFamily: style.fontFamily,
                            fontStyle: style.italic ? "italic" : "normal",
                            color: fontColor,
                            fontSize: "22px",
                          }}
                        >
                          {typedName || "Tanda Tangan"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              (activeTab === "draw" && !hasDrawn) ||
              (activeTab === "upload" && !uploadedImage) ||
              (activeTab === "font" && !typedName.trim())
            }
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Terapkan ke Surat Lamaran
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePadModal;

