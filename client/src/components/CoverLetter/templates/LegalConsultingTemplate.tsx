import React from "react";
import type { CoverLetterData } from "../types";
import SignatureDisplay from "../SignatureDisplay";
import { Scale, FileText, CheckCircle } from "lucide-react";

export default function LegalConsultingTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#312e81";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-10 sm:p-14 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Georgia, Cambria, serif" }}
    >
      <div>
        {/* Legal Header */}
        <div className="pb-6 mb-6 border-b-2 border-indigo-900/80">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 text-white flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{data.fullName}</h1>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Legal Practitioner & Corporate Counsel
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 space-y-0.5 font-sans">
              <p>{data.email}</p>
              <p>{data.phone} · {data.location}</p>
            </div>
          </div>
        </div>

        {/* Date & Destination */}
        <div className="flex justify-between items-start mb-6 text-xs font-sans">
          <div>
            <p className="text-slate-500">Kepada Yth.</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {data.recipientTitle || "Managing Partner / Head of Legal Division"}
            </p>
            <p className="font-semibold text-slate-800">{data.companyName}</p>
            <p className="text-slate-500">{data.companyAddress || "Gedung Perkantoran Hukum"}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-600 font-medium">
              {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="font-mono text-[10px] text-slate-400 mt-1">Perihal: Aplikasi Posisi Hukum</p>
          </div>
        </div>

        {/* Hal */}
        <div className="mb-4 bg-slate-50 border-l-4 border-indigo-900 p-2.5 text-xs font-sans">
          <span className="font-bold text-slate-900">Perihal: </span>
          <span className="text-slate-800 font-medium">
            Permohonan Kerja untuk Posisi {data.jobTitle}
          </span>
        </div>

        {/* Salam */}
        <p className="font-bold text-slate-900 mb-3">{data.salutation || "Dengan hormat,"}</p>

        {/* Pembuka */}
        <p className="text-justify mb-3 leading-relaxed indent-8">
          {data.opening ||
            `Sehubungan dengan kebutuhan tenaga ahli hukum pada ${data.companyName} untuk posisi ${data.jobTitle}, melalui surat ini saya bermaksud mengajukan kualifikasi profesional saya. Dengan pemahaman mendalam mengenai mitigasi risiko hukum, penyusunan kontrak korporasi (*legal drafting*), dan kepatuhan regulasi industri, saya siap memberikan opini hukum yang strategis bagi kepentingan institusi Bapak/Ibu.`}
        </p>

        {/* Paragraf Inti */}
        <p className="text-justify mb-3 leading-relaxed indent-8">
          {data.body ||
            `Dalam penanganan perkara dan penyusunan instrumen hukum, saya selalu memadukan ketajaman analisis yuridis dengan ketelitian riset regulasi terkini. Saya terbiasa menyusun klausul perjanjian komersial yang seimbang, mewakili kepentingan korporasi dalam negosiasi, dan memastikan setiap langkah bisnis berjalan dalam koridor kepatuhan hukum yang aman.`}
        </p>

        {/* Poin Kompetensi Hukum */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-4 pl-6 space-y-1.5 font-sans">
            <p className="font-bold text-slate-900 text-xs">Pilar Keahlian Yuridis Utama:</p>
            {data.skillsHighlight.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-900 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Penutup */}
        <p className="text-justify mb-6 leading-relaxed indent-8">
          {data.closing ||
            `Besar harapan saya untuk diberikan kesempatan wawancara agar dapat mengelaborasi lebih mendalam dedikasi profesional saya bagi ${data.companyName}. Atas perhatian serta kesempatan yang Bapak/Ibu berikan, saya haturkan terima kasih.`}
        </p>
      </div>

      {/* Tanda Tangan */}
      <div className="pt-4 border-t border-slate-200 flex justify-end font-sans">
        <div className="text-center min-w-[200px]">
          <p className="text-xs text-slate-600">{data.signOff || "Hormat saya,"}</p>
          <SignatureDisplay data={data} className="h-14 flex items-center justify-center" />
          <p className="font-bold text-slate-900 text-xs border-b border-slate-800 pb-0.5 inline-block">
            {data.fullName}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Praktisi Hukum / Legal Counsel</p>
        </div>
      </div>
    </div>
  );
}

