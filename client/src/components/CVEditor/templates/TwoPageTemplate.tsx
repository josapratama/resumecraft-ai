/**
 * Two-Page — explicit page breaks, footnote page numbers.
 * Long CVs, experienced professionals.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips, LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

export default function TwoPageTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white font-sans"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* PAGE 1 */}
      <div className="min-h-screen px-10 py-8 flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-black pb-5 mb-6 min-w-0">
          <h1 className="text-3xl font-bold text-black break-words">
            {cvData.personalInfo?.fullName || "Your Name"}
          </h1>
          <div className="flex flex-wrap gap-x-4 text-xs text-gray-500 mt-1">
            {cvData.personalInfo?.email && (
              <span className="break-all">{cvData.personalInfo.email}</span>
            )}
            {cvData.personalInfo?.phone && (
              <span className="break-words">{cvData.personalInfo.phone}</span>
            )}
            {cvData.personalInfo?.location && (
              <span className="break-words">
                {cvData.personalInfo.location}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {cvData.personalInfo?.professionalSummary && (
          <div className="mb-6 min-w-0">
            <p className="text-sm text-gray-700 leading-relaxed break-words">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {/* Experience */}
        {cvData.workExperiences.length > 0 && (
          <div className="mb-6 flex-1 min-w-0">
            <TwoPageSH>Professional Experience</TwoPageSH>
            <div className="space-y-5 min-w-0">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id} className="min-w-0">
                  <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                    <h3 className="text-sm font-bold text-black break-words min-w-0">
                      {exp.jobTitle}
                    </h3>
                    <span className="text-xs text-gray-400 shrink-0">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-600 mt-0.5 break-words">
                    {exp.company}
                    {exp.location ? ` | ${exp.location}` : ""}
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

        {/* Page 1 footer */}
        <div className="border-t border-gray-300 pt-2 mt-auto flex justify-between text-xs text-gray-400 flex-wrap gap-2">
          <span className="break-words">{cvData.personalInfo?.fullName}</span>
          <span>Page 1 of 2</span>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="min-h-screen px-10 py-8 flex flex-col border-t-4 border-dashed border-gray-300">
        <div className="flex justify-between items-baseline mb-6 border-b border-gray-200 pb-2 flex-wrap gap-2">
          <p className="text-xs font-semibold text-gray-500 break-words">
            {cvData.personalInfo?.fullName}
          </p>
          <p className="text-xs text-gray-400">Page 2 of 2</p>
        </div>

        {/* Education */}
        {cvData.educations.length > 0 && (
          <div className="mb-6 min-w-0">
            <TwoPageSH>Education</TwoPageSH>
            <div className="space-y-3 min-w-0">
              {cvData.educations.map(edu => (
                <div
                  key={edu.id}
                  className="flex justify-between items-baseline gap-2 flex-wrap min-w-0"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-black break-words">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-xs text-gray-600 break-words">
                      {edu.school}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {edu.graduationDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {grouped.length > 0 && (
          <div className="mb-6 min-w-0">
            <TwoPageSH>Technical Skills</TwoPageSH>
            <div className="grid grid-cols-2 gap-4 min-w-0">
              {grouped.map(cat => (
                <div key={cat.category} className="min-w-0">
                  <p className="text-xs font-semibold text-black mb-1 break-words">
                    {cat.category}
                  </p>
                  <p className="text-xs text-gray-700 break-words">
                    {cat.skills.map(s => s.skillName).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {cvData.projects.length > 0 && (
          <div className="mb-6 min-w-0">
            <TwoPageSH>Selected Projects</TwoPageSH>
            <div className="space-y-3 min-w-0">
              {cvData.projects.map(proj => (
                <div key={proj.id} className="min-w-0">
                  <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                    <h3 className="text-xs font-bold text-black break-words min-w-0">
                      {proj.projectName}
                    </h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline shrink-0"
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
                      className="bg-gray-100 border border-gray-200 text-gray-700"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {cvData.certifications.length > 0 && (
          <div className="mb-6 min-w-0">
            <TwoPageSH>Certifications & Awards</TwoPageSH>
            <div className="space-y-1.5 min-w-0">
              {cvData.certifications.map(cert => (
                <div
                  key={cert.id}
                  className="flex justify-between text-xs flex-wrap gap-2 min-w-0"
                >
                  <div className="min-w-0">
                    <span className="font-bold break-words">
                      {cert.certificationName}
                    </span>
                    <span className="text-gray-500 ml-2 break-words">
                      — {cert.issuer}
                    </span>
                  </div>
                  <span className="text-gray-400 shrink-0">
                    {cert.issueDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.languages && cvData.languages.length > 0 && (
          <div className="min-w-0 mb-4">
            <TwoPageSH>Languages</TwoPageSH>
            <LanguagesDisplay languages={cvData.languages} />
          </div>
        )}

        {cvData.customSections && cvData.customSections.length > 0 && (
          <div className="min-w-0 mb-4">
            <TwoPageSH>Additional Information</TwoPageSH>
            <CustomSectionsDisplay customSections={cvData.customSections} />
          </div>
        )}

        <div className="mt-auto border-t border-gray-300 pt-2 flex justify-between text-xs text-gray-400 flex-wrap gap-2">
          <span>References available upon request.</span>
          <span>Page 2 of 2</span>
        </div>
      </div>
    </div>
  );
}

function TwoPageSH({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b-2 border-black pb-0.5 mb-3">
      {children}
    </h2>
  );
}
