import React from "react";
import type { FullCVData } from "@/types/cv";
import { Target, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";

export interface ATSScoreCalculation {
  score: number;
  label: string;
  badgeClass: string;
  textClass: string;
  items: Array<{ label: string; done: boolean; points: number }>;
}

export function calculateATSReadiness(cvData?: FullCVData | null): ATSScoreCalculation {
  if (!cvData) {
    return {
      score: 0,
      label: "Belum Lengkap",
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
      textClass: "text-slate-500",
      items: [],
    };
  }

  const items = [
    {
      label: "Informasi Kontak (Nama, Email, No. HP)",
      done: !!(
        cvData.personalInfo?.fullName &&
        cvData.personalInfo?.email &&
        cvData.personalInfo?.phone
      ),
      points: 20,
    },
    {
      label: "Ringkasan Profil (About Me >= 80 karakter)",
      done: !!(
        cvData.personalInfo?.professionalSummary &&
        cvData.personalInfo.professionalSummary.trim().length >= 80
      ),
      points: 20,
    },
    {
      label: "Pengalaman Kerja dengan Deskripsi Rinci",
      done: !!(
        cvData.workExperiences &&
        cvData.workExperiences.length > 0 &&
        cvData.workExperiences.some(w => (w.description || "").trim().length >= 30)
      ),
      points: 25,
    },
    {
      label: "Riwayat Pendidikan Lengkap",
      done: !!(cvData.educations && cvData.educations.length > 0),
      points: 15,
    },
    {
      label: "Minimal 5 Keahlian Terkait",
      done: !!(cvData.skills && cvData.skills.length >= 5),
      points: 10,
    },
    {
      label: "Sertifikasi atau Portofolio Proyek",
      done: !!(
        (cvData.certifications && cvData.certifications.length > 0) ||
        (cvData.projects && cvData.projects.length > 0)
      ),
      points: 10,
    },
  ];

  const score = items.reduce((acc, item) => (item.done ? acc + item.points : acc), 0);

  let label = "Perlu Dilengkapi";
  let badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
  let textClass = "text-rose-600";

  if (score >= 85) {
    label = "Sangat Siap (ATS Ready)";
    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    textClass = "text-emerald-600";
  } else if (score >= 65) {
    label = "Cukup Baik";
    badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
    textClass = "text-amber-600";
  }

  return { score, label, badgeClass, textClass, items };
}

interface ATSReadinessBadgeProps {
  cvData?: FullCVData | null;
  onClick?: () => void;
  className?: string;
}

export default function ATSReadinessBadge({
  cvData,
  onClick,
  className = "",
}: ATSReadinessBadgeProps) {
  const { score, label, badgeClass, textClass } = calculateATSReadiness(cvData);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs hover:opacity-90 ${badgeClass} ${className}`}
      title="Klik untuk membuka audit mendalam ATS Match Score"
    >
      <Target className={`w-3.5 h-3.5 ${textClass} shrink-0`} />
      <span className="font-mono font-bold">{score}%</span>
      <span className="hidden sm:inline text-[11px] font-normal text-slate-600">· {label}</span>
      <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
    </button>
  );
}
