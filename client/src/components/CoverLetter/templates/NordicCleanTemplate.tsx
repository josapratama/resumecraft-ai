import React from "react";
import type { CoverLetterData } from "../types";

export default function NordicCleanTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#334155";

  return (
    <div
      className="cover-letter-paper bg-[#fafaf9] text-zinc-800 p-10 sm:p-14 text-[13px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "'Plus Jakarta Sans', -apple-system, sans-serif" }}
    >
      <div>
        {/* Nordic Clean Header */}
        <div className="pb-8 mb-8 border-b border-zinc-200">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                Kandidat Profesional
              </span>
              <h1 className="text-2xl font-light tracking-tight text-zinc-900">{data.fullName}</h1>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                {data.targetRole || data.jobTitle}
              </p>
            </div>
            <div className="text-right text-xs text-zinc-500 font-mono space-y-1">
              <p>{data.email}</p>
              <p>{data.phone}</p>
              <p>{data.location}</p>
            </div>
          </div>
        </div>

        {/* Date & Destination */}
        <div className="flex justify-between items-baseline mb-8 text-xs text-zinc-600">
          <div>
            <p className="font-medium text-zinc-900">{data.recipientName || "Hiring Team"}</p>
            <p className="text-zinc-700">{data.companyName}</p>
            <p className="text-zinc-400 text-[11px]">{data.companyAddress || "Office Location"}</p>
          </div>
          <div className="text-right font-mono text-[11px] text-zinc-400">
            {data.city ? `${data.city}, ` : ""}{data.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Salutation */}
        <p className="font-medium text-zinc-900 mb-4">{data.salutation || "Dear Hiring Team,"}</p>

        {/* Opening */}
        <p className="text-zinc-700 mb-4 text-justify leading-relaxed">
          {data.opening ||
            `I am pleased to present my application for the ${data.jobTitle} role at ${data.companyName}. Having observed your principled focus on craftsmanship, thoughtful execution, and clear organizational values, I am motivated to contribute my technical diligence to your team.`}
        </p>

        {/* Body */}
        <p className="text-zinc-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `My approach to work is guided by simplicity, clear communication, and dependable execution. I value well-structured systems that reduce complexity and empower colleagues to move with confidence and clarity.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-6 pl-4 border-l border-zinc-300 space-y-2">
            {data.skillsHighlight.map((item, idx) => (
              <p key={idx} className="text-xs text-zinc-600 leading-normal">
                <span className="font-mono text-zinc-400 mr-2">—</span>
                {item}
              </p>
            ))}
          </div>
        )}

        {/* Closing */}
        <p className="text-zinc-700 mb-8 text-justify leading-relaxed">
          {data.closing ||
            `I welcome an opportunity to speak with you about how my background and work ethic align with the goals of ${data.companyName}. Thank you for your consideration.`}
        </p>
      </div>

      {/* Nordic Sign-off */}
      <div className="pt-6 border-t border-zinc-200">
        <p className="text-xs text-zinc-500">{data.signOff || "Warmly,"}</p>
        <p className="text-sm font-medium text-zinc-900 mt-1">{data.fullName}</p>
      </div>
    </div>
  );
}

