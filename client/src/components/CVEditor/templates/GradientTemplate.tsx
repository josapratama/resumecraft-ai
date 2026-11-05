/**
 * Gradient — full-bleed color washes, blue-to-indigo theme.
 * Modern SaaS, startup, product roles.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, PROF_WIDTH, TechChips, LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

export default function GradientTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-10 py-10 text-white">
        <h1 className="text-3xl font-bold">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-4 text-xs text-blue-200 mt-1.5">
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
        {cvData.personalInfo?.professionalSummary && (
          <p className="text-sm text-blue-100 mt-4 max-w-xl leading-relaxed">
            {cvData.personalInfo.professionalSummary}
          </p>
        )}

        {/* Skill pills in header */}
        {cvData.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {cvData.skills.slice(0, 6).map(s => (
              <span
                key={s.id}
                className="text-xs bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full"
              >
                {s.skillName}
              </span>
            ))}
            {cvData.skills.length > 6 && (
              <span className="text-xs text-blue-200">
                +{cvData.skills.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="px-10 py-8 space-y-7">
        {/* Experience */}
        {cvData.workExperiences.length > 0 && (
          <div>
            <GradSection title="Experience" />
            <div className="space-y-5">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id} className="flex gap-4">
                  <div className="w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold text-gray-900">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {exp.startDate} – {exp.endDate || "Present"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-col: Skills + Education */}
        <div className="grid grid-cols-2 gap-6">
          {grouped.length > 0 && (
            <div>
              <GradSection title="Skills" />
              <div className="space-y-3">
                {grouped.map(cat => (
                  <div key={cat.category}>
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">
                      {cat.category}
                    </p>
                    {cat.skills.map(s => (
                      <div key={s.id} className="mb-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-xs text-gray-600">
                            {s.skillName}
                          </span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            style={{
                              width: `${PROF_WIDTH[s.proficiency ?? ""] ?? 60}%`,
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
          <div className="space-y-5">
            {cvData.educations.length > 0 && (
              <div>
                <GradSection title="Education" />
                {cvData.educations.map(edu => (
                  <div key={edu.id} className="mb-3">
                    <h3 className="text-xs font-bold text-gray-900">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-xs text-indigo-600">{edu.school}</p>
                    <p className="text-xs text-gray-400">
                      {edu.graduationDate}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {cvData.certifications.length > 0 && (
              <div>
                <GradSection title="Certifications" />
                {cvData.certifications.map(cert => (
                  <div
                    key={cert.id}
                    className="mb-2 bg-blue-50 border border-blue-100 p-2 rounded"
                  >
                    <p className="text-xs font-semibold text-gray-900">
                      {cert.certificationName}
                    </p>
                    <p className="text-xs text-gray-500">{cert.issuer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Projects */}
        {cvData.projects.length > 0 && (
          <div>
            <GradSection title="Projects" />
            <div className="grid grid-cols-2 gap-3">
              {cvData.projects.map(proj => (
                <div
                  key={proj.id}
                  className="border border-indigo-100 p-3 rounded hover:border-indigo-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-gray-900">
                      {proj.projectName}
                    </h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-500"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies && (
                    <TechChips
                      technologies={proj.technologies}
                      className="bg-indigo-50 border border-indigo-200 text-indigo-700"
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
            <GradSection title="Languages" />
            <LanguagesDisplay languages={cvData.languages} textColor="text-gray-900" subColor="text-indigo-600" />
          </div>
        )}

        {/* Additional Sections */}
        {cvData.customSections && cvData.customSections.length > 0 && (
          <div>
            <GradSection title="Additional Information" />
            <CustomSectionsDisplay customSections={cvData.customSections} />
          </div>
        )}
      </div>
    </div>
  );
}

function GradSection({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {title}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
    </div>
  );
}
