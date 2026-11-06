import React from "react";
import type { CoverLetterData } from "../types";
import { GraduationCap, BookOpen, HeartHandshake } from "lucide-react";

export default function EducationTeachingTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#15803d";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Cambria, Georgia, serif" }}
    >
      <div>
        {/* Education Header */}
        <div className="pb-6 mb-6 border-b border-green-200">
          <div className="flex justify-between items-baseline flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold mb-1">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Tenaga Pendidik & Pengajar Profesional</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{data.fullName}</h1>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Pendidik Berdedikasi · Kurikulum Merdeka & Pembelajaran Interaktif
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 font-sans space-y-0.5">
              <p>{data.email}</p>
              <p>{data.phone} · {data.location}</p>
            </div>
          </div>
        </div>

        {/* Date & Destination School */}
        <div className="flex justify-between items-start mb-6 text-xs font-sans">
          <div>
            <p className="text-slate-400 font-semibold uppercase text-[10px]">Ditujukan Kepada</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">Kepala Sekolah / Yayasan Pendidikan</p>
            <p className="font-semibold text-slate-800">{data.companyName}</p>
            <p className="text-slate-500">{data.companyAddress || "Bagian Manajemen Guru & Kurikulum"}</p>
          </div>
          <div className="text-right text-slate-500">
            {data.city || "Prabumulih"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Perihal */}
        <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-700 p-2.5 rounded-r text-xs font-sans">
          <span className="font-bold text-slate-900">Perihal: </span>
          <span className="text-slate-800 font-medium">Permohonan Menjadi Tenaga Pengajar – {data.jobTitle}</span>
        </div>

        {/* Salam */}
        <p className="font-bold text-slate-900 mb-3">{data.salutation || "Dengan hormat,"}</p>

        {/* Pembuka */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.opening ||
            `Sehubungan dengan komitmen ${data.companyName} dalam mencetak generasi unggul yang berkarakter, melalui surat ini saya bermaksud mengajukan diri untuk posisi ${data.jobTitle}. Sebagai seorang pendidik yang berdedikasi tinggi, saya berkeyakinan bahwa pembelajaran yang efektif berakar dari metode interaktif, pendekatan empati yang memotivasi, dan penciptaan lingkungan belajar yang aman bagi setiap siswa.`}
        </p>

        {/* Pedagogical Philosophy Box */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-sans text-xs flex items-start gap-3">
          <HeartHandshake className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">Pendekatan Pembelajaran Diferensiasi & Karakter</p>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Mengintegrasikan modul digital interaktif, asesmen formatif berkala, bimbingan minat bakat, serta komunikasi harmonis dengan orang tua siswa untuk mendukung perkembangan akademik dan mental anak.
            </p>
          </div>
        </div>

        {/* Paragraf Inti */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.body ||
            `Pengalaman mengajar saya membekali saya dengan kesabaran, kepiawaian manajemen kelas yang kondusif, dan kemampuan menyederhanakan konsep-konsep rumit menjadi mudah dipahami. Saya terbiasa menyusun RPP/Modul Ajar yang kontekstual dan memanfaatkan teknologi edukasi guna membangkitkan rasa ingin tahu siswa.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-6 space-y-1 font-sans">
            <p className="font-bold text-slate-900 text-xs">Kompetensi Pedagogik & Portofolio Pengajaran:</p>
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
            `Besar harapan saya untuk memperoleh kesempatan wawancara agar dapat memperagakan simulasi mengajar (*micro-teaching*) serta memaparkan dedikasi saya bagi ${data.companyName}. Atas perhatian Bapak/Ibu, saya haturkan terima kasih.`}
        </p>
      </div>

      {/* Tanda Tangan */}
      <div className="pt-4 border-t border-slate-200 flex justify-end font-sans">
        <div className="text-center min-w-[180px]">
          <p className="text-xs text-slate-600">{data.signOff || "Hormat saya,"}</p>
          <div className="h-14 flex items-center justify-center italic text-slate-600 font-serif text-sm">
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

