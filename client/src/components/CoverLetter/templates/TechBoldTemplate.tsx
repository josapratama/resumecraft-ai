import React from "react";
import type { CoverLetterData } from "../types";
import { Terminal, Cpu, GitBranch, ExternalLink } from "lucide-react";

export default function TechBoldTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#0f172a";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Consolas, 'Roboto Mono', Monaco, monospace" }}
    >
      <div>
        {/* Terminal Header */}
        <div className="rounded-xl bg-slate-950 text-slate-100 p-5 mb-6 shadow-md border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-[10px] text-slate-400 font-mono ml-2">application_letter.sh</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">STATUS: READY_TO_DEPLOY</span>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-[11px] text-emerald-400 font-mono">❯ user.profile --name</p>
              <h1 className="text-xl font-black text-white tracking-wide uppercase mt-0.5">{data.fullName}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                ROLE: {data.targetRole || data.jobTitle}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono space-y-0.5">
              <p>EMAIL : {data.email}</p>
              <p>PHONE : {data.phone}</p>
              <p>LOC   : {data.location}</p>
            </div>
          </div>
        </div>

        {/* Target Details */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-6 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px] block">TARGET EMPLOYER</span>
            <span className="font-bold text-slate-900">{data.companyName}</span>
            <span className="text-slate-500 text-[11px]"> · {data.recipientTitle || "Engineering Lead"}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">TIMESTAMP</span>
            <span className="font-mono text-slate-700">{data.date || "2026-11-06"}</span>
          </div>
        </div>

        {/* Salutation */}
        <p className="font-bold text-slate-900 mb-3 text-[13px]">{data.salutation || "Hello Engineering Team,"}</p>

        {/* Opening */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed">
          {data.opening ||
            `I am submitting this application for the ${data.jobTitle} position at ${data.companyName}. Having tracked your engineering architecture, reliability standards, and product velocity, I am confident that my technical background in distributed systems and modern web technologies aligns with your core challenges.`}
        </p>

        {/* Body */}
        <p className="text-slate-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `My engineering approach emphasizes maintainable clean code, resilient infrastructure, and fast feedback loops through CI/CD pipelines. I thrive on debugging complex bottlenecks, optimizing throughput, and collaborating across multidisciplinary teams to ship production-ready services.`}
        </p>

        {/* Code / Highlight Box */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Cpu className="w-3.5 h-3.5 text-slate-700" />
              <span>CORE TECHNICAL COMPETENCIES:</span>
            </div>
            <div className="space-y-1 pl-2">
              {data.skillsHighlight.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-mono">
                  <span className="text-emerald-600 font-bold">❯</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closing */}
        <p className="text-slate-700 mb-6 text-justify leading-relaxed">
          {data.closing ||
            `I welcome the opportunity to dive into a technical interview or code walkthrough to discuss how I can contribute to ${data.companyName}. Thanks for taking the time to review my application.`}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
        <div>
          <p className="text-slate-500">{data.signOff || "Best regards,"}</p>
          <p className="font-bold text-slate-900 mt-0.5">{data.fullName}</p>
        </div>
        {data.portfolioUrl && (
          <a
            href={data.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-700 font-bold hover:underline"
          >
            <span>Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
