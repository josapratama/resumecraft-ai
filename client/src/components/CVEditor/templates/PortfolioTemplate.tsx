/**
 * Portfolio — projects are the hero, skills as large pills, experience compact.
 * Developers, designers, artists.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, PROF_WIDTH } from "./_shared";

export default function PortfolioTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-[#0f0f0f] text-gray-200 min-h-screen"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Name + contact */}
      <div className="px-8 py-8 border-b border-gray-800 min-w-0">
        <div className="flex justify-between items-start gap-4 flex-wrap min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-white break-words">
              {cvData.personalInfo?.fullName || "Your Name"}
            </h1>
            <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 mt-1">
              {cvData.personalInfo?.location && (
                <span className="break-words">
                  {cvData.personalInfo.location}
                </span>
              )}
              {cvData.personalInfo?.email && (
                <span className="break-all">{cvData.personalInfo.email}</span>
              )}
              {cvData.personalInfo?.phone && (
                <span className="break-words">{cvData.personalInfo.phone}</span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            {cvData.skills.slice(0, 3).map(s => (
              <div key={s.id} className="text-xs text-gray-500 break-words">
                {s.skillName}
              </div>
            ))}
          </div>
        </div>
        {cvData.personalInfo?.professionalSummary && (
          <p className="text-sm text-gray-400 mt-4 max-w-xl leading-relaxed break-words">
            {cvData.personalInfo.professionalSummary}
          </p>
        )}
      </div>

      {/* Projects hero */}
      {cvData.projects.length > 0 && (
        <div className="px-8 py-6 border-b border-gray-800 min-w-0">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">
            Featured Projects
          </h2>
          <div className="grid grid-cols-2 gap-3 min-w-0">
            {cvData.projects.map((proj, i) => (
              <div
                key={proj.id}
                className={`p-4 border border-gray-800 hover:border-gray-600 transition-colors min-w-0 ${i === 0 ? "col-span-2" : ""}`}
              >
                <div className="flex justify-between items-start mb-2 gap-2 flex-wrap min-w-0">
                  <h3
                    className={`font-bold text-white break-words min-w-0 ${i === 0 ? "text-base" : "text-sm"}`}
                  >
                    {proj.projectName}
                  </h3>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-white px-2 py-0.5 border border-gray-700 hover:border-gray-400 transition-colors shrink-0"
                    >
                      View ↗
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-xs text-gray-400 leading-relaxed mb-2 break-words">
                    {proj.description}
                  </p>
                )}
                {proj.technologies && (
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies.split(",").map(t => (
                      <span
                        key={t.trim()}
                        className="text-xs bg-gray-900 border border-gray-700 px-2 py-0.5 text-gray-300 break-all"
                      >
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills as large display */}
      {grouped.length > 0 && (
        <div className="px-8 py-6 border-b border-gray-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map(s => {
              const pct = PROF_WIDTH[s.proficiency ?? ""] ?? 60;
              const size =
                pct >= 75
                  ? "text-sm font-bold"
                  : pct >= 50
                    ? "text-xs font-semibold"
                    : "text-xs opacity-60";
              return (
                <span
                  key={s.id}
                  className={`border border-gray-700 px-3 py-1.5 text-gray-300 hover:border-gray-500 transition-colors ${size}`}
                >
                  {s.skillName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Experience + Education compact row */}
      <div className="grid grid-cols-2 divide-x divide-gray-800">
        {cvData.workExperiences.length > 0 && (
          <div className="px-8 py-6 min-w-0 overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">
              Experience
            </h2>
            <div className="space-y-3 min-w-0">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id} className="min-w-0">
                  <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                    <span className="text-xs font-bold text-white break-words min-w-0">
                      {exp.jobTitle}
                    </span>
                    <span className="text-xs text-gray-700 shrink-0">
                      {exp.endDate || "Now"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 break-words">
                    {exp.company}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="px-8 py-6 space-y-5 min-w-0 overflow-hidden">
          {cvData.educations.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">
                Education
              </h2>
              {cvData.educations.map(edu => (
                <div key={edu.id} className="min-w-0">
                  <p className="text-xs font-bold text-white break-words">
                    {edu.degree} in {edu.field}
                  </p>
                  <p className="text-xs text-gray-500 break-words">
                    {edu.school} · {edu.graduationDate}
                  </p>
                </div>
              ))}
            </div>
          )}
          {cvData.certifications.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">
                Certifications
              </h2>
              {cvData.certifications.map(cert => (
                <p key={cert.id} className="text-xs text-gray-400 break-words">
                  {cert.certificationName} · {cert.issuer}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
