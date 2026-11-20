import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  FileCheck,
  Scissors,
  Palette,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import ModernTemplate from "./templates/ModernTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";
import TechTemplate from "./templates/TechTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";
import ElegantTemplate from "./templates/ElegantTemplate";
import BoldTemplate from "./templates/BoldTemplate";
import CorporateTemplate from "./templates/CorporateTemplate";
import AcademicTemplate from "./templates/AcademicTemplate";
import CompactTemplate from "./templates/CompactTemplate";
import TimelineTemplate from "./templates/TimelineTemplate";
import InfographicTemplate from "./templates/InfographicTemplate";
import NewspaperTemplate from "./templates/NewspaperTemplate";
import NordicTemplate from "./templates/NordicTemplate";
import RetroTemplate from "./templates/RetroTemplate";
import StealthTemplate from "./templates/StealthTemplate";
import GradientTemplate from "./templates/GradientTemplate";
import BrutalistTemplate from "./templates/BrutalistTemplate";
import SidebarLightTemplate from "./templates/SidebarLightTemplate";
import TwoPageTemplate from "./templates/TwoPageTemplate";
import PortfolioTemplate from "./templates/PortfolioTemplate";
import MonochromeTemplate from "./templates/MonochromeTemplate";
import AtlasTemplate from "./templates/AtlasTemplate";
import SwissTemplate from "./templates/SwissTemplate";
import DarkTemplate from "./templates/DarkTemplate";
import MidnightTemplate from "./templates/MidnightTemplate";
import PastelTemplate from "./templates/PastelTemplate";
import SplitTemplate from "./templates/SplitTemplate";
import type { FullCVData, TemplateId, PaperSize } from "@/types/cv";

interface CVPreviewProps {
  template: TemplateId;
  cvData: FullCVData;
  paperSize?: PaperSize;
  onPaperSizeChange?: (size: PaperSize) => void;
  onStyleChange?: (style: { accentColor?: string; fontFamily?: string }) => void;
}

const TEMPLATE_MAP: Record<
  TemplateId,
  React.ComponentType<{ cvData: FullCVData }>
> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
  creative: CreativeTemplate,
  elegant: ElegantTemplate,
  bold: BoldTemplate,
  corporate: CorporateTemplate,
  academic: AcademicTemplate,
  compact: CompactTemplate,
  timeline: TimelineTemplate,
  infographic: InfographicTemplate,
  newspaper: NewspaperTemplate,
  nordic: NordicTemplate,
  retro: RetroTemplate,
  stealth: StealthTemplate,
  gradient: GradientTemplate,
  brutalist: BrutalistTemplate,
  "sidebar-light": SidebarLightTemplate,
  "two-page": TwoPageTemplate,
  portfolio: PortfolioTemplate,
  monochrome: MonochromeTemplate,
  atlas: AtlasTemplate,
  swiss: SwissTemplate,
  dark: DarkTemplate,
  midnight: MidnightTemplate,
  pastel: PastelTemplate,
  split: SplitTemplate,
};

