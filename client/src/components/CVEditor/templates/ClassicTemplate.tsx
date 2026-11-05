import type { FullCVData } from "@/types/cv";
import { LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

interface ClassicTemplateProps {
  cvData: FullCVData;
}

export default function ClassicTemplate({ cvData }: ClassicTemplateProps) {
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
      className="bg-white p-10 min-h-screen font-sans"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black tracking-tight">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        {cvData.personalInfo?.location && (
          <p className="text-sm text-gray-600 mt-1">
            {cvData.personalInfo.location}
          </p>
        )}
        {/* Contact line */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
          {cvData.personalInfo?.email && (
            <span>{cvData.personalInfo.email}</span>
          )}
          {cvData.personalInfo?.phone && (
            <span>{cvData.personalInfo.phone}</span>
          )}
        </div>
        {/* Red underline */}
        <div className="mt-4 h-0.5 bg-red-600" />
        <div className="mt-0.5 h-0.5 bg-black" />
      </div>

      {/* Professional Summary */}
      {cvData.personalInfo?.professionalSummary && (
        <Section title="Professional Summary">
          <p className="text-xs text-gray-800 leading-relaxed italic">
            {cvData.personalInfo.professionalSummary}
          </p>
        </Section>
      )}

      {/* Work Experience */}
      {cvData.workExperiences.length > 0 && (
        <Section title="Work Experience">
          <div className="space-y-5">
            {cvData.workExperiences.map(exp => (
              <div key={exp.id} className="pl-4 border-l-2 border-red-600">
                <div className="flex items-baseline justify-between mb-0.5">
                  <h3 className="text-sm font-bold text-black">
                    {exp.jobTitle}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-3">
                    {exp.startDate} – {exp.endDate || "Present"}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  {exp.company}
                </p>
                {exp.location && (
                  <p className="text-xs text-gray-400 mb-1">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {cvData.educations.length > 0 && (
        <Section title="Education">
          <div className="space-y-4">
            {cvData.educations.map(edu => (
              <div key={edu.id} className="pl-4 border-l-2 border-black">
                <div className="flex items-baseline justify-between mb-0.5">
                  <h3 className="text-sm font-bold text-black">
                    {edu.degree} in {edu.field}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-3">
                    {edu.graduationDate}
                  </span>
                </div>
                <p className="text-xs text-gray-700">{edu.school}</p>
                {edu.description && (
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Skills */}
      {cvData.skills.length > 0 && (
        <Section title="Skills">
          <div className="space-y-2">
            {groupedSkills.map(cat => (
              <div key={cat.category} className="flex gap-2">
                <span className="text-xs font-bold text-black w-24 flex-shrink-0">
                  {cat.category}:
                </span>
                <span className="text-xs text-gray-700">
                  {cat.skills.join(" · ")}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Projects */}
      {cvData.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-4">
            {cvData.projects.map(proj => (
              <div key={proj.id} className="pl-4 border-l-2 border-red-600">
                <div className="flex items-baseline justify-between mb-0.5">
                  <h3 className="text-sm font-bold text-black">
                    {proj.projectName}
                  </h3>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-red-600 hover:underline ml-3 whitespace-nowrap"
                    >
                      Link ↗
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {proj.description}
                  </p>
                )}
                {proj.technologies && (
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-semibold">Tech:</span>{" "}
                    {proj.technologies}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {cvData.certifications.length > 0 && (
        <Section title="Certifications">
          <div className="space-y-2">
            {cvData.certifications.map(cert => (
              <div key={cert.id} className="flex items-baseline gap-3">
                <span className="text-xs font-bold text-black">
                  {cert.certificationName}
                </span>
                <span className="text-xs text-gray-400">—</span>
                <span className="text-xs text-gray-600">{cert.issuer}</span>
                {cert.issueDate && (
                  <span className="text-xs text-gray-400">
                    {cert.issueDate}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Languages */}
      {cvData.languages && cvData.languages.length > 0 && (
        <Section title="Languages">
          <LanguagesDisplay languages={cvData.languages} />
        </Section>
      )}

      {/* Additional / Custom Sections */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        <Section title="Additional Information" last>
          <CustomSectionsDisplay customSections={cvData.customSections} />
        </Section>
      )}
    </div>
  );
}

function Section({
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
      <h2
        className="text-xs font-bold uppercase tracking-[0.15em] text-black mb-3"
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
