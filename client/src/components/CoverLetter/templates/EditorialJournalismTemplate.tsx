import React from "react";
import type { CoverLetterData } from "../types";
import SignatureDisplay from "../SignatureDisplay";
import { Newspaper, Feather, Quote } from "lucide-react";

export default function EditorialJournalismTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#1c1917";

  return (
    <div
      className="cover-letter-paper bg-white text-stone-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Georgia, 'Times New Roman', serif" }}
    >
      <div>
        {/* Newspaper Masthead */}
        <div className="pb-4 mb-6 border-b-2 border-stone-800 text-center">
          <div className="flex justify-between items-center text-[10px] text-stone-500 uppercase tracking-widest font-sans border-b border-stone-200 pb-1 mb-2">
            <span>EDITORIAL CORRESPONDENCE</span>
            <span>{data.city || "Jakarta"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>EDISI PELAMAR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight uppercase font-serif">
            {data.fullName}
          </h1>
          <p className="text-xs text-stone-600 font-sans italic mt-0.5">
            Jurnalisme Investigatif · Penulisan Naratif · Riset Media & Konten
          </p>
          <div className="flex justify-center items-center gap-3 text-[11px] text-stone-500 font-sans mt-2">
            <span>{data.email}</span>
            <span>·</span>
            <span>{data.phone}</span>
            <span>·</span>
            <span>{data.location}</span>
          </div>
        </div>

        {/* Destination */}
        <div className="flex justify-between items-start mb-6 text-xs font-sans">
          <div>
            <p className="text-stone-400 uppercase font-semibold text-[10px]">Kepada Dewan Redaksi</p>
            <p className="font-bold text-stone-900 text-sm mt-0.5">{data.recipientTitle || "Pemimpin Redaksi / Editor-in-Chief"}</p>
            <p className="font-semibold text-stone-800">{data.companyName}</p>
          </div>
          <div className="text-right text-stone-500">
            Hal: Lamaran {data.jobTitle}
          </div>
        </div>

        {/* Salutation */}
        <p className="font-bold text-stone-900 mb-3">{data.salutation || "Yth. Dewan Redaksi dan Tim Rekrutmen,"}</p>

        {/* Pembuka */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.opening ||
            `Di era derasnya arus informasi yang serba instan, komitmen ${data.companyName} dalam menyajikan jurnalisme yang jernih, mendalam, dan berpihak pada kebenaran publik selalu menjadi rujukan saya. Melalui surat ini, saya bermaksud mengajukan diri untuk bergabung sebagai ${data.jobTitle} guna memperkuat liputan dan kualitas konten editorial media Bapak/Ibu.`}
        </p>

        {/* Editorial Ethic Box */}
        <div className="my-4 p-3.5 rounded-lg bg-stone-50 border-l-4 border-stone-800 font-sans text-xs italic text-stone-700">
          <p className="flex items-center gap-1.5 font-bold font-serif not-italic text-stone-900 mb-1">
            <Quote className="w-3.5 h-3.5 text-stone-700" />
            <span>Prinsip Keakuratan & Kedalaman Cerita</span>
          </p>
          "Jurnalisme yang baik bukan sekadar melaporkan apa yang terjadi, melainkan menggali mengapa hal itu penting dan menyajikannya secara berimbang dengan integritas verifikasi data yang ketat."
        </div>

        {/* Paragraf Inti */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.body ||
            `Saya memiliki pengalaman dalam riset investigatif, penulisan artikel berorientasi fakta (*fact-checking*), serta wawancara mendalam dengan berbagai narasumber kunci. Saya terbiasa memburu sudut pandang liputan yang orisinal, menyusun narasi yang memikat pembaca, dan bekerja dengan disiplin tenggat waktu (*deadline*) yang ketat di ruang redaksi.`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-6 space-y-1 font-sans">
            <p className="font-bold text-stone-900 text-xs">Portofolio Liputan & Keahlian Media:</p>
            {data.skillsHighlight.map((item, idx) => (
              <p key={idx} className="text-xs text-stone-700 leading-normal">
                • {item}
              </p>
            ))}
          </div>
        )}

        {/* Penutup */}
        <p className="text-justify mb-6 leading-relaxed indent-6">
          {data.closing ||
            `Besar harapan saya untuk memperoleh kesempatan berdiskusi langsung mengenai rencana liputan dan kontribusi yang dapat saya hadirkan di ${data.companyName}. Atas perhatian serta apresiasi Bapak/Ibu terhadap jurnalisme berkualitas, saya ucapkan terima kasih.`}
        </p>
      </div>

      {/* Tanda Tangan */}
      <div className="pt-4 border-t border-stone-300 flex justify-end font-sans">
        <div className="text-center min-w-[180px]">
          <p className="text-xs text-stone-600">{data.signOff || "Salam takzim,"}</p>
          <SignatureDisplay data={data} className="h-14 flex items-center justify-center" />
          <p className="font-bold text-stone-900 text-xs border-b border-stone-800 pb-0.5 inline-block">
            {data.fullName}
          </p>
        </div>
      </div>
    </div>
  );
}

