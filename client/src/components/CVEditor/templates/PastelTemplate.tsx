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
 * Pastel Template — ported from portfolio.
 * Lavender/rose pastel aesthetic (#fdf4ff) with soft purple lines and deep fuchsia typography (#4a044e).
 */
export default function PastelTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  const fontFamily = resolveFontFamily(cvData, "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
  const accent = resolveAccentColor(cvData, "#c084fc");

  return (
    <div
      className="bg-[#fdf4ff] text-[#4a044e] min-h-screen px-9 py-8"
      style={{
        fontFamily,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#e9d5ff] gap-6">
        <div className="flex items-center gap-5 min-w-0">
          {cvData.personalInfo?.photoUrl && (
            <img
              src={cvData.personalInfo.photoUrl}
              alt={cvData.personalInfo.fullName || "Profile"}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#d8b4fe] shadow-sm shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#4a044e] tracking-tight">
              {cvData.personalInfo?.fullName || "Your Name"}
            </h1>
            <TargetRoleDisplay
              role={cvData.cv?.targetRole}
              className="text-[#9333ea] font-medium text-xs mt-0.5"
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#a855f7] mt-1.5 font-medium">
              {cvData.personalInfo?.email && <span>{cvData.personalInfo.email}</span>}
              {cvData.personalInfo?.phone && <span>· {cvData.personalInfo.phone}</span>}
              {cvData.personalInfo?.location && <span>· {cvData.personalInfo.location}</span>}
            </div>
          </div>
        </div>
        <TemplateQRCode cvData={cvData} size={48} className="shrink-0" />
      </div>

      {/* Two Columns Layout */}
      <div className="flex gap-7">
        {/* Main Left Column (60%) */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Summary */}
          {cvData.personalInfo?.professionalSummary && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#9333ea] border-b border-[#e9d5ff] pb-1 mb-2.5">
                Profil Profesional
              </h2>
              <p className="text-xs text-[#4a044e] leading-relaxed">
                {cvData.personalInfo.professionalSummary}
              </p>
            </div>
          )}

          {/* Work Experiences */}
          {cvData.workExperiences.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#9333ea] border-b border-[#e9d5ff] pb-1 mb-3">
                Pengalaman Kerja
              </h2>
              <div className="space-y-4">
                {cvData.workExperiences.map(exp => (
                  <div key={exp.id} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-bold text-[#4a044e] leading-snug">
                        {exp.jobTitle}
                      </p>
                      <span className="text-[10px] text-[#c084fc] shrink-0 font-medium">
                        {exp.startDate} – {exp.endDate || "Sekarang"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9333ea] font-medium mb-1">
                      {exp.company}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </p>
                    {exp.description && (
                      <p className="text-[11px] text-[#6b21a8] leading-relaxed whitespace-pre-line">
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
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#9333ea] border-b border-[#e9d5ff] pb-1 mb-3">
                Proyek Unggulan
              </h2>
              <div className="space-y-3.5">
                {cvData.projects.map(p => (
                  <div key={p.id} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-[#4a044e]">{p.projectName}</p>
                      {p.link && (
                        <a
                          href={ensureAbsoluteUrl(p.link)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#9333ea] hover:underline"
                        >
                          Lihat Proyek ↗
                        </a>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-[11px] text-[#6b21a8] leading-relaxed mt-0.5">
                        {p.description}
                      </p>
                    )}
                    {p.technologies && (
                      <div className="mt-1.5">
                        <TechChips
                          technologies={p.technologies}
                          className="bg-white border border-[#e9d5ff] text-[#9333ea]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Column (40%) */}
        <div className="w-[36%] space-y-6 shrink-0 min-w-0">
          {/* Education */}
          {cvData.educations.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#9333ea] border-b border-[#e9d5ff] pb-1 mb-3">
                Pendidikan
              </h2>
              <div className="space-y-3">
                {cvData.educations.map(edu => (
                  <div key={edu.id} className="min-w-0">
                    <p className="text-xs font-bold text-[#4a044e] leading-snug">
                      {formatEducationTitle(edu.degree, edu.field)}
                    </p>
                    <p className="text-[11px] text-[#9333ea]">{edu.school}</p>
                    <p className="text-[10px] text-[#c084fc]">{edu.graduationDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {grouped.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#9333ea] border-b border-[#e9d5ff] pb-1 mb-3">
                Keahlian
              </h2>
              <div className="space-y-3">
                {grouped.map(cat => (
                  <div key={cat.category} className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#6b21a8] mb-1">
                      {cat.category}
                    </p>
                    <div className="space-y-1">
                      {cat.skills.map(s => (
                        <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-[#a855f7]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9333ea] shrink-0" />
                          <span className="break-words font-medium">{s.skillName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {cvData.certifications.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#9333ea] border-b border-[#e9d5ff] pb-1 mb-3">
                Sertifikasi
              </h2>
              <div className="space-y-2">
                {cvData.certifications.map(cert => (
                  <div key={cert.id} className="bg-white/80 border border-[#e9d5ff] rounded p-2.5 shadow-2xs">
                    <p className="text-[11px] font-semibold text-[#4a044e] leading-snug">
                      {cert.certificationName}
                    </p>
                    <p className="text-[10px] text-[#9333ea] mt-0.5">{cert.issuer}</p>
                    {cert.issueDate && (
                      <p className="text-[9px] text-[#c084fc] mt-0.5">{cert.issueDate}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#9333ea] border-b border-[#e9d5ff] pb-1 mb-3">
                Bahasa
              </h2>
              <div className="space-y-1.5">
                {cvData.languages.map(lang => (
                  <div key={lang.id} className="flex justify-between text-[11px]">
                    <span className="text-[#4a044e] font-medium">{lang.language}</span>
                    <span className="text-[#a855f7]">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
          {cvData.customSections && cvData.customSections.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#9333ea] border-b border-[#e9d5ff] pb-1 mb-3">
                Bagian Tambahan
              </h2>
              <CustomSectionsDisplay
                customSections={cvData.customSections}
                headingColor="text-[#4a044e]"
                subColor="text-[#9333ea]"
                descColor="text-[#6b21a8]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
