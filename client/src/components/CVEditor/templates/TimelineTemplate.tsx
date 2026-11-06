import { formatEducationTitle } from "@/lib/cvFormatters";
/**
 * Timeline — vertical timeline with alternating left/right entries.
 * Visually tells a career story.
 */
import type { FullCVData } from "@/types/cv";
import { groupSkills, TechChips, LanguagesDisplay, CustomSectionsDisplay } from "./_shared";

export default function TimelineTemplate({ cvData }: { cvData: FullCVData }) {
  const grouped = groupSkills(cvData.skills);

  // Merge experience + education into a unified chronological list
  type TimelineItem = {
    type: "exp" | "edu" | "cert" | "proj";
    id: number;
    title: string;
    subtitle: string;
    date: string;
    description?: string | null;
    technologies?: string | null;
    link?: string | null;
  };

  const items: TimelineItem[] = [
    ...cvData.workExperiences.map(e => ({
      type: "exp" as const,
      id: e.id,
      title: e.jobTitle,
      subtitle: e.company,
      date: `${e.startDate} – ${e.endDate || "Present"}`,
      description: e.description,
    })),
    ...cvData.educations.map(e => ({
      type: "edu" as const,
      id: e.id,
      title: `${formatEducationTitle(e.degree, e.field)}`,
      subtitle: e.school,
      date: e.graduationDate || "",
      description: e.description,
    })),
  ];

  const typeColors: Record<string, string> = {
    exp: "bg-red-600",
    edu: "bg-black",
    cert: "bg-amber-500",
    proj: "bg-blue-600",
  };

  return (
    <div
      className="bg-white min-h-screen px-8 py-8"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 min-w-0">
        <h1 className="text-2xl font-bold text-black break-words">
          {cvData.personalInfo?.fullName || "Your Name"}
        </h1>
        <div className="flex justify-center flex-wrap gap-4 text-xs text-gray-500 mt-1">
          {cvData.personalInfo?.email && (
            <span className="break-all">{cvData.personalInfo.email}</span>
          )}
          {cvData.personalInfo?.phone && (
            <span className="break-words">{cvData.personalInfo.phone}</span>
          )}
          {cvData.personalInfo?.location && (
            <span className="break-words">{cvData.personalInfo.location}</span>
          )}
        </div>
        {cvData.personalInfo?.professionalSummary && (
          <p className="text-xs text-gray-600 max-w-lg mx-auto mt-3 leading-relaxed break-words">
            {cvData.personalInfo.professionalSummary}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

        <div className="space-y-6">
          {items.map((item, idx) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`flex ${idx % 2 === 0 ? "flex-row" : "flex-row-reverse"} gap-0 items-start`}
            >
              {/* Card */}
              <div
                className={`w-[calc(50%-20px)] min-w-0 ${idx % 2 === 0 ? "pr-4 text-right" : "pl-4 text-left"}`}
              >
                <div className="border border-gray-200 p-3 bg-white shadow-sm min-w-0">
                  <span className="text-xs text-gray-400">{item.date}</span>
                  <h3 className="text-xs font-bold text-black mt-0.5 break-words">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 break-words">
                    {item.subtitle}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed break-words">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Dot */}
              <div className="w-10 flex justify-center flex-shrink-0">
                <div
                  className={`w-4 h-4 rounded-full border-2 border-white shadow ${typeColors[item.type]} flex-shrink-0 mt-3`}
                />
              </div>

              {/* Spacer */}
              <div className="w-[calc(50%-20px)]" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: skills + certs + projects */}
      <div className="mt-10 grid grid-cols-2 gap-6 min-w-0">
        {grouped.length > 0 && (
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
              Skills
            </h2>
            {grouped.map(cat => (
              <div key={cat.category} className="mb-2 min-w-0">
                <p className="text-xs font-semibold text-black break-words">
                  {cat.category}
                </p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {cat.skills.map(s => (
                    <span
                      key={s.id}
                      className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 break-all"
                    >
                      {s.skillName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-4 min-w-0">
          {cvData.projects.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Projects
              </h2>
              {cvData.projects.map(proj => (
                <div key={proj.id} className="mb-1.5 min-w-0">
                  <div className="flex items-baseline gap-1 flex-wrap min-w-0">
                    <span className="text-xs font-bold text-black break-words min-w-0">
                      {proj.projectName}
                    </span>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-500 shrink-0"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                  {proj.technologies && (
                    <TechChips
                      technologies={proj.technologies}
                      className="bg-gray-50 border border-gray-200 text-gray-600"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {cvData.certifications.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Certifications
              </h2>
              {cvData.certifications.map(cert => (
                <p key={cert.id} className="text-xs text-gray-700 break-words">
                  <span className="font-semibold">
                    {cert.certificationName}
                  </span>{" "}
                  · {cert.issuer}
                </p>
              ))}
            </div>
          )}
          {cvData.languages && cvData.languages.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Languages
              </h2>
              <LanguagesDisplay languages={cvData.languages} />
            </div>
          )}
          {cvData.customSections && cvData.customSections.length > 0 && (
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
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
