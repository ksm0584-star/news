"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Collapses the sheet when the user interacts with the article behind it.
 *
 * Two signals, with different reliability:
 * - Tapping the iframe: cross-origin content never bubbles click/scroll
 *   events to the parent page, so there is no direct way to see "the user
 *   tapped/scrolled inside the article." The one thing the browser *does*
 *   expose is a `blur` event on the parent window the moment focus moves
 *   into the iframe — that's a focus-change signal, not a read of the
 *   iframe's content, so it works even cross-origin. We use it here.
 * - Tapping the non-iframe fallback card (unsupported domains): that's our
 *   own same-origin DOM, so a plain pointerdown handler on the article area
 *   (wired by the caller) already covers it — no special-casing needed.
 *
 * Limitation (no safe workaround exists): scrolling *inside* a cross-origin
 * iframe's content cannot be observed from the parent at all — there's no
 * API for it, and the iframed site would have to opt in via postMessage,
 * which we don't control. The blur signal above only fires once, on the
 * first tap that moves focus into the frame; further scrolling inside it
 * afterward is invisible to us.
 */
export function useCollapseSheetOnArticleActivity(
  isSheetOpen: boolean,
  iframeRef: RefObject<HTMLIFrameElement | null>,
  onCollapse: () => void,
): void {
  useEffect(() => {
    if (!isSheetOpen) return;

    function onWindowBlur() {
      // document.activeElement only reflects the iframe after the blur
      // event finishes dispatching, so this has to run on the next tick.
      setTimeout(() => {
        if (document.activeElement === iframeRef.current) {
          onCollapse();
        }
      }, 0);
    }

    window.addEventListener("blur", onWindowBlur);
    return () => window.removeEventListener("blur", onWindowBlur);
  }, [isSheetOpen, iframeRef, onCollapse]);
}
