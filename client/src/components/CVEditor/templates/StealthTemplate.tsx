import { formatEducationTitle } from "@/lib/cvFormatters";
/**
 * Stealth — all-dark, subtle gray-on-charcoal, zero color except white text.
 * Security, elite consulting, understated luxury.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips, CustomSectionsDisplay } from "./_shared";

export default function StealthTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-[#111] text-gray-300 min-h-screen"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div className="px-10 pt-9 pb-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-5 text-xs text-gray-500 mt-2">
          {cvData.personalInfo?.location && (
            <span>{cvData.personalInfo.location}</span>
          )}
          {cvData.personalInfo?.email && (
            <span>{cvData.personalInfo.email}</span>
          )}
          {cvData.personalInfo?.phone && (
            <span>{cvData.personalInfo.phone}</span>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Left */}
        <div className="w-[36%] border-r border-gray-800 px-8 py-7 space-y-6 min-w-0 overflow-hidden">
          {grouped.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Skills
              </h2>
              {grouped.map(cat => (
                <div key={cat.category} className="mb-3 min-w-0">
                  <p className="text-xs font-semibold text-gray-400 mb-1 break-words">
                    {cat.category}
                  </p>
                  <div className="space-y-1 min-w-0">
                    {cat.skills.map(s => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 min-w-0"
                      >
                        <div className="w-1 h-1 bg-gray-600 rounded-full shrink-0" />
                        <span className="text-xs text-gray-400 break-words min-w-0">
                          {s.skillName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {cvData.educations.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Education
              </h2>
              {cvData.educations.map(edu => (
                <div key={edu.id} className="mb-2 min-w-0">
                  <p className="text-xs font-semibold text-gray-300 break-words">
                    {formatEducationTitle(edu.degree, edu.field)}
                  </p>
                  <p className="text-xs text-gray-500 break-words">
                    {edu.school}
                  </p>
                  <p className="text-xs text-gray-700">{edu.graduationDate}</p>
                </div>
              ))}
            </div>
          )}
          {cvData.certifications.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Credentials
              </h2>
              {cvData.certifications.map(cert => (
                <div key={cert.id} className="mb-1.5 min-w-0">
                  <p className="text-xs text-gray-300 break-words">
                    {cert.certificationName}
                  </p>
                  <p className="text-xs text-gray-600 break-words">
                    {cert.issuer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {cvData.languages && cvData.languages.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Languages
              </h2>
              <div className="space-y-1 text-xs">
                {cvData.languages.map(l => (
                  <div key={l.id} className="flex justify-between">
                    <span className="font-semibold text-gray-300">{l.language}</span>
                    <span className="text-gray-500 text-[11px]">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex-1 px-8 py-7 space-y-7 min-w-0 overflow-hidden">
          {cvData.personalInfo?.professionalSummary && (
            <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-gray-700 pl-4 break-words">
              {cvData.personalInfo.professionalSummary}
            </p>
          )}
          {cvData.workExperiences.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                Experience
              </h2>
              <div className="space-y-5 min-w-0">
                {cvData.workExperiences.map(exp => (
                  <div key={exp.id} className="min-w-0">
                    <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                      <h3 className="text-sm font-semibold text-white break-words min-w-0">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-xs text-gray-700 shrink-0">
                        {exp.startDate} – {exp.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 break-words">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed break-words">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.projects.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                Projects
              </h2>
              <div className="space-y-3 min-w-0">
                {cvData.projects.map(proj => (
                  <div
                    key={proj.id}
                    className="border border-gray-800 p-3 min-w-0"
                  >
                    <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                      <h3 className="text-xs font-semibold text-white break-words min-w-0">
                        {proj.projectName}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-600 hover:text-gray-400 shrink-0"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-gray-500 mt-0.5 break-words">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && (
                      <TechChips
                        technologies={proj.technologies}
                        className="bg-gray-900 border border-gray-700 text-gray-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {cvData.customSections && cvData.customSections.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Additional Information
              </h2>
              <CustomSectionsDisplay customSections={cvData.customSections} headingColor="text-white" subColor="text-gray-400" descColor="text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
