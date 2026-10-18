"use client";

import { useEffect, useRef, useState } from "react";

/** Mirrors Toast's own auto-dismiss pacing convention (Toast uses 3000ms for
 * a passive confirmation) — longer here since this banner asks for an
 * action, not just acknowledgement. */
const AUTO_DISMISS_MS = 8000;
/** Must match the Tailwind `duration-200` on the card below — the actual
 * unmount (via `onDismiss`) is deferred by this long so the fade/slide-out
 * has time to play before the element leaves the DOM. */
const EXIT_DURATION_MS = 200;

/**
 * Home-only snackbar — not a toast (an on-screen action, "기록하기", not
 * just a passive message) and not the old floating card this replaced
 * (no close button, no dim, single compact row). Sits just above BottomNav
 * (64px content height + safe-area + an 8px gap), using the same
 * `inset-x-0 mx-auto max-w-[430px]` centering BottomNav itself uses, so it
 * stays aligned with the app's mobile-width column on a wide desktop
 * window without needing a separate measured offset.
 *
 * This component only ever renders on the home screen, and the caller
 * (`src/app/page.tsx`) keys it by the return trip's `openedAt` so a second
 * "left for an article, came back" trip — while this one is still showing —
 * remounts it fresh: a new 8s timer and a new enter animation for the new
 * article, rather than reusing this instance's already-running timer.
 */
export default function ArticleReturnBanner({
  onRecord,
  onDismiss,
}: {
  onRecord: () => void;
  onDismiss: () => void;
}) {
  // Two-phase visibility so both the enter and the (auto-dismiss) exit get
  // a transition instead of popping in/out instantly: `visible` flips true
  // one frame after mount (enter), `closing` flips true when the 8s timer
  // fires (exit) — `onDismiss` itself (which actually removes this from
  // the tree, via the parent's `info` state) only runs after the exit
  // transition has had time to play.
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    autoDismissTimer.current = setTimeout(() => setClosing(true), AUTO_DISMISS_MS);
    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!closing) return;
    const timeout = setTimeout(onDismiss, EXIT_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [closing, onDismiss]);

  // Cancels the pending auto-dismiss the instant a press on "기록하기"
  // starts (pointerdown fires well before click) — otherwise an 8s timeout
  // landing mid-tap could flip `closing` and start removing this element
  // before the click event it's still waiting on ever fires.
  function cancelAutoDismiss() {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
  }

  return (
    <div
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom) + 0.5rem)" }}
      className="fixed inset-x-0 z-20 mx-auto w-full max-w-[430px] px-4"
    >
      <div
        className={`flex items-center gap-3 rounded-full bg-foreground/70 px-4 py-3 shadow-lg transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
          visible && !closing ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <p className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-white">
          방금 본 뉴스, 기록해 볼까요?
        </p>
        <button
          type="button"
          onPointerDown={cancelAutoDismiss}
          onClick={onRecord}
          className="shrink-0 rounded-full bg-point px-3 py-2 type-record-action text-white active:bg-point-dark"
        >
          기록하기
        </button>
      </div>
    </div>
  );
}
