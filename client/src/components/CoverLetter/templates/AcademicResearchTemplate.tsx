import React from "react";
import type { CoverLetterData } from "../types";
import { BookOpen, FileCode, Milestone } from "lucide-react";

export default function AcademicResearchTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#1e3a8a";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-10 sm:p-14 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Cambria, Georgia, serif" }}
    >
      <div>
        {/* Academic Institution Header */}
        <div className="pb-6 mb-6 border-b border-slate-300">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-normal">{data.fullName}</h1>
              <p className="text-xs text-slate-600 italic mt-0.5">
                {data.educationDegree || "Bachelor of Computer Science"} · {data.educationSchool || "Department of Informatics"}
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 space-y-0.5">
              <p>{data.email}</p>
              <p>{data.phone} · {data.location}</p>
              {data.portfolioUrl && <p className="text-blue-800 font-mono text-[11px]">{data.portfolioUrl}</p>}
            </div>
          </div>
        </div>

        {/* Date & Academic Committee */}
        <div className="mb-6 space-y-1 text-xs">
          <p className="text-slate-600 mb-2">
            {data.city ? `${data.city}, ` : ""}{data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="font-bold text-slate-900 text-sm">
            {data.recipientTitle || "Komite Seleksi Akademik / Panitia Rekrutmen"}
          </p>
          <p className="font-semibold text-slate-800">{data.companyName}</p>
          <p className="text-slate-600">{data.companyAddress || "Fakultas / Lembaga Penelitian"}</p>
        </div>

        {/* Reference / Perihal */}
        <div className="mb-4 text-xs">
          <span className="font-bold text-slate-900">Perihal: </span>
          <span className="font-medium text-slate-800">
            Aplikasi Posisi Akademik / Peneliti – {data.jobTitle}
          </span>
        </div>

        {/* Salutation */}
        <p className="font-bold text-slate-900 mb-3">{data.salutation || "Yth. Bapak/Ibu Dewan Penguji / Komite Seleksi,"}</p>

        {/* Opening */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.opening ||
            `Melalui surat ini, saya bermaksud untuk mengajukan aplikasi sebagai ${data.jobTitle} di ${data.companyName}. Berdasarkan minat riset dan fokus keilmuan saya pada komputasi terapan, kecerdasan buatan, dan arsitektur sistem terdistribusi, saya sangat bersemangat untuk dapat berkontribusi dalam riset laboratorium dan kegiatan akademik di institusi Bapak/Ibu.`}
        </p>

        {/* Academic Focus Card */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <p className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-900" />
            <span>Fokus Penelitian & Keilmuan Utama:</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11.5px] text-slate-700">
            <div className="p-2 bg-white rounded border border-slate-200/70">
              <span className="font-semibold text-slate-900 block">Sistem Komputasi:</span>
              Arsitektur Web Modern & Microservices
            </div>
            <div className="p-2 bg-white rounded border border-slate-200/70">
              <span className="font-semibold text-slate-900 block">Metodologi Riset:</span>
              Eksperimental & Analisis Data Kuantitatif
            </div>
            <div className="p-2 bg-white rounded border border-slate-200/70">
              <span className="font-semibold text-slate-900 block">Implementasi Riil:</span>
              Otomasi & Edge Computing
            </div>
          </div>
        </div>

        {/* Body */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.body ||
            `Selama menempuh pendidikan di ${data.educationSchool || "perguruan tinggi"}, saya secara konsisten melatih ketajaman metodologis, studi literatur kritis, serta perancangan eksperimen terukur. Saya telah menghasilkan prototipe sistem yang berhasil diimplementasikan dan siap untuk dikembangkan lebih lanjut menjadi publikasi karya ilmiah bereputasi.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-6 space-y-1">
            <p className="font-bold text-slate-900 text-xs">Capaian Akademik & Riset Relevan:</p>
            {data.skillsHighlight.map((item, idx) => (
              <p key={idx} className="text-xs text-slate-700 leading-normal">
                • {item}
              </p>
            ))}
          </div>
        )}

        {/* Attachments Note */}
        <p className="text-xs text-slate-600 mb-3 italic">
          Turut saya lampirkan: CV Akademik lengkap, salinan transkrip nilai, sertifikat kompetensi, dan ringkasan portofolio riset.
        </p>

        {/* Closing */}
        <p className="text-justify mb-6 leading-relaxed indent-6">
          {data.closing ||
            `Besar harapan saya untuk dapat mempresentasikan rencana kontribusi riset saya di hadapan Komite Seleksi. Atas pertimbangan yang Bapak/Ibu berikan, saya sampaikan terima kasih.`}
        </p>
      </div>

      {/* Academic Sign-off */}
      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <div className="text-center min-w-[200px]">
          <p className="text-xs text-slate-600">{data.signOff || "Hormat saya,"}</p>
          <div className="h-14 flex items-center justify-center italic text-slate-600 text-sm">
            {data.includeSignature ? data.fullName : ""}
          </div>
          <p className="font-bold text-slate-900 text-xs border-b border-slate-900 pb-0.5 inline-block">
            {data.fullName}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{data.educationDegree || "Peneliti / Akademisi"}</p>
        </div>
      </div>
    </div>
  );
}

