import React from "react";
import type { CoverLetterData } from "../types";
import SignatureDisplay from "../SignatureDisplay";
import { Landmark, ShieldCheck } from "lucide-react";

export default function CorporateBankingTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#0f2942";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Cambria, Georgia, serif" }}
    >
      <div>
        {/* Banking Letterhead */}
        <div className="pb-5 mb-6 border-b-2" style={{ borderColor: accent }}>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: accent }}
              >
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{data.fullName}</h1>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Profesional Keuangan, Perbankan & Sistem
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-sans space-y-0.5">
              <p>{data.email}</p>
              <p>{data.phone} · {data.location}</p>
            </div>
          </div>
        </div>

        {/* Tanggal & Referensi */}
        <div className="flex justify-between items-start mb-6 text-xs font-sans">
          <div>
            <p className="text-slate-500">Kepada Yth.</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {data.recipientTitle || "Dewan Rekrutmen & Manajemen SDM"}
            </p>
            <p className="font-semibold text-slate-800">{data.companyName}</p>
            <p className="text-slate-500">{data.companyAddress || "Gedung Kantor Pusat"}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-600 font-medium">
              {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="font-mono text-[10px] text-slate-400 mt-1">Ref: CB-APP/{new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Perihal */}
        <div className="mb-4 bg-slate-50 border-l-4 p-2.5 rounded-r-md text-xs font-sans" style={{ borderColor: accent }}>
          <span className="font-bold text-slate-900">Perihal: </span>
          <span className="text-slate-800 font-semibold">
            Permohonan Kerja untuk Posisi {data.jobTitle}
          </span>
        </div>

        {/* Salam */}
        <p className="font-bold text-slate-900 mb-3">{data.salutation || "Dengan hormat,"}</p>

        {/* Pembuka */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.opening ||
            `Sehubungan dengan informasi kesempatan berkarier yang dibuka oleh ${data.companyName} untuk posisi ${data.jobTitle}, melalui surat ini saya mengajukan permohonan diri untuk bergabung. Integritas tinggi, kepatuhan terhadap regulasi, serta keahlian analitis yang kuat merupakan prinsip dasar yang selalu saya junjung tinggi dalam berkarier.`}
        </p>

        {/* Compliance & Value Box */}
        <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 font-sans text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">Komitmen Integritas & Kepatuhan Perbankan</p>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Berpengalaman dalam manajemen risiko, ketelitian rekapitulasi data, kerahasiaan informasi perbankan, dan implementasi tata kelola perusahaan yang baik (GCG).
            </p>
          </div>
        </div>

        {/* Paragraf Inti */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.body ||
            `Dengan rekam jejak yang solid dalam pemrosesan data akurat, perancangan sistem transaksional yang andal, dan komunikasi profesional antar-divisi, saya siap mendukung ${data.companyName} dalam mempertahankan reputasi keunggulan perbankan dan akselerasi transformasi digital yang aman.`}
        </p>

        {/* Poin Kualifikasi */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-6 space-y-1">
            <p className="font-bold text-slate-900 text-xs font-sans">Kualifikasi Utama yang Saya Kontribusikan:</p>
            {data.skillsHighlight.map((item, idx) => (
              <p key={idx} className="text-xs text-slate-700 leading-normal">
                • {item}
              </p>
            ))}
          </div>
        )}

        {/* Penutup */}
        <p className="text-justify mb-6 leading-relaxed indent-6">
          {data.closing ||
            `Besar harapan saya untuk diberikan kesempatan wawancara agar dapat menjelaskan lebih lanjut kontribusi yang dapat saya berikan bagi ${data.companyName}. Atas perhatian dan kepercayaan Bapak/Ibu, saya sampaikan terima kasih.`}
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
        </div>
      </div>
    </div>
  );
}

