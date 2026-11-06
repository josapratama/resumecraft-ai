import type { FullCVData } from "@/types/cv";
import { formatEducationTitle, formatCVDate } from "@/lib/cvFormatters";
import { Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";

interface ModernTemplateProps {
  cvData: FullCVData;
}

const PROFICIENCY_WIDTH: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

export default function ModernTemplate({ cvData }: ModernTemplateProps) {
  const accent = cvData.cv?.accentColor || "#ef4444";
  const fontFamily = cvData.cv?.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const groupedSkills = cvData.skills.reduce(
    (acc, skill) => {
      const cat = acc.find(c => c.category === skill.category);
      if (cat) cat.skills.push(skill);
      else acc.push({ category: skill.category, skills: [skill] });
      return acc;
    },
    [] as Array<{ category: string; skills: typeof cvData.skills }>
  );

  return (
    <div
      className="bg-white min-h-[1050px] flex font-sans text-neutral-900 shadow-sm"
      style={{ fontFamily }}
    >
      {/* LEFT SIDEBAR (Dark, Modern, High Contrast) */}
      <div className="w-[36%] bg-slate-900 text-white flex-shrink-0 p-7 flex flex-col gap-6 min-w-0 overflow-hidden">
        {/* Profile Photo & Name */}
        <div className="min-w-0">
          {cvData.personalInfo?.photoUrl && (
            <div className="mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-800">
                <img
                  src={cvData.personalInfo.photoUrl}
                  alt={cvData.personalInfo.fullName || "Photo"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div
            className="w-10 h-1 mb-3 rounded-full"
            style={{ backgroundColor: accent }}
          />

          <h1 className="text-xl sm:text-2xl font-bold leading-tight break-words tracking-tight">
            {cvData.personalInfo?.fullName || "Your Name"}
          </h1>

          {cvData.cv?.targetRole && (
            <p
              className="text-xs font-semibold uppercase tracking-wider mt-1 break-words"
              style={{ color: accent }}
            >
              {cvData.cv.targetRole}
            </p>
          )}

          {cvData.personalInfo?.location && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 break-words">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{cvData.personalInfo.location}</span>
            </p>
          )}
        </div>

        {/* Contact Info */}
        {(cvData.personalInfo?.email || cvData.personalInfo?.phone) && (
          <div className="min-w-0">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-2.5 pb-1 border-b border-slate-800"
              style={{ color: accent }}
            >
              Contact
            </h2>
            <div className="space-y-2 text-xs text-slate-300 min-w-0">
              {cvData.personalInfo?.email && (
                <div className="flex items-start gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="break-all text-slate-200 leading-snug">
                    {cvData.personalInfo.email}
                  </span>
                </div>
              )}
              {cvData.personalInfo?.phone && (
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="break-words text-slate-200">
                    {cvData.personalInfo.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {cvData.skills.length > 0 && (
          <div className="min-w-0">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-2.5 pb-1 border-b border-slate-800"
              style={{ color: accent }}
            >
              Skills
            </h2>
            <div className="space-y-3.5 min-w-0">
              {groupedSkills.map(cat => (
                <div key={cat.category} className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-300 mb-1.5 break-words uppercase tracking-wider">
                    {cat.category}
                  </p>
                  <div className="space-y-1.5 min-w-0">
                    {cat.skills.map(skill => (
                      <div key={skill.id} className="min-w-0">
                        <div className="flex justify-between items-center mb-0.5 gap-2 min-w-0">
                          <span className="text-xs text-slate-200 break-words min-w-0">
                            {skill.skillName}
                          </span>
                          {skill.proficiency && (
                            <span className="text-[10px] text-slate-400 capitalize whitespace-nowrap">
                              {skill.proficiency}
                            </span>
                          )}
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${PROFICIENCY_WIDTH[skill.proficiency ?? ""] ?? 60}%`,
                              backgroundColor: accent,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {cvData.languages && cvData.languages.length > 0 && (
          <div className="min-w-0">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-2.5 pb-1 border-b border-slate-800"
              style={{ color: accent }}
            >
              Languages
            </h2>
            <div className="space-y-2 min-w-0">
              {cvData.languages.map(l => (
                <div key={l.id} className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-200 font-medium">{l.language}</span>
                  <span className="text-slate-400 text-[11px] font-light">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {cvData.certifications.length > 0 && (
          <div className="min-w-0">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-2.5 pb-1 border-b border-slate-800"
              style={{ color: accent }}
            >
              Certifications
            </h2>
            <div className="space-y-2 min-w-0">
              {cvData.certifications.map(cert => (
                <div key={cert.id} className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 break-words leading-tight">
                    {cert.certificationName}
                  </p>
                  <p className="text-[11px] text-slate-400 break-words mt-0.5">
                    {cert.issuer}
                    {cert.issueDate && ` · ${formatCVDate(cert.issueDate)}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT MAIN CONTENT (Light, Clean, Elegant Typography) */}
      <div className="flex-1 p-7 sm:p-8 flex flex-col gap-6 min-w-0 overflow-hidden bg-white">
        {/* Profile Summary */}
        {cvData.personalInfo?.professionalSummary && (
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                About Me
              </h2>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: `${accent}40` }}
              />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed break-words whitespace-pre-line text-justify">
              {cvData.personalInfo.professionalSummary}
            </p>
          </div>
        )}

        {/* Education Section */}
        {cvData.educations.length > 0 && (
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Education
              </h2>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: `${accent}40` }}
              />
            </div>

            <div className="space-y-4 min-w-0">
              {cvData.educations.map(edu => {
                const title = formatEducationTitle(edu.degree, edu.field);
                return (
                  <div
                    key={edu.id}
                    className="relative pl-3.5 border-l-2 border-slate-200 min-w-0"
                  >
                    <div
                      className="absolute -left-[5px] top-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    <div className="flex items-baseline justify-between mb-0.5 gap-2 flex-wrap min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 break-words min-w-0 leading-tight">
                        {title}
                      </h3>
                      {edu.graduationDate && (
                        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                          {formatCVDate(edu.graduationDate)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-600 break-words">
                      {edu.school}
                      {edu.location ? ` · ${edu.location}` : ""}
                    </p>
                    {edu.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words whitespace-pre-line">
                        {edu.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {cvData.workExperiences.length > 0 && (
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Work Experience
              </h2>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: `${accent}40` }}
              />
            </div>

            <div className="space-y-4 min-w-0">
              {cvData.workExperiences.map(exp => (
                <div
                  key={exp.id}
                  className="relative pl-3.5 border-l-2 border-slate-200 min-w-0"
                >
                  <div
                    className="absolute -left-[5px] top-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <div className="flex items-baseline justify-between mb-0.5 gap-2 flex-wrap min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 break-words min-w-0 leading-tight">
                      {exp.jobTitle}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                      {formatCVDate(exp.startDate)} – {formatCVDate(exp.endDate) || "Present"}
                    </span>
                  </div>
                  <p
                    className="text-xs font-semibold mb-1 break-words"
                    style={{ color: accent }}
                  >
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {cvData.projects.length > 0 && (
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Projects
              </h2>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: `${accent}40` }}
              />
            </div>

            <div className="space-y-3.5 min-w-0">
              {cvData.projects.map(proj => (
                <div key={proj.id} className="min-w-0">
                  <div className="flex items-baseline justify-between mb-0.5 gap-2 flex-wrap min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 break-words min-w-0">
                      {proj.projectName}
                    </h3>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold hover:underline flex items-center gap-1 whitespace-nowrap"
                        style={{ color: accent }}
                      >
                        <span>Demo</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mb-1.5 break-words">
                      {proj.description}
                    </p>
                  )}
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {proj.technologies.split(",").map(tech => (
                        <span
                          key={tech.trim()}
                          className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Sections / Achievements / Organizations */}
        {cvData.customSections && cvData.customSections.length > 0 && (
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Achievements & Activities
              </h2>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: `${accent}40` }}
              />
            </div>

            <div className="space-y-3.5 min-w-0">
              {cvData.customSections.map(item => (
                <div key={item.id} className="relative pl-3.5 border-l-2 border-slate-200 min-w-0">
                  <div
                    className="absolute -left-[5px] top-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accent }}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-0.5">
                    <p className="text-xs font-bold text-slate-900 break-words leading-tight">
                      {item.title} {item.subtitle && <span className="font-normal text-slate-600">· {item.subtitle}</span>}
                    </p>
                    {item.date && (
                      <span className="text-[11px] text-slate-500">{formatCVDate(item.date)}</span>
                    )}
                  </div>
                  <span
                    className="text-[10px] uppercase font-semibold tracking-wider block mt-0.5"
                    style={{ color: accent }}
                  >
                    {item.category}
                  </span>
                  {item.description && (
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 break-words whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
