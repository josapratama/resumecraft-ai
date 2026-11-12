import React from "react";
import type { CoverLetterData } from "../types";
import SignatureDisplay from "../SignatureDisplay";

export default function StandardIndonesianTemplate({ data }: { data: CoverLetterData }) {
  return (
    <div
      className="cover-letter-paper bg-white text-slate-900 p-10 sm:p-14 text-[13px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Times New Roman, Times, serif" }}
    >
      <div>
        {/* Judul Surat di Tengah (Opsional / Default ON) */}
        {data.includeLetterTitle !== false && (
          <div className="text-center mb-6">
            <h2 className="font-bold text-sm sm:text-base underline tracking-wide uppercase inline-block">
              {data.letterTitle || "SURAT LAMARAN KERJA"}
            </h2>
          </div>
        )}

        {/* Tempat & Tanggal di Kanan Atas */}
        <div className="text-right text-slate-850 mb-6 font-medium">
          {data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </div>

        {/* Nomor Surat & Lampiran (HANYA MUNCUL JIKA DIISI / DIAKTIFKAN USER) */}
        {data.includeReferenceNumber && data.referenceNumber && (
          <div className="mb-1 flex">
            <span className="w-24 text-slate-700">Nomor</span>
            <span className="mr-2">:</span>
            <span className="font-mono text-xs">{data.referenceNumber}</span>
          </div>
        )}
        {data.includeAttachmentsHeader && (
          <div className="mb-1 flex">
            <span className="w-24 text-slate-700">Lampiran</span>
            <span className="mr-2">:</span>
            <span>1 (Satu) Berkas Lengkap</span>
          </div>
        )}

        {/* Perihal */}
        <div className="mb-6 font-medium text-slate-900">
          Perihal: {data.subject || `Lamaran Pekerjaan ${data.jobTitle}`}
        </div>

        {/* Tujuan Surat (Kepada Yth) */}
        <div className="mb-6 space-y-0.5">
          <p className="text-slate-800">Kepada Yth,</p>
          <p className="font-semibold text-slate-900">
            {data.recipientTitle ? `${data.recipientTitle} ` : "Bapak/ Ibu HRD "}
            {data.companyName}
          </p>
          <p className="text-slate-700">{data.companyAddress || "Di Tempat"}</p>
        </div>

        {/* Salam Pembuka */}
        <p className="font-semibold text-slate-900 mb-3">{data.salutation || "Dengan Hormat,"}</p>

        {/* Paragraf 1: Sumber Lowongan & Tujuan Melamar */}
        <p className="text-justify mb-3.5 leading-relaxed">
          {data.opening ||
            `Berdasarkan informasi lowongan pekerjaan yang saya dapatkan di ${data.jobSource || "platform resmi"}, dengan ini saya ingin mengajukan diri untuk mengisi posisi ${data.jobTitle} di ${data.companyName}.`}
        </p>

        {/* Paragraf 2: Latar Belakang Pendidikan & Keahlian Utama */}
        <p className="text-justify mb-3.5 leading-relaxed">
          {data.body ||
            `Saya adalah lulusan ${data.educationDegree || "Sarjana"} dari ${data.educationSchool || "Universitas"}${data.educationGpa ? ` (IPK ${data.educationGpa})` : ""} dengan keterampilan analitis yang kuat, ketelitian tinggi, dan manajemen waktu yang baik. Memiliki keahlian dalam administrasi dokumen, perancangan sistem, serta pengoperasian perangkat lunak produktivitas yang didukung oleh sertifikasi kompetensi resmi. Berbekal latar belakang tersebut, saya mampu beradaptasi dengan cepat dan siap mendukung proses operasional secara efektif dan profesional.`}
        </p>

        {/* Paragraf 3: Pengalaman Kerja / Magang Nyata (Jika ada) */}
        {data.previousField && (
          <p className="text-justify mb-3.5 leading-relaxed">
            {data.previousField}
          </p>
        )}

        {/* Tabel Biodata (HANYA MUNCUL JIKA USER INGIN TAMPILKAN TABEL) */}
        {data.includeBiodataTable && (
          <div className="my-3 pl-4 py-2 border-l-2 border-slate-300 space-y-1 text-xs">
            <div className="grid grid-cols-[130px_10px_1fr]">
              <span className="text-slate-600">Nama Lengkap</span>
              <span>:</span>
              <span className="font-bold text-slate-900">{data.fullName}</span>
            </div>
            <div className="grid grid-cols-[130px_10px_1fr]">
              <span className="text-slate-600">Pendidikan</span>
              <span>:</span>
              <span>{data.educationDegree} - {data.educationSchool}</span>
            </div>
            <div className="grid grid-cols-[130px_10px_1fr]">
              <span className="text-slate-600">Domisili</span>
              <span>:</span>
              <span>{data.location}</span>
            </div>
            <div className="grid grid-cols-[130px_10px_1fr]">
              <span className="text-slate-600">Nomor Telepon</span>
              <span>:</span>
              <span>{data.phone}</span>
            </div>
          </div>
        )}

        {/* Daftar Lampiran Berkas (Bullet Points seperti di PDF contoh) */}
        <div className="my-3.5">
          <p className="mb-1.5 font-medium text-slate-900">Berikut saya lampirkan :</p>
          <ul className="list-disc list-inside pl-2 space-y-1 text-slate-800 text-[12.5px]">
            {data.attachments && data.attachments.length > 0 ? (
              data.attachments.map((att, idx) => (
                <li key={idx} className="leading-snug">{att}</li>
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
        <p className="text-justify mb-3 leading-relaxed">
          {data.closing ||
            `Saya memiliki minat yang besar untuk bergabung dengan ${data.companyName} dan mengembangkan kompetensi saya. Dengan latar belakang pendidikan, pengalaman, serta kemampuan yang saya miliki, saya siap memberikan kontribusi terbaik dalam mendukung operasional perusahaan secara profesional dan berintegritas.`}
        </p>

        <p className="text-justify mb-8 leading-relaxed">
          Terima kasih atas waktu dan perhatiannya. Saya harap dapat segera dihubungi untuk mengikuti proses seleksi selanjutnya.
        </p>
      </div>

      {/* Tanda Tangan Kanan Bawah */}
      <div className="pt-4 flex justify-end">
        <div className="text-center min-w-[200px]">
          <p className="text-slate-800 font-medium">{data.signOff || "Hormat Saya,"}</p>
          <SignatureDisplay data={data} />
          <p className="font-bold text-slate-900 text-sm">
            {data.fullName}
          </p>
        </div>
      </div>
    </div>
  );
}

