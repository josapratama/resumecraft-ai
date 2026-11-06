import React from "react";
import type { CoverLetterData } from "../types";

export default function FormalBUMNTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#1e3a8a";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Georgia, Cambria, serif" }}
    >
      <div>
        {/* Tempat & Tanggal (Kanan Atas) */}
        <div className="text-right text-slate-600 mb-6 font-medium">
          {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </div>

        {/* Hal & Lampiran (Kiri Atas) */}
        <div className="mb-6 space-y-1">
          <div className="flex">
            <span className="w-24 text-slate-600">Nomor</span>
            <span className="mr-2">:</span>
            <span className="text-slate-800 font-mono text-xs">{data.referenceNumber || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-slate-600">Lampiran</span>
            <span className="mr-2">:</span>
            <span className="text-slate-800 font-medium">1 (Satu) Berkas Lengkap</span>
          </div>
          <div className="flex">
            <span className="w-24 text-slate-600">Perihal</span>
            <span className="mr-2">:</span>
            <span className="font-bold text-slate-900 underline decoration-slate-300">
              {data.subject || `Lamaran Pekerjaan – ${data.jobTitle}`}
            </span>
          </div>
        </div>

        {/* Penerima Surat */}
        <div className="mb-6">
          <p className="text-slate-600">Kepada Yth.</p>
          <p className="font-bold text-slate-900 text-[13px]">
            {data.recipientTitle || "Pimpinan / HRD Manager"}
          </p>
          <p className="font-semibold text-slate-800">{data.companyName}</p>
          {data.companyAddress ? (
            <p className="text-slate-600 text-xs">{data.companyAddress}</p>
          ) : (
            <p className="text-slate-600 text-xs">Di Tempat</p>
          )}
        </div>

        {/* Salam Pembuka */}
        <p className="mb-3 font-semibold text-slate-900">{data.salutation || "Dengan hormat,"}</p>

        {/* Paragraf Pembuka */}
        <p className="text-justify mb-3 leading-relaxed indent-8">
          {data.opening ||
            `Berdasarkan informasi lowongan pekerjaan yang saya peroleh mengenai posisi ${data.jobTitle} di ${data.companyName}, melalui surat ini saya bermaksud mengajukan permohonan diri untuk dapat bergabung dan berkontribusi sebagai tenaga profesional pada instansi/perusahaan yang Bapak/Ibu pimpin.`}
        </p>

        {/* Biodata Singkat */}
        <div className="my-3 pl-8 py-2 bg-slate-50/70 border-l-2 rounded-r-md border-slate-300 space-y-1 text-xs">
          <div className="grid grid-cols-[130px_10px_1fr]">
            <span className="text-slate-600">Nama Lengkap</span>
            <span>:</span>
            <span className="font-bold text-slate-900">{data.fullName}</span>
          </div>
          <div className="grid grid-cols-[130px_10px_1fr]">
            <span className="text-slate-600">Pendidikan Terakhir</span>
            <span>:</span>
            <span className="text-slate-800 font-medium">
              {data.educationDegree ? `${data.educationDegree} - ${data.educationSchool || ""}` : "S1 Informatika"}
            </span>
          </div>
          <div className="grid grid-cols-[130px_10px_1fr]">
            <span className="text-slate-600">Domisili</span>
            <span>:</span>
            <span className="text-slate-800">{data.location || "Indonesia"}</span>
          </div>
          <div className="grid grid-cols-[130px_10px_1fr]">
            <span className="text-slate-600">Nomor Telepon/WA</span>
            <span>:</span>
            <span className="text-slate-800 font-mono">{data.phone}</span>
          </div>
          <div className="grid grid-cols-[130px_10px_1fr]">
            <span className="text-slate-600">Alamat Email</span>
            <span>:</span>
            <span className="text-slate-800 font-mono">{data.email}</span>
          </div>
        </div>

        {/* Paragraf Inti & Kualifikasi */}
        <p className="text-justify mb-3 leading-relaxed indent-8">
          {data.body ||
            `Saya memiliki dedikasi tinggi, kemampuan analisis pemecahan masalah yang baik, serta pengalaman relevan dalam bidang teknologi dan implementasi sistem. Saya terbiasa bekerja secara mandiri maupun berkolaborasi dalam tim dengan kedisiplinan kerja yang tinggi sesuai dengan nilai-nilai profesionalisme.`}
        </p>

        {/* Poin Keahlian (Jika ada) */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-3 pl-8 space-y-1">
            {data.skillsHighlight.map((item, idx) => (
              <div key={idx} className="flex items-baseline gap-2">
                <span className="text-slate-400 font-bold">•</span>
                <span className="text-slate-700 text-xs">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Daftar Lampiran */}
        <div className="mb-4">
          <p className="mb-1 text-slate-800 font-medium">
            Sebagai bahan pertimbangan Bapak/Ibu, bersama surat ini turut saya lampirkan:
          </p>
          <ol className="list-decimal list-inside pl-4 text-xs space-y-0.5 text-slate-700">
            {data.attachments && data.attachments.length > 0 ? (
              data.attachments.map((att, idx) => <li key={idx}>{att}</li>)
            ) : (
              <>
                <li>Curriculum Vitae (CV) Terbaru</li>
                <li>Salinan Portofolio dan Bukti Hasil Karya</li>
                <li>Salinan Ijazah dan Transkrip Nilai Terlegalisir</li>
                <li>Salinan Sertifikat Keahlian / Kompetensi</li>
                <li>Pas Foto Berwarna Terbaru</li>
              </>
            )}
          </ol>
        </div>

        {/* Paragraf Penutup */}
        <p className="text-justify mb-6 leading-relaxed indent-8">
          {data.closing ||
            `Demikian surat lamaran pekerjaan ini saya sampaikan. Besar harapan saya untuk diberikan kesempatan menghadiri tahapan wawancara agar dapat menjelaskan lebih mendalam mengenai kompetensi dan komitmen kerja yang saya miliki. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.`}
        </p>
      </div>

      {/* Tanda Tangan Formal (Kanan Bawah) */}
      <div className="pt-4 flex justify-end">
        <div className="text-center min-w-[200px]">
          <p className="text-slate-700 font-medium">{data.signOff || "Hormat saya,"}</p>
          <div className="h-16 flex items-center justify-center">
            {data.includeSignature ? (
              <span className="font-serif italic text-lg text-slate-600 opacity-70">
                {data.fullName}
              </span>
            ) : (
              <div className="h-12" />
            )}
          </div>
          <p className="font-bold text-slate-900 border-b border-slate-900 pb-0.5 inline-block">
            {data.fullName}
          </p>
        </div>
      </div>
    </div>
  );
}
