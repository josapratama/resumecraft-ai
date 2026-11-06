import { formatEducationTitle } from "@/lib/cvFormatters";
/**
 * Tech — dark terminal-style, green-on-black, monospace font.
 * Developer / hacker aesthetic.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, PROF_WIDTH, TechChips } from "./_shared";

export default function TechTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-gray-950 text-green-400 min-h-screen p-8"
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      {/* Prompt header */}
      <div className="mb-6">
        <p className="text-green-600 text-xs mb-1">~/resume $</p>
        <h1 className="text-2xl font-bold text-green-300">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-4 text-xs text-green-600 mt-1">
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
        <div className="mt-3 border-t border-green-900" />
      </div>

      {/* Summary */}
      {cvData.personalInfo?.professionalSummary && (
        <div className="mb-6">
          <p className="text-xs text-green-600 mb-1">/* about */</p>
          <p className="text-xs text-green-300 leading-relaxed">
            {cvData.personalInfo.professionalSummary}
          </p>
        </div>
      )}

      {/* Skills as tag cloud */}
      {cvData.skills.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-green-600 mb-2">/* stack */</p>
          <div className="flex flex-wrap gap-1.5">
            {cvData.skills.map(skill => {
              const pct = PROF_WIDTH[skill.proficiency ?? ""] ?? 60;
              const opacity =
                pct >= 75
                  ? "opacity-100"
                  : pct >= 50
                    ? "opacity-70"
                    : "opacity-40";
              return (
                <span
                  key={skill.id}
                  className={`text-xs border border-green-800 px-2 py-0.5 text-green-300 ${opacity}`}
                >
                  {skill.skillName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Experience */}
      {cvData.workExperiences.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-green-600 mb-3">/* experience */</p>
          <div className="space-y-4">
            {cvData.workExperiences.map(exp => (
              <div key={exp.id} className="border-l border-green-800 pl-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-green-300">
                    {exp.jobTitle}
                  </span>
                  <span className="text-xs text-green-700">
                    {exp.startDate} — {exp.endDate || "now"}
                  </span>
                </div>
                <p className="text-xs text-green-500">{exp.company}</p>
                {exp.description && (
                  <p className="text-xs text-green-400 mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {cvData.projects.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-green-600 mb-3">/* projects */</p>
          <div className="space-y-3">
            {cvData.projects.map(proj => (
              <div key={proj.id} className="border border-green-900 p-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-green-300">
                    {proj.projectName}
                  </span>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-400"
                    >
                      ↗ link
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-xs text-green-500 mt-0.5">
                    {proj.description}
                  </p>
                )}
                {proj.technologies && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.split(",").map(t => (
                      <span key={t.trim()} className="text-xs text-green-700">
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {cvData.educations.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-green-600 mb-2">/* education */</p>
          {cvData.educations.map(edu => (
            <div key={edu.id} className="flex justify-between">
              <span className="text-xs text-green-300">
                {formatEducationTitle(edu.degree, edu.field)} — {edu.school}
              </span>
              <span className="text-xs text-green-700">
                {edu.graduationDate}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {cvData.certifications.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-green-600 mb-2">/* certs */</p>
          {cvData.certifications.map(cert => (
            <p key={cert.id} className="text-xs text-green-400">
              [{cert.issuer}] {cert.certificationName}
            </p>
          ))}
        </div>
      )}

      {/* Languages */}
      {cvData.languages && cvData.languages.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-green-600 mb-2">/* languages */</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {cvData.languages.map(l => (
              <span key={l.id} className="text-green-300">
                {l.language} <span className="text-green-600">({l.proficiency})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        <div>
          <p className="text-xs text-green-600 mb-2">/* additional_info */</p>
          {cvData.customSections.map(cs => (
            <div key={cs.id} className="mb-2 text-xs">
              <span className="text-green-300 font-bold">{cs.title}</span>
              {cs.subtitle && <span className="text-green-600"> // {cs.subtitle}</span>}
              {cs.date && <span className="text-green-700 ml-2">[{cs.date}]</span>}
              {cs.description && <p className="text-green-500 mt-0.5">{cs.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
