import { formatEducationTitle } from "@/lib/cvFormatters";
/**
 * Monochrome — pure grayscale, subtle shadows, no color whatsoever.
 * Extremely professional, printer-friendly.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips, LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

export default function MonochromeTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div className="bg-gray-900 px-10 py-7 text-white">
        <h1 className="text-2xl font-bold tracking-tight">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-4 text-xs text-gray-400 mt-1.5">
          {cvData.personalInfo?.email && (
            <span>{cvData.personalInfo.email}</span>
          )}
          {cvData.personalInfo?.phone && (
            <span>{cvData.personalInfo.phone}</span>
          )}
          {cvData.personalInfo?.location && (
            <span>{cvData.personalInfo.location}</span>
          )}
        </div>
      </div>
      <div className="h-0.5 bg-gray-300" />

      <div className="grid grid-cols-[2fr_1fr]">
        {/* Main */}
        <div className="px-8 py-7 space-y-6 border-r border-gray-200 min-w-0 overflow-hidden">
          {cvData.personalInfo?.professionalSummary && (
            <div className="bg-gray-50 p-4 border-l-4 border-gray-400 min-w-0">
              <p className="text-xs text-gray-700 leading-relaxed break-words">
                {cvData.personalInfo.professionalSummary}
              </p>
            </div>
          )}
          {cvData.workExperiences.length > 0 && (
            <div className="min-w-0">
              <MH>Work Experience</MH>
              <div className="space-y-4 min-w-0">
                {cvData.workExperiences.map(exp => (
                  <div key={exp.id} className="min-w-0">
                    <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 break-words min-w-0">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-xs text-gray-400 shrink-0">
                        {exp.startDate} – {exp.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 break-words">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-700 mt-1 leading-relaxed break-words">
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
              <MH>Projects</MH>
              <div className="space-y-3 min-w-0">
                {cvData.projects.map(proj => (
                  <div
                    key={proj.id}
                    className="border border-gray-200 p-3 min-w-0"
                  >
                    <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 break-words min-w-0">
                        {proj.projectName}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-black shrink-0"
                        >
                          Link ↗
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-gray-700 mt-0.5 break-words">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && (
                      <TechChips
                        technologies={proj.technologies}
                        className="bg-gray-100 border border-gray-300 text-gray-600"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="px-6 py-7 space-y-5 bg-gray-50 min-w-0 overflow-hidden">
          {grouped.length > 0 && (
            <div className="min-w-0">
              <MH>Skills</MH>
              {grouped.map(cat => (
                <div key={cat.category} className="mb-2 min-w-0">
                  <p className="text-xs font-semibold text-gray-600 mb-1 break-words">
                    {cat.category}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map(s => (
                      <span
                        key={s.id}
                        className="text-xs bg-white border border-gray-300 px-1.5 py-0.5 text-gray-700 break-all"
                      >
                        {s.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {cvData.educations.length > 0 && (
            <div className="min-w-0">
              <MH>Education</MH>
              {cvData.educations.map(edu => (
                <div key={edu.id} className="mb-2 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 break-words">
                    {formatEducationTitle(edu.degree, edu.field)}
                  </p>
                  <p className="text-xs text-gray-500 break-words">
                    {edu.school}
                  </p>
                  <p className="text-xs text-gray-400">{edu.graduationDate}</p>
                </div>
              ))}
            </div>
          )}
          {cvData.certifications.length > 0 && (
            <div className="min-w-0">
              <MH>Certifications</MH>
              {cvData.certifications.map(cert => (
                <div key={cert.id} className="mb-1.5 text-xs min-w-0">
                  <p className="font-semibold text-gray-800 break-words">
                    {cert.certificationName}
                  </p>
                  <p className="text-gray-500 break-words">{cert.issuer}</p>
                </div>
              ))}
            </div>
          )}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="min-w-0">
              <MH>Languages</MH>
              <LanguagesDisplay languages={cvData.languages} textColor="text-black" subColor="text-gray-500" />
            </div>
          )}
          {cvData.customSections && cvData.customSections.length > 0 && (
            <div className="min-w-0">
              <MH>Additional Information</MH>
              <CustomSectionsDisplay customSections={cvData.customSections} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MH({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1 mb-3">
      {children}
    </h2>
  );
}
