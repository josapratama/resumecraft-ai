/**
 * Elegant — centered name, thin dividers, rose-gold accents, serif + sans mix.
 * Luxury, fashion, finance.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips, LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

export default function ElegantTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);
  return (
    <div
      className="bg-[#fdfcfb] min-h-screen px-12 py-10"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Centered header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="flex-1 h-px bg-[#c9a87c]" />
          <div className="w-2 h-2 bg-[#c9a87c] rotate-45" />
          <div className="flex-1 h-px bg-[#c9a87c]" />
        </div>
        <h1 className="text-3xl font-normal tracking-[0.15em] uppercase text-gray-900">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="flex-1 h-px bg-[#c9a87c]" />
          <div className="w-2 h-2 bg-[#c9a87c] rotate-45" />
          <div className="flex-1 h-px bg-[#c9a87c]" />
        </div>
        <div
          className="flex justify-center flex-wrap gap-x-4 text-xs text-gray-500 mt-3"
          style={{ fontFamily: "sans-serif" }}
        >
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

      {/* Summary */}
      {cvData.personalInfo?.professionalSummary && (
        <div className="text-center mb-8">
          <p className="text-xs text-gray-600 leading-loose max-w-lg mx-auto italic">
            "{cvData.personalInfo.professionalSummary}"
          </p>
        </div>
      )}

      {/* Experience */}
      {cvData.workExperiences.length > 0 && (
        <ElegantSection title="Experience">
          <div className="space-y-5">
            {cvData.workExperiences.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-normal italic text-gray-900">
                    {exp.jobTitle}
                  </h3>
                  <span
                    className="text-xs text-[#c9a87c]"
                    style={{ fontFamily: "sans-serif" }}
                  >
                    {exp.startDate} – {exp.endDate || "Present"}
                  </span>
                </div>
                <p
                  className="text-xs font-bold tracking-wider text-gray-700 mt-0.5"
                  style={{ fontFamily: "sans-serif" }}
                >
                  {exp.company}
                </p>
                {exp.description && (
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ElegantSection>
      )}

      {/* Education */}
      {cvData.educations.length > 0 && (
        <ElegantSection title="Education">
          <div className="space-y-3">
            {cvData.educations.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-sm italic text-gray-900">
                    {edu.degree} in {edu.field}
                  </h3>
                  <p
                    className="text-xs text-gray-600"
                    style={{ fontFamily: "sans-serif" }}
                  >
                    {edu.school}
                  </p>
                </div>
                <span
                  className="text-xs text-[#c9a87c]"
                  style={{ fontFamily: "sans-serif" }}
                >
                  {edu.graduationDate}
                </span>
              </div>
            ))}
          </div>
        </ElegantSection>
      )}

      {/* Skills */}
      {grouped.length > 0 && (
        <ElegantSection title="Expertise">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {grouped.map(cat => (
              <div key={cat.category} style={{ fontFamily: "sans-serif" }}>
                <span className="text-xs font-bold text-gray-700">
                  {cat.category}:{" "}
                </span>
                <span className="text-xs text-gray-600">
                  {cat.skills.map(s => s.skillName).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </ElegantSection>
      )}

      {/* Projects */}
      {cvData.projects.length > 0 && (
        <ElegantSection title="Selected Work">
          <div className="space-y-4">
            {cvData.projects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm italic text-gray-900">
                    {proj.projectName}
                  </h3>
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#c9a87c] hover:underline"
                      style={{ fontFamily: "sans-serif" }}
                    >
                      View
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
                    className="bg-[#fdf5ea] border border-[#e5c99c] text-[#8a6a3a]"
                  />
                )}
              </div>
            ))}
          </div>
        </ElegantSection>
      )}

      {/* Certifications */}
      {cvData.certifications.length > 0 && (
        <ElegantSection title="Credentials">
          {cvData.certifications.map(cert => (
            <div
              key={cert.id}
              className="flex items-baseline gap-2 text-xs"
              style={{ fontFamily: "sans-serif" }}
            >
              <span className="italic text-gray-800">
                {cert.certificationName}
              </span>
              <span className="text-[#c9a87c]">·</span>
              <span className="text-gray-500">{cert.issuer}</span>
            </div>
          ))}
        </ElegantSection>
      )}

      {/* Languages */}
      {cvData.languages && cvData.languages.length > 0 && (
        <ElegantSection title="Languages">
          <LanguagesDisplay languages={cvData.languages} textColor="text-gray-800" subColor="text-[#c9a87c]" />
        </ElegantSection>
      )}

      {/* Additional / Custom Sections */}
      {cvData.customSections && cvData.customSections.length > 0 && (
        <ElegantSection title="Additional Information" last>
          <CustomSectionsDisplay customSections={cvData.customSections} />
        </ElegantSection>
      )}
    </div>
  );
}

function ElegantSection({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "mb-0" : "mb-7"}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-4 h-px bg-[#c9a87c]" />
        <h2
          className="text-xs tracking-[0.2em] uppercase text-[#c9a87c]"
          style={{ fontFamily: "sans-serif" }}
        >
          {title}
        </h2>
        <div className="flex-1 h-px bg-[#e8ddd0]" />
      </div>
      {children}
    </div>
  );
}
