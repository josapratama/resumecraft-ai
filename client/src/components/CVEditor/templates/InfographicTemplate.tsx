import { formatEducationTitle } from "@/lib/cvFormatters";
/**
 * Infographic — visual stats, circular proficiency indicators, icon-driven.
 * Social media-ready, visual storytelling.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, PROF_WIDTH, TechChips, LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

function CircleProgress({
  pct,
  label,
  color = "#e11d48",
}: {
  pct: number;
  label: string;
  color?: string;
}) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fontSize="9"
          fontWeight="bold"
          fill="#111"
        >
          {pct}%
        </text>
      </svg>
      <span className="text-xs text-gray-600 text-center mt-0.5 leading-tight">
        {label}
      </span>
    </div>
  );
}

export default function InfographicTemplate({
  cvData,
}: {
  cvData: FullCVData;
}) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-rose-600 to-orange-500 px-8 py-7 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
            {(cvData.personalInfo?.fullName || "?")[0]}
          </div>
          <div>
            <h1 className="text-2xl font-black">
              {cvData.personalInfo?.fullName || "Your Name"}
            </h1>
            <div className="flex flex-wrap gap-x-3 text-xs text-red-100 mt-0.5">
              {cvData.personalInfo?.location && (
                <span>📍 {cvData.personalInfo.location}</span>
              )}
              {cvData.personalInfo?.email && (
                <span>✉ {cvData.personalInfo.email}</span>
              )}
              {cvData.personalInfo?.phone && (
                <span>📞 {cvData.personalInfo.phone}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Summary */}
        {cvData.personalInfo?.professionalSummary && (
          <div className="bg-rose-50 border-l-4 border-rose-500 px-4 py-3">
            <p className="text-xs text-gray-700 leading-relaxed">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {/* Skill circles */}
        {grouped.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-3">
              Skills Proficiency
            </h2>
            <div className="flex flex-wrap gap-3">
              {cvData.skills.slice(0, 8).map(skill => (
                <CircleProgress
                  key={skill.id}
                  pct={PROF_WIDTH[skill.proficiency ?? ""] ?? 60}
                  label={skill.skillName}
                />
              ))}
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { n: cvData.workExperiences.length, label: "Roles" },
            { n: cvData.projects.length, label: "Projects" },
            { n: cvData.certifications.length, label: "Certs" },
          ].map(s => (
            <div
              key={s.label}
              className="bg-gray-50 border border-gray-200 p-3 text-center"
            >
              <p className="text-2xl font-black text-rose-600">{s.n}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Experience */}
        {cvData.workExperiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-3">
              Experience
            </h2>
            <div className="space-y-4">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-rose-500 rounded-full mt-0.5 flex-shrink-0" />
                    <div className="w-0.5 flex-1 bg-rose-200 mt-1" />
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-black">
                        {exp.jobTitle}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {exp.startDate} – {exp.endDate || "Now"}
                      </span>
                    </div>
                    <p className="text-xs text-rose-600 font-semibold">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {cvData.projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-3">
              Projects
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {cvData.projects.map(proj => (
                <div
                  key={proj.id}
                  className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 p-3"
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
                        className="text-xs text-rose-500"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-gray-600 mt-0.5">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies && (
                    <TechChips
                      technologies={proj.technologies}
                      className="bg-white border border-rose-200 text-rose-700"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {cvData.educations.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">
              Education
            </h2>
            {cvData.educations.map(edu => (
              <div
                key={edu.id}
                className="flex justify-between items-baseline text-xs"
              >
                <div>
                  <span className="font-bold text-black">
                    {formatEducationTitle(edu.degree, edu.field)}
                  </span>
                  <span className="text-gray-500 ml-1">· {edu.school}</span>
                </div>
                <span className="text-gray-400">{edu.graduationDate}</span>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {cvData.languages && cvData.languages.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">
              Languages
            </h2>
            <LanguagesDisplay languages={cvData.languages} textColor="text-black font-bold" subColor="text-rose-600" />
          </div>
        )}

        {/* Custom Sections */}
        {cvData.customSections && cvData.customSections.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">
              Additional Information
            </h2>
            <CustomSectionsDisplay customSections={cvData.customSections} />
          </div>
        )}
      </div>
    </div>
  );
}
