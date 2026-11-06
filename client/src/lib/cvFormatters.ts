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
 * Format YYYY-MM dates cleanly
 * Example:
 * formatCVDate("2026-07") => "Jul 2026"
 */
export function formatCVDate(val?: string | null): string {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length >= 2) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      const date = new Date(year, month - 1);
      // Returns e.g. "Jul 2026"
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
  }
  return val;
}

