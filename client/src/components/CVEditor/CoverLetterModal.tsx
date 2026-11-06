import React from "react";
import type { FullCVData } from "@/types/cv";
import CoverLetterWorkspace from "@/components/CoverLetter/CoverLetterWorkspace";

interface CoverLetterModalProps {
  cvId: number;
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
  cvData?: FullCVData;
}

export default function CoverLetterModal({
  cvId,
  isOpen,
  onClose,
  defaultRole = "",
  cvData,
}: CoverLetterModalProps) {
  if (!isOpen) return null;

  return (
    <CoverLetterWorkspace
      cvId={cvId}
      cvData={cvData}
      defaultRole={defaultRole}
      onClose={onClose}
    />
  );
}
