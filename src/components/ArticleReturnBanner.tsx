"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

/** Mirrors Toast's own auto-dismiss pacing convention (Toast uses 3000ms for
 * a passive confirmation) — longer here since this banner asks for an
 * action, not just acknowledgement. */
const AUTO_DISMISS_MS = 8000;
/** Must match the Tailwind `duration-200` on the card below — the actual
 * unmount (via `onDismiss`) is deferred by this long so the fade/slide-out
 * has time to play before the element leaves the DOM. */
const EXIT_DURATION_MS = 200;
/** How far down (px) a swipe must travel before release counts as "close"
 * rather than "snap back". */
const SWIPE_DISMISS_THRESHOLD_PX = 50;
/** How far down (px) the card animates to once a swipe past the threshold
 * is released — continues the finger's own downward motion rather than
 * only playing the auto-dismiss exit's much smaller 8px nudge. */
const SWIPE_EXIT_DISTANCE_PX = 120;
/** Below this much total movement, a pointer down→up is still a tap (lets
 * "기록하기" register normally) rather than a drag. */
const DRAG_DEADZONE_PX = 8;

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

  // Swipe-to-dismiss. `dragY`/`dragging` only ever get touched by the
  // pointer handlers below — the pre-existing auto-dismiss path (timer →
  // `closing`) never sets them, so that path's rendering stays byte-for-byte
  // what it already was (see the style/className logic further down).
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const activePointerId = useRef<number | null>(null);
  // Set the instant a drag crosses the tap deadzone; an onClickCapture on
  // the card swallows the click this produces so a swipe that happened to
  // start or end over "기록하기" can never also fire its action.
  const suppressNextClick = useRef(false);

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

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (closing || !event.isPrimary) return;
    dragStartY.current = event.clientY;
    activePointerId.current = event.pointerId;
    // Pointer capture is deliberately NOT taken here — capturing on every
    // press (even a plain tap) redirects the browser's own synthesized
    // click away from whatever's actually under the finger (e.g.
    // "기록하기"), which broke its click entirely. It's taken below, only
    // once a press has proven to be an actual drag.
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null || event.pointerId !== activePointerId.current) return;
    const delta = event.clientY - dragStartY.current;
    // Upward movement never moves the card ("위로 스와이프: 닫히지
    // 않음") and can't accumulate toward the dismiss threshold either.
    const nextDragY = Math.max(0, delta);
    if (!dragging && Math.abs(delta) > DRAG_DEADZONE_PX) {
      setDragging(true);
      // A real drag just started (not a tap) — once this gesture ends,
      // the click it would otherwise produce on whatever's underneath
      // the finger (e.g. "기록하기") must not fire.
      suppressNextClick.current = true;
      cancelAutoDismiss();
      // Capture only now: this is confirmed to be a drag, so keeping
      // pointermove/pointerup targeted at this element (even if the
      // finger drifts off it) is exactly what's wanted, and any
      // click-redirection side effect no longer matters since
      // suppressNextClick already swallows that click either way.
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (dragging || nextDragY > 0) setDragY(nextDragY);
  }

  function endDrag(shouldDismiss: boolean) {
    dragStartY.current = null;
    activePointerId.current = null;
    setDragging(false);
    if (shouldDismiss) {
      setDragY(SWIPE_EXIT_DISTANCE_PX);
      setClosing(true);
    } else {
      setDragY(0);
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null || event.pointerId !== activePointerId.current) return;
    endDrag(dragY >= SWIPE_DISMISS_THRESHOLD_PX);
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null || event.pointerId !== activePointerId.current) return;
    endDrag(false);
  }

  // Swallows exactly the click a just-finished drag would otherwise
  // produce on a child (the capture phase runs before "기록하기"'s own
  // onClick) — a keyboard-triggered click never goes through the pointer
  // handlers above, so this never touches Enter/Space activation.
  function handleClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (!suppressNextClick.current) return;
    suppressNextClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom) + 0.5rem)" }}
      className="fixed inset-x-0 z-20 mx-auto w-full max-w-[430px] px-4"
    >
      <div
        // Inline transform only while an actual drag is in play (dragging,
        // or settling back to 0 / out to the exit distance) — otherwise
        // `undefined` so the auto-dismiss path's className transform
        // (translate-y-0 / translate-y-2 below) is the only thing in
        // control, exactly as before this feature existed. `transition:
        // "none"` while actively dragging gives 1:1 finger tracking;
        // omitting it once the pointer lifts lets the element's own
        // existing `transition-[opacity,transform] duration-200` (still
        // applied via className, untouched) animate the snap-back or the
        // swipe-exit, so no new transition timing was introduced.
        style={
          dragging || dragY !== 0
            ? { transform: `translateY(${dragY}px)`, transition: dragging ? "none" : undefined }
            : undefined
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
        className={`touch-none flex items-center gap-3 rounded-full bg-foreground/70 px-4 py-3 shadow-lg transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
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
