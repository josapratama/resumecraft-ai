/**
 * Atlas — deep forest green sidebar, khaki main, earthy explorer aesthetic.
 * Consultants, NGO workers, geographers.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips, CustomSectionsDisplay } from "./_shared";

export default function AtlasTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-[#f9f6f0] min-h-screen flex"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Forest sidebar */}
      <div className="w-[36%] bg-[#1a3a2a] text-white px-6 py-8 flex flex-col gap-6 min-w-0 overflow-hidden">
        {/* Name */}
        <div className="min-w-0">
          <div className="w-10 h-0.5 bg-[#8fb894] mb-3" />
          <h1 className="text-xl font-bold leading-tight break-words">
            {cvData.personalInfo?.fullName || "Your Name"}
          </h1>
          <div className="space-y-0.5 text-xs text-[#8fb894] mt-2 min-w-0">
            {cvData.personalInfo?.location && (
              <p className="break-words">{cvData.personalInfo.location}</p>
            )}
            {cvData.personalInfo?.email && (
              <p className="break-all">{cvData.personalInfo.email}</p>
            )}
            {cvData.personalInfo?.phone && (
              <p className="break-words">{cvData.personalInfo.phone}</p>
            )}
          </div>
        </div>

        {/* Skills */}
        {grouped.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8fb894] mb-3">
              Skills
            </h2>
            {grouped.map(cat => (
              <div key={cat.category} className="mb-2 min-w-0">
                <p className="text-xs font-semibold text-green-200 mb-1 break-words">
                  {cat.category}
                </p>
                <div className="flex flex-wrap gap-1 min-w-0">
                  {cat.skills.map(s => (
                    <span
                      key={s.id}
                      className="text-xs border border-[#2d5a3d] text-[#8fb894] px-1.5 py-0.5 rounded break-all"
                    >
                      {s.skillName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {cvData.educations.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8fb894] mb-3">
              Education
            </h2>
            {cvData.educations.map(edu => (
              <div key={edu.id} className="mb-2 min-w-0">
                <p className="text-xs font-semibold text-white break-words">
                  {edu.degree} in {edu.field}
                </p>
                <p className="text-xs text-[#8fb894] break-words">
                  {edu.school}
                </p>
                <p className="text-xs text-green-800">{edu.graduationDate}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {cvData.certifications.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8fb894] mb-3">
              Certifications
            </h2>
            {cvData.certifications.map(cert => (
              <div key={cert.id} className="mb-1.5 min-w-0">
                <p className="text-xs text-white break-words">
                  {cert.certificationName}
                </p>
                <p className="text-xs text-green-700 break-words">
                  {cert.issuer}
                </p>
              </div>
            ))}
          </div>
        )}

        {cvData.languages && cvData.languages.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8fb894] mb-3">
              Languages
            </h2>
            <div className="space-y-1.5 text-xs min-w-0">
              {cvData.languages.map(l => (
                <div key={l.id} className="flex justify-between">
                  <span className="font-semibold text-white break-words">{l.language}</span>
                  <span className="text-[#8fb894] text-[11px]">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 px-8 py-8 space-y-7 min-w-0 overflow-hidden">
        {cvData.personalInfo?.professionalSummary && (
          <div className="border-l-4 border-[#1a3a2a] pl-4 min-w-0">
            <p className="text-sm text-gray-700 leading-relaxed break-words">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {cvData.workExperiences.length > 0 && (
          <div className="min-w-0">
            <AtlasH>Experience</AtlasH>
            <div className="space-y-5 min-w-0">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id} className="min-w-0">
                  <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 break-words min-w-0">
                      {exp.jobTitle}
                    </h3>
                    <span className="text-xs text-[#1a3a2a] font-medium whitespace-nowrap shrink-0">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#2d6a3d] mt-0.5 break-words">
                    {exp.company}
                    {exp.location ? `, ${exp.location}` : ""}
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
            <AtlasH>Projects</AtlasH>
            <div className="space-y-3 min-w-0">
              {cvData.projects.map(proj => (
                <div
                  key={proj.id}
                  className="border border-[#c5d4c0] bg-white p-3 min-w-0"
                >
                  <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                    <h3 className="text-xs font-bold text-gray-900 break-words min-w-0">
                      {proj.projectName}
                    </h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#2d6a3d] hover:underline shrink-0"
                      >
                        ↗
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
                      className="bg-green-50 border border-green-200 text-green-800"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.customSections && cvData.customSections.length > 0 && (
          <div className="min-w-0">
            <AtlasH>Additional Information</AtlasH>
            <CustomSectionsDisplay customSections={cvData.customSections} />
          </div>
        )}
      </div>
    </div>
  );
}

function AtlasH({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a3a2a]">
        {children}
      </h2>
      <div className="flex-1 h-px bg-[#c5d4c0]" />
    </div>
  );
}
