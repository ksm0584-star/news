/**
 * Single place to manage which news domains are known NOT to render inside
 * a plain <iframe> (verified manually via /webview-test — see that page for
 * how to test a new domain). X-Frame-Options/CSP frame-ancestors blocks
 * can't be reliably detected from the frontend (iframe's `onload` fires
 * either way), so this is a manually-curated list, not a runtime check.
 *
 * Add a domain here once you've confirmed via /webview-test that it blocks
 * embedding; everything not listed is assumed embeddable until shown
 * otherwise.
 */
export const IFRAME_UNSUPPORTED_DOMAINS = [
  "news.naver.com", // X-Frame-Options: SAMEORIGIN — confirmed via /webview-test
];

export function isIframeUnsupported(url: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
  return IFRAME_UNSUPPORTED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}
