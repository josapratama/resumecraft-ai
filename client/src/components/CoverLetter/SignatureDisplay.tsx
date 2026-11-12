import React from "react";
import type { CoverLetterData } from "./types";

interface SignatureDisplayProps {
  data: CoverLetterData;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}

/**
 * Reusable Signature Display component for Cover Letter Templates.
 * Automatically handles:
 * - Drawn digital signature (Canvas PNG)
 * - Uploaded signature image (PNG/JPG)
 * - Fallback cursive/italic typography when signature toggle is on but no image has been drawn yet
 */
export const SignatureDisplay: React.FC<SignatureDisplayProps> = ({
  data,
  className = "h-16 flex items-center justify-center",
  imgClassName = "max-h-16 max-w-[190px] object-contain mx-auto mix-blend-multiply select-none pointer-events-none",
  fallbackClassName = "font-serif italic text-lg text-slate-700 tracking-wide select-none",
}) => {
  if (!data.includeSignature) {
    return <div className="h-12" />;
  }

  if (data.signatureDataUrl) {
    return (
      <div className={className}>
        <img
          src={data.signatureDataUrl}
          alt={`Tanda Tangan ${data.fullName}`}
          className={imgClassName}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <span className={fallbackClassName}>{data.fullName}</span>
    </div>
  );
};

export default SignatureDisplay;

