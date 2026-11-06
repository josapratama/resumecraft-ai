import React from "react";
import type { CoverLetterData } from "../types";
import { Paperclip, Send, Mail, Check } from "lucide-react";

export default function EmailCompactTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#0284c7";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-6 sm:p-10 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Email Header Chrome */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 mb-6 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-16 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">To:</span>
            <span className="font-semibold text-slate-800">
              {data.recipientName || "Hiring Team"} &lt;recruitment@{data.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&gt;
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-16 font-semibold text-slate-400 uppercase tracking-wider text-[11px]">From:</span>
            <span className="text-slate-700 font-mono">
              {data.fullName} &lt;{data.email}&gt;
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
            <span className="w-16 font-semibold text-sky-700 uppercase tracking-wider text-[11px]">Subject:</span>
            <span className="font-bold text-slate-900 font-mono">
              {data.subject || `[Lamaran Pekerjaan] - ${data.jobTitle} - ${data.fullName}`}
            </span>
          </div>
        </div>

        {/* Email Body Content */}
        <div className="px-2 space-y-3.5 text-slate-700">
          <p className="font-semibold text-slate-900">{data.salutation || "Selamat pagi/siang Tim HRD,"}</p>

          <p className="leading-relaxed">
            {data.opening ||
              `Perkenalkan, saya ${data.fullName}. Melalui email ini, saya bermaksud untuk mengajukan lamaran kerja untuk posisi ${data.jobTitle} di ${data.companyName}.`}
          </p>

          <p className="leading-relaxed">
            {data.body ||
              `Dengan pengalaman praktis dalam perancangan dan implementasi solusi perangkat lunak modern, saya memiliki pemahaman mendalam dalam membangun sistem yang efisien, scalable, dan berorientasi pada kepuasan pengguna.`}
          </p>

          {/* 3 Quick Bullets */}
          {data.skillsHighlight && data.skillsHighlight.length > 0 && (
            <div className="my-3 space-y-1.5 pl-2">
              <p className="font-bold text-slate-900 text-xs">Ringkasan Nilai Kualifikasi:</p>
              {data.skillsHighlight.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-1" />
                  <span className="text-xs text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          )}

          <p className="leading-relaxed">
            {data.closing ||
              `Bersama email ini telah saya lampirkan dokumen Curriculum Vitae (CV) dan tautan portofolio terbaru untuk bahan pertimbangan lebih lanjut. Saya sangat terbuka untuk kesempatan wawancara atau diskusi teknis.`}
          </p>

          {/* Attached Files Bar */}
          <div className="my-4 p-3 rounded-lg bg-sky-50/70 border border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-900">
              <Paperclip className="w-4 h-4 text-sky-600" />
              <span>Lampiran Tersemat:</span>
              <span className="font-mono text-[11px] text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-200">
                CV_{data.fullName.replace(/\s+/g, "_")}.pdf
              </span>
            </div>
            <span className="text-[10px] text-sky-600 font-medium">Terverifikasi</span>
          </div>

          <p className="pt-2">Terima kasih atas perhatian Bapak/Ibu.</p>
        </div>
      </div>

      {/* Professional Email Signature */}
      <div className="pt-6 border-t border-slate-200 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">{data.signOff || "Salam hangat,"}</p>
        <p className="font-bold text-slate-900 text-sm mt-1">{data.fullName}</p>
        <p className="text-sky-700 font-medium text-[11px]">{data.targetRole || data.jobTitle}</p>
        <div className="mt-2 text-[11px] text-slate-500 space-y-0.5 font-mono">
          <p>📞 {data.phone} · 📍 {data.location}</p>
          <p>✉️ {data.email}</p>
          {data.portfolioUrl && (
            <p>🌐 <a href={data.portfolioUrl} className="text-sky-700 hover:underline">{data.portfolioUrl}</a></p>
          )}
        </div>
      </div>
    </div>
  );
}
