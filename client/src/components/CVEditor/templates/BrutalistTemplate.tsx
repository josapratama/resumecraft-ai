/**
 * Brutalist — raw CSS grid, thick black borders, no rounded corners.
 * Architects, avant-garde designers.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, CustomSectionsDisplay } from "./_shared";

export default function BrutalistTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen border-4 border-black"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Name block — full width black */}
      <div className="bg-black text-white px-6 py-5 min-w-0">
        <h1 className="text-4xl font-black uppercase tracking-tight leading-none break-words">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
      </div>

      {/* Contact row */}
      <div className="flex border-b-4 border-black divide-x-4 divide-black text-xs flex-wrap">
        {[
          cvData.personalInfo?.email,
          cvData.personalInfo?.phone,
          cvData.personalInfo?.location,
        ]
          .filter(Boolean)
          .map((v, i) => (
            <div key={i} className="px-3 py-2 flex-1 min-w-0 break-all">
              {v}
            </div>
          ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 divide-x-4 divide-black min-h-[80vh]">
        {/* Left column */}
        <div className="col-span-1 divide-y-4 divide-black min-w-0 overflow-hidden">
          {grouped.length > 0 && (
            <div className="p-4 min-w-0">
              <h2 className="text-xs font-black uppercase bg-black text-white px-2 py-0.5 inline-block mb-3">
                Skills
              </h2>
              {grouped.map(cat => (
                <div key={cat.category} className="mb-2 min-w-0">
                  <p className="text-xs font-black uppercase text-gray-500 break-words">
                    {cat.category}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cat.skills.map(s => (
                      <span
                        key={s.id}
                        className="text-xs border-2 border-black px-1 py-0.5 font-bold break-all"
                      >
                        {s.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {cvData.educations.length > 0 && (
            <div className="p-4 min-w-0">
              <h2 className="text-xs font-black uppercase bg-black text-white px-2 py-0.5 inline-block mb-3">
                Education
              </h2>
              {cvData.educations.map(edu => (
                <div
                  key={edu.id}
                  className="border-2 border-black p-2 mb-2 min-w-0"
                >
                  <p className="text-xs font-black break-words">{edu.degree}</p>
                  <p className="text-xs break-words">{edu.field}</p>
                  <p className="text-xs text-gray-600 break-words">
                    {edu.school}
                  </p>
                  <p className="text-xs text-gray-400">{edu.graduationDate}</p>
                </div>
              ))}
            </div>
          )}
          {cvData.certifications.length > 0 && (
            <div className="p-4 min-w-0">
              <h2 className="text-xs font-black uppercase bg-black text-white px-2 py-0.5 inline-block mb-3">
                Credentials
              </h2>
              {cvData.certifications.map(cert => (
                <p
                  key={cert.id}
                  className="text-xs font-bold border-b border-black pb-1 mb-1 break-words"
                >
                  {cert.certificationName} / {cert.issuer}
                </p>
              ))}
            </div>
          )}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="p-4 min-w-0">
              <h2 className="text-xs font-black uppercase bg-black text-white px-2 py-0.5 inline-block mb-3">
                Languages
              </h2>
              <div className="space-y-1.5 min-w-0 text-xs">
                {cvData.languages.map(l => (
                  <div key={l.id} className="flex justify-between border-b-2 border-black pb-0.5">
                    <span className="font-black">{l.language}</span>
                    <span className="text-gray-600 font-mono text-[11px]">{l.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 2 columns */}
        <div className="col-span-2 divide-y-4 divide-black min-w-0 overflow-hidden">
          {cvData.personalInfo?.professionalSummary && (
            <div className="p-4 bg-gray-50 min-w-0">
              <p className="text-xs leading-relaxed break-words">
                {cvData.personalInfo.professionalSummary}
              </p>
            </div>
          )}
          {cvData.workExperiences.length > 0 && (
            <div className="p-4 min-w-0">
              <h2 className="text-xs font-black uppercase bg-black text-white px-2 py-0.5 inline-block mb-3">
                Experience
              </h2>
              <div className="space-y-3 min-w-0">
                {cvData.workExperiences.map(exp => (
                  <div
                    key={exp.id}
                    className="border-2 border-black p-3 min-w-0"
                  >
                    <div className="flex justify-between items-start gap-2 flex-wrap min-w-0">
                      <div className="min-w-0">
                        <h3 className="text-sm font-black uppercase break-words">
                          {exp.jobTitle}
                        </h3>
                        <p className="text-xs font-bold text-gray-600 break-words">
                          {exp.company}
                        </p>
                      </div>
                      <span className="text-xs bg-black text-white px-2 py-0.5 whitespace-nowrap shrink-0">
                        {exp.startDate}–{exp.endDate || "Now"}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-gray-700 mt-2 break-words">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.projects.length > 0 && (
            <div className="p-4 min-w-0">
              <h2 className="text-xs font-black uppercase bg-black text-white px-2 py-0.5 inline-block mb-3">
                Projects
              </h2>
              <div className="grid grid-cols-2 gap-2 min-w-0">
                {cvData.projects.map(proj => (
                  <div
                    key={proj.id}
                    className="border-2 border-black p-2 min-w-0"
                  >
                    <div className="flex justify-between items-start gap-1 flex-wrap min-w-0">
                      <h3 className="text-xs font-black uppercase break-words min-w-0">
                        {proj.projectName}
                      </h3>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold shrink-0"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-gray-700 mt-1 break-words">
                        {proj.description}
                      </p>
                    )}
                    {proj.technologies && (
                      <p className="text-xs text-gray-500 mt-1 font-mono break-words">
                        {proj.technologies}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.customSections && cvData.customSections.length > 0 && (
            <div className="p-4 min-w-0">
              <h2 className="text-xs font-black uppercase bg-black text-white px-2 py-0.5 inline-block mb-3">
                Additional Information
              </h2>
              <CustomSectionsDisplay customSections={cvData.customSections} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
