import type { LatestNewsItem } from "./news-rss";

/**
 * Re-orders an already latest-first-sorted article list so that no sector
 * (in practice: the often-largest "기타" bucket) can cluster at the top just
 * because it happens to have the most recent articles. Used only by the
 * 홈 "전체" tab — a single-sector tab keeps showing `articles` filtered and
 * sorted exactly as before (see LatestNewsList.tsx), and this never
 * fetches anything itself; it's a pure reorder of the list the caller
 * already has in hand.
 *
 * Round-robin by sector, not a shuffle: group articles by `sector` (each
 * group keeps its incoming, already latest-first relative order), then
 * repeatedly take one article from every sector that still has one left,
 * each round ordering those sectors by how recent their next article is.
 * This gives:
 *  - every sector exactly one slot per round, so the same sector can't
 *    repeat back-to-back once 2+ sectors still have articles left (solves
 *    "기타가 상단을 독점" without special-casing 기타 itself)
 *  - a sector with few articles still gets picked every round until it
 *    runs out, same as any other — never skipped, never dropped
 *  - round 1 is literally "each sector's single most recent article,
 *    newest-first", so the very top of the list is still the most recent
 *    article overall — recency bias is preserved, not discarded
 *  - fully deterministic for the same input (sector name is the tie-break
 *    for an exact publishedAt tie) — no Math.random, so the same feed
 *    snapshot always re-orders the same way; a genuinely new/changed
 *    article list naturally produces a different (but still deterministic)
 *    order on its own
 */
export function distributeAcrossSectors(articles: LatestNewsItem[]): LatestNewsItem[] {
  const queues = new Map<string, LatestNewsItem[]>();
  for (const article of articles) {
    const queue = queues.get(article.sector);
    if (queue) {
      queue.push(article);
    } else {
      queues.set(article.sector, [article]);
    }
  }

  const result: LatestNewsItem[] = [];
  while (queues.size > 0) {
    const roundSectors = [...queues.keys()].sort((a, b) => {
      const aTime = new Date(queues.get(a)![0].publishedAt).getTime();
      const bTime = new Date(queues.get(b)![0].publishedAt).getTime();
      if (bTime !== aTime) return bTime - aTime;
      return a.localeCompare(b);
    });
    for (const sector of roundSectors) {
      const queue = queues.get(sector)!;
      result.push(queue.shift()!);
      if (queue.length === 0) queues.delete(sector);
    }
  }
  return result;
}
