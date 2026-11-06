import React from "react";
import type { CoverLetterData } from "../types";

export default function ClassicVintageTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#1e293b";

  return (
    <div
      className="cover-letter-paper bg-[#fefefe] text-slate-900 p-10 sm:p-14 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between border-8 border-double border-slate-300"
      style={{ fontFamily: data.fontFamily || "'Baskerville', 'Garamond', 'Palatino', serif" }}
    >
      <div>
        {/* Classical Letterhead */}
        <div className="text-center pb-6 mb-8 border-b border-slate-300">
          <p className="text-[10px] tracking-[0.25em] text-slate-500 uppercase font-sans mb-1">
            CURRICULUM VITAE ET LITTERAE
          </p>
          <h1 className="text-2xl font-bold tracking-widest uppercase text-slate-900">
            {data.fullName}
          </h1>
          <div className="flex justify-center items-center gap-4 text-[11px] text-slate-600 font-sans mt-2">
            <span>{data.location}</span>
            <span>✦</span>
            <span>{data.phone}</span>
            <span>✦</span>
            <span>{data.email}</span>
          </div>
        </div>

        {/* Date & Destination */}
        <div className="flex justify-between items-start mb-6 text-xs font-sans">
          <div>
            <p className="text-slate-500">Kepada Yang Terhormat,</p>
            <p className="font-bold text-slate-900 text-[13px] mt-0.5">
              {data.recipientTitle || "Pimpinan Terhormat / Dewan Direksi"}
            </p>
            <p className="font-semibold text-slate-800">{data.companyName}</p>
            <p className="text-slate-600">{data.companyAddress || "Di Tempat"}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-700 font-medium italic font-serif">
              {data.city || "Prabumulih"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Hal */}
        <p className="font-bold text-slate-900 text-xs mb-4 border-b border-slate-200 pb-1 inline-block">
          Perihal: Permohonan Melamar Posisi {data.jobTitle}
        </p>

        {/* Salam */}
        <p className="font-bold text-slate-900 mb-3">{data.salutation || "Dengan segala hormat,"}</p>

        {/* Pembuka */}
        <p className="text-justify mb-3 leading-relaxed indent-8">
          {data.opening ||
            `Melalui warkat ini, perkenankan saya mengajukan diri dengan penuh ketulusan untuk posisi ${data.jobTitle} di ${data.companyName}. Memandang rekam jejak integritas serta reputasi luhur yang senantiasa dipertahankan oleh instansi Bapak/Ibu, saya merasa terhormat untuk dapat mengabdikan kompetensi dan dedikasi profesional saya.`}
        </p>

        {/* Paragraf Inti */}
        <p className="text-justify mb-3 leading-relaxed indent-8">
          {data.body ||
            `Selama bertahun-tahun menggeluti bidang keahlian ini, saya memegang teguh asas ketelitian, kesopanan kerja, dan tanggung jawab paripurna. Saya percaya bahwa kemajuan organisasi yang berkelanjutan dibangun di atas fondasi disiplin kerja yang kokoh, kejujuran budi pekerti, dan dedikasi tanpa pamrih pada mutu hasil kerja.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="my-4 pl-8 space-y-1.5 font-sans">
            <p className="font-bold text-slate-900 text-xs font-serif">Pilar Kompetensi dan Komitmen Kerja:</p>
            {data.skillsHighlight.map((item, idx) => (
              <p key={idx} className="text-xs text-slate-700 leading-normal">
                ✦ {item}
              </p>
            ))}
          </div>
        )}

        {/* Penutup */}
        <p className="text-justify mb-6 leading-relaxed indent-8">
          {data.closing ||
            `Demikian surat permohonan ini saya layangkan dengan segenap kerendahan hati. Kiranya saya dianugerahi kesempatan untuk bersua dalam tahapan wawancara guna memaparkan kesungguhan bakti saya bagi ${data.companyName}. Atas perkenan dan budi baik Bapak/Ibu, saya haturkan sembah terima kasih.`}
        </p>
      </div>

      {/* Tanda Tangan */}
      <div className="pt-4 border-t border-slate-300 flex justify-end font-sans">
        <div className="text-center min-w-[200px]">
          <p className="text-xs text-slate-700 italic font-serif">{data.signOff || "Hormat dan takzim saya,"}</p>
          <div className="h-14 flex items-center justify-center italic text-slate-700 text-base font-serif">
            {data.includeSignature ? data.fullName : ""}
          </div>
          <p className="font-bold text-slate-900 text-xs border-b border-slate-900 pb-0.5 inline-block">
            {data.fullName}
          </p>
        </div>
      </div>
    </div>
  );
}
