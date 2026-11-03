import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from "lucide-react";
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
  const [zoom, setZoom] = useState<number>(100);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);

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
    <Card className="overflow-hidden shadow-sm border border-neutral-200 bg-neutral-900/5 rounded-2xl">
      {/* Top Interactive Preview Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 text-white text-xs border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide capitalize text-neutral-200">
            {template}
          </span>
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-neutral-700 text-neutral-300">
            A4 Standard
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            className="h-6 w-6 p-0 text-neutral-300 hover:text-white hover:bg-neutral-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          <button
            onClick={handleResetZoom}
            className="px-1.5 py-0.5 text-[11px] font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 rounded"
            title="Reset to 100%"
          >
            {zoom}%
          </button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            className="h-6 w-6 p-0 text-neutral-300 hover:text-white hover:bg-neutral-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>

          <div className="w-px h-3.5 bg-neutral-700 mx-1" />

          <Button
            size="sm"
            variant="ghost"
            onClick={handleFitScreen}
            className={`h-6 px-1.5 text-[11px] gap-1 ${
              isAutoFit ? "text-indigo-400 bg-neutral-800" : "text-neutral-300 hover:text-white hover:bg-neutral-800"
            }`}
            title="Fit to Screen Width"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Fit</span>
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
            className="cv-template-root bg-white shadow-2xl mx-auto rounded-xs overflow-hidden"
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
