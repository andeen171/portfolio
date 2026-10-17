/**
 * Date and text helpers shared by the project and experience timelines.
 *
 * Sanity stores these as plain `YYYY-MM-DD` dates. Going through `new Date()`
 * would read them as UTC midnight and then shift them into the viewer's zone —
 * in Brazil, `2024-10-01` becomes September 30th. So dates are handled as a
 * bare year and month, and only formatted in UTC.
 */

export type YearMonth = { year: number; month: number };

export function parseYearMonth(value?: string | null): YearMonth | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})/.exec(value);
  if (match) return { year: Number(match[1]), month: Number(match[2]) };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function currentYearMonth(now = new Date()): YearMonth {
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

/** "Oct 2024" / "out. 2024" — the pt-BR "de" is dropped to fit compact meta rows. */
export function formatMonthYear(locale: string, { year, month }: YearMonth): string {
  const parts = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(Date.UTC(year, month - 1, 1));
  const monthPart = parts.find((part) => part.type === 'month')?.value ?? '';
  const yearPart = parts.find((part) => part.type === 'year')?.value ?? String(year);
  return `${monthPart} ${yearPart}`.trim();
}

/** `YYYY-MM`, for `<time dateTime>`. */
export function isoYearMonth({ year, month }: YearMonth): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Whole months covered by a role, counting both ends — the way LinkedIn and
 * most CVs count, so Oct 2024 → Oct 2026 reads "2 yrs 1 mo".
 */
export function monthsBetween(start: YearMonth, end: YearMonth): number {
  return Math.max(1, (end.year - start.year) * 12 + (end.month - start.month) + 1);
}

/**
 * Splits Sanity long text into paragraphs. Some entries were typed with real
 * newlines and others with a literal backslash-n, so both count.
 */
export function toParagraphs(text?: string | null): string[] {
  if (!text) return [];
  return text
    .replace(/\\r/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph
        .split('\n')
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n')
    )
    .filter(Boolean);
}
