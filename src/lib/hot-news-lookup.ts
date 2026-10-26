import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * How many KST calendar days old the most recently populated
 * effective_date is allowed to be before it stops being shown at all.
 * Covers one full missed cron run (e.g. a single-day outage) while still
 * bounding how stale "today's" HOT 뉴스 can ever look. Picked
 * conservatively small since the cron runs daily — raise it only if a
 * longer outage grace period is explicitly wanted.
 */
export const HOT_NEWS_MAX_STALE_DAYS = 2;

export interface HotNewsLookupRow {
  effective_date: string;
  rank_order: number;
  title: string;
  url: string;
  press: string;
  sector: string;
  published_at: string;
  image_url: string | null;
}

export interface HotNewsLookupResult {
  effectiveDate: string;
  rows: HotNewsLookupRow[];
}

/** `dateStr` (YYYY-MM-DD) minus `days` calendar days, as the same format. */
function subtractDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * Finds the most recently *populated* effective_date at or before
 * `asOfDate` (KST "today"), within HOT_NEWS_MAX_STALE_DAYS, and returns
 * all of that one date's rows — never a mix of two different dates. This
 * is what lets the HOT 뉴스 section keep showing yesterday's picks
 * between midnight and whenever today's 08:00 KST cron actually finishes
 * writing, instead of going blank the instant the calendar date rolls
 * over (the bug reported 2026-10-27). Shared by GET /api/hot-news (to
 * serve) and the cron's own post-write self-check (to know what the API
 * *should* be returning right now), so the two can never drift apart in
 * how they interpret "no row for today yet."
 *
 * A date's row set is written by one bulk INSERT — a single atomic
 * Postgres statement — so it is never visible here half-written; either
 * all of a day's rows are present or none are. Returns null when nothing
 * is available within the window at all (no row for today, and nothing
 * recent enough to fall back to).
 */
export async function fetchLatestHotNews(
  supabase: SupabaseClient,
  asOfDate: string,
): Promise<HotNewsLookupResult | null> {
  const cutoffDate = subtractDays(asOfDate, HOT_NEWS_MAX_STALE_DAYS);

  const { data, error } = await supabase
    .from("hot_news_daily")
    .select("effective_date, rank_order, title, url, press, sector, published_at, image_url")
    .lte("effective_date", asOfDate)
    .gte("effective_date", cutoffDate)
    .order("effective_date", { ascending: false })
    .order("rank_order", { ascending: true })
    .returns<HotNewsLookupRow[]>();

  if (error || !data || data.length === 0) return null;

  const effectiveDate = data[0].effective_date;
  const rows = data.filter((row) => row.effective_date === effectiveDate);
  return { effectiveDate, rows };
}
