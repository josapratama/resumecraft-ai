import React from "react";
import type { CoverLetterData, CoverLetterTemplateId } from "../types";
import FormalBUMNTemplate from "./FormalBUMNTemplate";
import ModernTechTemplate from "./ModernTechTemplate";
import MinimalistTemplate from "./MinimalistTemplate";
import CreativeAgencyTemplate from "./CreativeAgencyTemplate";
import FreshGraduateTemplate from "./FreshGraduateTemplate";
import CareerSwitchTemplate from "./CareerSwitchTemplate";
import InternationalTemplate from "./InternationalTemplate";
import EmailCompactTemplate from "./EmailCompactTemplate";
import ExecutiveLeadershipTemplate from "./ExecutiveLeadershipTemplate";
import AcademicResearchTemplate from "./AcademicResearchTemplate";

export const COVER_LETTER_TEMPLATE_COMPONENTS: Record<
  CoverLetterTemplateId,
  React.ComponentType<{ data: CoverLetterData }>
> = {
  "formal-bumn": FormalBUMNTemplate,
  "modern-tech": ModernTechTemplate,
  minimalist: MinimalistTemplate,
  "creative-agency": CreativeAgencyTemplate,
  "fresh-graduate": FreshGraduateTemplate,
  "career-switch": CareerSwitchTemplate,
  international: InternationalTemplate,
  "email-compact": EmailCompactTemplate,
  executive: ExecutiveLeadershipTemplate,
  academic: AcademicResearchTemplate,
};

export {
  FormalBUMNTemplate,
  ModernTechTemplate,
  MinimalistTemplate,
  CreativeAgencyTemplate,
  FreshGraduateTemplate,
  CareerSwitchTemplate,
  InternationalTemplate,
  EmailCompactTemplate,
  ExecutiveLeadershipTemplate,
  AcademicResearchTemplate,
};
