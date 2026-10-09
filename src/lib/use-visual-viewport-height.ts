"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the visual viewport (not the layout viewport) so UI sized from it
 * stays correct when the on-screen keyboard opens — some mobile browsers
 * resize the layout viewport on keyboard open, others only shrink the
 * visual one, so this is the one signal that works either way.
 *
 * Listens to both `resize` and `scroll`: iOS Safari/Chrome can shift the
 * visual viewport's `offsetTop` (e.g. auto-scrolling to keep a focused
 * input visible) via a `scroll` event without a `height` change. Callers
 * that also read useKeyboardInsetPx's `bottom` offset (which already
 * listens to both) need this height to update in the same tick that does
 * — otherwise the sheet's height and position can briefly fall out of
 * sync during a keyboard transition, which looks like the layout glitching.
 */
export function useVisualViewportHeight(): number | undefined {
  const [height, setHeight] = useState<number | undefined>(() =>
    typeof window !== "undefined" ? window.visualViewport?.height : undefined,
  );

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    function update() {
      setHeight(viewport!.height);
    }
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return height;
}
