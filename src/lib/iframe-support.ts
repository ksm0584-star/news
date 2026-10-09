/**
 * Single place to manage which news domains don't work inside a plain
 * <iframe> on mobile. Two different problems get tracked separately here,
 * because they have different causes and different ways of being
 * confirmed — but both get exactly the same treatment from callers (see
 * isIframeUnsupported below): no iframe is mounted at all, and
 * ArticleOpenExternalBar is shown instead so the user reads the article in
 * a real tab/browser.
 *
 * - IFRAME_BLOCKED_DOMAINS: the site's own X-Frame-Options/CSP refuses to
 *   be framed at all. This can't be detected at runtime — the iframe's
 *   `onload` fires either way — so it's a manually-curated list. Add a
 *   domain here once you've confirmed via /webview-test that it blocks
 *   embedding.
 *
 * - IFRAME_NON_RESPONSIVE_DOMAINS: the site *allows* framing, but its
 *   article pages declare a fixed, non-mobile viewport (e.g.
 *   hankyung.com's article pages ship
 *   `<meta name="viewport" content="width=1240">` instead of
 *   `width=device-width`), so the page renders as a squashed/cropped
 *   desktop layout inside a mobile-width iframe instead of reflowing to
 *   fit it. This also can't be fixed from our side — reading or restyling
 *   cross-origin iframe content isn't something we do — so the only real
 *   fix is the same as for a blocked domain: don't attempt the iframe.
 *   Confirm by checking the page's own `<meta name="viewport">` (compare
 *   against a known-responsive domain's `width=device-width`) before
 *   adding one here.
 *
 * Everything not listed in either array is assumed embeddable and
 * mobile-friendly until shown otherwise.
 */
export const IFRAME_BLOCKED_DOMAINS = [
  "news.naver.com", // X-Frame-Options: SAMEORIGIN — confirmed via /webview-test
  "mt.co.kr", // www.mt.co.kr — blocked embedding, confirmed via /webview-test. Covers subdomains too (e.g. news.mt.co.kr).
];

export const IFRAME_NON_RESPONSIVE_DOMAINS = [
  "hankyung.com", // article pages ship a fixed `viewport width=1240`, not device-width — confirmed by fetching an article page and comparing its <meta name="viewport"> against mk.co.kr's (device-width, responsive).
];

function hostnameMatchesDomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function isIframeUnsupported(url: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
  return [...IFRAME_BLOCKED_DOMAINS, ...IFRAME_NON_RESPONSIVE_DOMAINS].some((domain) =>
    hostnameMatchesDomain(hostname, domain),
  );
}
