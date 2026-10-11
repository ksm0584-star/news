/**
 * sessionStorage-backed "the user just left for an article's original URL"
 * marker — read back on the home screen (see use-article-return-banner.ts)
 * to show a "방금 본 뉴스, 기록해 볼까요?" banner after a Safari-back
 * return. sessionStorage (not localStorage) is deliberate: it survives the
 * same tab navigating away and back, but never leaks into a different tab
 * or a later day's session.
 *
 * Only non-sensitive, minimal fields are stored here — never draft
 * title/question/thought text, which lives entirely in useExternalDraft's
 * own localStorage keyed separately.
 */

const STORAGE_KEY = "moayo:article-return";
/** Stale "did they come back?" signals aren't worth acting on — 30 minutes covers a normal read, not an abandoned tab from hours ago. */
const MAX_AGE_MS = 30 * 60 * 1000;

export interface ArticleReturnInfo {
  url: string;
  title: string;
  sector: string;
  /** Not present for the RSS-backed home feed today (LatestNewsItem has no id) — kept for a future source that does have one. */
  articleId?: string;
  /** epoch ms — when the user left for the original article. */
  openedAt: number;
  /** Where this return trip started from — always "/" today (the only caller), kept explicit for clarity/future callers. */
  fromPath: string;
  /** Set once the banner has actually been shown for this entry, so re-checking (e.g. a second pageshow, or a plain re-render) never shows it twice. */
  bannerShown?: boolean;
}

export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Call right before navigating to the article's real URL. No-ops on an invalid URL — never sends the user toward the home return-banner flow for a link that wasn't real. */
export function saveArticleReturnInfo(info: {
  url: string;
  title: string;
  sector: string;
  articleId?: string;
  fromPath: string;
}): void {
  if (!isHttpUrl(info.url)) return;
  try {
    const entry: ArticleReturnInfo = { ...info, openedAt: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Private browsing / storage disabled — the return banner just won't
    // appear this time, which is a safe fallback (no crash, no banner).
  }
}

/** Returns the pending entry if one exists, is well-formed, and isn't stale — clearing it from storage if it's any of those. Does NOT consume/clear a valid entry; callers decide that. */
export function readPendingArticleReturn(): ArticleReturnInfo | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Partial<ArticleReturnInfo> | null;
    if (
      !entry ||
      typeof entry.url !== "string" ||
      typeof entry.title !== "string" ||
      typeof entry.sector !== "string" ||
      typeof entry.openedAt !== "number" ||
      !isHttpUrl(entry.url)
    ) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() - entry.openedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return entry as ArticleReturnInfo;
  } catch {
    return null;
  }
}

/** Marks the current entry as shown, in place — still present for the banner's own onRecord/onDismiss to read, just no longer eligible to be *shown* again. */
export function markArticleReturnBannerShown(): void {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const entry = JSON.parse(raw) as ArticleReturnInfo;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...entry, bannerShown: true }));
  } catch {
    // Best-effort — worst case the banner could show again this session.
  }
}

/** Consumes the entry entirely — call once the user acts on the banner (either button), so it can never resurface for this trip. */
export function clearPendingArticleReturn(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort.
  }
}
