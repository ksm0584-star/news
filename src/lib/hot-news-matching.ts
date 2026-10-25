import type { LatestNewsItem } from "./news-rss";

/**
 * Pure matching logic for "지금 주목할 뉴스" — no I/O here (no RSS fetch, no
 * Supabase), just admin keywords + an already-fetched article pool in,
 * picks out. Keeps the selection rules in one place, independent of where
 * the keywords/articles came from, so this stays easy to reason about and
 * change later.
 *
 * This is explicitly NOT a popularity/view-count ranking — "관심도" here
 * means "an admin manually judged this economic issue worth highlighting
 * today," never an actual read/click metric. Don't describe its output as
 * view-count- or popularity-based anywhere this is surfaced.
 */

export interface HotNewsKeyword {
  keyword: string;
  /** Lower number = processed first = higher priority. */
  priority: number;
}

export interface HotNewsPick {
  keyword: string;
  article: LatestNewsItem;
}

const MAX_PICKS = 5;
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Splits an admin keyword into its meaningful parts — "삼성전자 실적" →
 * ["삼성전자", "실적"]. Internal punctuation (e.g. "원·달러") is kept
 * as-is, not split further; only whitespace separates tokens.
 */
function keywordTokens(keyword: string): string[] {
  return keyword.trim().split(/\s+/).filter(Boolean);
}

/**
 * True only when EVERY token of the keyword appears in the title — a title
 * containing just one of several tokens is deliberately not a match (e.g.
 * a "삼성전자" HR story with no mention of "실적" doesn't count for the
 * keyword "삼성전자 실적"). This is the "핵심 개체와 주제가 모두 일치"
 * requirement, applied as a hard eligibility gate rather than a ranking
 * factor — there's no partial-credit "related enough" tier.
 */
function isFullMatch(title: string, tokens: string[]): boolean {
  return tokens.length > 0 && tokens.every((token) => title.includes(token));
}

/**
 * Picks the single best representative article for one admin keyword, or
 * null if nothing qualifies (caller skips that keyword entirely — see
 * selectHotNews). `excludedUrls` keeps an earlier, higher-priority
 * keyword's pick from being reused for a later one (the "동일 기사 중복
 * 최소화" rule — each keyword is a distinct admin-curated issue, so one
 * article URL per keyword slot is the dedup unit here).
 *
 * Every outlet is eligible regardless of thumbnail — a real
 * `allowThumbnail`-gated photo is preferred when available (2026-10-25:
 * no longer a hard requirement; a card with no real photo falls back to a
 * sector-matched illustration instead, see hot-news-illustration.ts, so
 * excluding non-photo articles from selection entirely is no longer
 * necessary). Among candidates that pass isFullMatch, ranked by (in
 * order): (1) published within the last 24h, (2) has a real thumbnail
 * (soft preference, not a gate), (3) more recent publishedAt as the final
 * tiebreaker. Relevance itself isn't a ranking factor — it's the
 * isFullMatch gate above; everything that passes it is equally "relevant
 * enough".
 */
export function pickArticleForKeyword(
  keyword: string,
  articles: readonly LatestNewsItem[],
  excludedUrls: ReadonlySet<string>,
  now: Date = new Date(),
): LatestNewsItem | null {
  const tokens = keywordTokens(keyword);
  const candidates = articles.filter(
    (article) => !excludedUrls.has(article.url) && isFullMatch(article.title, tokens),
  );
  if (candidates.length === 0) return null;

  const nowMs = now.getTime();
  function rankKey(article: LatestNewsItem): [number, number, number] {
    const publishedMs = new Date(article.publishedAt).getTime();
    const withinWindow = nowMs - publishedMs <= RECENT_WINDOW_MS ? 1 : 0;
    const hasThumbnail = article.imageUrl ? 1 : 0;
    return [withinWindow, hasThumbnail, publishedMs];
  }

  return candidates.reduce((best, current) => {
    const bestKey = rankKey(best);
    const currentKey = rankKey(current);
    for (let i = 0; i < bestKey.length; i++) {
      if (currentKey[i] !== bestKey[i]) return currentKey[i] > bestKey[i] ? current : best;
    }
    return best;
  });
}

/**
 * Runs pickArticleForKeyword for every keyword in priority order, skipping
 * a keyword that finds no match ("기사 매칭에 실패한 키워드는 건너뜁니다")
 * and never reusing an article URL an earlier keyword already claimed.
 * Caps at 5 results total regardless of how many keywords are registered —
 * "실제 확보된 기사만 노출", never padded with anything else.
 */
export function selectHotNews(
  keywords: readonly HotNewsKeyword[],
  articles: readonly LatestNewsItem[],
  now: Date = new Date(),
): HotNewsPick[] {
  const sorted = [...keywords].sort((a, b) => a.priority - b.priority);
  const picks: HotNewsPick[] = [];
  const usedUrls = new Set<string>();

  for (const { keyword } of sorted) {
    if (picks.length >= MAX_PICKS) break;
    const article = pickArticleForKeyword(keyword, articles, usedUrls, now);
    if (!article) continue;
    usedUrls.add(article.url);
    picks.push({ keyword, article });
  }

  return picks;
}
