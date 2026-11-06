import React from "react";
import type { CoverLetterData } from "../types";
import { Cog, HardHat, ShieldAlert } from "lucide-react";

export default function EngineeringIndustrialTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#334155";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Engineering Header */}
        <div className="pb-6 mb-6 border-b-2 border-slate-700">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
                <Cog className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{data.fullName}</h1>
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Industrial, Operations & Technical Engineering
                </p>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono space-y-0.5">
              <p>{data.email}</p>
              <p>{data.phone} · {data.location}</p>
            </div>
          </div>
        </div>

        {/* Destination & Date */}
        <div className="flex justify-between items-start mb-6 text-xs">
          <div>
            <p className="text-slate-400 uppercase font-semibold text-[10px]">Tujuan Permohonan</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {data.recipientTitle || "Plant Manager / HR Operations Division"}
            </p>
            <p className="font-semibold text-slate-800">{data.companyName}</p>
            <p className="text-slate-500">{data.companyAddress || "Kawasan Industri & Fabrikasi"}</p>
          </div>
          <div className="text-right text-slate-600">
            {data.city || "Cikarang"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Perihal */}
        <div className="mb-4 bg-slate-100 border-l-4 border-slate-800 p-2.5 rounded-r text-xs">
          <span className="font-bold text-slate-900">Perihal: </span>
          <span className="text-slate-800 font-medium">Lamaran Pekerjaan Bidang Teknik – {data.jobTitle}</span>
        </div>

        {/* Salam */}
        <p className="font-bold text-slate-900 mb-3">{data.salutation || "Dengan hormat,"}</p>

        {/* Pembuka */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.opening ||
            `Sehubungan dengan kebutuhan tenaga ahli teknis dan operasional untuk posisi ${data.jobTitle} di ${data.companyName}, saya mengajukan surat lamaran ini. Memiliki komitmen tanpa kompromi terhadap keselamatan kerja (K3/HSE), efisiensi lini produksi, dan continuous improvement (Kaizen), saya siap memperkuat kinerja operasional manufaktur di perusahaan Bapak/Ibu.`}
        </p>

        {/* HSE Safety Box */}
        <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-3">
          <HardHat className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">Komitmen Keselamatan Kerja & Manajemen Mutu (HSE / ISO)</p>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Berpengalaman dalam identifikasi bahaya risiko (*Hazard Identification*), audit kepatuhan ISO 9001/14001/45001, serta penerapan pemeliharaan preventif (*preventive maintenance*) untuk meminimalkan *downtime* mesin.
            </p>
          </div>
        </div>

        {/* Paragraf Inti */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.body ||
            `Latar belakang teknis saya membekali saya dengan pemahaman mendalam tentang kalkulasi efisiensi, pembacaan skema teknis, dan koordinasi tim lapangan. Saya terbiasa memimpin troubleshooting di area produksi dengan tenang, sistematis, dan selalu berorientasi pada pencapaian target output tanpa mengabaikan aspek keselamatan.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-6 space-y-1">
            <p className="font-bold text-slate-900 text-xs">Keahlian Teknis & Sertifikasi Industri:</p>
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
            `Besar harapan saya untuk memperoleh kesempatan wawancara agar dapat menjelaskan lebih lanjut kesiapan saya dalam mendukung keandalan operasional ${data.companyName}. Atas perhatian dan kesempatan yang diberikan, saya sampaikan terima kasih.`}
        </p>
      </div>

      {/* Tanda Tangan */}
      <div className="pt-4 border-t border-slate-200 flex justify-end">
        <div className="text-center min-w-[180px]">
          <p className="text-xs text-slate-600">{data.signOff || "Hormat saya,"}</p>
          <div className="h-14 flex items-center justify-center italic text-slate-600 text-sm">
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
