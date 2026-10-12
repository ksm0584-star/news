import { NextResponse } from "next/server";
import { NEWS_SOURCES, dedupeByUrl, parseRssFeed, type LatestNewsItem } from "@/lib/news-rss";

/**
 * Previous (non-Cache-Components) caching model: Route Handler GET methods
 * default to dynamic since Next 15, so `force-static` is required to get
 * the whole response cached/ISR'd rather than re-running on every request.
 * `revalidate` here (and on each fetch below) sets the shared 6h window —
 * stale content is served instantly past that point while this re-runs in
 * the background, so no visitor ever blocks on a slow upstream RSS feed.
 */
export const dynamic = "force-static";
export const revalidate = 21600;

interface NewsResponse {
  articles: LatestNewsItem[];
  error?: string;
}

async function fetchSource(source: (typeof NEWS_SOURCES)[number]): Promise<LatestNewsItem[]> {
  const response = await fetch(source.feedUrl, {
    next: { revalidate: 21600 },
    headers: { "User-Agent": "NewsNoteBot/1.0 (+https://github.com/ksm0584-star/news)" },
  });
  if (!response.ok) throw new Error(`${source.press}: ${response.status}`);
  const xml = await response.text();
  return parseRssFeed(xml, source.press, source.allowThumbnail);
}

/**
 * Server-side RSS fetch, one outlet at a time — keeps this off the client
 * (no CORS issues, no API key needed since these are all public feeds) and
 * cached per-source via Next's `fetch` revalidation so the home screen
 * isn't re-fetching every publisher's feed on every page view.
 *
 * Each source is fetched independently (Promise.allSettled): one outlet's
 * feed being down or erroring never drops the others — only when every
 * configured source fails does this report an error. With zero sources
 * configured (see NEWS_SOURCES), this is simply an empty list, not an
 * error — there's nothing to have failed yet.
 */
export async function GET() {
  if (NEWS_SOURCES.length === 0) {
    return NextResponse.json<NewsResponse>({ articles: [] });
  }

  const results = await Promise.allSettled(NEWS_SOURCES.map(fetchSource));
  const succeeded = results.filter(
    (result): result is PromiseFulfilledResult<LatestNewsItem[]> => result.status === "fulfilled",
  );

  if (succeeded.length === 0) {
    return NextResponse.json<NewsResponse>({ articles: [], error: "fetch_failed" });
  }

  const articles = dedupeByUrl(succeeded.flatMap((result) => result.value)).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return NextResponse.json<NewsResponse>({ articles });
}
