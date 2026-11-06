import { formatEducationTitle } from "@/lib/cvFormatters";
/**
 * Retro — typewriter font, tan/cream background, vintage stamp aesthetic.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

export default function RetroTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-[#f5f0e8] min-h-screen px-10 py-8"
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      {/* Header with stamp border */}
      <div className="border-4 border-double border-gray-700 p-6 mb-6 text-center">
        <p className="text-xs tracking-[0.4em] uppercase text-gray-500 mb-2">
          — Curriculum Vitae —
        </p>
        <h1 className="text-3xl font-bold text-gray-900 tracking-wide uppercase">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="border-t-2 border-b-2 border-gray-400 my-2 py-1 flex justify-center gap-4 text-xs text-gray-600">
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

      <div className="space-y-5">
        {cvData.personalInfo?.professionalSummary && (
          <div className="border-l-4 border-gray-600 pl-4">
            <p className="text-xs text-gray-700 leading-loose">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {cvData.workExperiences.length > 0 && (
          <RetroSection title="Work History">
            <div className="space-y-4">
              {cvData.workExperiences.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline border-b border-dashed border-gray-400 pb-0.5 mb-1">
                    <span className="text-xs font-bold uppercase">
                      {exp.jobTitle} @ {exp.company}
                    </span>
                    <span className="text-xs text-gray-500">
                      {exp.startDate}–{exp.endDate || "Pres."}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </RetroSection>
        )}

        {cvData.educations.length > 0 && (
          <RetroSection title="Education">
            {cvData.educations.map(edu => (
              <div
                key={edu.id}
                className="flex justify-between items-baseline text-xs"
              >
                <span className="font-bold">
                  {formatEducationTitle(edu.degree, edu.field)} — {edu.school}
                </span>
                <span className="text-gray-500">{edu.graduationDate}</span>
              </div>
            ))}
          </RetroSection>
        )}

        {grouped.length > 0 && (
          <RetroSection title="Competencies">
            {grouped.map(cat => (
              <div key={cat.category} className="flex gap-2 text-xs">
                <span className="font-bold w-24 flex-shrink-0">
                  [{cat.category}]
                </span>
                <span className="text-gray-700">
                  {cat.skills.map(s => s.skillName).join(" / ")}
                </span>
              </div>
            ))}
          </RetroSection>
        )}

        {cvData.projects.length > 0 && (
          <RetroSection title="Portfolio">
            <div className="space-y-2">
              {cvData.projects.map(proj => (
                <div
                  key={proj.id}
                  className="border border-dashed border-gray-400 p-2"
                >
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold uppercase">
                      {proj.projectName}
                    </span>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-black"
                      >
                        [link]
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-gray-700 mt-0.5">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Tech: {proj.technologies}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </RetroSection>
        )}

        {cvData.certifications.length > 0 && (
          <RetroSection title="Credentials">
            {cvData.certifications.map(cert => (
              <p key={cert.id} className="text-xs">
                * <span className="font-bold">{cert.certificationName}</span> —{" "}
                {cert.issuer}
                {cert.issueDate ? ` (${cert.issueDate})` : ""}
              </p>
            ))}
          </RetroSection>
        )}

        {cvData.languages && cvData.languages.length > 0 && (
          <RetroSection title="Languages">
            <LanguagesDisplay languages={cvData.languages} textColor="text-gray-900" subColor="text-gray-600" />
          </RetroSection>
        )}

        {cvData.customSections && cvData.customSections.length > 0 && (
          <RetroSection title="Additional Information" last>
            <CustomSectionsDisplay customSections={cvData.customSections} />
          </RetroSection>
        )}
      </div>
    </div>
  );
}

function RetroSection({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "" : "mb-5"}>
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] bg-gray-700 text-[#f5f0e8] px-2 py-0.5 inline-block mb-2">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}