export default function CVPreview({
  template,
  cvData,
  paperSize = "a4",
  onPaperSizeChange,
  onStyleChange,
}: CVPreviewProps) {
  const { t } = useI18n();
  const TemplateComponent = TEMPLATE_MAP[template] ?? ModernTemplate;
  const containerRef = useRef<HTMLDivElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [isOnePageMode, setIsOnePageMode] = useState<boolean>(false);
  const [showPageBreakGuide, setShowPageBreakGuide] = useState<boolean>(true);
  const [docHeight, setDocHeight] = useState<number>(1123);
  const [accentColor, setAccentColor] = useState<string>(cvData.cv.accentColor || "#ef4444");
  const [fontSizePercent, setFontSizePercent] = useState<number>(100);
  const [lineSpacing, setLineSpacing] = useState<"compact" | "normal" | "relaxed">("normal");

  useEffect(() => {
    if (cvData.cv.accentColor) {
      setAccentColor(cvData.cv.accentColor);
    }
  }, [cvData.cv.accentColor]);

  // Standard paper dimensions in px (at 96 DPI)
  // A4: 210mm x 297mm ≈ 794px x 1123px
  // Letter: 8.5in x 11in ≈ 816px x 1056px
  const targetWidthPx = paperSize === "letter" ? 816 : 794;
  const targetHeightPx = paperSize === "letter" ? 1056 : 1123;

  // Measure actual document height to detect 1-page vs overflow
  useEffect(() => {
    const el = templateRef.current;
    if (!el) return;

    const measure = () => {
      setDocHeight(el.clientHeight || targetHeightPx);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [cvData, template, isOnePageMode, targetHeightPx]);

  // Auto-fit scale on mount and container resize so it never clips on mobile or narrow split-views
  useEffect(() => {
    if (!isAutoFit) return;

    const updateFit = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const padding = containerWidth < 500 ? 16 : 32;
      const availableWidth = Math.max(260, containerWidth - padding);
      if (availableWidth < targetWidthPx) {
        const calculated = Math.max(30, Math.floor((availableWidth / targetWidthPx) * 100));
        setZoom(calculated);
      } else {
        setZoom(100);
      }
    };

    updateFit();
    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, [isAutoFit, targetWidthPx]);

  const handleZoomIn = () => {
    setIsAutoFit(false);
    setZoom(prev => Math.min(150, prev + 10));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setZoom(prev => Math.max(30, prev - 10));
  };

  const handleResetZoom = () => {
    setIsAutoFit(false);
    setZoom(100);
  };

  const handleFitScreen = () => {
    setIsAutoFit(true);
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const padding = containerWidth < 500 ? 16 : 32;
    const availableWidth = Math.max(260, containerWidth - padding);
    const calculated = Math.min(100, Math.max(30, Math.floor((availableWidth / targetWidthPx) * 100)));
    setZoom(calculated);
  };

  const isOnePage = docHeight <= targetHeightPx + 15;
  const isSlightOverflow = docHeight > targetHeightPx + 15 && docHeight <= targetHeightPx + 250;

  return (
    <Card className="overflow-hidden shadow-sm border border-neutral-200/80 bg-neutral-100/50 rounded-2xl">
      {/* Top Interactive Preview Toolbar - Modern Refined Studio Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 text-white text-xs border-b border-slate-800/90 gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-2 min-w-0 flex-nowrap shrink-0">
          <span className="font-bold tracking-wide capitalize text-white text-xs truncate shrink-0">
            {template}
          </span>

          {/* Paper Size Selector (A4 vs Letter) */}
          <div className="inline-flex rounded-full bg-slate-800 p-0.5 border border-slate-700/80 shrink-0">
            <button
              type="button"
              onClick={() => onPaperSizeChange?.("a4")}
              className={`px-2 py-0.5 text-[10px] rounded-full font-medium transition-all ${
                paperSize === "a4"
                  ? "bg-slate-700 text-white shadow-2xs font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Ukuran Kertas Standar Internasional A4 (210 x 297 mm)"
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => onPaperSizeChange?.("letter")}
              className={`px-2 py-0.5 text-[10px] rounded-full font-medium transition-all ${
                paperSize === "letter"
                  ? "bg-slate-700 text-white shadow-2xs font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Ukuran Kertas Standar AS Letter (8.5 x 11 inch)"
            >
              Letter
            </button>
          </div>

          {/* Dynamic Page Budget Indicator */}
          {isOnePage ? (
            <span className="text-[10px] py-0.5 px-2.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 font-semibold inline-flex items-center gap-1.5 shadow-2xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{t("preview_bar.one_page_fit", "Pas 1 Halaman")}</span>
            </span>
          ) : isSlightOverflow ? (
            <button
              onClick={() => setIsOnePageMode(true)}
              className="text-[10px] py-0.5 px-2 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/80 font-semibold inline-flex items-center gap-1.5 hover:bg-amber-900 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
              title="Konten tumpah sedikit. Klik untuk padatkan otomatis ke 1 halaman!"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>
                {t("preview_bar.overflow_warning", "Tumpah +{n} baris (Klik Paskan)").replace(
                  "{n}",
                  String(Math.max(1, Math.round((docHeight - targetHeightPx) / 24)))
                )}
              </span>
            </button>
          ) : (
            <span className="text-[10px] py-0.5 px-2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium inline-flex shrink-0">
              {t("preview_bar.pages_label", "{n} Halaman {paper}")
                .replace("{n}", String(Math.ceil(docHeight / targetHeightPx)))
                .replace("{paper}", paperSize.toUpperCase())}
            </span>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOnePageMode(!isOnePageMode)}
            className={`h-6 px-2 text-[10px] gap-1 rounded-full font-semibold transition-all shrink-0 ${
              isOnePageMode
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700"
            }`}
            title={`Padatkan konten CV agar pas di 1 lembar ${paperSize.toUpperCase()}`}
          >
            <FileCheck className="w-3 h-3 text-emerald-400" />
            <span>
              {isOnePageMode
                ? t("preview_bar.btn_compact_active", "1 Hal: Aktif")
                : t("preview_bar.btn_compact", "Padatkan")}
            </span>
          </Button>

          {/* Quick Accent Color Swatches Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-6 px-2 text-[10px] gap-1.5 rounded-full font-semibold transition-all inline-flex items-center text-slate-300 hover:text-white bg-slate-800 border border-slate-700 shrink-0 cursor-pointer shadow-2xs"
                title="Ganti warna tema CV"
              >
                <span className="w-2.5 h-2.5 rounded-full border border-white/50" style={{ backgroundColor: accentColor }} />
                <span className="hidden sm:inline">Warna</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 p-2 rounded-xl bg-slate-900 border-slate-700 text-white shadow-xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                Warna Aksen CV
              </div>
              <div className="grid grid-cols-4 gap-1.5 p-1">
                {[
                  { name: "Crimson Red", hex: "#ef4444" },
                  { name: "Classic Navy", hex: "#1e3a8a" },
                  { name: "Royal Indigo", hex: "#4f46e5" },
                  { name: "Emerald Green", hex: "#059669" },
                  { name: "Teal Cyan", hex: "#0d9488" },
                  { name: "Amethyst Violet", hex: "#7c3aed" },
                  { name: "Amber Ochre", hex: "#d97706" },
                  { name: "Dark Zinc", hex: "#18181b" },
                ].map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => {
                      setAccentColor(c.hex);
                      onStyleChange?.({ accentColor: c.hex });
                    }}
                    className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {accentColor === c.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Micro-Spacing / Line-Height / Font-Size Adjuster */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-6 px-2 text-[10px] gap-1 rounded-full font-semibold transition-all inline-flex items-center text-slate-300 hover:text-white bg-slate-800 border border-slate-700 shrink-0 cursor-pointer shadow-2xs"
                title="Atur Kerapatan Huruf & Spasi Baris agar Pas 1 Lembar"
              >
                <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">Kerapatan</span>
                {fontSizePercent !== 100 && <span className="text-[9px] text-cyan-300">({fontSizePercent}%)</span>}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2.5 rounded-xl bg-slate-900 border-slate-700 text-white shadow-xl space-y-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Ukuran Font ({fontSizePercent}%)
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[90, 95, 100, 105].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSizePercent(sz)}
                      className={`py-1 text-[10px] rounded font-semibold transition-all ${
                        fontSizePercent === sz ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {sz}%
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-800 pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Jarak Spasi Baris
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: "compact", label: "Ketat" },
                    { id: "normal", label: "Normal" },
                    { id: "relaxed", label: "Renggang" },
                  ].map(sp => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setLineSpacing(sp.id as any)}
                      className={`py-1 text-[10px] rounded font-semibold transition-all ${
                        lineSpacing === sp.id ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {docHeight > targetHeightPx + 15 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPageBreakGuide(!showPageBreakGuide)}
              className={`h-6 px-2 text-[10px] gap-1 rounded-full font-semibold transition-all shrink-0 ${
                showPageBreakGuide
                  ? "bg-slate-800 text-blue-300 border border-blue-500/50 shadow-2xs"
                  : "text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}
              title="Garis pembatas lembar halaman cetak"
            >
              <Scissors className="w-3 h-3 text-blue-400" />
              <span className="hidden sm:inline">
                {showPageBreakGuide
                  ? t("preview_bar.guide_on", "Garis: On")
                  : t("preview_bar.guide_off", "Garis: Off")}
              </span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          <button
            onClick={handleResetZoom}
            className="px-1.5 py-0.5 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset ke 100%"
          >
            {zoom}%
          </button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-3.5 bg-slate-700 mx-1" />

          <Button
            size="sm"
            variant="ghost"
            onClick={handleFitScreen}
            className={`h-6 px-2 text-[10px] gap-1 rounded-md transition-all ${
              isAutoFit
                ? "bg-blue-600 text-white font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            title="Fit to Screen (Paskan ke Layar)"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit</span>
          </Button>
        </div>
      </div>

      {/* Document Preview Container with Content-Aware Scaling */}
      <div
        ref={containerRef}
        className="bg-neutral-200/60 cv-scroll-wrapper overflow-auto flex items-start justify-center p-1 sm:p-4 min-h-[440px] max-h-none lg:max-h-[calc(100vh-140px)]"
      >
        {/* Layout boundary matches visual scaled size so NO horizontal overflow happens on mobile */}
        <div
          className="relative transition-all duration-150 block shrink-0"
          style={{
            width: `${Math.ceil(targetWidthPx * (zoom / 100))}px`,
            height: `${Math.ceil(docHeight * (zoom / 100))}px`,
          }}
        >
          <div
            className="transition-transform duration-150 origin-top-left"
            style={{
              transform: `scale(${zoom / 100})`,
              width: `${targetWidthPx}px`,
            }}
          >
            {/* Document Root with Paper Size */}
            <div
              ref={templateRef}
              className={`cv-template-root relative bg-white shadow-2xl mx-auto rounded-xs overflow-hidden ${
                isOnePageMode ? "cv-one-page-compact" : ""
              }`}
              style={{
                width: `${targetWidthPx}px`,
                minHeight: `${targetHeightPx}px`,
                wordBreak: "break-word",
                overflowWrap: "break-word",
                fontSize: `${fontSizePercent}%`,
                lineHeight: lineSpacing === "compact" ? "1.3" : lineSpacing === "relaxed" ? "1.7" : "1.5",
                ['--accent-color' as any]: accentColor,
              }}
            >
            {/* Visual Page-Break Guide (Visible in Studio Preview, Hidden on Print) */}
            {showPageBreakGuide && docHeight > targetHeightPx + 15 && (
              <div
                className="absolute left-0 right-0 pointer-events-none z-30 print:hidden"
                style={{ top: `${targetHeightPx}px` }}
              >
                <div className="w-full border-b-2 border-dashed border-red-500/70 relative">
                  <span className="absolute right-3 -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-600 text-white shadow-2xs uppercase tracking-wider flex items-center gap-1">
                    <span>✂️ Batas Halaman 1 ({paperSize.toUpperCase()})</span>
                  </span>
                </div>
              </div>
            )}
            {showPageBreakGuide && docHeight > targetHeightPx * 2 + 15 && (
              <div
                className="absolute left-0 right-0 pointer-events-none z-30 print:hidden"
                style={{ top: `${targetHeightPx * 2}px` }}
              >
                <div className="w-full border-b-2 border-dashed border-red-500/70 relative">
                  <span className="absolute right-3 -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-600 text-white shadow-2xs uppercase tracking-wider flex items-center gap-1">
                    <span>✂️ Batas Halaman 2 ({paperSize.toUpperCase()})</span>
                  </span>
                </div>
              </div>
            )}

            <TemplateComponent cvData={cvData} />
          </div>
        </div>
      </div>
    </div>
  </Card>
  );
}
