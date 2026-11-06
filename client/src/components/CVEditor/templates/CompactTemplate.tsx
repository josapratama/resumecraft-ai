import { formatEducationTitle } from "@/lib/cvFormatters";
/**
 * Compact — maximum info density, small text, single page optimized.
 * When you need everything on one page.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills } from "./_shared";

export default function CompactTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen px-6 py-5"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: "11px",
      }}
    >
      {/* Inline header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-3">
        <div>
          <h1 className="text-lg font-bold text-black leading-tight">
            {cvData.personalInfo?.fullName || "Your Name"}
          </h1>
        </div>
        <div className="text-right text-gray-600">
          {cvData.personalInfo?.email && <p>{cvData.personalInfo.email}</p>}
          {cvData.personalInfo?.phone && <p>{cvData.personalInfo.phone}</p>}
          {cvData.personalInfo?.location && (
            <p>{cvData.personalInfo.location}</p>
          )}
        </div>
      </div>

      {/* Summary inline */}
      {cvData.personalInfo?.professionalSummary && (
        <p className="text-gray-700 leading-snug mb-3">
          {cvData.personalInfo.professionalSummary}
        </p>
      )}

      {/* Skills — one line per category */}
      {grouped.length > 0 && (
        <div className="mb-3">
          <CompactTitle>Skills</CompactTitle>
          {grouped.map(cat => (
            <p key={cat.category} className="leading-snug">
              <span className="font-bold">{cat.category}:</span>{" "}
              <span className="text-gray-700">
                {cat.skills.map(s => s.skillName).join(", ")}
              </span>
            </p>
          ))}
        </div>
      )}

      {/* Experience */}
      {cvData.workExperiences.length > 0 && (
        <div className="mb-3">
          <CompactTitle>Experience</CompactTitle>
          <div className="space-y-1.5">
            {cvData.workExperiences.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between">
                  <span className="font-bold">
                    {exp.jobTitle}, {exp.company}
                    {exp.location ? `, ${exp.location}` : ""}
                  </span>
                  <span className="text-gray-500 whitespace-nowrap ml-2">
                    {exp.startDate}–{exp.endDate || "Present"}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-gray-700 leading-snug">
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
        <div className="mb-3">
          <CompactTitle>Education</CompactTitle>
          <div className="space-y-1">
            {cvData.educations.map(edu => (
              <div key={edu.id} className="flex justify-between">
                <span className="font-bold">
                  {formatEducationTitle(edu.degree, edu.field)}, {edu.school}
                </span>
                <span className="text-gray-500">{edu.graduationDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects — compact */}
      {cvData.projects.length > 0 && (
        <div className="mb-3">
          <CompactTitle>Projects</CompactTitle>
          <div className="space-y-1">
            {cvData.projects.map(proj => (
              <div key={proj.id}>
                <span className="font-bold">{proj.projectName}</span>
                {proj.technologies && (
                  <span className="text-gray-500 ml-1">
                    ({proj.technologies})
                  </span>
                )}
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 ml-1"
                  >
                    ↗
                  </a>
                )}
                {proj.description && (
                  <span className="text-gray-700"> — {proj.description}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {cvData.certifications.length > 0 && (
        <div>
          <CompactTitle>Certifications</CompactTitle>
          <div className="flex flex-wrap gap-x-4">
            {cvData.certifications.map(cert => (
              <span key={cert.id} className="text-gray-700">
                <span className="font-bold">{cert.certificationName}</span> (
                {cert.issuer}
                {cert.issueDate ? `, ${cert.issueDate}` : ""})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {cvData.languages && cvData.languages.length > 0 && (
        <div className="mt-3">
          <CompactTitle>Languages</CompactTitle>
          <div className="flex flex-wrap gap-x-4">
            {cvData.languages.map(l => (
              <span key={l.id} className="text-gray-700">
                <span className="font-bold">{l.language}</span> ({l.proficiency})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        <div className="mt-3">
          <CompactTitle>Additional Information</CompactTitle>
          <div className="space-y-1">
            {cvData.customSections.map(cs => (
              <div key={cs.id} className="text-gray-700">
                <span className="font-bold">{cs.title}</span>
                {cs.subtitle && <span> · {cs.subtitle}</span>}
                {cs.date && <span className="text-gray-500"> ({cs.date})</span>}
                {cs.description && <p className="text-gray-600 mt-0.5">{cs.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompactTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold uppercase tracking-wider text-black border-b border-gray-300 mb-1">
      {children}
    </h2>
  );
}
