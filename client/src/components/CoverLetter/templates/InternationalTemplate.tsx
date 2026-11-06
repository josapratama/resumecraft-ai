import React from "react";
import type { CoverLetterData } from "../types";

export default function InternationalTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#1e293b";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-10 sm:p-14 text-[13px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Times New Roman, Times, serif" }}
    >
      <div>
        {/* US/UK Applicant Address Block (Top Left) */}
        <div className="mb-6 space-y-0.5 text-xs text-slate-700">
          <p className="text-base font-bold text-slate-900 tracking-wide">{data.fullName}</p>
          <p>{data.location}</p>
          <p>{data.phone}</p>
          <p className="text-blue-700 hover:underline">{data.email}</p>
          {data.portfolioUrl && <p className="text-blue-700">{data.portfolioUrl}</p>}
        </div>

        {/* Date */}
        <div className="mb-6 text-xs text-slate-600">
          {data.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>

        {/* Employer Address Block */}
        <div className="mb-6 space-y-0.5 text-xs text-slate-700">
          <p className="font-bold text-slate-900">{data.recipientName || "Hiring Manager"}</p>
          {data.recipientTitle && <p>{data.recipientTitle}</p>}
          <p className="font-semibold text-slate-800">{data.companyName}</p>
          <p>{data.companyAddress || "Corporate Headquarters"}</p>
        </div>

        {/* Subject line (optional in US letters, but clean) */}
        <div className="mb-4 font-bold text-slate-900 text-xs">
          RE: Application for the position of {data.jobTitle}
        </div>

        {/* Salutation */}
        <p className="font-semibold text-slate-900 mb-4">{data.salutation || "Dear Hiring Team,"}</p>

        {/* Paragraph 1: The Hook & Alignment */}
        <p className="text-justify mb-4 leading-relaxed">
          {data.opening ||
            `Please accept this letter as an expression of my strong interest in the ${data.jobTitle} opportunity with ${data.companyName}. Having followed your organization's impressive growth and commitment to industry-leading standards, I am eager to contribute my background in full-lifecycle software delivery and technical problem solving to your engineering team.`}
        </p>

        {/* Paragraph 2: The Pitch & Core Competencies */}
        <p className="text-justify mb-4 leading-relaxed">
          {data.body ||
            `Throughout my experience, I have developed end-to-end architectures, automated complex deployment workflows, and partnered cross-functionally to achieve measurable business milestones. My technical foundation is complemented by a rigorous approach to code quality, system resilience, and user-centric execution.`}
        </p>

        {/* Key Accomplishments (Bullet Points) */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-4 pl-6 space-y-2">
            <p className="text-xs font-bold text-slate-900">Key Qualifications and Achievements:</p>
            {data.skillsHighlight.map((item, idx) => (
              <div key={idx} className="flex items-baseline gap-2">
                <span className="text-slate-500">•</span>
                <span className="text-slate-700 text-xs text-justify">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Paragraph 3: The Close & Interview Request */}
        <p className="text-justify mb-6 leading-relaxed">
          {data.closing ||
            `I welcome the chance to speak with you directly to discuss how my skill set and proactive work ethic can support ${data.companyName}'s upcoming goals. Thank you for your time, consideration, and review of my attached application materials.`}
        </p>
      </div>

      {/* Formal US/UK Sign-off */}
      <div className="pt-6">
        <p className="text-xs text-slate-700">{data.signOff || "Sincerely,"}</p>
        <div className="h-16 flex items-center">
          {data.includeSignature ? (
            <span className="font-serif italic text-base text-slate-700">
              {data.fullName}
            </span>
          ) : (
            <div className="h-12" />
          )}
        </div>
        <p className="font-bold text-slate-900 text-sm">{data.fullName}</p>
        <p className="text-xs text-slate-500 mt-0.5">Enclosures: Resume, Portfolio</p>
      </div>
    </div>
  );
}
