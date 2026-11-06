import type { FullCVData, Skill } from "@/types/cv";
import { useI18n } from "@/lib/i18n";
import { formatProficiency } from "@/lib/cvFormatters";

// ─── Skill grouping ────────────────────────────────────────────────────────────

export function groupSkills(skills: Skill[]) {
  return skills.reduce(
    (acc, skill) => {
      const cat = acc.find(c => c.category === skill.category);
      if (cat) cat.skills.push(skill);
      else acc.push({ category: skill.category, skills: [skill] });
      return acc;
    },
    [] as Array<{ category: string; skills: Skill[] }>
  );
}

export const PROF_WIDTH: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

// ─── Proficiency dot badges ────────────────────────────────────────────────────

export function ProfDots({ level }: { level: string | null }) {
  const filled = level ? Math.round(PROF_WIDTH[level] / 25) : 3;
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full ${i <= filled ? "bg-current" : "opacity-20 bg-current"}`}
        />
      ))}
    </span>
  );
}

// ─── Skill bar ─────────────────────────────────────────────────────────────────

export function SkillBar({
  pct,
  color = "bg-red-500",
  bg = "bg-gray-200",
}: {
  pct: number;
  color?: string;
  bg?: string;
}) {
  return (
    <div className={`h-1 rounded-full overflow-hidden ${bg}`}>
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Technology chips ─────────────────────────────────────────────────────────

export function TechChips({
  technologies,
  className = "bg-gray-100 border border-gray-200 text-gray-700",
}: {
  technologies: string;
  className?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {technologies.split(",").map(t => (
        <span
          key={t.trim()}
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}
        >
          {t.trim()}
        </span>
      ))}
    </div>
  );
}

// ─── Section heading helper ────────────────────────────────────────────────────

export function SectionTitle({
  children,
  className = "text-xs font-bold uppercase tracking-widest text-gray-400",
  barColor = "bg-red-600",
}: {
  children: React.ReactNode;
  className?: string;
  barColor?: string;
}) {
  return (
    <div className="mb-3">
      <h2 className={className}>{children}</h2>
      <div className={`w-8 h-0.5 mt-1 ${barColor}`} />
    </div>
  );
}

export function LanguagesDisplay({
  languages,
  textColor = "text-gray-800",
  subColor = "text-gray-500",
}: {
  languages?: FullCVData["languages"];
  textColor?: string;
  subColor?: string;
}) {
  const { t } = useI18n();
  if (!languages || languages.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
      {languages.map(l => (
        <span key={l.id} className="inline-flex items-center gap-1.5">
          <strong className={textColor}>{l.language}</strong>
          <span className={subColor}>({formatProficiency(l.proficiency, t)})</span>
        </span>
      ))}
    </div>
  );
}

export function CustomSectionsDisplay({
  customSections,
  headingColor = "text-gray-800",
  subColor = "text-gray-500",
  descColor = "text-gray-700",
}: {
  customSections?: FullCVData["customSections"];
  headingColor?: string;
  subColor?: string;
  descColor?: string;
}) {
  if (!customSections || customSections.length === 0) return null;
  return (
    <div className="space-y-3">
      {customSections.map(cs => (
        <div key={cs.id} className="text-xs">
          <div className="flex justify-between items-baseline">
            <span className={`font-semibold ${headingColor}`}>
              {cs.title} {cs.subtitle && <span className="font-normal opacity-75">· {cs.subtitle}</span>}
            </span>
            {cs.date && <span className={`text-[11px] ${subColor}`}>{cs.date}</span>}
          </div>
          {cs.description && (
            <p className={`mt-0.5 leading-relaxed whitespace-pre-line ${descColor}`}>
              {cs.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export type { FullCVData };
