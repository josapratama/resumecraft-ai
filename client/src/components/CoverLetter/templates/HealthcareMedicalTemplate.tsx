import React from "react";
import type { CoverLetterData } from "../types";
import { HeartPulse, Stethoscope, Award } from "lucide-react";

export default function HealthcareMedicalTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#0284c7";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <div>
        {/* Healthcare Header */}
        <div className="pb-6 mb-6 border-b border-sky-100">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{data.fullName}</h1>
                <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mt-0.5">
                  Tenaga Kesehatan & Medis Profesional
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  No. STR / Lisensi: STR-{(data.phone || "8888").slice(-6)}-AKTIF
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <p>{data.email}</p>
              <p>{data.phone} · {data.location}</p>
            </div>
          </div>
        </div>

        {/* Date & Destination Hospital */}
        <div className="flex justify-between items-start mb-6 text-xs">
          <div>
            <p className="text-slate-500">Kepada Yth.</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              Direktur / Kepala SDM Rumah Sakit
            </p>
            <p className="font-semibold text-slate-800">{data.companyName}</p>
            <p className="text-slate-500">{data.companyAddress || "Bagian Pelayanan Medis"}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-600 font-medium">
              {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="text-[10px] text-sky-700 font-semibold mt-1">Berkas Medis Terverifikasi</p>
          </div>
        </div>

        {/* Perihal */}
        <div className="mb-4 bg-sky-50 border border-sky-200 p-2.5 rounded-lg text-xs font-semibold text-sky-950 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Perihal: Permohonan Bergabung sebagai {data.jobTitle}</span>
        </div>

        {/* Salam */}
        <p className="font-bold text-slate-900 mb-3">{data.salutation || "Dengan hormat,"}</p>

        {/* Pembuka */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.opening ||
            `Berdasarkan informasi pembukaan formasi tenaga kesehatan untuk posisi ${data.jobTitle} di ${data.companyName}, saya bermaksud mengajukan surat lamaran kerja. Dengan komitmen mendalam terhadap keselamatan pasien, kepatuhan prosedur operasional standar (SOP), dan etika profesi yang tinggi, saya siap mendedikasikan keahlian saya bagi pelayanan kesehatan institusi Bapak/Ibu.`}
        </p>

        {/* Nilai Etika Klinis */}
        <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-sky-600" />
            <span>Kepatuhan Regulasi & Standar Pelayanan Klinis:</span>
          </p>
          <p className="text-slate-600 leading-relaxed text-[11.5px]">
            Memiliki sertifikasi Surat Tanda Registrasi (STR) aktif, terbiasa dalam penanganan tindakan cepat tanggap darurat, ketelitian rekam medis elektronik, serta komunikasi terapeutik yang menenangkan pasien dan keluarga.
          </p>
        </div>

        {/* Paragraf Inti */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.body ||
            `Sepanjang perjalanan praktik klinis dan pendidikan, saya telah terlatih dalam observasi akurat, ketepatan pemberian tindakan medis, dan koordinasi multidisiplin antar dokter, perawat, serta tenaga penunjang lainnya. Saya terbiasa menghadapi situasi kritis dengan ketenangan dan ketelitian maksimal.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-6 space-y-1">
            <p className="font-bold text-slate-900 text-xs">Kualifikasi Klinis & Sertifikasi:</p>
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
            `Besar harapan saya untuk memperoleh kesempatan wawancara agar dapat memaparkan integritas kerja dan dedikasi saya secara langsung. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya sampaikan terima kasih.`}
        </p>
      </div>

      {/* Tanda Tangan */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
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

