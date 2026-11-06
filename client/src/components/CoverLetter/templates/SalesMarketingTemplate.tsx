import React from "react";
import type { CoverLetterData } from "../types";
import { TrendingUp, Target, Zap } from "lucide-react";

export default function SalesMarketingTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#ea580c";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Sales Header */}
        <div className="pb-6 mb-6 border-b border-orange-100">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                Revenue & Business Growth
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">{data.fullName}</h1>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Target Role: {data.targetRole || data.jobTitle}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <p>{data.email}</p>
              <p>{data.phone} · {data.location}</p>
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="flex justify-between items-start mb-6 text-xs">
          <div>
            <p className="text-slate-400 font-semibold uppercase text-[10px]">Prepared For</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {data.recipientTitle || "Head of Sales & Commercial Growth"}
            </p>
            <p className="font-semibold text-slate-800">{data.companyName}</p>
          </div>
          <div className="text-right text-slate-500">
            {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Salutation */}
        <p className="font-bold text-slate-900 mb-3 text-[13px]">{data.salutation || "Dear Hiring Team,"}</p>

        {/* Opening */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed">
          {data.opening ||
            `I am reaching out to present my track record for the ${data.jobTitle} opportunity at ${data.companyName}. In today's fast-moving market, scaling revenue requires a relentless combination of strategic pipeline prospecting, value-based consultative selling, and data-backed closing discipline. I am eager to replicate that growth engine with your sales team.`}
        </p>

        {/* Growth Matrix */}
        <div className="my-4 p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Pipeline Generation</p>
              <p className="text-[11px] text-slate-600 mt-0.5">High-volume outbound sourcing & qualified lead acquisition.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Quota Attainment</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Consistent performance exceeding target revenue goals.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Relationship Retention</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Nurturing enterprise accounts and long-term customer LTV.</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-slate-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `Throughout my commercial experience, I have developed a deep appreciation for customer pain points, rapid objection handling, and cross-functional alignment with marketing and product teams. I don't just sell features; I build defensible business cases that make partnering with our company an undeniable win for the client.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-4 border-l-2 border-orange-500 space-y-1.5">
            <p className="text-xs font-bold text-slate-900">Commercial Wins & Core Capabilities:</p>
            {data.skillsHighlight.map((item, idx) => (
              <p key={idx} className="text-xs text-slate-700 leading-normal">
                • {item}
              </p>
            ))}
          </div>
        )}

        {/* Closing */}
        <p className="text-slate-700 mb-6 text-justify leading-relaxed">
          {data.closing ||
            `I look forward to discussing how my outbound drive and commercial momentum can support ${data.companyName}'s quarterly growth targets. Thank you very much for your review.`}
        </p>
      </div>

      {/* Signature */}
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
        <div>
          <p className="text-slate-500">{data.signOff || "Best regards,"}</p>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{data.fullName}</p>
        </div>
        <p className="text-orange-600 font-semibold text-[11px]">Ready to Drive Impact</p>
      </div>
    </div>
  );
}

