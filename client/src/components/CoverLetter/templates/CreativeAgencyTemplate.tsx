import React from "react";
import type { CoverLetterData } from "../types";
import { Mail, Phone, MapPin, Globe, Sparkles } from "lucide-react";

export default function CreativeAgencyTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#7c3aed";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col md:flex-row"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* Creative Sidebar */}
      <div
        className="w-full md:w-[260px] p-6 sm:p-8 text-white flex flex-col justify-between shrink-0"
        style={{ backgroundColor: accent }}
      >
        <div>
          {/* Avatar / Photo */}
          {data.photoUrl ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 border-2 border-white/30 shadow-md">
              <img src={data.photoUrl} alt={data.fullName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-xl mb-4 border border-white/20">
              {data.fullName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <h2 className="text-lg font-black tracking-tight leading-tight">{data.fullName}</h2>
          <p className="text-xs text-white/80 font-medium mt-1 uppercase tracking-wider">
            {data.targetRole || data.jobTitle}
          </p>

          {/* Contact Details */}
          <div className="mt-8 space-y-3 text-xs text-white/90">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-white/70 shrink-0" />
              <span className="truncate">{data.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-white/70 shrink-0" />
              <span>{data.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/70 shrink-0" />
              <span>{data.location}</span>
            </div>
            {data.portfolioUrl && (
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-white/70 shrink-0" />
                <span className="truncate">{data.portfolioUrl.replace(/^https?:\/\//, "")}</span>
              </div>
            )}
          </div>

          {/* Skills / Badges */}
          {data.skillsHighlight && data.skillsHighlight.length > 0 && (
            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Core Competencies</p>
              <div className="flex flex-wrap gap-1.5">
                {data.skillsHighlight.slice(0, 4).map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/10"
                  >
                    {s.length > 25 ? s.slice(0, 24) + "…" : s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/20 text-[10px] text-white/60">
          Portfolio & Application · {new Date().getFullYear()}
        </div>
      </div>

      {/* Main Letter Body */}
      <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between">
        <div>
          {/* Header Metadata */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Opportunity</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{data.jobTitle}</p>
              <p className="font-semibold text-slate-700">{data.companyName}</p>
            </div>
            <div className="text-right text-slate-500 font-medium">
              {data.city ? `${data.city}, ` : ""}{data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* Salutation */}
          <p className="font-bold text-slate-900 mb-3 text-[13px]">{data.salutation || "Dear Creative Team,"}</p>

          {/* Opening */}
          <p className="text-slate-700 mb-3 text-justify leading-relaxed">
            {data.opening ||
              `I am thrilled to apply for the ${data.jobTitle} role at ${data.companyName}. Your commitment to high-impact design and bold innovation deeply resonates with my creative philosophy and hands-on production background.`}
          </p>

          {/* Core Body */}
          <p className="text-slate-700 mb-4 text-justify leading-relaxed">
            {data.body ||
              `Throughout my projects, I bridge the gap between creative visual execution and robust engineering. Whether designing intuitive digital interfaces, orchestrating design systems, or shipping responsive experiences, I emphasize both emotional resonance and high functional craft.`}
          </p>

          {/* Key Contributions */}
          {data.skillsHighlight && data.skillsHighlight.length > 0 && (
            <div className="my-4 p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
              <div className="flex items-center gap-1.5 font-bold text-purple-950 text-xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>What I Bring to {data.companyName}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-purple-900">
                {data.skillsHighlight.map((item, idx) => (
                  <li key={idx} className="flex items-baseline gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Closing */}
          <p className="text-slate-700 mb-6 text-justify leading-relaxed">
            {data.closing ||
              `I would love the opportunity to walk you through my portfolio work and discuss how we can create exceptional products together. Thank you for taking the time to review my application.`}
          </p>
        </div>

        {/* Signature */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">{data.signOff || "Warm regards,"}</p>
          <p className="text-sm font-black text-slate-900 mt-1">{data.fullName}</p>
        </div>
      </div>
    </div>
  );
}

