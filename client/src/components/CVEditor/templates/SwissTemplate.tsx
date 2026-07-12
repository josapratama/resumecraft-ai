/**
 * Swiss — International Typographic Style, grid-based, red + black, Helvetica.
 * Pure Swiss design school.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips } from "./_shared";

export default function SwissTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen px-10 py-8"
      style={{ fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif" }}
    >
      {/* Grid header */}
      <div className="grid grid-cols-[auto_1fr] gap-6 mb-8 pb-4 border-b-4 border-black min-w-0">
        <div className="w-2 bg-red-600 self-stretch" />
        <div className="min-w-0">
          <h1 className="text-4xl font-black tracking-tighter leading-none uppercase break-words">
            {cvData.personalInfo?.fullName || "Your Name"}
          </h1>
          <div className="grid grid-cols-3 gap-2 mt-3 min-w-0">
            {cvData.personalInfo?.email && (
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Email
                </p>
                <p className="text-xs break-all">{cvData.personalInfo.email}</p>
              </div>
            )}
            {cvData.personalInfo?.phone && (
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Phone
                </p>
                <p className="text-xs break-words">
                  {cvData.personalInfo.phone}
                </p>
              </div>
            )}
            {cvData.personalInfo?.location && (
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Location
                </p>
                <p className="text-xs break-words">
                  {cvData.personalInfo.location}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {cvData.personalInfo?.professionalSummary && (
        <div className="grid grid-cols-[80px_1fr] gap-4 mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-0.5">
            Profile
          </p>
          <p className="text-xs text-gray-800 leading-relaxed">
            {cvData.personalInfo.professionalSummary}
          </p>
        </div>
      )}

      {/* Experience */}
      {cvData.workExperiences.length > 0 && (
        <div className="grid grid-cols-[80px_1fr] gap-4 mb-7 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-0.5">
            Work
          </p>
          <div className="space-y-5 min-w-0">
            {cvData.workExperiences.map(exp => (
              <div
                key={exp.id}
                className="grid grid-cols-[1fr_auto] gap-4 min-w-0"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-black uppercase break-words">
                    {exp.jobTitle}
                  </h3>
                  <p className="text-xs text-red-600 font-bold break-words">
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-gray-700 mt-1 leading-relaxed break-words">
                      {exp.description}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-400 whitespace-nowrap shrink-0">
                  <p>{exp.endDate || "Now"}</p>
                  <p>{exp.startDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {cvData.educations.length > 0 && (
        <div className="grid grid-cols-[80px_1fr] gap-4 mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-0.5">
            Edu
          </p>
          <div className="space-y-3">
            {cvData.educations.map(edu => (
              <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase">
                    {edu.degree} in {edu.field}
                  </h3>
                  <p className="text-xs text-gray-600">{edu.school}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {edu.graduationDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {grouped.length > 0 && (
        <div className="grid grid-cols-[80px_1fr] gap-4 mb-7">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-0.5">
            Skills
          </p>
          <div className="space-y-2">
            {grouped.map(cat => (
              <div key={cat.category} className="flex gap-3 items-baseline">
                <span className="text-xs font-bold uppercase w-24 flex-shrink-0 text-red-600">
                  {cat.category}
                </span>
                <span className="text-xs text-gray-700">
                  {cat.skills.map(s => s.skillName).join(" / ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {cvData.projects.length > 0 && (
        <div className="grid grid-cols-[80px_1fr] gap-4 mb-7 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-0.5">
            Work
          </p>
          <div className="space-y-3 min-w-0">
            {cvData.projects.map(proj => (
              <div
                key={proj.id}
                className="border-l-2 border-red-600 pl-3 min-w-0"
              >
                <div className="flex justify-between items-baseline gap-2 flex-wrap min-w-0">
                  <h3 className="text-xs font-black uppercase break-words min-w-0">
                    {proj.projectName}
                  </h3>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-red-600 shrink-0"
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
                    className="bg-gray-100 border border-gray-300 text-gray-700"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {cvData.certifications.length > 0 && (
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-0.5">
            Creds
          </p>
          <div className="space-y-1">
            {cvData.certifications.map(cert => (
              <div key={cert.id} className="flex items-baseline gap-3 text-xs">
                <span className="font-black uppercase">
                  {cert.certificationName}
                </span>
                <span className="text-red-600">—</span>
                <span className="text-gray-500">{cert.issuer}</span>
                {cert.issueDate && (
                  <span className="text-gray-400">{cert.issueDate}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
