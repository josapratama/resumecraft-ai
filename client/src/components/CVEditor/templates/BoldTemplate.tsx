/**
 * Bold — large red name, heavy black sections, high contrast.
 * Sales, marketing, impactful presence.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips } from "./_shared";

export default function BoldTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Bold header */}
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-5xl font-black text-red-600 leading-none tracking-tight">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex gap-4 mt-2 text-xs text-gray-600">
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
      <div className="h-3 bg-black mx-8 mb-6" />

      <div className="px-8 space-y-6">
        {cvData.personalInfo?.professionalSummary && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {cvData.personalInfo.professionalSummary}
          </p>
        )}

        {cvData.workExperiences.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-black">
                Experience
              </h2>
              <div className="flex-1 h-0.5 bg-red-600" />
            </div>
            <div className="space-y-4">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id} className="grid grid-cols-[1fr_auto] gap-2">
                  <div>
                    <h3 className="text-sm font-black text-black">
                      {exp.jobTitle}
                    </h3>
                    <p className="text-xs font-bold text-red-600">
                      {exp.company}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-700 mt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-black text-white px-2 py-0.5 whitespace-nowrap">
                      {exp.startDate} – {exp.endDate || "Now"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {grouped.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-black">
                Skills
              </h2>
              <div className="flex-1 h-0.5 bg-red-600" />
            </div>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map(skill => (
                <span
                  key={skill.id}
                  className="text-xs font-bold border-2 border-black px-2 py-0.5 hover:bg-black hover:text-white transition-colors"
                >
                  {skill.skillName}
                </span>
              ))}
            </div>
          </div>
        )}

        {cvData.educations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-black">
                Education
              </h2>
              <div className="flex-1 h-0.5 bg-red-600" />
            </div>
            <div className="space-y-2">
              {cvData.educations.map(edu => (
                <div
                  key={edu.id}
                  className="flex justify-between items-baseline"
                >
                  <div>
                    <h3 className="text-xs font-black text-black">
                      {edu.degree} in {edu.field}
                    </h3>
                    <p className="text-xs text-gray-600">{edu.school}</p>
                  </div>
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5">
                    {edu.graduationDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.projects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-black">
                Projects
              </h2>
              <div className="flex-1 h-0.5 bg-red-600" />
            </div>
            <div className="space-y-3">
              {cvData.projects.map(proj => (
                <div key={proj.id} className="border-l-4 border-red-600 pl-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-black">
                      {proj.projectName}
                    </h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-600 font-bold"
                      >
                        ↗
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
                      className="bg-red-50 border border-red-200 text-red-800"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.certifications.length > 0 && (
          <div className="pb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-black">
                Certifications
              </h2>
              <div className="flex-1 h-0.5 bg-red-600" />
            </div>
            {cvData.certifications.map(cert => (
              <div
                key={cert.id}
                className="flex justify-between items-baseline text-xs"
              >
                <span className="font-bold text-black">
                  {cert.certificationName}
                </span>
                <span className="text-gray-500">{cert.issuer}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
