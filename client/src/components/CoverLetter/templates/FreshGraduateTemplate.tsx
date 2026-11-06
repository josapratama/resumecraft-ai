import React from "react";
import type { CoverLetterData } from "../types";
import { GraduationCap, Award, BookOpen } from "lucide-react";

export default function FreshGraduateTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#059669";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Header Block */}
        <div className="pb-6 mb-6 border-b-2 border-emerald-500/20">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{data.fullName}</h1>
              <p className="text-xs font-semibold uppercase tracking-wider mt-0.5 text-emerald-700">
                Fresh Graduate · {data.educationDegree || "S1 Informatika"}
              </p>
            </div>
            <div className="text-xs text-slate-500">
              {data.city || "Prabumulih"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {data.email} · {data.phone} · {data.location}
          </p>
        </div>

        {/* Recipient */}
        <div className="mb-6 space-y-0.5 text-xs text-slate-700">
          <p className="text-slate-500">Kepada Yth.</p>
          <p className="font-bold text-slate-900 text-[13px]">{data.recipientTitle || "HRD Manager / Tim Rekrutmen"}</p>
          <p className="font-semibold text-slate-800">{data.companyName}</p>
          <p className="text-slate-500">{data.companyAddress || "Di Tempat"}</p>
        </div>

        {/* Perihal */}
        <div className="mb-4 inline-block bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-900">
          Perihal: Permohonan Magang / Lamaran Kerja – {data.jobTitle}
        </div>

        {/* Salam */}
        <p className="font-bold text-slate-900 mb-3">{data.salutation || "Dengan hormat,"}</p>

        {/* Opening */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed indent-6">
          {data.opening ||
            `Sehubungan dengan informasi lowongan pekerjaan untuk posisi ${data.jobTitle} di ${data.companyName}, saya yang merupakan lulusan baru dari ${data.educationSchool || "Universitas"} dengan jurusan ${data.educationDegree || "Informatika"}, bermaksud untuk mengajukan diri guna mengawali karier profesional dan berkontribusi aktif di perusahaan yang Bapak/Ibu pimpin.`}
        </p>

        {/* Academic Spotlight Card */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Pendidikan</p>
              <p className="font-bold text-slate-800">{data.educationDegree || "S1 Informatika"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Institusi</p>
              <p className="font-bold text-slate-800 truncate">{data.educationSchool || "Universitas"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Fokus Keahlian</p>
              <p className="font-bold text-slate-800">{data.targetRole || data.jobTitle}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-slate-700 mb-3 text-justify leading-relaxed indent-6">
          {data.body ||
            `Selama masa perkuliahan dan pengerjaan berbagai proyek akademik, saya telah mendalami dasar teori yang kuat serta praktik langsung pengembangan perangkat lunak dan arsitektur sistem modern. Saya memiliki daya juang yang tinggi, cepat mempelajari teknologi baru, serta terbiasa berkolaborasi dalam tim dengan komunikasi yang proaktif.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-4 border-l-2 border-emerald-500 space-y-1.5">
            <p className="text-xs font-bold text-slate-900">Kompetensi & Nilai Tambah yang Saya Bawa:</p>
            {data.skillsHighlight.map((item, idx) => (
              <p key={idx} className="text-xs text-slate-700 leading-normal">
                • {item}
              </p>
            ))}
          </div>
        )}

        {/* Closing */}
        <p className="text-slate-700 mb-6 text-justify leading-relaxed indent-6">
          {data.closing ||
            `Saya sangat bersemangat untuk dapat membuktikan dedikasi dan kemampuan saya secara nyata di ${data.companyName}. Besar harapan saya untuk diberikan kesempatan wawancara agar dapat berdiskusi lebih lanjut. Atas perhatian Bapak/Ibu, saya haturkan terima kasih.`}
        </p>
      </div>

      {/* Signature */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <div className="text-center min-w-[180px]">
          <p className="text-xs text-slate-600">{data.signOff || "Hormat saya,"}</p>
          <div className="h-14 flex items-center justify-center italic text-slate-500">
            {data.includeSignature ? data.fullName : ""}
          </div>
          <p className="font-bold text-slate-900 text-xs border-b border-slate-800 pb-0.5 inline-block">
            {data.fullName}
          </p>
        </div>
      </div>
    </div>
  );
}

