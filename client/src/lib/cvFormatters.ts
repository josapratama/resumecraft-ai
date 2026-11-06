/**
 * Format Degree and Field cleanly without clumsy " in "
 * Example:
 * formatEducationTitle("S1", "Informatika") => "S1 Informatika"
 * formatEducationTitle("", "Informatika") => "Informatika"
 * formatEducationTitle("S1", "") => "S1"
 */
export function formatEducationTitle(degree?: string | null, field?: string | null): string {
  const d = degree?.trim() || "";
  const f = field?.trim() || "";
  if (d && f) return `${d} ${f}`;
  return d || f || "";
}

/**
 * Format URL for clean, professional display on both digital PDF and printed paper.
 * Strips https://, http://, www. and trailing slash.
 * Truncates gracefully if extremely long.
 * Examples:
 * formatDisplayUrl("https://josapratama.com") => "josapratama.com"
 * formatDisplayUrl("https://github.com/josapratama/portfolio") => "github.com/josapratama/portfolio"
 */
export function formatDisplayUrl(url?: string | null, maxLen = 35): string {
  if (!url) return "";
  let clean = url.trim().replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  if (clean.length > maxLen) {
    clean = clean.slice(0, maxLen - 1) + "…";
  }
  return clean;
}

/**
 * Format YYYY-MM dates cleanly with active locale
 * Example:
 * formatCVDate("2026-07", "id") => "Jul 2026"
 * formatCVDate("2026-08", "id") => "Agu 2026"
 * formatCVDate("2026-12", "id") => "Des 2026"
 */
export function formatCVDate(val?: string | null, locale = "id"): string {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length >= 2) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      const date = new Date(year, month - 1);
      const loc = locale === "id" ? "id-ID" : locale === "ja" ? "ja-JP" : "en-US";
      return date.toLocaleDateString(loc, { month: "short", year: "numeric" });
    }
  }
  return val;
}

/**
 * Format proficiency level dynamically using i18n
 * Supports both skill levels (beginner, intermediate, advanced, expert)
 * and language levels (elementary, conversational, fluent, professional, native, etc.)
 */
export function formatProficiency(
  proficiency?: string | null,
  t?: (key: string, fallback?: string) => string
): string {
  if (!proficiency) return "";
  const raw = proficiency.trim();
  const lower = raw.toLowerCase();

  let key = "";
  if (lower === "beginner") key = "proficiency.beginner";
  else if (lower === "intermediate") key = "proficiency.intermediate";
  else if (lower === "advanced") key = "proficiency.advanced";
  else if (lower === "expert") key = "proficiency.expert";
  else if (lower === "elementary" || lower.includes("elementary")) key = "proficiency.elementary";
  else if (lower === "conversational" || lower.includes("conversational")) key = "proficiency.conversational";
  else if (lower === "fluent" || lower.includes("fluent")) key = "proficiency.fluent";
  else if (lower.includes("native") || lower.includes("bilingual")) key = "proficiency.native";
  else if (lower.includes("full professional")) key = "proficiency.full_professional";
  else if (lower.includes("professional")) key = "proficiency.professional";
  else if (lower === "none" || lower.includes("not specified")) key = "proficiency.none";

  if (key && t) {
    return t(key, raw);
  }
  return raw;
}

/**
 * Format skill category dynamically using i18n
 */
export function formatCategory(
  category?: string | null,
  t?: (key: string, fallback?: string) => string
): string {
  if (!category) return "";
  const raw = category.trim();
  const lower = raw.toLowerCase();

  let key = "";
  if (lower.includes("technical")) key = "categories.technical";
  else if (lower.includes("soft")) key = "categories.soft";
  else if (lower.includes("programming")) key = "categories.programming";
  else if (lower.includes("framework")) key = "categories.frameworks";
  else if (lower.includes("tool") || lower.includes("platform")) key = "categories.tools";
  else if (lower.includes("cloud") || lower.includes("devops")) key = "categories.cloud";
  else if (lower.includes("leadership") || lower.includes("management")) key = "categories.leadership";

  if (key && t) {
    return t(key, raw);
  }
  return raw;
}

