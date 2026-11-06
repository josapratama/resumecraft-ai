import React from "react";
import type { CoverLetterData } from "../types";
import { RefreshCw, ArrowRight } from "lucide-react";

export default function CareerSwitchTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#d97706";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Top Header */}
        <div className="pb-6 mb-6 border-b border-amber-200">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{data.fullName}</h1>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-0.5">
                Target Role: {data.jobTitle}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <p>{data.email}</p>
              <p>{data.phone} · {data.location}</p>
            </div>
          </div>
        </div>

        {/* Date & Recipient */}
        <div className="flex justify-between items-baseline mb-6 text-xs">
          <div>
            <p className="font-bold text-slate-900">{data.recipientName || "Hiring Team"}</p>
            <p className="text-slate-700 font-medium">{data.companyName}</p>
            <p className="text-slate-500">{data.companyAddress || "Di Tempat"}</p>
          </div>
          <p className="text-slate-500 font-medium">
            {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Salutation */}
        <p className="font-bold text-slate-900 mb-3 text-[13px]">{data.salutation || "Dengan hormat,"}</p>

        {/* Opening */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed">
          {data.opening ||
            `Saya menulis surat ini untuk mengajukan diri pada posisi ${data.jobTitle} di ${data.companyName}. Meskipun latar belakang saya berawal dari bidang yang berbeda, dedikasi intensif saya dalam mempelajari teknologi terbaru serta kemampuan adaptasi yang cepat memungkinkan saya membawa perspektif baru yang kaya nilai bagi tim Anda.`}
        </p>

        {/* Transferable Value Matrix */}
        <div className="my-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center gap-2 font-bold text-amber-950 text-xs mb-2">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Sinergi Nilai Tambah (Transferable Value)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white/80 border border-amber-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Fondasi Pengalaman Sebelumnya</p>
              <p className="text-slate-700 mt-1">Disiplin kerja tinggi, pemahaman alur operasional, dan komunikasi interpersonal yang matang.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-white/80 border border-amber-100">
              <p className="text-[10px] uppercase font-bold text-amber-600">Relevansi untuk {data.jobTitle}</p>
              <p className="text-slate-700 mt-1">Kemampuan analisis mendalam, pemecahan masalah secara terstruktur, dan eksekusi solusi teknis yang tepat sasaran.</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed">
          {data.body ||
            `Melalui pembelajaran mandiri yang terarah serta portofolio proyek riil yang telah saya bangun, saya telah menguasai alur kerja teknis yang dibutuhkan untuk posisi ini. Kombinasi antara kematangan profesional dan ketajaman teknis membuat saya siap memberikan kontribusi nyata sejak hari pertama.`}
        </p>

        {/* Key Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-4 border-l-2 border-amber-500 space-y-1.5">
            <p className="text-xs font-bold text-slate-900">Bukti Kemampuan & Karya Terkait:</p>
            {data.skillsHighlight.map((item, idx) => (
              <p key={idx} className="text-xs text-slate-700 leading-normal flex items-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-amber-600 shrink-0 mt-1" />
                <span>{item}</span>
              </p>
            ))}
          </div>
        )}

        {/* Closing */}
        <p className="text-slate-700 mb-6 text-justify leading-relaxed">
          {data.closing ||
            `Saya sangat antusias untuk berdiskusi lebih lanjut mengenai bagaimana keunikan pengalaman saya dapat mendukung akselerasi tujuan ${data.companyName}. Terima kasih atas waktu dan kesempatan yang Bapak/Ibu berikan.`}
        </p>
      </div>

      {/* Signature */}
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500">{data.signOff || "Hormat saya,"}</p>
          <p className="text-sm font-bold text-slate-900 mt-1">{data.fullName}</p>
        </div>
        <div className="text-right text-[11px] text-slate-400 font-mono">
          Ref: Application-{data.jobTitle.replace(/\s+/g, "-")}
        </div>
      </div>
    </div>
  );
}
