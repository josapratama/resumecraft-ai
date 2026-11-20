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
 * Split Template — ported from portfolio.
 * Bold deep blue header banner (#0f4c75) with dual-tone body: clean white main column + soft sky-blue sidebar (#f0f9ff).
 */
export default function SplitTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  const fontFamily = resolveFontFamily(cvData, "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
  const accent = resolveAccentColor(cvData, "#0f4c75");

  return (
    <div
      className="bg-white text-[#1e293b] min-h-screen"
      style={{
        fontFamily,
      }}
    >
      {/* Top Banner (#0f4c75) */}
      <div className="bg-[#0f4c75] px-9 py-7 text-white flex items-center justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0">
          {cvData.personalInfo?.photoUrl && (
            <img
              src={cvData.personalInfo.photoUrl}
              alt={cvData.personalInfo.fullName || "Profile"}
              className="w-18 h-18 rounded-full object-cover border-2 border-[#1b98e0] shadow shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {cvData.personalInfo?.fullName || "Your Name"}
            </h1>
            <TargetRoleDisplay
              role={cvData.cv?.targetRole}
              className="text-[#90e0ef] font-medium text-xs mt-0.5"
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#caf0f8] mt-2">
              {cvData.personalInfo?.email && <span>{cvData.personalInfo.email}</span>}
              {cvData.personalInfo?.phone && <span>· {cvData.personalInfo.phone}</span>}
              {cvData.personalInfo?.location && <span>· {cvData.personalInfo.location}</span>}
            </div>
          </div>
        </div>
        <TemplateQRCode cvData={cvData} size={48} isDark={true} className="shrink-0" />
      </div>

      {/* Body: Left Main + Right Sky Sidebar */}
      <div className="flex">
        {/* Left Main (65%) */}
        <div className="flex-1 px-8 py-6 space-y-6 min-w-0">
          {/* Summary */}
          {cvData.personalInfo?.professionalSummary && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#0f4c75] border-b-2 border-[#0f4c75] pb-1 mb-2.5">
                Ringkasan Profesional
              </h2>
              <p className="text-xs text-[#334155] leading-relaxed">
                {cvData.personalInfo.professionalSummary}
              </p>
            </div>
          )}

          {/* Work Experiences */}
          {cvData.workExperiences.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#0f4c75] border-b-2 border-[#0f4c75] pb-1 mb-3">
                Pengalaman Kerja
              </h2>
              <div className="space-y-4">
                {cvData.workExperiences.map(exp => (
                  <div key={exp.id} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-bold text-[#0f172a] leading-snug">
                        {exp.jobTitle}
                      </p>
                      <span className="text-[10px] text-[#64748b] shrink-0 font-medium">
                        {exp.startDate} – {exp.endDate || "Sekarang"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#0f4c75] font-semibold mb-1">
                      {exp.company}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </p>
                    {exp.description && (
                      <p className="text-[11px] text-[#334155] leading-relaxed whitespace-pre-line">
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
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#0f4c75] border-b-2 border-[#0f4c75] pb-1 mb-3">
                Proyek Unggulan
              </h2>
              <div className="space-y-3.5">
                {cvData.projects.map(p => (
                  <div key={p.id} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-[#0f172a]">{p.projectName}</p>
                      {p.link && (
                        <a
                          href={ensureAbsoluteUrl(p.link)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#0f4c75] hover:underline font-medium"
                        >
                          Lihat Proyek ↗
                        </a>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-[11px] text-[#334155] leading-relaxed mt-0.5">
                        {p.description}
                      </p>
                    )}
                    {p.technologies && (
                      <div className="mt-1.5">
                        <TechChips
                          technologies={p.technologies}
                          className="bg-[#f0f9ff] border border-[#bae6fd] text-[#0f4c75]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar (#f0f9ff) */}
        <div className="w-[35%] bg-[#f0f9ff] border-l border-[#bae6fd] px-5 py-6 space-y-6 shrink-0 min-w-0">
          {/* Education */}
          {cvData.educations.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#0f4c75] border-b-2 border-[#0f4c75] pb-1 mb-3">
                Pendidikan
              </h2>
              <div className="space-y-3">
                {cvData.educations.map(edu => (
                  <div key={edu.id} className="min-w-0">
                    <p className="text-xs font-bold text-[#0f172a] leading-snug">
                      {formatEducationTitle(edu.degree, edu.field)}
                    </p>
                    <p className="text-[11px] text-[#0f4c75] font-medium">{edu.school}</p>
                    <p className="text-[10px] text-[#64748b]">{edu.graduationDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {grouped.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#0f4c75] border-b-2 border-[#0f4c75] pb-1 mb-3">
                Keahlian
              </h2>
              <div className="space-y-3">
                {grouped.map(cat => (
                  <div key={cat.category} className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#0f4c75] mb-1">
                      {cat.category}
                    </p>
                    <div className="space-y-1">
                      {cat.skills.map(s => (
                        <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-[#475569]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1b98e0] shrink-0" />
                          <span className="break-words">{s.skillName}</span>
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
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#0f4c75] border-b-2 border-[#0f4c75] pb-1 mb-3">
                Sertifikasi
              </h2>
              <div className="space-y-2">
                {cvData.certifications.map(cert => (
                  <div key={cert.id} className="bg-white border border-[#bae6fd] rounded p-2.5 shadow-2xs">
                    <p className="text-[11px] font-semibold text-[#0f172a] leading-snug">
                      {cert.certificationName}
                    </p>
                    <p className="text-[10px] text-[#0f4c75] mt-0.5">{cert.issuer}</p>
                    {cert.issueDate && (
                      <p className="text-[9px] text-[#64748b] mt-0.5">{cert.issueDate}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#0f4c75] border-b-2 border-[#0f4c75] pb-1 mb-3">
                Bahasa
              </h2>
              <div className="space-y-1.5">
                {cvData.languages.map(lang => (
                  <div key={lang.id} className="flex justify-between text-[11px]">
                    <span className="text-[#0f172a] font-medium">{lang.language}</span>
                    <span className="text-[#64748b]">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
          {cvData.customSections && cvData.customSections.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#0f4c75] border-b-2 border-[#0f4c75] pb-1 mb-3">
                Bagian Tambahan
              </h2>
              <CustomSectionsDisplay
                customSections={cvData.customSections}
                headingColor="text-[#0f172a]"
                subColor="text-[#0f4c75]"
                descColor="text-[#475569]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
