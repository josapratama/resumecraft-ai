/**
 * Sidebar Light — light lavender sidebar, white main, clean and airy.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, PROF_WIDTH, TechChips } from "./_shared";

export default function SidebarLightTemplate({
  cvData,
}: {
  cvData: FullCVData;
}) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen flex"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Light sidebar */}
      <div className="w-[36%] bg-[#f0edf8] px-6 py-8 flex flex-col gap-6 min-w-0 overflow-hidden">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 leading-tight break-words">
            {cvData.personalInfo?.fullName || "Your Name"}
          </h1>
          <div className="w-8 h-0.5 bg-[#7c5cbf] mt-2 mb-2" />
          <div className="space-y-0.5 text-xs text-gray-600 min-w-0">
            {cvData.personalInfo?.location && (
              <p className="break-words">📍 {cvData.personalInfo.location}</p>
            )}
            {cvData.personalInfo?.email && (
              <p className="break-all">✉ {cvData.personalInfo.email}</p>
            )}
            {cvData.personalInfo?.phone && (
              <p className="break-words">☎ {cvData.personalInfo.phone}</p>
            )}
          </div>
        </div>

        {grouped.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#7c5cbf] mb-3">
              Skills
            </h2>
            <div className="space-y-3 min-w-0">
              {grouped.map(cat => (
                <div key={cat.category} className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 mb-1.5 break-words">
                    {cat.category}
                  </p>
                  {cat.skills.map(s => (
                    <div key={s.id} className="mb-1 min-w-0">
                      <span className="text-xs text-gray-600 break-words">
                        {s.skillName}
                      </span>
                      <div className="h-1 bg-purple-100 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="h-full bg-[#7c5cbf] rounded-full"
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

        {cvData.certifications.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#7c5cbf] mb-3">
              Certifications
            </h2>
            {cvData.certifications.map(cert => (
              <div
                key={cert.id}
                className="mb-2 bg-white/60 p-2 rounded min-w-0"
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

        {cvData.educations.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#7c5cbf] mb-3">
              Education
            </h2>
            {cvData.educations.map(edu => (
              <div key={edu.id} className="mb-2 min-w-0">
                <p className="text-xs font-semibold text-gray-800 break-words">
                  {edu.degree} in {edu.field}
                </p>
                <p className="text-xs text-[#7c5cbf] break-words">
                  {edu.school}
                </p>
                <p className="text-xs text-gray-400">{edu.graduationDate}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 px-8 py-8 space-y-6 min-w-0 overflow-hidden">
        {cvData.personalInfo?.professionalSummary && (
          <div className="bg-purple-50 border-l-4 border-[#7c5cbf] p-4 rounded-r min-w-0">
            <p className="text-xs text-gray-700 leading-relaxed break-words">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {cvData.workExperiences.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#7c5cbf] mb-4 flex items-center gap-2">
              Experience <span className="flex-1 h-px bg-purple-100" />
            </h2>
            <div className="space-y-4 min-w-0">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id} className="min-w-0">
                  <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 break-words min-w-0">
                      {exp.jobTitle}
                    </h3>
                    <span className="text-xs text-gray-400 shrink-0">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#7c5cbf] break-words">
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#7c5cbf] mb-4 flex items-center gap-2">
              Projects <span className="flex-1 h-px bg-purple-100" />
            </h2>
            <div className="space-y-3 min-w-0">
              {cvData.projects.map(proj => (
                <div
                  key={proj.id}
                  className="border border-purple-100 p-3 rounded min-w-0"
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
                        className="text-xs text-[#7c5cbf] hover:underline shrink-0"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-gray-600 mt-0.5 break-words">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies && (
                    <TechChips
                      technologies={proj.technologies}
                      className="bg-purple-50 border border-purple-200 text-purple-700"
                    />
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
