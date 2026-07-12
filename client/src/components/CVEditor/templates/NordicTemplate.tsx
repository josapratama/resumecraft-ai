/**
 * Nordic — Scandinavian minimalism, teal/seafoam accents, extreme whitespace.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips } from "./_shared";

export default function NordicTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-[#f8f9f7] min-h-screen"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Teal top bar */}
      <div className="h-2 bg-[#2d9b8a]" />

      <div className="px-10 py-9 max-w-2xl">
        {/* Name block */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900 tracking-wide">
            {cvData.personalInfo?.fullName || "Your Name"}
          </h1>
          <div className="w-12 h-0.5 bg-[#2d9b8a] mt-2 mb-2" />
          <div className="flex flex-wrap gap-x-4 text-xs text-gray-500">
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

        {/* Summary */}
        {cvData.personalInfo?.professionalSummary && (
          <div className="mb-8">
            <p className="text-sm text-gray-600 leading-loose">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {/* Experience */}
        {cvData.workExperiences.length > 0 && (
          <NordicSection title="Experience">
            <div className="space-y-6">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id} className="flex gap-4">
                  <div className="text-right w-20 flex-shrink-0 pt-0.5">
                    <p className="text-xs text-[#2d9b8a]">
                      {exp.endDate || "Now"}
                    </p>
                    <p className="text-xs text-gray-400">{exp.startDate}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-[#2d9b8a] bg-[#f8f9f7] mt-0.5 flex-shrink-0" />
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  </div>
                  <div className="flex-1 pb-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {exp.jobTitle}
                    </h3>
                    <p className="text-xs text-[#2d9b8a] mt-0.5">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </NordicSection>
        )}

        {/* Education */}
        {cvData.educations.length > 0 && (
          <NordicSection title="Education">
            <div className="space-y-3">
              {cvData.educations.map(edu => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{edu.school}</p>
                  </div>
                  <span className="text-xs text-[#2d9b8a]">
                    {edu.graduationDate}
                  </span>
                </div>
              ))}
            </div>
          </NordicSection>
        )}

        {/* Skills */}
        {grouped.length > 0 && (
          <NordicSection title="Skills">
            <div className="space-y-3">
              {grouped.map(cat => (
                <div key={cat.category}>
                  <p className="text-xs font-medium text-gray-700 mb-1.5">
                    {cat.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map(s => (
                      <span
                        key={s.id}
                        className="text-xs border border-[#2d9b8a] text-[#2d9b8a] px-2 py-0.5 rounded-full"
                      >
                        {s.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </NordicSection>
        )}

        {/* Projects */}
        {cvData.projects.length > 0 && (
          <NordicSection title="Projects">
            <div className="space-y-4">
              {cvData.projects.map(proj => (
                <div key={proj.id} className="border-l-2 border-[#2d9b8a] pl-3">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-900">
                      {proj.projectName}
                    </h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#2d9b8a] hover:underline"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies && (
                    <TechChips
                      technologies={proj.technologies}
                      className="bg-teal-50 border border-teal-200 text-teal-800"
                    />
                  )}
                </div>
              ))}
            </div>
          </NordicSection>
        )}

        {/* Certifications */}
        {cvData.certifications.length > 0 && (
          <NordicSection title="Certifications" last>
            <div className="space-y-1.5">
              {cvData.certifications.map(cert => (
                <div
                  key={cert.id}
                  className="flex items-baseline gap-2 text-xs"
                >
                  <span className="font-medium text-gray-900">
                    {cert.certificationName}
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500">{cert.issuer}</span>
                  {cert.issueDate && (
                    <span className="text-[#2d9b8a]">{cert.issueDate}</span>
                  )}
                </div>
              ))}
            </div>
          </NordicSection>
        )}
      </div>
    </div>
  );
}

function NordicSection({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "mb-0" : "mb-8"}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}
