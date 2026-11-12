import React from "react";
import type { CoverLetterData } from "../types";
import SignatureDisplay from "../SignatureDisplay";
import { Utensils, Star, Smile } from "lucide-react";

export default function HospitalityTourismTemplate({ data }: { data: CoverLetterData }) {
  const accent = data.accentColor || "#be123c";

  return (
    <div
      className="cover-letter-paper bg-white text-slate-800 p-8 sm:p-12 text-[12.5px] leading-relaxed select-text min-h-[1050px] flex flex-col justify-between"
      style={{ fontFamily: data.fontFamily || "Georgia, Cambria, serif" }}
    >
      <div>
        {/* Hospitality Header */}
        <div className="pb-6 mb-6 border-b border-rose-100 flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold mb-1">
              <Star className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>Hospitality & Guest Experience Excellence</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{data.fullName}</h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Spesialis Layanan Tamu, Perhotelan & Operasional Pariwisata
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-sans space-y-0.5">
            <p>{data.email}</p>
            <p>{data.phone} · {data.location}</p>
          </div>
        </div>

        {/* Date & Destination Hotel */}
        <div className="flex justify-between items-start mb-6 text-xs font-sans">
          <div>
            <p className="text-slate-400 font-semibold uppercase text-[10px]">Ditujukan Kepada</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">General Manager / Human Resources</p>
            <p className="font-semibold text-slate-800">{data.companyName}</p>
            <p className="text-slate-500">{data.companyAddress || "Hotel & Resort Division"}</p>
          </div>
          <div className="text-right text-slate-500">
            {data.city || "Bali"}, {data.date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Perihal */}
        <div className="mb-4 bg-rose-50 border-l-4 border-rose-700 p-2.5 rounded-r-md text-xs font-sans">
          <span className="font-bold text-slate-900">Perihal: </span>
          <span className="text-slate-800 font-medium">Lamaran Pekerjaan untuk Posisi {data.jobTitle}</span>
        </div>

        {/* Salam */}
        <p className="font-bold text-slate-900 mb-3">{data.salutation || "Dengan hormat,"}</p>

        {/* Pembuka */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.opening ||
            `Sehubungan dengan reputasi keunggulan pelayanan bintang lima yang selalu dihadirkan oleh ${data.companyName}, melalui surat ini saya bermaksud mengajukan diri untuk posisi ${data.jobTitle}. Dengan keramahan autentik, ketelitian dalam operasional layanan, dan kemampuan komunikasi multibahasa yang baik, saya berkomitmen menciptakan pengalaman menginap yang tak terlupakan bagi setiap tamu.`}
        </p>

        {/* Guest Service Box */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-sans text-xs flex items-start gap-3">
          <Smile className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">Standar Keramahan & Kecepatan Respons (Service Excellence)</p>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Terlatih dalam penanganan keluhan tamu secara solutif, etika penyambutan (*guest greeting*), manajemen reservasi kamar, dan sertifikasi kebersihan serta sanitasi standar CHSE.
            </p>
          </div>
        </div>

        {/* Paragraf Inti */}
        <p className="text-justify mb-3 leading-relaxed indent-6">
          {data.body ||
            `Saya meyakini bahwa sentuhan keramahan yang tulus dan kesiapan membantu dengan senyuman adalah kunci loyalitas tamu. Saya memiliki fleksibilitas waktu kerja tinggi, stamina prima, serta mampu menjaga ketenangan dan keramahan di bawah tekanan jam-jam sibuk (*peak hours*).`}
        </p>

        {/* Highlights */}
        {data.skillsHighlight && data.skillsHighlight.length > 0 && (
          <div className="mb-4 pl-6 space-y-1 font-sans">
            <p className="font-bold text-slate-900 text-xs">Keahlian & Penguasaan Standar Hospitality:</p>
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
            `Merupakan sebuah kehormatan bagi saya apabila diberikan kesempatan wawancara untuk mendemonstrasikan antusiasme dan komitmen saya bagi ${data.companyName}. Atas waktu dan pertimbangan yang Bapak/Ibu berikan, saya haturkan terima kasih.`}
        </p>
      </div>

      {/* Tanda Tangan */}
      <div className="pt-4 border-t border-slate-200 flex justify-end font-sans">
        <div className="text-center min-w-[180px]">
          <p className="text-xs text-slate-600">{data.signOff || "Salam hangat & hormat saya,"}</p>
          <SignatureDisplay data={data} className="h-14 flex items-center justify-center" />
          <p className="font-bold text-slate-900 text-xs border-b border-slate-800 pb-0.5 inline-block">
            {data.fullName}
          </p>
        </div>
      </div>
    </div>
  );
}

