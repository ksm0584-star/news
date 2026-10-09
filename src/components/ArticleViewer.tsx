"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { trackClick } from "@/lib/mixpanel";

/**
 * How long to wait before treating a load as "taking too long" and showing
 * the retry UI. Not a confirmed failure — iframe `onload` doesn't guarantee
 * the article actually rendered, and there's no reliable way to detect a
 * cross-origin X-Frame-Options/CSP block from here, so this is just "has
 * it been unusually long," never a success/failure determination. Kept as
 * a named constant so it's easy to tune later.
 */
const LOAD_TIMEOUT_MS = 15000;

/**
 * Some WebKit-based browsers fire the iframe's `load` event almost
 * instantly for the frame's own initial empty document — a separate event
 * from the real external navigation finishing — which looks indistinguishable
 * from a genuine load from here. No real external article page can finish
 * loading this fast over an actual network, so an `onload` firing before
 * this much time has passed is treated as that spurious event rather than
 * "loaded successfully," so the loading UI doesn't disappear onto a blank
 * frame before the real content (or the timeout/retry card) has a chance to
 * show up.
 */
const SPURIOUS_LOAD_THRESHOLD_MS = 200;

/**
 * Renders an article URL as a plain <iframe> with loading / timeout-retry
 * overlays.
 *
 * Does NOT decide iframe-support itself — that decision (and what to show
 * instead for a confirmed-unsupported domain) belongs to the caller, via
 * src/lib/iframe-support.ts's isIframeUnsupported(). Callers only mount
 * this component once they've already decided the URL should be attempted
 * as an iframe; it's never conditionally rendered internally, so a
 * confirmed-unsupported URL's iframe is simply never mounted at all.
 *
 * Forwards a ref to the <iframe> itself — callers use it to tell whether
 * focus has moved into the iframe, since cross-origin content never
 * reports clicks/scrolls directly.
 *
 * Retry: "다시 불러오기" remounts the <iframe> (via a `key` bump) instead
 * of just reassigning the same `src`, so a reload is guaranteed even for
 * the identical URL — and because the old iframe element is torn down
 * entirely, there's no stale in-flight load left to race with the new
 * attempt or resurrect an old `onLoad`/timeout after a retry.
 *
 * No persistent "can't see it?" affordance floats over the article while
 * things are going normally — that was distracting during a successful
 * read. The timeout/retry card (for when loading genuinely stalls) and the
 * header's separate "브라우저에서 원문 열기" link (added by the caller,
 * outside this component) are the two ways out instead.
 *
 * `bottomInsetPx` (default 0): how much of the bottom of this component's
 * box a caller-rendered overlay (e.g. a bottom sheet) currently covers.
 * The loading/retry overlay centers itself within the space above that
 * inset instead of the full box, so it isn't hidden behind the sheet.
 */
const ArticleViewer = forwardRef<
  HTMLIFrameElement,
  { url: string; bottomInsetPx?: number }
>(function ArticleViewer({ url, bottomInsetPx = 0 }, iframeRef) {
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadStartRef = useRef(0);

  useEffect(() => {
    loadStartRef.current = performance.now();
    setIsLoading(true);
    setHasTimedOut(false);
    timeoutRef.current = setTimeout(() => setHasTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [url, retryCount]);

  function handleLoad() {
    if (performance.now() - loadStartRef.current < SPURIOUS_LOAD_THRESHOLD_MS) return;
    clearTimeout(timeoutRef.current);
    setIsLoading(false);
    setHasTimedOut(false);
  }

  // Best-effort fast path only — iframe `error` events are not reliable
  // for navigation-level failures (X-Frame-Options/CSP blocks typically
  // don't fire one at all), so this never substitutes for the timeout
  // above; it just lets a failure that *does* raise one surface sooner.
  function handleError() {
    setHasTimedOut(true);
  }

  function handleRetry() {
    trackClick("article_retry_load");
    setRetryCount((n) => n + 1);
  }

  return (
    <div className="relative h-full w-full">
      <iframe
        key={retryCount}
        ref={iframeRef}
        src={url}
        title="원문 기사"
        className="h-full w-full border-0"
        onLoad={handleLoad}
        onError={handleError}
      />

      <div
        aria-hidden={!isLoading}
        style={{ paddingBottom: bottomInsetPx }}
        className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background px-6 text-center transition-[padding,opacity] duration-300 ${
          isLoading ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {hasTimedOut ? (
          <>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-muted">
              <path
                d="M3 12a9 9 0 0 1 15-6.7M21 12a9 9 0 0 1-15 6.7M21 3v6h-6M3 21v-6h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[14px] font-semibold text-foreground">
              뉴스를 불러오지 못했어요
            </p>
            <p className="text-[13px] text-muted">뉴스를 다시 불러올까요?</p>
            <div className="mt-1 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-full bg-point px-5 py-2.5 text-[13px] font-semibold text-white active:bg-point-dark"
              >
                다시 불러오기
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("external_open_new_tab")}
                className="text-[12.5px] font-medium text-point"
              >
                새 탭에서 원문 보기 ↗
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-point" />
            <p className="text-[13px] text-muted">뉴스를 불러오는 중이에요</p>
          </>
        )}
      </div>
    </div>
  );
});

export default ArticleViewer;
