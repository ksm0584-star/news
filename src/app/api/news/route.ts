import { NextResponse } from "next/server";
import { fetchAllNewsItems, type LatestNewsItem } from "@/lib/news-rss";

/**
 * Previous (non-Cache-Components) caching model: Route Handler GET methods
 * default to dynamic since Next 15, so `force-static` is required to get
 * the whole response cached/ISR'd rather than re-running on every request.
 * `revalidate` here (and on each fetch inside fetchAllNewsItems) sets the
 * shared 6h window — stale content is served instantly past that point
 * while this re-runs in the background, so no visitor ever blocks on a
 * slow upstream RSS feed.
 */
export const dynamic = "force-static";
export const revalidate = 21600;

interface NewsResponse {
  articles: LatestNewsItem[];
  error?: string;
}

/**
 * Server-side RSS fetch, one outlet at a time — keeps this off the client
 * (no CORS issues, no API key needed since these are all public feeds) and
 * cached per-source via Next's `fetch` revalidation so the home screen
 * isn't re-fetching every publisher's feed on every page view. The actual
 * fetch-all-sources logic lives in fetchAllNewsItems (src/lib/news-rss.ts),
 * shared with the HOT 뉴스 cron job which matches keywords against this
 * exact same article pool.
 */
export async function GET() {
  const { articles, failed } = await fetchAllNewsItems();

  if (failed) {
    return NextResponse.json<NewsResponse>({ articles: [], error: "fetch_failed" });
  }

  return NextResponse.json<NewsResponse>({ articles });
}
