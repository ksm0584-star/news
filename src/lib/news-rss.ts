import type { NewsCategory } from "./news-categories";
import { classifySectorV2, evaluateNonEconomicFilter } from "./news-classification-v2";

export interface LatestNewsItem {
  title: string;
  url: string;
  press: string;
  /** ISO 8601 */
  publishedAt: string;
  sector: NewsCategory;
  /**
   * Only ever the feed's own <media:content> url, and only for a source
   * with allowThumbnail: true below — never fetched by crawling the
   * article page itself. Absent whenever the feed has no media:content
   * for that item, or the source isn't allowlisted.
   */
  imageUrl?: string;
}

export interface NewsSource {
  press: string;
  feedUrl: string;
  /**
   * Whether a thumbnail extracted from this feed's own <media:content> is
   * actually shown — a separate, explicit decision from "can we technically
   * extract one." A feed exposing <media:content> at all is a reasonably
   * standard aggregator-facing signal (that's what the tag is for), but
   * isn't a substitute for actually-confirmed image reuse terms. Checked at
   * the time this was added:
   *  - 매일경제: true — media:content present on ~98% of sampled items, and
   *    nothing in this project's own RSS-terms research flags this source
   *    as unclear.
   *  - 조선일보: false — media:content IS present (~74% of sampled items),
   *    but this project's own research (see NEWS_SOURCES below) already
   *    flagged 조선일보's feed as carrying no copyright/terms line at all,
   *    the least clear of any source checked — not layering image reuse on
   *    top of that without an explicit decision to accept it.
   * 이데일리/아시아경제 don't need an entry either way — their feeds have no
   * media:content at all, so this flag has nothing to gate.
   */
  allowThumbnail: boolean;
}

/**
 * Official RSS feed sources for the home screen's latest-news list — no API
 * key needed for any of them. Only an outlet whose article pages have
 * actually been confirmed to render correctly in a real mobile iframe
 * belongs here long-term; a domain not blocked and a reasonable-looking
 * viewport meta tag are not enough on their own (that's exactly how
 * hankyung.com — now kept only in src/lib/iframe-support.ts's
 * non-responsive list, never used as a home-feed source — ended up here
 * before actual mobile rendering showed it doesn't reflow correctly).
 *
 * TEMPORARY, DEV-ONLY: 매일경제 passed real mobile-device testing. 이데일리,
 * 아시아경제, 조선일보 have only passed the header/viewport checks and
 * mount successfully in ArticleViewer's iframe — their actual
 * mobile-rendered appearance has NOT been confirmed on a real device yet
 * (see the project's RSS-source research for the full findings) — they're
 * wired in now specifically so that confirmation can happen against this
 * dev server. Do not treat this as cleared for a public/production deploy
 * until that confirmation lands, and RSS usage terms still need an
 * explicit check before any public launch either way (조선일보's feed in
 * particular carries no copyright/terms line at all — the least clear of
 * any source checked so far).
 *
 * Excluded: 한국경제 (confirmed non-responsive — see
 * IFRAME_NON_RESPONSIVE_DOMAINS in iframe-support.ts), 서울경제 (confirmed
 * non-responsive on a real device test), 머니투데이/파이낸셜뉴스 (confirmed
 * iframe-blocked via X-Frame-Options/CSP headers).
 */
export const NEWS_SOURCES: NewsSource[] = [
  { press: "매일경제", feedUrl: "https://www.mk.co.kr/rss/30100041/", allowThumbnail: true },
  { press: "이데일리", feedUrl: "https://rss.edaily.co.kr/economy_news.xml", allowThumbnail: false },
  {
    press: "아시아경제",
    feedUrl: "https://www.asiae.co.kr/news/rss/asia_rss.htm",
    allowThumbnail: false,
  },
  {
    press: "조선일보",
    feedUrl: "https://www.chosun.com/arc/outboundfeeds/rss/category/economy/?outputType=xml",
    allowThumbnail: false,
  },
];

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function extractField(itemXml: string, tag: string): string | null {
  const cdata = itemXml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  if (cdata) return cdata[1].trim();
  const plain = itemXml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (plain) return decodeXmlEntities(plain[1]).trim();
  return null;
}

/** The feed's own <media:content url="..."/> — matches either self-closing or open/close form, since only the url attribute is needed. */
function extractMediaContentImageUrl(itemXml: string): string | null {
  const match = itemXml.match(/<media:content\b[^>]*\burl="([^"]*)"/);
  if (!match) return null;
  return decodeXmlEntities(match[1]);
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Parses one outlet's RSS feed into LatestNewsItems, tagging every item
 * with the given `press` name (RSS <channel> titles vary too much per
 * outlet to parse reliably, and every source here is single-outlet anyway,
 * so the caller just says who it is). Targeted regex rather than a general
 * XML parser — every outlet checked so far uses the same flat <item> shape
 * (just inconsistent CDATA-wrapping, which extractField already handles
 * either way) — avoids a new dependency for four flat fields.
 *
 * An item missing a required field, with a non-http(s) URL, or with an
 * unparseable pubDate is skipped rather than producing a broken entry. An
 * item the non-economic filter flags (see news-classification-v2.ts) is
 * also skipped entirely — it never reaches the feed, not even as "기타".
 */
export function parseRssFeed(
  xml: string,
  press: string,
  allowThumbnail: boolean,
): LatestNewsItem[] {
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const items: LatestNewsItem[] = [];

  for (const block of itemBlocks) {
    const title = extractField(block, "title");
    const url = extractField(block, "link");
    const pubDateRaw = extractField(block, "pubDate");
    if (!title || !url || !pubDateRaw || !isHttpUrl(url)) continue;

    const published = new Date(pubDateRaw);
    if (Number.isNaN(published.getTime())) continue;

    const classification = classifySectorV2(title);
    if (evaluateNonEconomicFilter(title, classification.scores).excluded) continue;

    // Extracted from the feed itself only — never a reason to fetch the
    // article page. `allowThumbnail` gates whether a source's own
    // media:content is actually used (see NEWS_SOURCES' own comment).
    const imageUrl = allowThumbnail ? extractMediaContentImageUrl(block) : null;

    items.push({
      title,
      url,
      press,
      publishedAt: published.toISOString(),
      sector: classification.sector,
      ...(imageUrl && isHttpUrl(imageUrl) ? { imageUrl } : {}),
    });
  }

  return items;
}

/** Later duplicate of the same URL is dropped, earlier one is kept. */
export function dedupeByUrl(items: LatestNewsItem[]): LatestNewsItem[] {
  const seen = new Set<string>();
  const result: LatestNewsItem[] = [];
  for (const item of items) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    result.push(item);
  }
  return result;
}
