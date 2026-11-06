import React from "react";
import type { CoverLetterData, CoverLetterTemplateId } from "../types";

// 1 - 10 Original Templates
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

// 11 - 25 New Templates
import CorporateBankingTemplate from "./CorporateBankingTemplate";
import TechBoldTemplate from "./TechBoldTemplate";
import HealthcareMedicalTemplate from "./HealthcareMedicalTemplate";
import LegalConsultingTemplate from "./LegalConsultingTemplate";
import SalesMarketingTemplate from "./SalesMarketingTemplate";
import HospitalityTourismTemplate from "./HospitalityTourismTemplate";
import RemoteWorkTemplate from "./RemoteWorkTemplate";
import StartupPitchTemplate from "./StartupPitchTemplate";
import EngineeringIndustrialTemplate from "./EngineeringIndustrialTemplate";
import EducationTeachingTemplate from "./EducationTeachingTemplate";
import NonprofitNGOTemplate from "./NonprofitNGOTemplate";
import FreelanceContractTemplate from "./FreelanceContractTemplate";
import EditorialJournalismTemplate from "./EditorialJournalismTemplate";
import NordicCleanTemplate from "./NordicCleanTemplate";
import ClassicVintageTemplate from "./ClassicVintageTemplate";

export const COVER_LETTER_TEMPLATE_COMPONENTS: Record<
  CoverLetterTemplateId,
  React.ComponentType<{ data: CoverLetterData }>
> = {
  // 1-10
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

  // 11-25
  "corporate-banking": CorporateBankingTemplate,
  "tech-bold": TechBoldTemplate,
  "healthcare-medical": HealthcareMedicalTemplate,
  "legal-consulting": LegalConsultingTemplate,
  "sales-marketing": SalesMarketingTemplate,
  "hospitality-tourism": HospitalityTourismTemplate,
  "remote-work": RemoteWorkTemplate,
  "startup-pitch": StartupPitchTemplate,
  "engineering-industrial": EngineeringIndustrialTemplate,
  "education-teaching": EducationTeachingTemplate,
  "nonprofit-ngo": NonprofitNGOTemplate,
  "freelance-contract": FreelanceContractTemplate,
  "editorial-journalism": EditorialJournalismTemplate,
  "nordic-clean": NordicCleanTemplate,
  "classic-vintage": ClassicVintageTemplate,
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
  CorporateBankingTemplate,
  TechBoldTemplate,
  HealthcareMedicalTemplate,
  LegalConsultingTemplate,
  SalesMarketingTemplate,
  HospitalityTourismTemplate,
  RemoteWorkTemplate,
  StartupPitchTemplate,
  EngineeringIndustrialTemplate,
  EducationTeachingTemplate,
  NonprofitNGOTemplate,
  FreelanceContractTemplate,
  EditorialJournalismTemplate,
  NordicCleanTemplate,
  ClassicVintageTemplate,
};
