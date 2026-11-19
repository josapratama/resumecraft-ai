import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";

interface CVQRCodeProps {
  url?: string | null;
  label?: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
  isDark?: boolean;
}

export default function CVQRCode({
  url,
  label = "Portofolio Digital",
  size = 52,
  fgColor = "#0f172a",
  bgColor = "#ffffff",
  className = "",
  isDark = false,
}: CVQRCodeProps) {
  if (!url) return null;

  const displayDomain = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  return (
    <div
      className={`inline-flex items-center gap-2 p-2 rounded-xl border ${
        isDark
          ? "bg-slate-900/90 border-slate-800 text-slate-200"
          : "bg-white/95 border-slate-200/80 text-slate-800 shadow-xs"
      } ${className}`}
      title={`Scan QR Code: ${url}`}
    >
      <div className="p-1 bg-white rounded-lg shrink-0 shadow-xs">
        <QRCodeSVG
          value={url}
          size={size}
          fgColor={fgColor}
          bgColor={bgColor}
          level="M"
        />
      </div>
      <div className="flex flex-col min-w-0 pr-0.5">
        <span
          className={`text-[9.5px] font-bold leading-tight flex items-center gap-1 truncate ${
            isDark ? "text-slate-200" : "text-slate-900"
          }`}
        >
          <QrCode className="w-2.5 h-2.5 text-blue-500 shrink-0" />
          {label}
        </span>
        <span
          className={`text-[8.5px] truncate max-w-[130px] font-mono mt-0.5 ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {displayDomain}
        </span>
        <span className="text-[7.5px] text-slate-400 uppercase tracking-wider mt-0.5 font-medium">
          Scan dengan Kamera HP
        </span>
      </div>
    </div>
  );
}
