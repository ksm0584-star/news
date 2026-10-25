import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { kstDateString } from "@/lib/kst-date";
import type { LatestNewsItem } from "@/lib/news-rss";

/**
 * This data only ever changes once a day, at the 08:00 KST cron run (see
 * src/app/api/cron/hot-news/route.ts) — a 1h cache window is a reasonable
 * freshness/cost tradeoff (any visitor sees the new day's picks within at
 * most an hour of the cron completing) without hitting Supabase on every
 * single home-screen load, same ISR-style approach /api/news already uses.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

interface HotNewsRow {
  rank_order: number;
  title: string;
  url: string;
  press: string;
  sector: string;
  published_at: string;
  image_url: string | null;
}

interface HotNewsResponse {
  effectiveDate: string;
  articles: LatestNewsItem[];
}

/**
 * Public read of today's (KST) frozen HOT 뉴스 picks — a plain anon-key
 * client, not the service-role one, since hot_news_daily's RLS already
 * allows public select (supabase/migrations/0008_hot_news.sql) and this
 * route has no reason for elevated access. Never falls back to a previous
 * day's rows: a cron failure or a day with zero keyword matches means
 * simply no rows for today, and HotNewsSection.tsx hides the section
 * entirely rather than showing stale picks as if they were today's.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const effectiveDate = kstDateString();
  if (!url || !anonKey) {
    return NextResponse.json<HotNewsResponse>({ effectiveDate, articles: [] });
  }

  const supabase = createClient(url, anonKey);
  const { data, error } = await supabase
    .from("hot_news_daily")
    .select("rank_order, title, url, press, sector, published_at, image_url")
    .eq("effective_date", effectiveDate)
    .order("rank_order", { ascending: true })
    .returns<HotNewsRow[]>();

  if (error || !data) {
    return NextResponse.json<HotNewsResponse>({ effectiveDate, articles: [] });
  }

  const articles: LatestNewsItem[] = data.map((row) => ({
    title: row.title,
    url: row.url,
    press: row.press,
    sector: row.sector as LatestNewsItem["sector"],
    publishedAt: row.published_at,
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
  }));

  return NextResponse.json<HotNewsResponse>({ effectiveDate, articles });
}
