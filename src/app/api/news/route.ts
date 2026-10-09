import { NextResponse } from "next/server";
import { NEWS_SOURCES, dedupeByUrl, parseRssFeed, type LatestNewsItem } from "@/lib/news-rss";

export const dynamic = "force-dynamic";

interface NewsResponse {
  articles: LatestNewsItem[];
  error?: string;
}

async function fetchSource(source: (typeof NEWS_SOURCES)[number]): Promise<LatestNewsItem[]> {
  const response = await fetch(source.feedUrl, {
    next: { revalidate: 600 },
    headers: { "User-Agent": "NewsNoteBot/1.0 (+https://github.com/ksm0584-star/news)" },
  });
  if (!response.ok) throw new Error(`${source.press}: ${response.status}`);
  const xml = await response.text();
  return parseRssFeed(xml, source.press);
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
