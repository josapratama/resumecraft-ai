import type { FullCVData } from "@/types/cv";

interface ModernTemplateProps {
  cvData: FullCVData;
}

const PROFICIENCY_WIDTH: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

export default function ModernTemplate({ cvData }: ModernTemplateProps) {
  const groupedSkills = cvData.skills.reduce(
    (acc, skill) => {
      const cat = acc.find(c => c.category === skill.category);
      if (cat) cat.skills.push(skill);
      else acc.push({ category: skill.category, skills: [skill] });
      return acc;
    },
    [] as Array<{ category: string; skills: typeof cvData.skills }>
  );

  return (
    <div
      className="bg-white min-h-screen flex font-sans text-black"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* LEFT SIDEBAR */}
      <div className="w-[38%] bg-gray-900 text-white flex-shrink-0 p-8 flex flex-col gap-8 min-w-0 overflow-hidden">
        {/* Name + title */}
        <div className="min-w-0">
          <div className="w-10 h-1 bg-red-500 mb-4" />
          <h1 className="text-2xl font-bold leading-tight break-words">
            {cvData.personalInfo?.fullName || "Your Name"}
          </h1>
          {cvData.personalInfo?.location && (
            <p className="text-xs text-gray-400 mt-1 break-words">
              {cvData.personalInfo.location}
            </p>
          )}
        </div>

        {/* Contact */}
        {(cvData.personalInfo?.email || cvData.personalInfo?.phone) && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">
              Contact
            </h2>
            <div className="space-y-2 min-w-0">
              {cvData.personalInfo?.email && (
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-xs text-white break-all">
                    {cvData.personalInfo.email}
                  </p>
                </div>
              )}
              {cvData.personalInfo?.phone && (
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="text-xs text-white break-words">
                    {cvData.personalInfo.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {cvData.skills.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">
              Skills
            </h2>
            <div className="space-y-4 min-w-0">
              {groupedSkills.map(cat => (
                <div key={cat.category} className="min-w-0">
                  <p className="text-xs font-semibold text-gray-300 mb-2 break-words">
                    {cat.category}
                  </p>
                  <div className="space-y-1.5 min-w-0">
                    {cat.skills.map(skill => (
                      <div key={skill.id} className="min-w-0">
                        <div className="flex justify-between items-center mb-0.5 gap-2 min-w-0">
                          <span className="text-xs text-gray-300 break-words min-w-0">
                            {skill.skillName}
                          </span>
                          {skill.proficiency && (
                            <span className="text-xs text-gray-500 capitalize whitespace-nowrap">
                              {skill.proficiency}
                            </span>
                          )}
                        </div>
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${PROFICIENCY_WIDTH[skill.proficiency ?? ""] ?? 60}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {cvData.certifications.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">
              Certifications
            </h2>
            <div className="space-y-2 min-w-0">
              {cvData.certifications.map(cert => (
                <div key={cert.id} className="min-w-0">
                  <p className="text-xs font-semibold text-white break-words">
                    {cert.certificationName}
                  </p>
                  <p className="text-xs text-gray-400 break-words">
                    {cert.issuer}
                    {cert.issueDate && ` · ${cert.issueDate}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT MAIN */}
      <div className="flex-1 p-8 flex flex-col gap-7 min-w-0 overflow-hidden">
        {/* Summary */}
        {cvData.personalInfo?.professionalSummary && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Profile
            </h2>
            <div className="w-8 h-0.5 bg-red-600 mb-3" />
            <p className="text-xs text-gray-700 leading-relaxed break-words">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {cvData.workExperiences.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Experience
            </h2>
            <div className="w-8 h-0.5 bg-red-600 mb-4" />
            <div className="space-y-5 min-w-0">
              {cvData.workExperiences.map(exp => (
                <div
                  key={exp.id}
                  className="relative pl-4 border-l-2 border-gray-200 min-w-0"
                >
                  <div className="absolute -left-[5px] top-0 w-2 h-2 bg-red-600 rounded-full" />
                  <div className="flex items-baseline justify-between mb-0.5 gap-2 flex-wrap min-w-0">
                    <h3 className="text-sm font-bold text-black break-words min-w-0">
                      {exp.jobTitle}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-red-600 mb-1 break-words">
                    {exp.company}
                  </p>
                  {exp.location && (
                    <p className="text-xs text-gray-400 mb-1 break-words">
                      {exp.location}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-xs text-gray-700 leading-relaxed break-words">
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
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Education
            </h2>
            <div className="w-8 h-0.5 bg-red-600 mb-4" />
            <div className="space-y-4 min-w-0">
              {cvData.educations.map(edu => (
                <div
                  key={edu.id}
                  className="relative pl-4 border-l-2 border-gray-200 min-w-0"
                >
                  <div className="absolute -left-[5px] top-0 w-2 h-2 bg-black rounded-full" />
                  <div className="flex items-baseline justify-between mb-0.5 gap-2 flex-wrap min-w-0">
                    <h3 className="text-sm font-bold text-black break-words min-w-0">
                      {edu.degree} in {edu.field}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {edu.graduationDate}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 break-words">
                    {edu.school}
                  </p>
                  {edu.description && (
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed break-words">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {cvData.projects.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Projects
            </h2>
            <div className="w-8 h-0.5 bg-red-600 mb-4" />
            <div className="space-y-4 min-w-0">
              {cvData.projects.map(proj => (
                <div key={proj.id} className="min-w-0">
                  <div className="flex items-baseline justify-between mb-1 gap-2 flex-wrap min-w-0">
                    <h3 className="text-sm font-bold text-black break-words min-w-0">
                      {proj.projectName}
                    </h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-600 hover:underline whitespace-nowrap"
                      >
                        View →
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-gray-700 leading-relaxed mb-1 break-words">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1 mt-1.5 min-w-0">
                      {proj.technologies.split(",").map(tech => (
                        <span
                          key={tech.trim()}
                          className="text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full font-medium text-gray-700 break-all"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
