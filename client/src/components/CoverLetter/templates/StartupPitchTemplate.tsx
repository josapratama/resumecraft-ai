import React from "react";
import type { CoverLetterData } from "../types";
import { Rocket, Flame, Gauge } from "lucide-react";

export default function StartupPitchTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#e11d48";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Startup Pitch Header */}
        <div className="pb-6 mb-6 border-b border-rose-100 flex justify-between items-baseline flex-wrap gap-2">
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white bg-rose-600 px-2 py-0.5 rounded-full mb-1.5 shadow-xs">
              <Rocket className="w-3 h-3" /> Startup Operator & Builder
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{data.fullName}</h1>
            <p className="text-xs font-semibold text-slate-600">
              Applying for: <span className="text-rose-600 font-bold">{data.jobTitle}</span> @ {data.companyName}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <p>{data.email}</p>
            <p>{data.phone} · {data.location}</p>
          </div>
        </div>

        {/* Pitch Hook Box */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-600" />
            <span>The Quick Pitch: Why I'm Backing {data.companyName}</span>
          </p>
          <p className="text-slate-700 text-xs mt-1.5 leading-relaxed">
            Early-stage execution doesn't wait for permission. I specialize in turning ambiguous problems into shipped MVPs, iterating with ruthless speed, and wearing whatever hat is necessary to hit product-market milestones.
          </p>
        </div>

        {/* Salutation */}
        <p className="font-bold text-slate-900 mb-3 text-[13px]">{data.salutation || `Hey ${data.companyName} Founders & Team,`}</p>

        {/* Opening */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed">
          {data.opening ||
            `I've been following what you're building at ${data.companyName}, and your trajectory is electrifying. Startups at your stage don't need corporate bureaucracy—they need high-agency builders who take extreme ownership from day one. That is exactly what I bring to the table as your next ${data.jobTitle}.`}
        </p>

        {/* Body */}
        <p className="text-slate-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `Over recent projects, I have launched full-stack applications from scratch, integrated zero-to-one APIs, and optimized deployment cycles to deploy multiple times a day. I operate comfortable in chaos, prioritize aggressively by user impact, and obsess over delivering tangible value to early adopters.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-4 space-y-2">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">How I Accelerate Your Growth:</p>
            <div className="grid grid-cols-1 gap-2">
              {data.skillsHighlight.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-rose-600 font-mono">0{idx + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closing */}
        <p className="text-slate-700 mb-6 text-justify leading-relaxed">
          {data.closing ||
            `Let's skip the weeks of back-and-forth and jump on a quick 15-minute sync this week. I'd love to share ideas on how we can tackle your current growth bottlenecks together.`}
        </p>
      </div>

      {/* Signature */}
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
        <div>
          <p className="text-slate-500">{data.signOff || "Let's build,"}</p>
          <p className="font-black text-slate-900 text-sm mt-0.5">{data.fullName}</p>
        </div>
        {data.portfolioUrl && (
          <a
            href={data.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-rose-600 hover:underline"
          >
            Check Out My Live Demos ↗
          </a>
        )}
      </div>
    </div>
  );
}
