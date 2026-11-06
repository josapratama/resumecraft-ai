import React from "react";
import type { CoverLetterData } from "../types";
import { Mail, Phone, MapPin, Globe, CheckCircle2, ArrowUpRight } from "lucide-react";

export default function ModernTechTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#2563eb";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Modern Header Banner */}
        <div className="pb-6 mb-6 border-b border-slate-100">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{data.fullName}</h1>
              <p className="text-xs font-semibold tracking-wide uppercase mt-0.5" style={{ color: accent }}>
                {data.targetRole || data.jobTitle}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">
                {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Contact Pills */}
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 mt-3">
            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-md">
              <Mail className="w-3 h-3 text-slate-400" /> {data.email}
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-md">
              <Phone className="w-3 h-3 text-slate-400" /> {data.phone}
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-md">
              <MapPin className="w-3 h-3 text-slate-400" /> {data.location}
            </span>
            {data.portfolioUrl && (
              <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-md">
                <Globe className="w-3 h-3 text-slate-400" /> {data.portfolioUrl.replace(/^https?:\/\//, "")}
              </span>
            )}
          </div>
        </div>

        {/* Recipient Block */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex justify-between items-start">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">To / Application For</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {data.recipientName || "Hiring Manager"}
              {data.recipientTitle ? ` · ${data.recipientTitle}` : ""}
            </p>
            <p className="text-slate-700 font-medium text-xs">{data.companyName}</p>
            {data.companyAddress && <p className="text-slate-500 text-[11px] mt-0.5">{data.companyAddress}</p>}
          </div>
          <div className="text-right">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white shadow-xs"
              style={{ backgroundColor: accent }}
            >
              Role: {data.jobTitle}
            </span>
          </div>
        </div>

        {/* Salutation */}
        <p className="font-bold text-slate-900 mb-3 text-[13px]">{data.salutation || "Dear Hiring Team,"}</p>

        {/* Opening Paragraph */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed">
          {data.opening ||
            `I am writing to express my strong enthusiasm for the ${data.jobTitle} position at ${data.companyName}. Having followed your technology initiatives and product milestones, I am eager to leverage my engineering background and problem-solving skills to accelerate your team's upcoming roadmaps.`}
        </p>

        {/* Core Body */}
        <p className="text-slate-700 mb-4 text-justify leading-relaxed">
          {data.body ||
            `Throughout my experience developing modern web architectures and robust backend services, I have focused on writing scalable code, optimizing system throughput, and delivering intuitive user experiences. I thrive in high-ownership engineering cultures where measurable customer impact is the primary goal.`}
        </p>

        {/* Key Highlights (Bullet Cards) */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Key Contributions & Highlights</p>
            <div className="grid grid-cols-1 gap-2">
              {data.skillsHighlight.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                  <span className="text-xs text-slate-700 leading-normal">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closing Paragraph */}
        <p className="text-slate-700 mb-6 text-justify leading-relaxed">
          {data.closing ||
            `I welcome the opportunity to discuss how my technical expertise and proactive problem-solving can benefit ${data.companyName}. Thank you very much for your time and consideration.`}
        </p>
      </div>

      {/* Modern Sign-off */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{data.signOff || "Sincerely,"}</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{data.fullName}</p>
          <p className="text-[11px] text-slate-500 font-mono">{data.email} · {data.phone}</p>
        </div>
        {data.portfolioUrl && (
          <a
            href={data.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: accent }}
          >
            <span>Live Portfolio</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

