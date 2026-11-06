import React from "react";
import type { CoverLetterData } from "../types";
import { Briefcase, CheckCircle2, Calendar, DollarSign } from "lucide-react";

export default function FreelanceContractTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#475569";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Proposal Header */}
        <div className="pb-6 mb-6 border-b border-slate-200 flex justify-between items-start flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-0.5 rounded-md">
              Independent Contractor & Project Proposal
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{data.fullName}</h1>
            <p className="text-xs font-semibold text-slate-600">
              Specialized Freelance Consultant · {data.targetRole || data.jobTitle}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono space-y-0.5">
            <p>{data.email}</p>
            <p>{data.phone} · {data.location}</p>
          </div>
        </div>

        {/* Project Target */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-6 flex justify-between items-center text-xs">
          <div>
            <p className="text-slate-400 font-semibold text-[10px] uppercase">Client Organization</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{data.companyName}</p>
            <p className="text-slate-600 text-[11px]">Attention: {data.recipientName || "Project Manager / Client"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase">Availability</p>
            <p className="font-bold text-emerald-700">Immediate / 20-40 hrs/wk</p>
          </div>
        </div>

        {/* Salutation */}
        <p className="font-bold text-slate-900 mb-3 text-[13px]">{data.salutation || `Hi ${data.companyName} Team,`}</p>

        {/* Opening */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed">
          {data.opening ||
            `I am submitting this proposal for your upcoming ${data.jobTitle} project scope. As an experienced independent consultant, I understand that hiring contract talent is about certainty: crisp deliverables, zero onboarding friction, and hitting deadlines on budget.`}
        </p>

        {/* Deliverables Scope Box */}
        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <p className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-slate-700" />
            <span>Scope of Collaboration & Deliverables:</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700">End-to-end execution from architecture to production release.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700">Weekly sprint demos, transparent milestone tracking, and clean docs.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700">Self-sufficient delivery with responsive async communication.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-slate-700">Post-launch handover, training, and warranty period.</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-slate-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `Over past client engagements, I have consistently turned product visions into production realities without requiring extensive management overhead. I take full responsibility for technical architecture, code quality, and timely milestone handovers.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-4 pl-4 border-l-2 border-slate-700 space-y-1.5">
            <p className="text-xs font-bold text-slate-900">Proven Track Record Highlights:</p>
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
            `I would be happy to review your project brief or schedule a 20-minute kickoff discovery call to provide an estimate and action plan. Thank you for your consideration.`}
        </p>
      </div>

      {/* Signature */}
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
        <div>
          <p className="text-slate-500">{data.signOff || "Best regards,"}</p>
          <p className="font-bold text-slate-900 mt-0.5">{data.fullName}</p>
        </div>
        {data.portfolioUrl && (
          <a
            href={data.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-700 hover:underline"
          >
            Review Case Studies & Past Work ↗
          </a>
        )}
      </div>
    </div>
  );
}
