import { formatEducationTitle } from "@/lib/cvFormatters";
/**
 * Academic — dense, publication-ready, serif, Chicago style citations.
 * Professors, researchers, PhD candidates.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills } from "./_shared";

export default function AcademicTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-white min-h-screen px-10 py-8"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-black">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex justify-center flex-wrap gap-x-3 text-xs text-gray-600 mt-1">
          {cvData.personalInfo?.email && (
            <span>{cvData.personalInfo.email}</span>
          )}
          {cvData.personalInfo?.phone && (
            <span>| {cvData.personalInfo.phone}</span>
          )}
          {cvData.personalInfo?.location && (
            <span>| {cvData.personalInfo.location}</span>
          )}
        </div>
        <div className="mt-3 border-b-2 border-black" />
      </div>

      {/* Summary */}
      {cvData.personalInfo?.professionalSummary && (
        <AcademicSection title="Research Interests">
          <p className="text-xs text-gray-800 leading-loose">
            {cvData.personalInfo.professionalSummary}
          </p>
        </AcademicSection>
      )}

      {/* Education first for academic */}
      {cvData.educations.length > 0 && (
        <AcademicSection title="Education">
          <div className="space-y-3">
            {cvData.educations.map(edu => (
              <div key={edu.id}>
                <div className="flex justify-between">
                  <span className="text-xs font-bold">
                    {formatEducationTitle(edu.degree, edu.field)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {edu.graduationDate}
                  </span>
                </div>
                <p className="text-xs text-gray-700">
                  {edu.school}
                  {edu.location ? `, ${edu.location}` : ""}
                </p>
                {edu.description && (
                  <p className="text-xs text-gray-600 mt-0.5 italic">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AcademicSection>
      )}

      {/* Work = Appointments */}
      {cvData.workExperiences.length > 0 && (
        <AcademicSection title="Academic & Professional Appointments">
          <div className="space-y-4">
            {cvData.workExperiences.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between">
                  <span className="text-xs font-bold">{exp.jobTitle}</span>
                  <span className="text-xs text-gray-500">
                    {exp.startDate}–{exp.endDate || "Present"}
                  </span>
                </div>
                <p className="text-xs italic text-gray-700">
                  {exp.company}
                  {exp.location ? `, ${exp.location}` : ""}
                </p>
                {exp.description && (
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AcademicSection>
      )}

      {/* Projects = Publications / Research */}
      {cvData.projects.length > 0 && (
        <AcademicSection title="Research & Publications">
          <div className="space-y-3">
            {cvData.projects.map((proj, i) => (
              <div key={proj.id} className="pl-4 relative">
                <span className="absolute left-0 top-0 text-xs text-gray-400">
                  [{i + 1}]
                </span>
                <span className="text-xs font-bold">{proj.projectName}</span>
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 ml-2"
                  >
                    DOI ↗
                  </a>
                )}
                {proj.description && (
                  <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                    {proj.description}
                  </p>
                )}
                {proj.technologies && (
                  <p className="text-xs text-gray-500 mt-0.5 italic">
                    Keywords: {proj.technologies}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AcademicSection>
      )}

      {/* Skills = Areas of Expertise */}
      {grouped.length > 0 && (
        <AcademicSection title="Areas of Expertise">
          <div className="space-y-1">
            {grouped.map(cat => (
              <p key={cat.category} className="text-xs">
                <span className="font-bold">{cat.category}: </span>
                <span className="text-gray-700">
                  {cat.skills.map(s => s.skillName).join(", ")}
                </span>
              </p>
            ))}
          </div>
        </AcademicSection>
      )}

      {/* Certifications = Awards / Honors */}
      {cvData.certifications.length > 0 && (
        <AcademicSection title="Awards, Honors & Certifications">
          <div className="space-y-1.5">
            {cvData.certifications.map(cert => (
              <div key={cert.id} className="flex justify-between text-xs">
                <div>
                  <span className="font-bold">{cert.certificationName}</span>
                  <span className="text-gray-600 ml-2">— {cert.issuer}</span>
                </div>
                <span className="text-gray-500">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </AcademicSection>
      )}

      {/* Languages */}
      {cvData.languages && cvData.languages.length > 0 && (
        <AcademicSection title="Languages">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
            {cvData.languages.map(l => (
              <span key={l.id}>
                <span className="font-bold text-black">{l.language}</span>{" "}
                <span className="text-gray-600">({l.proficiency})</span>
              </span>
            ))}
          </div>
        </AcademicSection>
      )}

      {/* Additional / Custom Sections */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        <AcademicSection title="Additional Information" last>
          <div className="space-y-3">
            {cvData.customSections.map(cs => (
              <div key={cs.id}>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-black">
                    {cs.title} {cs.subtitle && <span className="font-normal text-gray-700">· {cs.subtitle}</span>}
                  </span>
                  {cs.date && <span className="text-gray-500">{cs.date}</span>}
                </div>
                {cs.description && (
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed whitespace-pre-line">
                    {cs.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AcademicSection>
      )}
    </div>
  );
}

function AcademicSection({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "mb-0" : "mb-5"}>
      <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}
