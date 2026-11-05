/**
 * Corporate — blue/grey palette, formal layout, suited for big companies.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips, CustomSectionsDisplay } from "./_shared";

export default function CorporateTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div className="bg-[#1e3a5f] px-10 py-7 text-white">
        <div className="flex items-center gap-6 min-w-0">
          <div className="w-14 h-14 bg-[#4a90c4] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white">
              {(cvData.personalInfo?.fullName || "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white break-words">
              {cvData.personalInfo?.fullName || "Your Name"}
            </h1>
            <div className="flex flex-wrap gap-x-4 text-xs text-blue-200 mt-1 min-w-0">
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
        </div>
      </div>
      <div className="h-1.5 bg-[#4a90c4]" />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-[32%] bg-gray-50 border-r border-gray-200 px-6 py-7 space-y-6 min-w-0 overflow-hidden">
          {grouped.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1e3a5f] mb-3">
                Skills
              </h2>
              {grouped.map(cat => (
                <div key={cat.category} className="mb-3 min-w-0">
                  <p className="text-xs font-semibold text-[#4a90c4] mb-1 break-words">
                    {cat.category}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map(s => (
                      <span
                        key={s.id}
                        className="text-xs bg-blue-50 border border-blue-200 text-blue-800 px-1.5 py-0.5 rounded break-all"
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
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1e3a5f] mb-3">
                Education
              </h2>
              {cvData.educations.map(edu => (
                <div key={edu.id} className="mb-2 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 break-words">
                    {edu.degree}
                  </p>
                  <p className="text-xs text-gray-600 break-words">
                    {edu.field}
                  </p>
                  <p className="text-xs text-[#4a90c4] break-words">
                    {edu.school}
                  </p>
                  <p className="text-xs text-gray-400">{edu.graduationDate}</p>
                </div>
              ))}
            </div>
          )}
          {cvData.certifications.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1e3a5f] mb-3">
                Certifications
              </h2>
              {cvData.certifications.map(cert => (
                <div
                  key={cert.id}
                  className="mb-2 border-l-2 border-[#4a90c4] pl-2 min-w-0"
                >
                  <p className="text-xs font-semibold text-gray-800 break-words">
                    {cert.certificationName}
                  </p>
                  <p className="text-xs text-gray-500 break-words">
                    {cert.issuer}
                  </p>
                </div>
              ))}
            </div>
          )}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1e3a5f] mb-3">
                Languages
              </h2>
              <div className="space-y-1 text-xs">
                {cvData.languages.map(l => (
                  <div key={l.id} className="flex justify-between">
                    <span className="font-semibold text-gray-800">{l.language}</span>
                    <span className="text-gray-500 text-[11px]">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main */}
        <div className="flex-1 px-8 py-7 space-y-6 min-w-0 overflow-hidden">
          {cvData.personalInfo?.professionalSummary && (
            <div className="bg-blue-50 border-l-4 border-[#4a90c4] p-4 min-w-0">
              <p className="text-xs text-gray-700 leading-relaxed break-words">
                {cvData.personalInfo.professionalSummary}
              </p>
            </div>
          )}
          {cvData.workExperiences.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1e3a5f] pb-1 border-b-2 border-[#4a90c4] mb-4">
                Work Experience
              </h2>
              <div className="space-y-5 min-w-0">
                {cvData.workExperiences.map(exp => (
                  <div key={exp.id} className="min-w-0">
                    <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                      <h3 className="text-sm font-bold text-[#1e3a5f] break-words min-w-0">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-xs text-[#4a90c4] whitespace-nowrap shrink-0">
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
          {cvData.projects.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1e3a5f] pb-1 border-b-2 border-[#4a90c4] mb-4">
                Projects
              </h2>
              <div className="space-y-3 min-w-0">
                {cvData.projects.map(proj => (
                  <div key={proj.id} className="min-w-0">
                    <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                      <h3 className="text-xs font-bold text-[#1e3a5f] break-words min-w-0">
                        {proj.projectName}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#4a90c4] hover:underline shrink-0"
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
                        className="bg-blue-50 border border-blue-200 text-blue-800"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.customSections && cvData.customSections.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#1e3a5f] border-b border-[#4a90c4] pb-1 mb-4">
                Additional Information
              </h2>
              <CustomSectionsDisplay customSections={cvData.customSections} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
