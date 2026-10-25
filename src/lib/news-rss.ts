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
 * key needed for any of them. Articles always open via direct external
 * navigation (web: same-tab `<a href>`; native app: in-app browser, see
 * src/lib/native/article-browser.ts) — there is no in-app iframe viewer of
 * any article content, so iframe-embeddability (X-Frame-Options/CSP
 * frame-ancestors) is not an inclusion criterion. (An earlier iframe-based
 * ArticleViewer did gate sources on that basis — see git history around
 * src/lib/iframe-support.ts — but that component was removed; a stale
 * version of this comment kept citing it after the fact.) What actually
 * matters: the feed is an official, currently-live RSS endpoint, and a
 * sampled article URL from it actually loads (200, not a 404/paywall
 * stub).
 *
 * Each source's own comment below records what was actually checked for
 * that outlet (item volume, date range, media tag presence, article URL
 * check) at the time it was added — re-verify rather than assume if a
 * source starts misbehaving.
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
  // Added 2026-10-25, 경제 category feed. 50 items/pull, ~2-day span,
  // official <copyright> line present, article URL spot-checked (200).
  // Zero media:content/media:thumbnail/enclosure in any sampled item — no
  // thumbnail to gate either way, allowThumbnail is false as a structural
  // fact, not a cautious guess.
  { press: "한국경제", feedUrl: "https://www.hankyung.com/feed/economy", allowThumbnail: false },
  // Added 2026-10-25. Only "최신기사" (all-sections latest) feed found —
  // hankyung-style per-category feeds (mt_economy.xml etc.) all 302
  // redirect to a 404 page, so this is the one real feed this outlet
  // offers; same classifySectorV2/evaluateNonEconomicFilter in
  // parseRssFeed already used for 아시아경제's similarly mixed-topic feed
  // does the economic-relevance narrowing. 100 items/pull, ~14h span (high
  // update frequency), official <copyright> line present, article URL
  // spot-checked (200). No <media:content>/<media:thumbnail>/<enclosure>
  // in any sampled item — the feed's <description> CDATA does embed a raw
  // `<img src=...>` for each item's teaser image, but that's a different,
  // unverified reuse case (HTML inside a text field, not an aggregator
  // media tag) that this parser deliberately does not extract from;
  // allowThumbnail is false until that's separately decided.
  { press: "머니투데이", feedUrl: "https://rss.mt.co.kr/mt_news.xml", allowThumbnail: false },
  // Added 2026-10-25, three category feeds (경제/증권/산업) — found via the
  // feed index at fnnews.com/rss; each individual category feed is thin
  // (경제 5 / 증권 3 / 산업 4 items per pull, same-day span only), so three
  // are combined for usable volume (dedupeByUrl already handles any
  // overlap). Official <copyright> line present, article URL spot-checked
  // (200). Zero media:content/media:thumbnail/enclosure in any sampled
  // item across all three — same structural no-thumbnail situation as
  // 한국경제.
  {
    press: "파이낸셜뉴스",
    feedUrl: "https://www.fnnews.com/rss/r20/fn_realnews_economy.xml",
    allowThumbnail: false,
  },
  {
    press: "파이낸셜뉴스",
    feedUrl: "https://www.fnnews.com/rss/r20/fn_realnews_stock.xml",
    allowThumbnail: false,
  },
  {
    press: "파이낸셜뉴스",
    feedUrl: "https://www.fnnews.com/rss/r20/fn_realnews_industry.xml",
    allowThumbnail: false,
  },
];

/**
 * Individual articles kept out of the feed by exact URL — e.g. a link the
 * publisher has since taken down. Only hides the feed entry: records a user
 * already saved for the same URL are separate rows (url is plain text, no
 * relation to the feed) and are left untouched.
 *  - asiae 2026101415554159471: 원문이 "페이지를 찾을 수 없습니다"(404).
 */
const EXCLUDED_ARTICLE_URLS = new Set<string>([
  "https://view.asiae.co.kr/article/2026101415554159471",
]);

/**
 * Decodes XML/HTML entities exactly once per call (each `.replace` pass is
 * non-overlapping and runs a single time — e.g. "&amp;amp;" becomes the
 * literal text "&amp;", not a further-decoded "&", so this never
 * double-unescapes a source that legitimately wanted to display an escaped
 * entity as text). Numeric entities are handled generically (`&#39;` and
 * `&#039;` — any digit count — both resolve to the same code point) rather
 * than special-cased per digit-width, since 머니투데이's feed in particular
 * emits the 3-digit form. `&amp;` is decoded last so it can't interfere
 * with the other patterns above it.
 */
function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, "&");
}

/**
 * CDATA content is raw text by XML definition (no entity parsing happens
 * inside it), so a feed that writes a literal apostrophe has nothing to
 * decode — but some sources (머니투데이 in particular) put
 * already-HTML-entity-encoded text inside their own CDATA blocks (their own
 * data-quality issue, not XML escaping), which readers see as literal
 * "&#039;" if left alone. Running the same decodeXmlEntities used for the
 * plain branch here is a no-op for every source that doesn't do this and
 * fixes display for the ones that do — one single decode pass either way,
 * matching the plain branch's behavior exactly.
 */
function extractField(itemXml: string, tag: string): string | null {
  const cdata = itemXml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  if (cdata) return decodeXmlEntities(cdata[1]).trim();
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
 * unparseable pubDate is skipped rather than producing a broken entry, as is
 * any URL in EXCLUDED_ARTICLE_URLS. An
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
    if (EXCLUDED_ARTICLE_URLS.has(url)) continue;

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
 * Fetches every configured source (Promise.allSettled — one outlet's feed
 * being down never drops the others), dedupes, and sorts newest-first. The
 * same aggregation GET /api/news has always done, pulled out here so the
 * HOT 뉴스 cron (src/app/api/cron/hot-news/route.ts) can match keywords
 * against the exact same article pool instead of re-implementing this
 * fetch loop a second time. Behavior-preserving extraction — GET /api/news
 * just calls this now instead of inlining it.
 *
 * `failed` is true only when sources are configured but every single one
 * of them errored — zero configured sources is "nothing to fetch", not a
 * failure (same distinction the original inline version drew).
 */
export async function fetchAllNewsItems(): Promise<{
  articles: LatestNewsItem[];
  failed: boolean;
}> {
  if (NEWS_SOURCES.length === 0) {
    return { articles: [], failed: false };
  }

  const results = await Promise.allSettled(NEWS_SOURCES.map(fetchSource));
  const succeeded = results.filter(
    (result): result is PromiseFulfilledResult<LatestNewsItem[]> => result.status === "fulfilled",
  );

  if (succeeded.length === 0) {
    return { articles: [], failed: true };
  }

  const articles = dedupeByUrl(succeeded.flatMap((result) => result.value)).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return { articles, failed: false };
}
