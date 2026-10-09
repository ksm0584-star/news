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
 */
export function useKeyboardInsetPx(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    function update() {
      const next = window.innerHeight - viewport!.height - viewport!.offsetTop;
      setInset(Math.max(0, Math.round(next)));
    }
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
