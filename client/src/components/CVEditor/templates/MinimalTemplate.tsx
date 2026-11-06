import { formatEducationTitle } from "@/lib/cvFormatters";
import type { FullCVData } from "@/types/cv";
import { LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

interface MinimalTemplateProps {
  cvData: FullCVData;
}

export default function MinimalTemplate({ cvData }: MinimalTemplateProps) {
  const groupedSkills = cvData.skills.reduce(
    (acc, skill) => {
      const cat = acc.find(c => c.category === skill.category);
      if (cat) cat.skills.push(skill.skillName);
      else acc.push({ category: skill.category, skills: [skill.skillName] });
      return acc;
    },
    [] as Array<{ category: string; skills: string[] }>
  );

  return (
    <div
      className="bg-white px-12 py-10 min-h-screen font-sans"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header — name center-aligned, minimal info below */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-light text-black tracking-widest uppercase">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-2">
          {cvData.personalInfo?.location && (
            <span>{cvData.personalInfo.location}</span>
          )}
          {cvData.personalInfo?.location && cvData.personalInfo?.email && (
            <span className="text-gray-300">|</span>
          )}
          {cvData.personalInfo?.email && (
            <span>{cvData.personalInfo.email}</span>
          )}
          {cvData.personalInfo?.email && cvData.personalInfo?.phone && (
            <span className="text-gray-300">|</span>
          )}
          {cvData.personalInfo?.phone && (
            <span>{cvData.personalInfo.phone}</span>
          )}
        </div>
        <div className="w-8 h-px bg-red-600 mx-auto mt-4" />
      </div>

      {/* Summary */}
      {cvData.personalInfo?.professionalSummary && (
        <div className="mb-8 text-center">
          <p className="text-xs text-gray-600 leading-loose max-w-xl mx-auto">
            {cvData.personalInfo.professionalSummary}
          </p>
        </div>
      )}

      {/* Experience */}
      {cvData.workExperiences.length > 0 && (
        <MinSection title="Experience">
          <div className="space-y-5">
            {cvData.workExperiences.map(exp => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xs font-semibold text-black">
                    {exp.jobTitle}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {exp.startDate} – {exp.endDate || "Present"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {exp.company}
                  {exp.location && `, ${exp.location}`}
                </p>
                {exp.description && (
                  <p className="text-xs text-gray-700 leading-relaxed mt-1">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </MinSection>
      )}

      {/* Education */}
      {cvData.educations.length > 0 && (
        <MinSection title="Education">
          <div className="space-y-3">
            {cvData.educations.map(edu => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xs font-semibold text-black">
                    {formatEducationTitle(edu.degree, edu.field)}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                    {edu.graduationDate}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{edu.school}</p>
                {edu.description && (
                  <p className="text-xs text-gray-600 mt-1">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </MinSection>
      )}

      {/* Skills */}
      {cvData.skills.length > 0 && (
        <MinSection title="Skills">
          <div className="space-y-1.5">
            {groupedSkills.map(cat => (
              <div key={cat.category} className="flex gap-2 items-baseline">
                <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                  {cat.category}
                </span>
                <span className="text-xs text-gray-700">
                  {cat.skills.join("  ·  ")}
                </span>
              </div>
            ))}
          </div>
        </MinSection>
      )}

      {/* Projects */}
      {cvData.projects.length > 0 && (
        <MinSection title="Projects">
          <div className="space-y-4">
            {cvData.projects.map(proj => (
              <div key={proj.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xs font-semibold text-black">
                    {proj.projectName}
                  </h3>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-black ml-2 whitespace-nowrap"
                    >
                      ↗
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-xs text-gray-600 leading-relaxed mt-0.5">
                    {proj.description}
                  </p>
                )}
                {proj.technologies && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {proj.technologies.split(",").map(tech => (
                      <span
                        key={tech.trim()}
                        className="text-xs text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded"
                      >
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </MinSection>
      )}

      {/* Certifications */}
      {cvData.certifications.length > 0 && (
        <MinSection title="Certifications">
          <div className="space-y-1.5">
            {cvData.certifications.map(cert => (
              <div key={cert.id} className="flex items-baseline gap-2 text-xs">
                <span className="font-semibold text-black">
                  {cert.certificationName}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">{cert.issuer}</span>
                {cert.issueDate && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400">{cert.issueDate}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </MinSection>
      )}

      {/* Languages */}
      {cvData.languages && cvData.languages.length > 0 && (
        <MinSection title="Languages">
          <LanguagesDisplay languages={cvData.languages} />
        </MinSection>
      )}

      {/* Additional / Custom Sections */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        <MinSection title="Additional Information" last>
          <CustomSectionsDisplay customSections={cvData.customSections} />
        </MinSection>
      )}
    </div>
  );
}

function MinSection({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "mb-0" : "mb-7"}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          {title}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}
