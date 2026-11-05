/**
 * Newspaper — editorial columns, headline-style name, drop cap.
 * Journalists, writers, editors.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips, CustomSectionsDisplay } from "./_shared";

export default function NewspaperTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen px-8 py-6"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Masthead */}
      <div className="text-center border-b-4 border-black pb-3 mb-4">
        <p
          className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-1"
          style={{ fontFamily: "sans-serif" }}
        >
          Curriculum Vitæ
        </p>
        <h1 className="text-4xl font-black uppercase tracking-tight text-black leading-none break-words">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div
          className="border-t-2 border-black mt-2 pt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600"
          style={{ fontFamily: "sans-serif" }}
        >
          {cvData.personalInfo?.location && (
            <span className="break-words">{cvData.personalInfo.location}</span>
          )}
          {cvData.personalInfo?.email && (
            <span className="break-all">✦ {cvData.personalInfo.email}</span>
          )}
          {cvData.personalInfo?.phone && (
            <span>✦ {cvData.personalInfo.phone}</span>
          )}
        </div>
      </div>

      {/* Three-column layout — each col gets min-w-0 + overflow-hidden to contain long words */}
      <div className="grid grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-4 min-w-0 overflow-hidden">
          {cvData.personalInfo?.professionalSummary && (
            <div>
              <h2
                className="font-black uppercase text-xs tracking-widest border-b border-black mb-2"
                style={{ fontFamily: "sans-serif" }}
              >
                Profile
              </h2>
              <p className="text-xs leading-relaxed text-gray-800 break-words">
                {cvData.personalInfo.professionalSummary}
              </p>
            </div>
          )}
          {grouped.length > 0 && (
            <div>
              <h2
                className="font-black uppercase text-xs tracking-widest border-b border-black mb-2"
                style={{ fontFamily: "sans-serif" }}
              >
                Skills
              </h2>
              <div className="space-y-1">
                {grouped.map(cat => (
                  <div key={cat.category}>
                    <p
                      className="text-xs font-bold"
                      style={{ fontFamily: "sans-serif" }}
                    >
                      {cat.category}
                    </p>
                    <p className="text-xs text-gray-700 break-words">
                      {cat.skills.map(s => s.skillName).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.educations.length > 0 && (
            <div>
              <h2
                className="font-black uppercase text-xs tracking-widest border-b border-black mb-2"
                style={{ fontFamily: "sans-serif" }}
              >
                Education
              </h2>
              {cvData.educations.map(edu => (
                <div key={edu.id} className="mb-2">
                  <p className="text-xs font-bold break-words">{edu.degree}</p>
                  <p className="text-xs italic break-words">{edu.field}</p>
                  <p
                    className="text-xs text-gray-600"
                    style={{ fontFamily: "sans-serif" }}
                  >
                    {edu.school} · {edu.graduationDate}
                  </p>
                </div>
              ))}
            </div>
          )}
          {cvData.certifications.length > 0 && (
            <div>
              <h2
                className="font-black uppercase text-xs tracking-widest border-b border-black mb-2"
                style={{ fontFamily: "sans-serif" }}
              >
                Credentials
              </h2>
              {cvData.certifications.map(cert => (
                <p key={cert.id} className="text-xs mb-1">
                  <span className="font-bold break-words">
                    {cert.certificationName}
                  </span>
                  <br />
                  <span className="text-gray-600 italic">{cert.issuer}</span>
                </p>
              ))}
            </div>
          )}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="min-w-0">
              <h2
                className="font-black uppercase text-xs tracking-widest border-b border-black mb-2"
                style={{ fontFamily: "sans-serif" }}
              >
                Languages
              </h2>
              {cvData.languages.map(l => (
                <p key={l.id} className="text-xs mb-1">
                  <span className="font-bold break-words">{l.language}</span>{" "}
                  <span className="text-gray-600 italic">({l.proficiency})</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Column 2–3 */}
        <div className="col-span-2 border-l border-black pl-5 space-y-5 min-w-0 overflow-hidden">
          {cvData.workExperiences.length > 0 && (
            <div>
              <h2
                className="font-black uppercase text-xs tracking-widest border-b border-black mb-3"
                style={{ fontFamily: "sans-serif" }}
              >
                Career
              </h2>
              <div className="space-y-4">
                {cvData.workExperiences.map(exp => (
                  <div key={exp.id}>
                    {/* flex-wrap prevents title + date from overflowing */}
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                      <h3 className="text-sm font-bold italic min-w-0 break-words">
                        {exp.jobTitle}
                      </h3>
                      <span
                        className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0"
                        style={{ fontFamily: "sans-serif" }}
                      >
                        {exp.startDate} – {exp.endDate || "Present"}
                      </span>
                    </div>
                    <p
                      className="text-xs font-bold uppercase tracking-wider text-gray-700 break-words"
                      style={{ fontFamily: "sans-serif" }}
                    >
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-gray-700 mt-1 leading-relaxed break-words">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.projects.length > 0 && (
            <div>
              <h2
                className="font-black uppercase text-xs tracking-widest border-b border-black mb-3"
                style={{ fontFamily: "sans-serif" }}
              >
                Notable Work
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {cvData.projects.map(proj => (
                  <div
                    key={proj.id}
                    className="border border-gray-300 p-2 min-w-0 overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-xs font-bold break-words min-w-0">
                        {proj.projectName}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-700 italic flex-shrink-0"
                          style={{ fontFamily: "sans-serif" }}
                        >
                          ↗
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-gray-700 mt-0.5 leading-relaxed break-words">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && (
                      <TechChips
                        technologies={proj.technologies}
                        className="bg-gray-50 border border-gray-300 text-gray-700"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.customSections && cvData.customSections.length > 0 && (
            <div>
              <h2
                className="font-black uppercase text-xs tracking-widest border-b border-black mb-3"
                style={{ fontFamily: "sans-serif" }}
              >
                Dispatches & Notes
              </h2>
              <CustomSectionsDisplay customSections={cvData.customSections} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
