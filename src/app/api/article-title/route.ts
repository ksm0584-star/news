import { NextResponse } from "next/server";
import { decodeXmlEntities } from "@/lib/news-rss";

/**
 * On-demand lookup of an external article's own real title, straight from
 * the live page's `<meta property="og:title">` (falling back to
 * `<title>`) — for a record saved before `records.article_title` existed
 * (or one with no known title at save time, e.g. a manual URL paste), so
 * the connected-article banner can still show the real headline instead
 * of a domain name or the user's own record title (neither of which is
 * acceptable per the project's "정확한 원본 제목, 대체 금지" requirement).
 *
 * Never writes anything back to the record — this is a pure read, called
 * from the client only when `article_title` is already known to be
 * missing (see use-article-title-lookup.ts). A failure of any kind
 * (network, timeout, non-200, no recognizable title tag) returns
 * `{ title: null }` with a 200 status, not an error — the caller's own
 * "제목을 확인할 수 없어요" state handles that, and the record screen must
 * render regardless either way.
 */

const FETCH_TIMEOUT_MS = 8000;

// Only stripped when the title ends in " - 그 언론사" for an outlet this
// project actually fetches RSS from (news-rss.ts's NEWS_SOURCES) — a
// precise known-suffix match, not a blind "cut after the last dash"
// heuristic that could mangle a title that legitimately contains one.
const KNOWN_PRESS_NAMES = [
  "매일경제",
  "이데일리",
  "아시아경제",
  "조선일보",
  "한국경제",
  "머니투데이",
  "파이낸셜뉴스",
];
const PRESS_SUFFIX_PATTERN = new RegExp(
  `\\s*[-|·]\\s*(?:${KNOWN_PRESS_NAMES.join("|")})\\s*$`,
);

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function extractOgOrPlainTitle(html: string): string | null {
  const ogMatch =
    html.match(/<meta[^>]+property=["']og:title["'][^>]*\bcontent=["']([^"']*)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i);
  const rawTitle = ogMatch?.[1] ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  if (!rawTitle) return null;

  const decoded = decodeXmlEntities(rawTitle).trim();
  if (!decoded) return null;

  return decoded.replace(PRESS_SUFFIX_PATTERN, "").trim() || null;
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !isHttpUrl(url)) {
    return NextResponse.json({ title: null });
  }

  try {
    const response = await fetch(url, {
      // Same self-identifying UA news-rss.ts already uses for RSS — this
      // fetches one article page per lookup, not a crawl.
      headers: { "User-Agent": "NewsNoteBot/1.0 (+https://github.com/ksm0584-star/news)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      // A 24h cache on the exact same URL — the real title essentially
      // never changes after the first successful lookup, and this keeps
      // repeat views of the same old record from re-fetching every time.
      next: { revalidate: 86400 },
    });
    if (!response.ok) {
      return NextResponse.json({ title: null });
    }
    const html = await response.text();
    return NextResponse.json({ title: extractOgOrPlainTitle(html) });
  } catch {
    return NextResponse.json({ title: null });
  }
}
