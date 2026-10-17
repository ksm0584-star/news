/**
 * KST (UTC+9, no DST) month-boundary math for the 내 기록 month picker —
 * no date library needed since the offset is fixed year-round. `month` is
 * always 1-12 here, never the 0-indexed JS convention.
 */

export interface MonthRange {
  /** Inclusive UTC instant (ISO 8601) of the KST month's first moment. */
  startIso: string;
  /** Exclusive UTC instant (ISO 8601) — the KST next month's first moment. */
  endIsoExclusive: string;
}

export interface YearMonth {
  year: number;
  month: number;
}

/**
 * `Date.UTC(year, month - 1, 1, -9)` is "midnight KST on the 1st" expressed
 * as a UTC instant — passing an out-of-range hour (-9) to Date.UTC rolls
 * the date back a day instead of throwing, which is exactly "9 hours
 * before UTC midnight." Querying `records.created_at` (timestamptz) with
 * these two instants is correct regardless of the DB server's own
 * timezone setting, since timestamptz comparisons are always instant-based.
 */
export function getKstMonthRange(year: number, month: number): MonthRange {
  const startIso = new Date(Date.UTC(year, month - 1, 1, -9, 0, 0)).toISOString();
  const endIsoExclusive = new Date(Date.UTC(year, month, 1, -9, 0, 0)).toISOString();
  return { startIso, endIsoExclusive };
}

/** The current wall-clock year/month in KST — the picker's default and its "future month" ceiling. */
export function getCurrentKstYearMonth(): YearMonth {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return { year: kstNow.getUTCFullYear(), month: kstNow.getUTCMonth() + 1 };
}

export function shiftMonth(year: number, month: number, deltaMonths: number): YearMonth {
  const totalMonthIndex = year * 12 + (month - 1) + deltaMonths;
  const normalizedMonth = ((totalMonthIndex % 12) + 12) % 12;
  return { year: Math.floor(totalMonthIndex / 12), month: normalizedMonth + 1 };
}

/** True when (year, month) is strictly after the current KST month. */
export function isFutureYearMonth(year: number, month: number): boolean {
  const current = getCurrentKstYearMonth();
  return year !== current.year ? year > current.year : month > current.month;
}

export function formatKoreanYearMonth(year: number, month: number): string {
  return `${year}년 ${month}월`;
}
