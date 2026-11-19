import React from "react";
import type { CoverLetterData } from "../types";
import SignatureDisplay from "../SignatureDisplay";

export default function StandardIndonesianTemplate({ data }: { data: CoverLetterData }) {
  const hasBiodata = !!data.includeBiodataTable;

  return (
    <div
      className={`cover-letter-paper bg-white text-slate-900 ${
        hasBiodata
          ? "px-7 py-6 sm:px-9 sm:py-7 text-[11.5px] sm:text-[12px] leading-snug"
          : "px-9 py-8 sm:px-11 sm:py-9 text-[12.5px] sm:text-[13px] leading-relaxed"
      } select-text min-h-[1050px] flex flex-col justify-between`}
      style={{ fontFamily: data.fontFamily || "Times New Roman, Times, serif" }}
    >
      <div>
        {/* Judul Surat di Tengah (Opsional / Default ON) */}
        {data.includeLetterTitle !== false && (
          <div className={`text-center ${hasBiodata ? "mb-2" : "mb-3 sm:mb-4"}`}>
            <h2 className="font-bold text-sm sm:text-base underline tracking-wide uppercase inline-block">
              {data.letterTitle || "SURAT LAMARAN KERJA"}
            </h2>
          </div>
        )}

        {/* Tempat & Tanggal di Kanan Atas */}
        <div className={`text-right text-slate-850 ${hasBiodata ? "mb-2" : "mb-3 sm:mb-4"} font-medium`}>
          {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </div>

        {/* Nomor Surat & Lampiran (HANYA MUNCUL JIKA DIISI / DIAKTIFKAN USER) */}
        {data.includeReferenceNumber && data.referenceNumber && (
          <div className="mb-0.5 flex">
            <span className="w-24 text-slate-700">Nomor</span>
            <span className="mr-2">:</span>
            <span className="font-mono text-xs">{data.referenceNumber}</span>
          </div>
        )}
        {data.includeAttachmentsHeader && (
          <div className="mb-0.5 flex">
            <span className="w-24 text-slate-700">Lampiran</span>
            <span className="mr-2">:</span>
            <span>1 (Satu) Berkas Lengkap</span>
          </div>
        )}

        {/* Perihal */}
        <div className={`${hasBiodata ? "mb-2" : "mb-3 sm:mb-4"} font-medium text-slate-900`}>
          Perihal: {data.subject || `Lamaran Pekerjaan ${data.jobTitle}`}
        </div>

        {/* Tujuan Surat (Kepada Yth) */}
        <div className={`${hasBiodata ? "mb-2" : "mb-3 sm:mb-4"} space-y-0.5`}>
          <p className="text-slate-800">Kepada Yth,</p>
          <p className="font-semibold text-slate-900">
            {data.recipientTitle ? `${data.recipientTitle} ` : "Bapak/ Ibu HRD "}
            {data.companyName}
          </p>
          <p className="text-slate-700">{data.companyAddress || "Di Tempat"}</p>
        </div>

        {/* Salam Pembuka */}
        <p className={`font-semibold text-slate-900 ${hasBiodata ? "mb-1.5" : "mb-2"}`}>{data.salutation || "Dengan Hormat,"}</p>

        {/* Paragraf 1: Sumber Lowongan & Tujuan Melamar */}
        <p className={`text-justify ${hasBiodata ? "mb-1.5 leading-normal" : "mb-2.5 leading-relaxed"}`}>
          {data.opening ||
            `Berdasarkan informasi lowongan pekerjaan yang saya dapatkan di ${data.jobSource || "platform resmi"}, dengan ini saya ingin mengajukan diri untuk mengisi posisi ${data.jobTitle} di ${data.companyName}.`}
        </p>

        {/* Paragraf 2: Latar Belakang Pendidikan & Keahlian Utama */}
        <p className={`text-justify ${hasBiodata ? "mb-1.5 leading-normal" : "mb-2.5 leading-relaxed"}`}>
          {data.body ||
            `Saya adalah lulusan ${data.educationDegree || "Sarjana"} dari ${data.educationSchool || "Universitas"}${data.educationGpa ? ` (IPK ${data.educationGpa})` : ""} dengan keterampilan analitis yang kuat, ketelitian tinggi, dan manajemen waktu yang baik. Memiliki keahlian dalam administrasi dokumen, perancangan sistem, serta pengoperasian perangkat lunak produktivitas yang didukung oleh sertifikasi kompetensi resmi. Berbekal latar belakang tersebut, saya mampu beradaptasi dengan cepat dan siap mendukung proses operasional secara efektif dan profesional.`}
        </p>

        {/* Paragraf 3: Pengalaman Kerja / Magang Nyata (Jika ada) */}
        {data.previousField && (
          <p className={`text-justify ${hasBiodata ? "mb-1.5 leading-normal" : "mb-2.5 leading-relaxed"}`}>
            {data.previousField}
          </p>
        )}

        {/* Tabel Biodata (HANYA MUNCUL JIKA USER INGIN TAMPILKAN TABEL) */}
        {data.includeBiodataTable && (
          <div className="my-1.5 pl-3 py-1 border-l-2 border-slate-300 space-y-0.5 text-[11px] sm:text-[11.5px] break-inside-avoid">
            <div className="grid grid-cols-[110px_10px_1fr]">
              <span className="text-slate-600">Nama Lengkap</span>
              <span>:</span>
              <span className="font-bold text-slate-900">{data.fullName}</span>
            </div>
            <div className="grid grid-cols-[110px_10px_1fr]">
              <span className="text-slate-600">Pendidikan</span>
              <span>:</span>
              <span>{data.educationDegree} - {data.educationSchool}</span>
            </div>
            <div className="grid grid-cols-[110px_10px_1fr]">
              <span className="text-slate-600">Domisili</span>
              <span>:</span>
              <span>{data.location}</span>
            </div>
            <div className="grid grid-cols-[110px_10px_1fr]">
              <span className="text-slate-600">Nomor Telepon</span>
              <span>:</span>
              <span>{data.phone}</span>
            </div>
          </div>
        )}

        {/* Daftar Lampiran Berkas (Bullet Points) */}
        <div className={`${hasBiodata ? "my-1.5" : "my-2.5"} break-inside-avoid`}>
          <p className="mb-0.5 font-medium text-slate-900 text-xs">Berikut saya lampirkan :</p>
          <ul className={`list-disc list-inside pl-2 ${hasBiodata ? "space-y-0.5 text-[11px]" : "space-y-0.5 text-[11.5px]"} text-slate-800`}>
            {data.attachments && data.attachments.length > 0 ? (
              data.attachments.map((att, idx) => (
                <li key={idx} className="leading-tight">{att}</li>
              ))
            ) : (
              <>
                <li>Surat Lamaran Pekerjaan</li>
                <li>Curriculum Vitae (CV)</li>
                <li>Salinan Ijazah dan Transkrip Nilai</li>
                <li>Salinan Sertifikat Kompetensi</li>
              </>
            )}
          </ul>
        </div>

        {/* Paragraf Penutup & Harapan Wawancara */}
        <p className={`text-justify ${hasBiodata ? "mb-1.5 leading-normal" : "mb-2.5 leading-relaxed"}`}>
          {data.closing ||
            `Besar harapan saya untuk diberikan kesempatan menghadiri sesi wawancara agar dapat menjelaskan lebih lanjut mengenai kualifikasi dan dedikasi saya. Atas perhatian dan kesempatan yang Bapak/Ibu berikan, saya ucapkan terima kasih.`}
        </p>
      </div>

      {/* Tanda Tangan Kanan Bawah */}
      <div
        className={`${hasBiodata ? "pt-1.5" : "pt-3"} flex justify-end`}
        style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
      >
        <div className="text-center min-w-[170px]">
          <p className="text-slate-800 font-medium mb-1">{data.signOff || "Hormat Saya,"}</p>
          <SignatureDisplay
            data={data}
            className={hasBiodata ? "h-12 flex items-center justify-center my-0.5" : "h-14 flex items-center justify-center my-1"}
          />
          <p className="font-bold text-slate-900 text-xs sm:text-[13px] mt-1 underline decoration-slate-400">
            {data.fullName}
          </p>
        </div>
      </div>
    </div>
  );
}
