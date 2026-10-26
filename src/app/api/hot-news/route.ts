import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { kstDateString } from "@/lib/kst-date";
import { fetchLatestHotNews } from "@/lib/hot-news-lookup";
import type { LatestNewsItem } from "@/lib/news-rss";

/**
 * Always runs per-request: a force-static + revalidate cache here froze a
 * pre-cron empty response in production until the next deploy, since the
 * CDN snapshot never revalidated on its own. The underlying query is a
 * single indexed row lookup, so per-request cost is negligible.
 */
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = { "Cache-Control": "no-store, must-revalidate" };

interface HotNewsResponse {
  effectiveDate: string;
  articles: LatestNewsItem[];
}

/**
 * Public read of the most recently generated HOT 뉴스 picks — a plain
 * anon-key client, not the service-role one, since hot_news_daily's RLS
 * already allows public select (supabase/migrations/0008_hot_news.sql)
 * and this route has no reason for elevated access.
 *
 * Falls back to the latest prior KST date within
 * HOT_NEWS_MAX_STALE_DAYS (src/lib/hot-news-lookup.ts) whenever today has
 * no rows yet — between midnight and whenever today's 08:00 KST cron
 * finishes writing, this keeps showing yesterday's picks instead of going
 * blank (the bug reported 2026-10-27), and swaps over the moment today's
 * row set actually lands, whatever time that happens to be. A day the
 * cron ran but matched zero keywords looks identical, at the DB level, to
 * "hasn't run yet" — both correctly keep showing the last populated day's
 * picks, since there is nothing new to replace them with either way.
 * `effectiveDate` in the response always names whichever date's rows are
 * actually being returned, not necessarily today's.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const today = kstDateString();
  if (!url || !anonKey) {
    return NextResponse.json<HotNewsResponse>(
      { effectiveDate: today, articles: [] },
      { headers: NO_STORE_HEADERS },
    );
  }

  const supabase = createClient(url, anonKey);
  const result = await fetchLatestHotNews(supabase, today);

  if (!result) {
    return NextResponse.json<HotNewsResponse>(
      { effectiveDate: today, articles: [] },
      { headers: NO_STORE_HEADERS },
    );
  }

  const articles: LatestNewsItem[] = result.rows.map((row) => ({
    title: row.title,
    url: row.url,
    press: row.press,
    sector: row.sector as LatestNewsItem["sector"],
    publishedAt: row.published_at,
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
  }));

  return NextResponse.json<HotNewsResponse>(
    { effectiveDate: result.effectiveDate, articles },
    { headers: NO_STORE_HEADERS },
  );
}
