import { formatEducationTitle } from "@/lib/cvFormatters";
/**
 * Creative — violet/pink gradient header, bold typography, asymmetric layout.
 * Designers, marketers, creative roles.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, PROF_WIDTH, TechChips, CustomSectionsDisplay } from "./_shared";

export default function CreativeTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen font-sans"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 px-10 py-10 text-white">
        <h1 className="text-4xl font-black tracking-tighter leading-none break-words">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-4 text-xs text-purple-200 mt-2 min-w-0">
          {cvData.personalInfo?.location && (
            <span className="break-words">{cvData.personalInfo.location}</span>
          )}
          {cvData.personalInfo?.email && (
            <span className="break-all">{cvData.personalInfo.email}</span>
          )}
          {cvData.personalInfo?.phone && (
            <span className="break-words">{cvData.personalInfo.phone}</span>
          )}
        </div>
        {cvData.personalInfo?.professionalSummary && (
          <p className="text-sm text-purple-100 mt-4 max-w-xl leading-relaxed break-words">
            {cvData.personalInfo.professionalSummary}
          </p>
        )}
      </div>

      {/* Wavy divider simulation via thick border */}
      <div className="h-2 bg-gradient-to-r from-violet-500 to-pink-400" />

      <div className="flex gap-0">
        {/* Left narrow col */}
        <div className="w-[35%] bg-gray-50 px-6 py-8 space-y-6 min-w-0 overflow-hidden">
          {grouped.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-black uppercase tracking-widest text-violet-600 mb-3">
                Skills
              </h2>
              <div className="space-y-3 min-w-0">
                {grouped.map(cat => (
                  <div key={cat.category} className="min-w-0">
                    <p className="text-xs font-bold text-gray-700 mb-1 break-words">
                      {cat.category}
                    </p>
                    {cat.skills.map(skill => (
                      <div key={skill.id} className="mb-1 min-w-0">
                        <div className="flex justify-between mb-0.5 gap-2 min-w-0">
                          <span className="text-xs text-gray-600 break-words min-w-0">
                            {skill.skillName}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-pink-400 rounded-full"
                            style={{
                              width: `${PROF_WIDTH[skill.proficiency ?? ""] ?? 60}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.certifications.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-black uppercase tracking-widest text-violet-600 mb-3">
                Certifications
              </h2>
              <div className="space-y-2 min-w-0">
                {cvData.certifications.map(cert => (
                  <div
                    key={cert.id}
                    className="bg-white border border-purple-100 p-2 rounded min-w-0"
                  >
                    <p className="text-xs font-bold text-gray-800 break-words">
                      {cert.certificationName}
                    </p>
                    <p className="text-xs text-gray-500 break-words">
                      {cert.issuer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-black uppercase tracking-widest text-violet-600 mb-3">
                Languages
              </h2>
              <div className="space-y-1.5 min-w-0 text-xs">
                {cvData.languages.map(l => (
                  <div key={l.id} className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{l.language}</span>
                    <span className="text-violet-600 text-[11px]">({l.proficiency})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right main col */}
        <div className="flex-1 px-8 py-8 space-y-7 min-w-0 overflow-hidden">
          {cvData.workExperiences.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-black uppercase tracking-widest text-violet-600 mb-4">
                Experience
              </h2>
              <div className="space-y-5 min-w-0">
                {cvData.workExperiences.map(exp => (
                  <div key={exp.id} className="min-w-0">
                    <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                      <h3 className="text-sm font-black text-gray-900 break-words min-w-0">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                        {exp.startDate} – {exp.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-violet-600 mt-0.5 break-words">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed break-words">
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
              <h2 className="text-xs font-black uppercase tracking-widest text-violet-600 mb-4">
                Projects
              </h2>
              <div className="grid grid-cols-2 gap-3 min-w-0">
                {cvData.projects.map(proj => (
                  <div
                    key={proj.id}
                    className="border-2 border-purple-100 p-3 hover:border-violet-400 transition-colors min-w-0 overflow-hidden"
                  >
                    <div className="flex justify-between items-start gap-2 min-w-0 flex-wrap">
                      <h3 className="text-xs font-black text-gray-900 break-words min-w-0">
                        {proj.projectName}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-500 shrink-0"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-gray-600 mt-1 break-words">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && (
                      <TechChips
                        technologies={proj.technologies}
                        className="bg-purple-50 text-purple-700 border border-purple-200"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.educations.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-black uppercase tracking-widest text-violet-600 mb-3">
                Education
              </h2>
              {cvData.educations.map(edu => (
                <div
                  key={edu.id}
                  className="flex justify-between items-baseline gap-2 flex-wrap min-w-0"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 break-words">
                      {formatEducationTitle(edu.degree, edu.field)}
                    </p>
                    <p className="text-xs text-gray-500 break-words">
                      {edu.school}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {edu.graduationDate}
                  </span>
                </div>
              ))}
            </div>
          )}
          {cvData.customSections && cvData.customSections.length > 0 && (
            <div className="space-y-3 min-w-0">
              <h2 className="text-xs font-black uppercase tracking-widest text-violet-600 border-b-2 border-violet-200 pb-1">
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
