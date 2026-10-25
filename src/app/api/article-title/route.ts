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

/**
 * `content`'s own quote character must be excluded only for the quote
 * type actually delimiting it — not both types at once. A shared
 * `[^"']` class truncates at the first apostrophe inside a
 * double-quoted value (e.g. 아시아경제's `content="박지원 &quot;보수는
 * '장·한·오' ...`), cutting the title off right before "장·한·오'".
 */
function extractOgTitleAttr(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:title["'][^>]*\bcontent="([^"]*)"/i,
    /<meta[^>]+property=["']og:title["'][^>]*\bcontent='([^']*)'/i,
    /<meta[^>]+content="([^"]*)"[^>]+property=["']og:title["']/i,
    /<meta[^>]+content='([^']*)'[^>]+property=["']og:title["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractOgOrPlainTitle(html: string): string | null {
  const rawTitle = extractOgTitleAttr(html) ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  if (!rawTitle) return null;

  const decoded = decodeXmlEntities(rawTitle).trim();
  if (!decoded) return null;

  const stripped = decoded.replace(PRESS_SUFFIX_PATTERN, "").trim();
  if (!stripped) return null;

  // A title that collapses to exactly the outlet's own name once the
  // " - 언론사" suffix is stripped means the page's title *is* the site's
  // own masthead (a homepage, a dead link redirected back to one, a
  // paywall/login wall) rather than a real headline — showing the press
  // name as if it were "the original article title" would be exactly the
  // domain-name-as-title mistake this feature exists to avoid, so this is
  // treated the same as "no title found", not a real result.
  if (KNOWN_PRESS_NAMES.includes(stripped)) return null;

  return stripped;
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
