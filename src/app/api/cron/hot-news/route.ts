import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchAllNewsItems } from "@/lib/news-rss";
import { selectHotNews, type HotNewsKeyword } from "@/lib/hot-news-matching";
import { kstDateString } from "@/lib/kst-date";
import { sendDiscordAlert, DiscordAlertColor } from "@/lib/discord-alert";
import { fetchLatestHotNews } from "@/lib/hot-news-lookup";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * The deployed origin to self-check GET /api/hot-news against after this
 * cron writes — VERCEL_PROJECT_PRODUCTION_URL is Vercel's own system env
 * var for the assigned Production domain, set automatically with no
 * dashboard config needed. Falls back to the known production domain
 * (same one hardcoded in src/app/layout.tsx's SITE_URL) for local runs.
 */
const PRODUCTION_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://news-sable-tau.vercel.app";

interface HotNewsApiResponse {
  effectiveDate?: string;
  articles?: { url: string }[];
}

/**
 * Computes what GET /api/hot-news *should* be returning right now via
 * the exact same fetchLatestHotNews lookup it uses to serve requests
 * (src/lib/hot-news-lookup.ts — today's rows if present, else the latest
 * prior day within HOT_NEWS_MAX_STALE_DAYS), then compares that against
 * what the live API actually returns, URL by URL and in rank order (not
 * just a count). Comparing against this shared expectation — rather than
 * hardcoding "today's rows" — means a day with zero new picks (which
 * correctly falls back to yesterday's) never reads as a false
 * API/DB mismatch; it still catches the real class of bug from
 * 2026-10-26, where the DB had today's picks but a stale API cache kept
 * serving an empty array. Never throws: every branch (DB error, non-200,
 * network failure, shape mismatch) ends in a Discord warning and a
 * return, so this can't turn a successful generation into a reported
 * failure. Only runs after generation has already completed.
 */
async function verifyApiMatchesDb(supabase: SupabaseClient, asOfDate: string): Promise<void> {
  try {
    const expected = await fetchLatestHotNews(supabase, asOfDate);
    const expectedDate = expected?.effectiveDate ?? asOfDate;
    const expectedUrls = expected?.rows.map((row) => row.url) ?? [];

    const res = await fetch(`${PRODUCTION_URL}/api/hot-news`, { cache: "no-store" });
    if (!res.ok) {
      await sendDiscordAlert({
        title: "⚠️ HOT 뉴스 점검 실패 (API 응답 오류)",
        description: `/api/hot-news 응답 코드 ${res.status}`,
        color: DiscordAlertColor.warning,
        fields: [{ name: "날짜", value: asOfDate }],
      });
      return;
    }

    const apiJson: HotNewsApiResponse = await res.json();
    const apiUrls = (apiJson.articles ?? []).map((a) => a.url);
    const mismatch =
      apiJson.effectiveDate !== expectedDate ||
      expectedUrls.length !== apiUrls.length ||
      expectedUrls.some((url, i) => url !== apiUrls[i]);

    if (mismatch) {
      await sendDiscordAlert({
        title: "⚠️ HOT 뉴스 API/DB 불일치 감지",
        description:
          "Production API 응답이 DB 기준 기대값과 다릅니다. 캐싱 등 API 레이어 문제일 수 있습니다.",
        color: DiscordAlertColor.warning,
        fields: [
          { name: "DB 기준 effectiveDate", value: expectedDate, inline: true },
          { name: "API effectiveDate", value: apiJson.effectiveDate ?? "(없음)", inline: true },
          { name: "DB 기준 기사 수", value: String(expectedUrls.length), inline: true },
          { name: "API 기사 수", value: String(apiUrls.length), inline: true },
        ],
      });
    }
  } catch (error) {
    await sendDiscordAlert({
      title: "⚠️ HOT 뉴스 점검 실패 (요청 중 오류)",
      description: error instanceof Error ? error.message : String(error),
      color: DiscordAlertColor.warning,
      fields: [{ name: "날짜", value: asOfDate }],
    });
  }
}

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
 * It just means today's date has no new rows, so GET /api/hot-news
 * (src/lib/hot-news-lookup.ts) keeps serving the latest prior day's
 * picks instead, and only the HOT 뉴스 section itself is ever affected —
 * the rest of the home screen (최신 뉴스 목록, 섹터 필터) renders exactly as
 * before regardless.
 *
 * Every outcome also posts a Discord embed (see src/lib/discord-alert.ts)
 * so a failure or an unexpected zero-pick day can be caught same-day
 * instead of silently waiting for the next person to notice the home
 * screen. IMPORTANT LIMITATION: this alerting only fires from inside a
 * running cron invocation. If Vercel's scheduler itself fails to invoke
 * this route at all (platform outage, cron misconfiguration, account/plan
 * issue), no Discord message is sent either — there is no external
 * watchdog here. Catching that failure mode would require an outside
 * uptime check (e.g. a third-party scheduled ping) verifying this ran,
 * which is intentionally out of scope for this free-tier setup.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const effectiveDate = kstDateString();
  const supabase = createSupabaseAdminClient();
  let stage = "keywords_fetch";

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
      stage = "db_delete";
      await supabase.from("hot_news_daily").delete().eq("effective_date", effectiveDate);

      await sendDiscordAlert({
        title: "ℹ️ HOT 뉴스 선정 0건 (키워드 없음)",
        description: "등록된 키워드가 없어 오늘은 HOT 뉴스를 선정하지 않았습니다.",
        color: DiscordAlertColor.info,
        fields: [{ name: "날짜", value: effectiveDate }],
      });
      await verifyApiMatchesDb(supabase, effectiveDate);

      return NextResponse.json({ effectiveDate, picked: 0, reason: "no_keywords" });
    }

    stage = "rss_fetch";
    const { articles } = await fetchAllNewsItems();
    stage = "matching";
    const picks = selectHotNews(keywords, articles);

    stage = "db_delete";
    await supabase.from("hot_news_daily").delete().eq("effective_date", effectiveDate);

    if (picks.length > 0) {
      stage = "db_insert";
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

      await sendDiscordAlert({
        title: "✅ HOT 뉴스 생성 완료",
        description: `오늘자 HOT 뉴스 ${picks.length}건이 정상적으로 생성되었습니다.`,
        color: DiscordAlertColor.success,
        fields: [
          { name: "날짜", value: effectiveDate, inline: true },
          { name: "생성 기사 수", value: String(picks.length), inline: true },
        ],
      });
    } else {
      await sendDiscordAlert({
        title: "ℹ️ HOT 뉴스 선정 0건",
        description: "키워드와 매칭되는 기사가 없어 오늘은 HOT 뉴스를 선정하지 않았습니다.",
        color: DiscordAlertColor.info,
        fields: [{ name: "날짜", value: effectiveDate }],
      });
    }

    await verifyApiMatchesDb(supabase, effectiveDate);

    return NextResponse.json({ effectiveDate, picked: picks.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("hot-news cron failed:", message);
    await sendDiscordAlert({
      title: "🚨 HOT 뉴스 생성 오류",
      description: message,
      color: DiscordAlertColor.error,
      fields: [
        { name: "날짜", value: effectiveDate, inline: true },
        { name: "실패 단계", value: stage, inline: true },
      ],
    });
    return NextResponse.json({ error: "cron_failed" }, { status: 500 });
  }
}
