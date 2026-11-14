export function urlFixer(url: string | undefined) {
  if (!url) return "";
  return `https://${url.replace(/^https?:\/\//, "")}`;
}

export function parseMonthYear(str?: string): Date {
  if (!str) return new Date();
  if (/present|current|now/i.test(str)) return new Date();
  const months: Record<string, number> = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    sept: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  const match = str.match(/([a-zA-Z]+)\.?\s*(\d{4})/);
  if (!match) return new Date();
  const m = months[match[1].toLowerCase()] ?? 0;
  const y = parseInt(match[2], 10);
  return new Date(y, m, 1);
}

export function calculateYearsOfExperience(
  experience?: Array<{ from: string; to: string }>,
): number {
  if (!experience || experience.length === 0) return 7;

  const startDates = experience
    .map((e) => parseMonthYear(e.from))
    .filter((d) => !isNaN(d.getTime()));

  if (startDates.length === 0) return 7;

  const earliest = new Date(Math.min(...startDates.map((d) => d.getTime())));
  const now = new Date();

  const yearsDiff = now.getFullYear() - earliest.getFullYear();
  const monthsDiff = now.getMonth() - earliest.getMonth();

  let totalYears = yearsDiff;
  if (monthsDiff < 0) {
    totalYears -= 1;
  }
  return Math.max(1, totalYears);
}
