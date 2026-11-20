import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, FileCheck } from "lucide-react";
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
import type { FullCVData, TemplateId } from "@/types/cv";

interface CVPreviewProps {
  template: TemplateId;
  cvData: FullCVData;
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
};

export default function CVPreview({ template, cvData }: CVPreviewProps) {
  const TemplateComponent = TEMPLATE_MAP[template] ?? ModernTemplate;
  const containerRef = useRef<HTMLDivElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [isOnePageMode, setIsOnePageMode] = useState<boolean>(false);
  const [docHeight, setDocHeight] = useState<number>(1123);

  // Measure actual document height to detect 1-page vs overflow
  useEffect(() => {
    const el = templateRef.current;
    if (!el) return;

    const measure = () => {
      setDocHeight(el.clientHeight || 1123);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [cvData, template, isOnePageMode]);

  // Auto-fit scale on mount and container resize so it never clips on mobile or narrow split-views
  useEffect(() => {
    if (!isAutoFit) return;

    const updateFit = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 32; // 32px padding
      const a4WidthPx = 794; // approx 210mm in standard 96dpi screen
      if (containerWidth < a4WidthPx) {
        const calculated = Math.max(45, Math.floor((containerWidth / a4WidthPx) * 100));
        setZoom(calculated);
      } else {
        setZoom(100);
      }
    };

    updateFit();
    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, [isAutoFit]);

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
    const a4WidthPx = 794;
    const calculated = Math.min(100, Math.max(45, Math.floor((containerWidth / a4WidthPx) * 100)));
    setZoom(calculated);
  };

  return (
    <Card className="overflow-hidden shadow-sm border border-neutral-200/80 bg-neutral-100/50 rounded-2xl">
      {/* Top Interactive Preview Toolbar - Modern Refined Studio Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 text-white text-xs border-b border-slate-800/90 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-bold tracking-wide capitalize text-white text-xs truncate">
            {template}
          </span>
          <span className="text-[10px] py-0.5 px-2 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700/80">
            A4 Standard
          </span>

          {/* Dynamic Page Budget Indicator */}
          {docHeight <= 1135 ? (
            <span className="text-[10px] py-0.5 px-2.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 font-semibold hidden sm:inline-flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Pas 1 Halaman A4</span>
            </span>
          ) : docHeight <= 1380 ? (
            <button
              onClick={() => setIsOnePageMode(true)}
              className="text-[10px] py-0.5 px-2.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-600/80 font-semibold inline-flex items-center gap-1.5 hover:bg-amber-900 transition-all cursor-pointer shadow-2xs"
              title="Konten sedikit tumpah ke halaman 2. Klik untuk padatkan otomatis ke 1 halaman!"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Tumpah +{Math.max(1, Math.round((docHeight - 1123) / 24))} baris (Klik Paskan)</span>
            </button>
          ) : (
            <span className="text-[10px] py-0.5 px-2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium hidden sm:inline-flex">
              {Math.ceil(docHeight / 1123)} Halaman A4
            </span>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOnePageMode(!isOnePageMode)}
            className={`h-6 px-2 text-[10px] gap-1 rounded-full font-semibold transition-all ${
              isOnePageMode
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                : "text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700"
            }`}
            title="Padatkan konten CV agar pas di 1 lembar A4"
          >
            <FileCheck className="w-3 h-3 text-emerald-400" />
            <span>{isOnePageMode ? "1 Hal: Aktif" : "Pas 1 Halaman"}</span>
          </Button>
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

      {/* A4 Preview Container with Content-Aware Scaling */}
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
          {/* A4 Document Root */}
          <div
            ref={templateRef}
            className={`cv-template-root bg-white shadow-2xl mx-auto rounded-xs overflow-hidden ${
              isOnePageMode ? "cv-one-page-compact" : ""
            }`}
            style={{
              width: "794px",
              minHeight: "1123px",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            <TemplateComponent cvData={cvData} />
          </div>
        </div>
      </div>
    </Card>
  );
}
