import React from "react";
import type { CoverLetterData } from "../types";

export default function MinimalistTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#0f172a";

  return (
    <div
      className="cover-letter-paper bg-white text-neutral-800 p-10 sm:p-14 text-[13px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "'Inter', -apple-system, sans-serif" }}
    >
      <div>
        {/* Minimalist Header */}
        <div className="flex justify-between items-start pb-8 mb-8 border-b border-neutral-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
              {data.fullName}
            </h1>
            <p className="text-xs text-neutral-500 tracking-wider uppercase mt-1">
              {data.targetRole || data.jobTitle}
            </p>
          </div>
          <div className="text-right text-[11px] text-neutral-500 space-y-0.5">
            <p className="font-mono">{data.email}</p>
            <p className="font-mono">{data.phone}</p>
            <p>{data.location}</p>
          </div>
        </div>

        {/* Date & Recipient Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs text-neutral-600">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Attention</p>
            <p className="font-semibold text-neutral-900 text-[13px]">{data.recipientName || "Hiring Manager"}</p>
            <p className="text-neutral-700">{data.companyName}</p>
            {data.companyAddress && <p className="text-neutral-500">{data.companyAddress}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mb-1">Date & Reference</p>
            <p className="text-neutral-800 font-medium">
              {data.city ? `${data.city}, ` : ""}{data.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-neutral-500">Re: {data.jobTitle}</p>
          </div>
        </div>

        {/* Salutation */}
        <p className="font-semibold text-neutral-900 mb-4">{data.salutation || "Dear Hiring Team,"}</p>

        {/* Opening */}
        <p className="text-neutral-700 mb-4 text-justify leading-relaxed">
          {data.opening ||
            `I am writing to express my candidacy for the ${data.jobTitle} position at ${data.companyName}. With a disciplined foundation in technical execution and collaborative delivery, I am confident in my capacity to add immediate momentum to your organization.`}
        </p>

        {/* Body */}
        <p className="text-neutral-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `Over the course of my career, I have dedicated myself to mastering core domain competencies, solving critical architectural bottlenecks, and delivering clear results under tight deadlines. My background combines rigorous analytical thinking with hands-on accountability.`}
        </p>

        {/* Key Points */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-5 pl-4 border-l border-neutral-300 space-y-2">
            {data.skillsHighlight.map((item, idx) => (
              <p key={idx} className="text-xs text-neutral-700 leading-normal">
                <span className="font-semibold text-neutral-900">0{idx + 1}. </span>
                {item}
              </p>
            ))}
          </div>
        )}

        {/* Closing */}
        <p className="text-neutral-700 mb-8 text-justify leading-relaxed">
          {data.closing ||
            `I look forward to discussing how my experience and perspective align with ${data.companyName}'s strategic objectives. Thank you for your review and consideration.`}
        </p>
      </div>

      {/* Clean Sign-off */}
      <div className="pt-6 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">{data.signOff || "Respectfully,"}</p>
        <p className="text-sm font-bold text-neutral-900 mt-2">{data.fullName}</p>
      </div>
    </div>
  );
}
