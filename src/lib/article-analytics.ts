/** Stable public-article fingerprint; never send raw URLs, query strings or titles. */
export function articleAnalyticsId(rawUrl: string): string | undefined {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    // FNV-1a 64: an opaque join key, not an anonymization scheme for private data.
    let hash = BigInt("14695981039346656037");
    for (const byte of new TextEncoder().encode(url.toString())) {
      hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * BigInt("1099511628211"));
    }
    return `article_v1_${hash.toString(16).padStart(16, "0")}`;
  } catch {
    return undefined;
  }
}

export function articleAnalytics(rawUrl: string): { article_id?: string } {
  const id = articleAnalyticsId(rawUrl);
  return id ? { article_id: id } : {};
}

/** Visible progress through this list, not through the entire home page. */
export function newsListDepth(top: number, height: number, viewportHeight: number): number {
  if (height <= 0 || top >= viewportHeight || top + height <= 0) return 0;
  return Math.max(0, Math.min(100, ((viewportHeight - top) / height) * 100));
}
