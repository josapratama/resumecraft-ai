import React from "react";
import type { CoverLetterData } from "../types";
import { ShieldCheck, TrendingUp, Users } from "lucide-react";

export default function ExecutiveLeadershipTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#1e1b4b";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-10 sm:p-14 text-[13px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Palatino, 'Palatino Linotype', 'Book Antiqua', serif" }}
    >
      <div>
        {/* Executive Letterhead */}
        <div className="text-center pb-6 mb-8 border-b-2 border-slate-900">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-slate-900 mb-2 font-bold text-sm tracking-widest">
            {data.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">{data.fullName}</h1>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-500 mt-1">
            Executive Leadership & Technology Management
          </p>
          <div className="flex justify-center items-center gap-3 text-xs text-slate-600 mt-2 font-sans">
            <span>{data.email}</span>
            <span>•</span>
            <span>{data.phone}</span>
            <span>•</span>
            <span>{data.location}</span>
          </div>
        </div>

        {/* Date & Recipient Details */}
        <div className="flex justify-between items-start mb-6 text-xs font-sans">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Delivered To</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{data.recipientName || "Executive Search Committee"}</p>
            <p className="font-semibold text-slate-700">{data.companyName}</p>
            <p className="text-slate-500">{data.companyAddress || "Executive Suite"}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-600 font-medium">
              {data.city ? `${data.city}, ` : ""}{data.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-slate-500 font-bold mt-1">CONFIDENTIAL APPLICATION</p>
          </div>
        </div>

        {/* Subject */}
        <p className="font-bold text-slate-900 text-sm mb-4 border-l-2 border-slate-900 pl-3">
          Subject: Candidacy for {data.jobTitle}
        </p>

        {/* Salutation */}
        <p className="font-semibold text-slate-900 mb-4">{data.salutation || "Dear Members of the Search Committee,"}</p>

        {/* Executive Opening */}
        <p className="text-slate-700 mb-4 text-justify leading-relaxed">
          {data.opening ||
            `I am writing to express my strategic interest in the ${data.jobTitle} executive mandate at ${data.companyName}. With extensive experience spearheading mission-critical engineering initiatives, mentoring high-performance technical teams, and translating complex technical roadmaps into sustainable business value, I am prepared to deliver transformational leadership to your enterprise.`}
        </p>

        {/* Strategic Impact Pillars */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-sans grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-900 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Strategic Vision</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Architecting resilient systems and driving business growth.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-indigo-900 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Team Enablement</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Empowering engineering talents with accountability.</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-900 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Governance & Trust</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Maintaining rigorous security, quality, and operational SLA.</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-slate-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `My executive philosophy centers on establishing clear architectural north stars, eliminating friction in development lifecycles, and fostering cross-functional synergy between engineering and executive leadership. I approach every technological investment with a keen focus on ROI and operational resilience.`}
        </p>

        {/* Strategic Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-4 pl-6 space-y-1.5">
            <p className="text-xs font-bold text-slate-900 font-sans">Key Leadership Deliverables:</p>
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
            `I look forward to discussing how my leadership track record can advance ${data.companyName}'s organizational vision. Thank you for your consideration and discretion.`}
        </p>
      </div>

      {/* Executive Sign-off */}
      <div className="pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-600">{data.signOff || "Respectfully submitted,"}</p>
        <div className="h-14 flex items-center italic text-slate-700 text-base">
          {data.includeSignature ? data.fullName : ""}
        </div>
        <p className="font-bold text-slate-900 text-sm tracking-wide">{data.fullName}</p>
      </div>
    </div>
  );
}
