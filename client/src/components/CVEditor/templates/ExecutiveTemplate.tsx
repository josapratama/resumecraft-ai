/**
 * Executive — navy header, gold accents, two-column footer for skills/certs.
 * Authoritative, C-suite feel.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips, LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

export default function ExecutiveTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen font-sans"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      {/* Navy header */}
      <div className="bg-[#0a1628] px-10 py-8 text-white">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {cvData.personalInfo?.fullName || "Your Name"}
            </h1>
            {cvData.personalInfo?.location && (
              <p className="text-sm text-blue-300 mt-1">
                {cvData.personalInfo.location}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-blue-200 space-y-1">
            {cvData.personalInfo?.email && <p>{cvData.personalInfo.email}</p>}
            {cvData.personalInfo?.phone && <p>{cvData.personalInfo.phone}</p>}
          </div>
        </div>
        {/* Gold rule */}
        <div className="mt-5 h-px bg-amber-400" />
      </div>

      <div className="px-10 py-8 space-y-7">
        {/* Summary */}
        {cvData.personalInfo?.professionalSummary && (
          <div className="border-l-4 border-amber-400 pl-4">
            <p className="text-sm text-gray-700 leading-relaxed italic">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {/* Experience */}
        {cvData.workExperiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0a1628] mb-4 flex items-center gap-2">
              <span>Professional Experience</span>
              <span className="flex-1 h-px bg-amber-400" />
            </h2>
            <div className="space-y-5">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-bold text-[#0a1628]">
                      {exp.jobTitle}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-600 mt-0.5">
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cvData.educations.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0a1628] mb-4 flex items-center gap-2">
              <span>Education</span>
              <span className="flex-1 h-px bg-amber-400" />
            </h2>
            <div className="space-y-3">
              {cvData.educations.map(edu => (
                <div
                  key={edu.id}
                  className="flex justify-between items-baseline"
                >
                  <div>
                    <h3 className="text-xs font-bold text-[#0a1628]">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-xs text-gray-600">{edu.school}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {edu.graduationDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom two-column */}
        <div className="grid grid-cols-2 gap-8 pt-2">
          {grouped.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0a1628] mb-3">
                Core Competencies
              </h2>
              <div className="space-y-1">
                {grouped.map(cat => (
                  <div key={cat.category}>
                    <p className="text-xs font-semibold text-amber-700">
                      {cat.category}
                    </p>
                    <p className="text-xs text-gray-600">
                      {cat.skills.map(s => s.skillName).join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0a1628] mb-3">
                Certifications
              </h2>
              <div className="space-y-1.5">
                {cvData.certifications.map(cert => (
                  <div key={cert.id}>
                    <p className="text-xs font-semibold text-[#0a1628]">
                      {cert.certificationName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cert.issuer}
                      {cert.issueDate ? ` · ${cert.issueDate}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Projects */}
        {cvData.projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0a1628] mb-4 flex items-center gap-2">
              <span>Key Projects</span>
              <span className="flex-1 h-px bg-amber-400" />
            </h2>
            <div className="space-y-3">
              {cvData.projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold text-[#0a1628]">
                      {proj.projectName}
                    </h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-600 hover:underline"
                      >
                        View ↗
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-gray-700 mt-0.5">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies && (
                    <TechChips
                      technologies={proj.technologies}
                      className="bg-amber-50 border border-amber-200 text-amber-800"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {cvData.languages && cvData.languages.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0a1628] mb-3 flex items-center gap-2">
              <span>Languages</span>
              <span className="flex-1 h-px bg-amber-400" />
            </h2>
            <LanguagesDisplay languages={cvData.languages} textColor="text-[#0a1628]" />
          </div>
        )}

        {/* Additional Sections */}
        {cvData.customSections && cvData.customSections.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#0a1628] mb-3 flex items-center gap-2">
              <span>Additional Information</span>
              <span className="flex-1 h-px bg-amber-400" />
            </h2>
            <CustomSectionsDisplay customSections={cvData.customSections} headingColor="text-[#0a1628]" />
          </div>
        )}
      </div>
    </div>
  );
}
