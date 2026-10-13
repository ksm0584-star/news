/**
 * localStorage-backed "has the user ever opened this article" set, used to
 * dim already-read cards in the home news list. Keyed by article URL — the
 * only stable identifier LatestNewsItem has (see news-rss.ts, which has no
 * id field) — so the same article reads as read everywhere it appears,
 * across every category tab it's filtered into. Shared by logged-in and
 * anonymous users alike: this is a per-browser UI affordance, not account
 * data, so it deliberately doesn't route through records.ts/record-store.ts.
 */

const STORAGE_KEY = "moayo:read-articles";

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((value): value is string => typeof value === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

export function getReadArticleUrls(): Set<string> {
  return readSet();
}

/** No-ops if already marked read, so a re-open never rewrites storage. */
export function markArticleRead(url: string): void {
  try {
    const current = readSet();
    if (current.has(url)) return;
    current.add(url);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
  } catch {
    // Private browsing / storage disabled — the card just won't dim next time, which is harmless.
  }
}
