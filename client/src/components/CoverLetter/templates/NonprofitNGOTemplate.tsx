import React from "react";
import type { CoverLetterData } from "../types";
import { Heart, Globe2, Users2 } from "lucide-react";

export default function NonprofitNGOTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#047857";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* NGO Header */}
        <div className="pb-6 mb-6 border-b border-emerald-100 flex justify-between items-baseline flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Social Impact, Humanitarian Aid & Community Development</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{data.fullName}</h1>
            <p className="text-xs font-semibold text-slate-600">
              Applying for: <span className="text-emerald-700 font-bold">{data.jobTitle}</span>
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <p>{data.email}</p>
            <p>{data.phone} · {data.location}</p>
          </div>
        </div>

        {/* Recipient */}
        <div className="flex justify-between items-start mb-6 text-xs">
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px]">Addressed To</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">Country Director / Program Selection Committee</p>
            <p className="font-semibold text-slate-800">{data.companyName}</p>
            <p className="text-slate-500">{data.companyAddress || "Non-Governmental Organization"}</p>
          </div>
          <div className="text-right text-slate-500">
            {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Salutation */}
        <p className="font-bold text-slate-900 mb-3 text-[13px]">{data.salutation || "Dear Selection Committee,"}</p>

        {/* Opening */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed">
          {data.opening ||
            `I am writing to express my strong commitment to joining ${data.companyName} as ${data.jobTitle}. Your mission of empowering marginalized communities and driving systemic social change deeply mirrors my personal and professional values. I am eager to leverage my operational discipline and grassroots empathy to amplify the reach of your programs.`}
        </p>

        {/* Impact Box */}
        <div className="my-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <Users2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Community Engagement</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Building deep trust with local beneficiaries and community stakeholders.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Donor Accountability</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Transparent reporting, budget stewardship, and monitoring & evaluation (M&E).</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-slate-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `Throughout my background in project coordination and community advocacy, I have navigated complex field challenges with cultural sensitivity, resourceful problem solving, and strict ethical accountability. I believe in sustainable interventions that empower local leaders rather than creating dependency.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-4 border-l-2 border-emerald-600 space-y-1.5">
            <p className="text-xs font-bold text-slate-900">Program Execution & Core Capabilities:</p>
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
            `I would welcome the opportunity to discuss how my hands-on commitment can support ${data.companyName}'s impactful initiatives. Thank you for your tireless dedication to humanitarian change and for reviewing my application.`}
        </p>
      </div>

      {/* Signature */}
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
        <div>
          <p className="text-slate-500">{data.signOff || "In solidarity and respect,"}</p>
          <p className="font-bold text-slate-900 text-sm mt-0.5">{data.fullName}</p>
        </div>
        <p className="text-emerald-700 font-semibold text-[11px]">Dedicated to Meaningful Impact</p>
      </div>
    </div>
  );
}

