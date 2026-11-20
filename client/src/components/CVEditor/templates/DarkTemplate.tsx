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
 * Dark Template — ported from portfolio.
 * Sleek zinc-dark aesthetics (#09090b) with soft purple/violet accents (#a78bfa) or user custom accent.
 */
export default function DarkTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  const fontFamily = resolveFontFamily(cvData, "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
  const accent = resolveAccentColor(cvData, "#a78bfa");

  return (
    <div
      className="bg-[#09090b] text-[#a1a1aa] min-h-screen"
      style={{
        fontFamily,
      }}
    >
      {/* Top Header Card */}
      <div className="bg-[#18181b] px-9 py-6 border-b border-[#27272a] flex items-center justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0">
          {cvData.personalInfo?.photoUrl && (
            <img
              src={cvData.personalInfo.photoUrl}
              alt={cvData.personalInfo.fullName || "Profile"}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#a78bfa] shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#fafafa] tracking-tight">
              {cvData.personalInfo?.fullName || "Your Name"}
            </h1>
            <TargetRoleDisplay
              role={cvData.cv?.targetRole}
              className="text-[#a78bfa] font-medium text-xs mt-0.5"
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#71717a] mt-2">
              {cvData.personalInfo?.email && <span>{cvData.personalInfo.email}</span>}
              {cvData.personalInfo?.phone && <span>· {cvData.personalInfo.phone}</span>}
              {cvData.personalInfo?.location && <span>· {cvData.personalInfo.location}</span>}
            </div>
          </div>
        </div>
        <TemplateQRCode cvData={cvData} size={46} isDark={true} className="shrink-0" />
      </div>

      {/* Body: Left Sidebar + Right Main */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-[34%] bg-[#18181b] border-r border-[#27272a] px-5 py-6 space-y-6 shrink-0 min-w-0">
          {/* Skills */}
          {grouped.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#a78bfa] border-b border-[#a78bfa]/40 pb-1 mb-3">
                Keahlian
              </h2>
              <div className="space-y-3">
                {grouped.map(cat => (
                  <div key={cat.category} className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#e4e4e7] mb-1">
                      {cat.category}
                    </p>
                    <div className="space-y-1">
                      {cat.skills.map(s => (
                        <div key={s.id} className="flex items-center gap-1.5 text-[11px] text-[#71717a]">
                          <span className="w-1 h-1 rounded-full bg-[#a78bfa] shrink-0" />
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
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#a78bfa] border-b border-[#a78bfa]/40 pb-1 mb-3">
                Pendidikan
              </h2>
              <div className="space-y-3">
                {cvData.educations.map(edu => (
                  <div key={edu.id} className="min-w-0">
                    <p className="text-xs font-semibold text-[#fafafa] leading-snug">
                      {formatEducationTitle(edu.degree, edu.field)}
                    </p>
                    <p className="text-[11px] text-[#a78bfa]">{edu.school}</p>
                    <p className="text-[10px] text-[#52525b]">{edu.graduationDate}</p>
                    {edu.description && (
                      <p className="text-[10px] text-[#71717a] mt-1 leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#a78bfa] border-b border-[#a78bfa]/40 pb-1 mb-3">
                Bahasa
              </h2>
              <div className="space-y-1.5">
                {cvData.languages.map(lang => (
                  <div key={lang.id} className="flex justify-between text-[11px]">
                    <span className="text-[#fafafa] font-medium">{lang.language}</span>
                    <span className="text-[#71717a]">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 px-7 py-6 space-y-6 min-w-0">
          {/* Summary */}
          {cvData.personalInfo?.professionalSummary && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#a78bfa] border-b border-[#a78bfa]/40 pb-1 mb-2.5">
                Tentang Saya
              </h2>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                {cvData.personalInfo.professionalSummary}
              </p>
            </div>
          )}

          {/* Experiences */}
          {cvData.workExperiences.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#a78bfa] border-b border-[#a78bfa]/40 pb-1 mb-3">
                Pengalaman Kerja
              </h2>
              <div className="space-y-4">
                {cvData.workExperiences.map(exp => (
                  <div key={exp.id} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-bold text-[#fafafa] leading-snug">
                        {exp.jobTitle}
                      </p>
                      <span className="text-[10px] text-[#52525b] shrink-0 font-medium">
                        {exp.startDate} – {exp.endDate || "Sekarang"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a78bfa] font-medium mb-1">
                      {exp.company}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </p>
                    {exp.description && (
                      <p className="text-[11px] text-[#71717a] leading-relaxed whitespace-pre-line">
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
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#a78bfa] border-b border-[#a78bfa]/40 pb-1 mb-3">
                Proyek Unggulan
              </h2>
              <div className="space-y-3.5">
                {cvData.projects.map(p => (
                  <div key={p.id} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-[#fafafa]">{p.projectName}</p>
                      {p.link && (
                        <a
                          href={ensureAbsoluteUrl(p.link)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#a78bfa] hover:underline"
                        >
                          Lihat Proyek ↗
                        </a>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-[11px] text-[#71717a] leading-relaxed mt-0.5">
                        {p.description}
                      </p>
                    )}
                    {p.technologies && (
                      <div className="mt-1.5">
                        <TechChips
                          technologies={p.technologies}
                          className="bg-[#27272a] border border-[#3f3f46] text-[#a78bfa]"
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
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#a78bfa] border-b border-[#a78bfa]/40 pb-1 mb-3">
                Sertifikasi
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {cvData.certifications.map(cert => (
                  <div key={cert.id} className="bg-[#18181b] border border-[#27272a] rounded p-2">
                    <p className="text-[11px] font-semibold text-[#fafafa] leading-snug">
                      {cert.certificationName}
                    </p>
                    <p className="text-[10px] text-[#a78bfa] mt-0.5">{cert.issuer}</p>
                    {cert.issueDate && (
                      <p className="text-[9px] text-[#52525b] mt-0.5">{cert.issueDate}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
          {cvData.customSections && cvData.customSections.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-[11px] font-bold tracking-wider uppercase text-[#a78bfa] border-b border-[#a78bfa]/40 pb-1 mb-3">
                Bagian Tambahan
              </h2>
              <CustomSectionsDisplay
                customSections={cvData.customSections}
                headingColor="text-[#fafafa]"
                subColor="text-[#a78bfa]"
                descColor="text-[#71717a]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
