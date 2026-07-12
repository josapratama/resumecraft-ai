import { Card } from "@/components/ui/card";
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
  return (
    <Card className="overflow-hidden shadow-lg border-2 border-black">
      {/*
        A4 Preview - responsive and content-aware:
        - Width adjusts to container (max 210mm A4 width)
        - Height follows content naturally
        - No forced empty space
      */}
      <div
        className="bg-gray-100 cv-scroll-wrapper overflow-y-auto overflow-x-hidden flex items-start justify-center py-4"
        style={{ maxHeight: "calc(100vh - 200px)", minHeight: "500px" }}
      >
        {/* A4 container - responsive width */}
        <div
          className="cv-template-root bg-white shadow-xl mx-auto"
          style={{
            width: "100%",
            maxWidth: "210mm",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          <TemplateComponent cvData={cvData} />
        </div>
      </div>
    </Card>
  );
}
