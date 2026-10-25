/**
 * Formats `date` as a YYYY-MM-DD calendar-date string in KST (UTC+9), not
 * the runtime's own timezone. Vercel serverless functions run in UTC, so a
 * naive `date.toISOString().slice(0, 10)` would mislabel a cron run that
 * fires at 23:00 UTC (= 08:00 KST the *next* calendar day) with yesterday's
 * date — this shifts the clock by +9h first so the date rolls over at the
 * right moment. Korea has no DST, so this fixed +9h offset is always
 * correct (no seasonal adjustment needed, unlike most other timezones).
 *
 * Used by the HOT 뉴스 cron (src/app/api/cron/hot-news/route.ts, to stamp
 * hot_news_daily.effective_date) and GET /api/hot-news (to know which
 * date's rows "today" means).
 */
export function kstDateString(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}
