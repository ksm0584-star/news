import type { NewsCategory } from "./news-categories";

export interface LatestNewsItem {
  title: string;
  url: string;
  press: string;
  /** ISO 8601 */
  publishedAt: string;
  sector: NewsCategory;
}

export interface NewsSource {
  press: string;
  feedUrl: string;
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
  { press: "매일경제", feedUrl: "https://www.mk.co.kr/rss/30100041/" },
  { press: "이데일리", feedUrl: "https://rss.edaily.co.kr/economy_news.xml" },
  { press: "아시아경제", feedUrl: "https://www.asiae.co.kr/news/rss/asia_rss.htm" },
  {
    press: "조선일보",
    feedUrl: "https://www.chosun.com/arc/outboundfeeds/rss/category/economy/?outputType=xml",
  },
];

/**
 * Simple ordered keyword match — first category whose keyword appears in
 * the title wins. Deliberately crude (title-only, no ML/LLM call): good
 * enough to sort real estate from semiconductors, not a guarantee of
 * precise categorization. Anything unmatched falls to "기타", same as the
 * app's existing catch-all convention.
 */
const SECTOR_KEYWORDS: [NewsCategory, string[]][] = [
  ["반도체", ["반도체", "메모리", "파운드리", "웨이퍼", "낸드", "D램", "HBM"]],
  ["바이오·헬스케어", ["바이오", "제약", "헬스케어", "임상", "병원", "의료", "백신"]],
  ["자동차·모빌리티", ["자동차", "전기차", "현대차", "기아", "모빌리티", "완성차", "수소차"]],
  [
    "에너지",
    ["에너지", "전력", "원전", "태양광", "석유", "가스", "탈탄소", "전기요금", "배터리"],
  ],
  ["부동산·건설", ["부동산", "아파트", "건설", "분양", "재건축", "전세"]],
  [
    "소비재·유통",
    ["유통", "면세점", "백화점", "편의점", "패션", "화장품", "식품", "뷰티", "이커머스", "쿠팡"],
  ],
  [
    "금융",
    ["금리", "주가", "증시", "코스피", "코스닥", "은행", "금융", "채권", "환율", "한국은행", "펀드"],
  ],
  [
    "AI·테크",
    ["AI", "인공지능", "빅테크", "데이터센터", "소프트웨어", "플랫폼", "로봇", "통신", "주파수", "스타트업"],
  ],
  ["정책·거시경제", ["정부", "정책", "국회", "세금", "연금", "예산", "물가", "경제단체", "규제"]],
];

export function classifySector(title: string): NewsCategory {
  for (const [category, keywords] of SECTOR_KEYWORDS) {
    if (keywords.some((keyword) => title.includes(keyword))) return category;
  }
  return "기타";
}

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
 * unparseable pubDate is skipped rather than producing a broken entry.
 */
export function parseRssFeed(xml: string, press: string): LatestNewsItem[] {
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const items: LatestNewsItem[] = [];

  for (const block of itemBlocks) {
    const title = extractField(block, "title");
    const url = extractField(block, "link");
    const pubDateRaw = extractField(block, "pubDate");
    if (!title || !url || !pubDateRaw || !isHttpUrl(url)) continue;

    const published = new Date(pubDateRaw);
    if (Number.isNaN(published.getTime())) continue;

    items.push({
      title,
      url,
      press,
      publishedAt: published.toISOString(),
      sector: classifySector(title),
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
