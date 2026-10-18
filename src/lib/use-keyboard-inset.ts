"use client";

import { useEffect, useState } from "react";

/**
 * How much of the bottom of the layout viewport the on-screen keyboard is
 * currently covering, derived live from the Visual Viewport API — never a
 * fixed assumed keyboard height, since that varies by device, keyboard, and
 * browser. 0 whenever there's no keyboard (or no VisualViewport support).
 *
 * `window.innerHeight` stays pinned to the full layout viewport (what
 * `position: fixed` elements are positioned against) while
 * `visualViewport.height`/`offsetTop` shrink/shift to the actually-visible
 * area once a keyboard opens — the gap between them is the keyboard.
 *
 * iOS Safari fires several `resize`/`scroll` events on `visualViewport` in
 * quick succession while the keyboard is animating open or closed — each
 * one used to trigger its own `setInset`, so every `position: fixed`
 * element reading this value could re-render against a slightly different,
 * not-yet-settled number on the very same visual frame (visible as a brief
 * lag/jump, worse the more elements derive further positioning from this
 * one, like TermDictionaryButton deriving its own offset from the fixed
 * footer that itself depends on this hook). Coalescing every burst into a
 * single `requestAnimationFrame` read makes every consumer settle on the
 * same one number per frame instead of racing each other through it.
 */
export function useKeyboardInsetPx(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    let rafId: number | null = null;
    function update() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const next = window.innerHeight - viewport!.height - viewport!.offsetTop;
        setInset(Math.max(0, Math.round(next)));
      });
    }
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
