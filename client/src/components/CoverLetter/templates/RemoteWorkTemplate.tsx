import React from "react";
import type { CoverLetterData } from "../types";
import { Wifi, Clock, MessageSquare, Laptop } from "lucide-react";

export default function RemoteWorkTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#0d9488";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Remote Header */}
        <div className="pb-6 mb-6 border-b border-teal-100 flex justify-between items-start flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-teal-700 text-xs font-semibold mb-1">
              <Wifi className="w-3.5 h-3.5 text-teal-600" />
              <span>Remote-First & Distributed Team Specialist</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{data.fullName}</h1>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
              {data.targetRole || data.jobTitle}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono space-y-0.5">
            <p>{data.email}</p>
            <p>{data.phone}</p>
            <p>Timezone: UTC+7 (Flexible +/- 4 hrs)</p>
          </div>
        </div>

        {/* Remote Specs Badge Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-teal-800">Overlap Working Hours</p>
              <p className="font-semibold text-slate-800">4-6 Hours US/EU Core Overlap</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-teal-800">Communication</p>
              <p className="font-semibold text-slate-800">Async-First & Clear Written Docs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-teal-800">Workspace</p>
              <p className="font-semibold text-slate-800">High-Speed Fiber & Dedicated Rig</p>
            </div>
          </div>
        </div>

        {/* Recipient */}
        <div className="flex justify-between items-start mb-6 text-xs">
          <div>
            <p className="font-bold text-slate-900">{data.recipientName || "Remote Talent Acquisition Lead"}</p>
            <p className="font-semibold text-slate-700">{data.companyName}</p>
            <p className="text-slate-500">Fully Distributed Organization</p>
          </div>
          <div className="text-right text-slate-500">
            {data.city || "Remote"}, {data.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Salutation */}
        <p className="font-bold text-slate-900 mb-3 text-[13px]">{data.salutation || "Hi Remote Team,"}</p>

        {/* Opening */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed">
          {data.opening ||
            `I am excited to submit my application for the remote ${data.jobTitle} position at ${data.companyName}. Having spent years excelling in distributed work setups, I understand that true remote success is built on clear documentation, extreme ownership, and proactive asynchronous coordination.`}
        </p>

        {/* Body */}
        <p className="text-slate-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `I operate with high autonomy and minimal supervision, translating broad product specifications into actionable milestones. My communication style is structured: thorough PR descriptions, detailed Loom walkthroughs when necessary, and concise Slack summaries that keep teammates across all timezones perfectly in sync.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-4 pl-4 border-l-2 border-teal-500 space-y-1.5">
            <p className="text-xs font-bold text-slate-900">Distributed Workflow Highlights:</p>
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
            `I would welcome a video call to discuss how my self-driven execution can add immediate velocity to ${data.companyName}. Thank you for considering my application.`}
        </p>
      </div>

      {/* Signature */}
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
        <div>
          <p className="text-slate-500">{data.signOff || "Cheers,"}</p>
          <p className="font-bold text-slate-900 mt-0.5">{data.fullName}</p>
        </div>
        <div className="text-right text-[11px] text-teal-700 font-medium">
          Ready for Worldwide Remote Onboarding
        </div>
      </div>
    </div>
  );
}
