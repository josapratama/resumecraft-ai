import { formatEducationTitle, ensureAbsoluteUrl } from "@/lib/cvFormatters";
import type { FullCVData } from "@/types/cv";
import {
  groupSkills,
  TechChips,
  CustomSectionsDisplay,
  TargetRoleDisplay,
  TemplateQRCode,
  resolveFontFamily,
  resolveAccentColor,
} from "./_shared";

/**
 * Midnight Template — ported from portfolio.
 * Deep midnight navy (#020617) with ocean sky-blue accents (#38bdf8) and structured full-height sidebar.
 */
export default function MidnightTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  const fontFamily = resolveFontFamily(cvData, "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
  const accent = resolveAccentColor(cvData, "#38bdf8");

  return (
    <div
      className="bg-[#020617] text-[#94a3b8] min-h-screen flex"
      style={{
        fontFamily,
      }}
    >
      {/* Sidebar (Full height) */}
      <div className="w-[33%] bg-[#0f172a] border-r border-[#1e293b] px-5 py-7 space-y-6 shrink-0 min-w-0">
        {/* Photo + Name + Title */}
        <div className="flex flex-col items-center text-center">
          {cvData.personalInfo?.photoUrl && (
            <img
              src={cvData.personalInfo.photoUrl}
              alt={cvData.personalInfo.fullName || "Profile"}
              className="w-18 h-18 rounded-full object-cover border-2 border-[#38bdf8] mb-3 shrink-0"
            />
          )}
          <h1 className="text-lg font-bold text-[#f1f5f9] tracking-tight leading-snug">
            {cvData.personalInfo?.fullName || "Your Name"}
          </h1>
          <TargetRoleDisplay
            role={cvData.cv?.targetRole}
            className="text-[#38bdf8] font-medium text-xs mt-1"
          />

          {/* Contact Details */}
          <div className="mt-4 space-y-1.5 text-[11px] text-[#64748b] w-full text-left border-t border-[#1e293b] pt-3">
            {cvData.personalInfo?.email && (
              <p className="truncate">✉ {cvData.personalInfo.email}</p>
            )}
            {cvData.personalInfo?.phone && (
              <p className="truncate">📞 {cvData.personalInfo.phone}</p>
            )}
            {cvData.personalInfo?.location && (
              <p className="truncate">📍 {cvData.personalInfo.location}</p>
            )}
          </div>

          <TemplateQRCode cvData={cvData} size={48} isDark={true} className="mt-4" />
        </div>

        {/* Skills */}
        {grouped.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#38bdf8] border-b border-[#1e293b] pb-1.5 mb-2.5">
              Keahlian
            </h2>
            <div className="space-y-3">
              {grouped.map(cat => (
                <div key={cat.category} className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#e2e8f0] mb-1">
                    {cat.category}
                  </p>
                  <div className="space-y-1">
                    {cat.skills.map(s => (
                      <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shrink-0" />
                        <span className="break-words">{s.skillName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cvData.educations.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#38bdf8] border-b border-[#1e293b] pb-1.5 mb-2.5">
              Pendidikan
            </h2>
            <div className="space-y-3">
              {cvData.educations.map(edu => (
                <div key={edu.id} className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#e2e8f0] leading-snug">
                    {formatEducationTitle(edu.degree, edu.field)}
                  </p>
                  <p className="text-[11px] text-[#38bdf8]">{edu.school}</p>
                  <p className="text-[10px] text-[#475569]">{edu.graduationDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {cvData.languages && cvData.languages.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#38bdf8] border-b border-[#1e293b] pb-1.5 mb-2.5">
              Bahasa
            </h2>
            <div className="space-y-1.5">
              {cvData.languages.map(lang => (
                <div key={lang.id} className="flex justify-between text-[11px]">
                  <span className="text-[#e2e8f0]">{lang.language}</span>
                  <span className="text-[#64748b]">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 py-7 space-y-6 min-w-0">
        {/* Summary */}
        {cvData.personalInfo?.professionalSummary && (
          <div className="min-w-0">
            <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#38bdf8] border-b border-[#1e293b] pb-1.5 mb-2.5">
              Ringkasan Profesional
            </h2>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {/* Experiences */}
        {cvData.workExperiences.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#38bdf8] border-b border-[#1e293b] pb-1.5 mb-3">
              Pengalaman Kerja
            </h2>
            <div className="space-y-4">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-[#f1f5f9] leading-snug">
                      {exp.jobTitle}
                    </p>
                    <span className="text-[10px] text-[#475569] shrink-0 font-medium">
                      {exp.startDate} – {exp.endDate || "Sekarang"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#38bdf8] font-medium mb-1">
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  {exp.description && (
                    <p className="text-[11px] text-[#64748b] leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {cvData.projects && cvData.projects.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#38bdf8] border-b border-[#1e293b] pb-1.5 mb-3">
              Proyek Portofolio
            </h2>
            <div className="space-y-3.5">
              {cvData.projects.map(p => (
                <div key={p.id} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold text-[#f1f5f9]">{p.projectName}</p>
                    {p.link && (
                      <a
                        href={ensureAbsoluteUrl(p.link)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[#38bdf8] hover:underline"
                      >
                        Lihat Proyek ↗
                      </a>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-[11px] text-[#64748b] leading-relaxed mt-0.5">
                      {p.description}
                    </p>
                  )}
                  {p.technologies && (
                    <div className="mt-1.5">
                      <TechChips
                        technologies={p.technologies}
                        className="bg-[#1e293b] border border-[#334155] text-[#38bdf8]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {cvData.certifications.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#38bdf8] border-b border-[#1e293b] pb-1.5 mb-3">
              Sertifikasi & Pelatihan
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {cvData.certifications.map(cert => (
                <div key={cert.id} className="bg-[#0f172a] border border-[#1e293b] rounded p-2.5">
                  <p className="text-[11px] font-semibold text-[#f1f5f9] leading-snug">
                    {cert.certificationName}
                  </p>
                  <p className="text-[10px] text-[#38bdf8] mt-0.5">{cert.issuer}</p>
                  {cert.issueDate && (
                    <p className="text-[9px] text-[#475569] mt-0.5">{cert.issueDate}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Sections */}
        {cvData.customSections && cvData.customSections.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#38bdf8] border-b border-[#1e293b] pb-1.5 mb-3">
              Bagian Tambahan
            </h2>
            <CustomSectionsDisplay
              customSections={cvData.customSections}
              headingColor="text-[#f1f5f9]"
              subColor="text-[#38bdf8]"
              descColor="text-[#64748b]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
