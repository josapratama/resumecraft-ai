import type { FullCVData, Skill } from "@/types/cv";

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

export type { FullCVData };
