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
  className = "h-14 flex items-center justify-center my-1",
  imgClassName = "cover-letter-signature-img max-h-13 max-w-[180px] w-auto h-12 object-contain mx-auto select-none pointer-events-none block",
  fallbackClassName = "font-serif italic text-lg text-slate-700 tracking-wide select-none",
}) => {
  if (!data.includeSignature) {
    return <div className="h-10" />;
  }

  if (data.signatureDataUrl) {
    return (
      <div className={`${className} my-1 relative min-h-[44px] flex items-center justify-center`}>
        <img
          src={data.signatureDataUrl}
          alt={`Tanda Tangan ${data.fullName}`}
          className={imgClassName}
          style={{
            height: "46px",
            maxHeight: "50px",
            width: "auto",
            maxWidth: "180px",
            objectFit: "contain",
            display: "block",
            margin: "0 auto",
          }}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div className={`${className} my-1`}>
      <span className={fallbackClassName}>{data.fullName}</span>
    </div>
  );
};

export default SignatureDisplay;

