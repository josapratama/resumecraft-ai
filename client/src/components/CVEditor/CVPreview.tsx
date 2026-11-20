import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, FileCheck, Scissors } from "lucide-react";
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
}: CVPreviewProps) {
  const TemplateComponent = TEMPLATE_MAP[template] ?? ModernTemplate;
  const containerRef = useRef<HTMLDivElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [isOnePageMode, setIsOnePageMode] = useState<boolean>(false);
  const [showPageBreakGuide, setShowPageBreakGuide] = useState<boolean>(true);
  const [docHeight, setDocHeight] = useState<number>(1123);

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
      const containerWidth = containerRef.current.clientWidth - 32; // 32px padding
      if (containerWidth < targetWidthPx) {
        const calculated = Math.max(45, Math.floor((containerWidth / targetWidthPx) * 100));
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
    setZoom(prev => Math.max(40, prev - 10));
  };

  const handleResetZoom = () => {
    setIsAutoFit(false);
    setZoom(100);
  };

  const handleFitScreen = () => {
    setIsAutoFit(true);
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 32;
    const calculated = Math.min(100, Math.max(45, Math.floor((containerWidth / targetWidthPx) * 100)));
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
              <span>Pas 1 Halaman</span>
            </span>
          ) : isSlightOverflow ? (
            <button
              onClick={() => setIsOnePageMode(true)}
              className="text-[10px] py-0.5 px-2 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/80 font-semibold inline-flex items-center gap-1.5 hover:bg-amber-900 transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
              title="Konten tumpah sedikit. Klik untuk padatkan otomatis ke 1 halaman!"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Tumpah +{Math.max(1, Math.round((docHeight - targetHeightPx) / 24))} baris (Klik Paskan)</span>
            </button>
          ) : (
            <span className="text-[10px] py-0.5 px-2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium inline-flex shrink-0">
              {Math.ceil(docHeight / targetHeightPx)} Halaman {paperSize.toUpperCase()}
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
            <span>{isOnePageMode ? "1 Hal: Aktif" : "Padatkan"}</span>
          </Button>

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
              <span className="hidden sm:inline">{showPageBreakGuide ? "Garis: On" : "Garis: Off"}</span>
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

          <div className="w-px h-3.5 bg-slate-700 mx-1 hidden sm:block" />

          <Button
            size="sm"
            variant="ghost"
            onClick={handleFitScreen}
            className="h-6 px-2 text-[10px] gap-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md hidden sm:inline-flex"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit</span>
          </Button>
        </div>
      </div>

      {/* Document Preview Container with Content-Aware Scaling */}
      <div
        ref={containerRef}
        className="bg-neutral-200/60 cv-scroll-wrapper overflow-auto flex items-start justify-center p-3 sm:p-5"
        style={{
          maxHeight: "calc(100vh - 210px)",
          minHeight: "480px",
        }}
      >
        <div
          className="transition-transform duration-150 origin-top"
          style={{
            transform: `scale(${zoom / 100})`,
            marginBottom: zoom < 100 ? `-${(100 - zoom) * 9}px` : "0px",
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
    </Card>
  );
}
