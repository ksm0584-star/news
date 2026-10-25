export function formatDate(iso: string): string {
  const date = new Date(iso);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

/**
 * Same as formatDate but with a 2-digit year ("26.10.25" instead of
 * "2026.10.25") — only for the 홈 "최신 경제 뉴스" list card meta row
 * (LatestNewsList). A separate function rather than changing formatDate
 * itself, since that one is shared by every other date display (기록
 * 상세·완료·회고, 기사 상세, RecordCard, 경제용어 기록) which all keep the
 * 4-digit year.
 */
export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(iso)} ${hh}:${min}`;
}

/** Whole days elapsed since `iso`, floored at 0 to absorb clock skew — never negative. */
export function daysSince(iso: string): number {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diffMs / 86_400_000));
}

export function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
