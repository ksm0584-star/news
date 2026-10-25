import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchAllNewsItems } from "@/lib/news-rss";
import { selectHotNews, type HotNewsKeyword } from "@/lib/hot-news-matching";
import { kstDateString } from "@/lib/kst-date";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Vercel Cron target (see vercel.json) — runs once daily at 23:00 UTC
 * (08:00 KST, no DST in Korea so this offset never shifts). Reads
 * admin-curated keywords via the service-role client (hot_news_keywords
 * has no app-level RLS access at all — see
 * supabase/migrations/0008_hot_news.sql), matches them against the exact
 * same RSS pool GET /api/news already fetches (fetchAllNewsItems,
 * src/lib/news-rss.ts), and freezes the result into hot_news_daily under
 * today's KST date.
 *
 * A failure anywhere in here (bad RSS fetch, Supabase error, zero
 * keywords, zero matches) never touches the live RSS feed or any other
 * home-screen feature — this route only ever writes to hot_news_daily.
 * It just means GET /api/hot-news finds no row for today, and the HOT
 * 뉴스 section hides itself (see HotNewsSection.tsx) while the rest of the
 * home screen (최신 뉴스 목록, 섹터 필터) renders exactly as before.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const effectiveDate = kstDateString();
  const supabase = createSupabaseAdminClient();

  try {
    const { data: keywordRows, error: keywordsError } = await supabase
      .from("hot_news_keywords")
      .select("keyword, priority")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true });
    if (keywordsError) throw keywordsError;

    const keywords: HotNewsKeyword[] = keywordRows ?? [];

    if (keywords.length === 0) {
      // Nothing registered — clear any stale row set under today's date
      // (e.g. a previous run's leftovers) instead of letting an old pick
      // linger under a "today" label it no longer matches.
      await supabase.from("hot_news_daily").delete().eq("effective_date", effectiveDate);
      return NextResponse.json({ effectiveDate, picked: 0, reason: "no_keywords" });
    }

    const { articles } = await fetchAllNewsItems();
    const picks = selectHotNews(keywords, articles);

    await supabase.from("hot_news_daily").delete().eq("effective_date", effectiveDate);

    if (picks.length > 0) {
      const rows = picks.map(({ keyword, article }, index) => ({
        effective_date: effectiveDate,
        rank_order: index,
        keyword,
        title: article.title,
        url: article.url,
        press: article.press,
        sector: article.sector,
        published_at: article.publishedAt,
        image_url: article.imageUrl ?? null,
      }));
      const { error: insertError } = await supabase.from("hot_news_daily").insert(rows);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ effectiveDate, picked: picks.length });
  } catch (error) {
    console.error("hot-news cron failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "cron_failed" }, { status: 500 });
  }
}
