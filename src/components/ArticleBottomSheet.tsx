"use client";

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { useVisualViewportHeight } from "@/lib/use-visual-viewport-height";
import { useKeyboardInsetPx } from "@/lib/use-keyboard-inset";

/**
 * "minimized": a slim always-visible handle bar — doesn't block reading.
 * "peek"/"expanded": the sheet's content, at two heights, both sized from
 * the viewport (dvh) with a px max-height ceiling for larger screens, so it
 * never approaches "takes over the whole screen" on any mobile size.
 *
 * Shared shell for both the external-article write panel
 * (ExternalArticleWritePanel) and the record-detail read-only viewer
 * (RecordBottomSheet) — same minimize/peek/expand mechanics and layout,
 * different content passed as children.
 *
 * Focusing an input/textarea inside `children` temporarily overrides the
 * resting height to fill the current Visual Viewport (the keyboard-aware
 * one), and lifts the sheet's `bottom` by the keyboard's live inset — see
 * useKeyboardInsetPx/useVisualViewportHeight below. `state` itself is never
 * touched by this, so blurring back out simply falls back to whatever
 * height `state` already resolves to.
 */
export type SheetPanelState = "minimized" | "peek" | "expanded";

// Mirrors the h-12 / h-[46dvh] max-h-[400px] / h-[78dvh] max-h-[640px]
// classes used below — this is only a numeric estimate for clamping the
// *live* drag height; the resting (non-dragging) height is always driven by
// those CSS classes, which this does not change.
const MINIMIZED_PX = 48;
const PEEK_FRACTION = 0.46;
const PEEK_MAX_PX = 400;
const EXPANDED_FRACTION = 0.78;
const EXPANDED_MAX_PX = 640;

const TAP_MAX_MOVEMENT_PX = 10;
const DRAG_DISTANCE_THRESHOLD_PX = 40;
const FLICK_VELOCITY_PX_PER_MS = 0.5;

// Cosmetic-only top gap for the keyboard-expanded height below, so the
// sheet's rounded top corners still peek into view — not a keyboard height
// assumption. The actual available height always comes from the live
// Visual Viewport reading (see useKeyboardInsetPx/useVisualViewportHeight).
const KEYBOARD_EXPANDED_TOP_GAP_PX = 24;

function restingHeightPx(state: SheetPanelState, viewportHeight: number): number {
  if (state === "minimized") return MINIMIZED_PX;
  if (state === "peek") return Math.min(viewportHeight * PEEK_FRACTION, PEEK_MAX_PX);
  return Math.min(viewportHeight * EXPANDED_FRACTION, EXPANDED_MAX_PX);
}

interface DragTracking {
  startY: number;
  startHeight: number;
  maxHeight: number;
  lastY: number;
  lastTime: number;
  velocity: number;
}

export default function ArticleBottomSheet({
  state,
  ariaLabel,
  minimizedLabel,
  showBackButton = true,
  minimizedVariant = "handle",
  showExpandButton = true,
  onOpen,
  onCollapse,
  onToggleExpand,
  children,
  footer,
}: {
  state: SheetPanelState;
  ariaLabel: string;
  minimizedLabel: string;
  showBackButton?: boolean;
  /**
   * "handle" (default): the slim drag-handle-only bar every caller has
   * always used. "cta": a full-width primary-colored button showing
   * `minimizedLabel` as visible text instead — for a screen that isn't
   * open by default and needs an obvious "start writing" entry point
   * rather than a discoverable-by-dragging handle. Same tap-to-open/
   * drag-to-open mechanics either way, just the visual treatment differs.
   */
  minimizedVariant?: "handle" | "cta";
  /**
   * true (default): the open-state header row keeps its explicit "크게
   * 보기"/"작게 보기" text button, and a plain tap elsewhere on that row
   * collapses the sheet — the original behavior, unchanged for any caller
   * that doesn't pass this.
   * false: no separate button — the handle itself becomes the
   * expand/collapse toggle (tap it, or Enter/Space when focused), since
   * there's nothing else in that row to tap once the button's gone.
   */
  showExpandButton?: boolean;
  onOpen: () => void;
  onCollapse: () => void;
  onToggleExpand: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const isOpen = state !== "minimized";

  // Non-null only while an active drag is in progress — overrides the CSS
  // class height so the sheet's edge follows the finger 1:1. Cleared on
  // release, letting the class-driven `transition-[height]` snap it to
  // whichever state the gesture resolved to.
  const [dragHeightPx, setDragHeightPx] = useState<number | null>(null);
  const dragRef = useRef<DragTracking | null>(null);

  // True while focus is somewhere inside `children` (a field in the write
  // form) — used to temporarily expand the sheet so the keyboard can't
  // cover whatever's focused. Cleared on blur-out; also falls back to
  // false on its own when the sheet closes, since its content (and
  // whatever's focused inside it) unmounts then, which blurs it first.
  // `isOpen &&` at the point of use below is a belt-and-suspenders guard
  // against briefly reusing a stale `true` from the sheet's previous open.
  const [isInputFocused, setIsInputFocused] = useState(false);
  const viewportHeight = useVisualViewportHeight();
  const keyboardInsetPx = useKeyboardInsetPx();

  function handleContentFocus() {
    setIsInputFocused(true);
  }

  function handleContentBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsInputFocused(false);
    }
  }

  // Re-asserts (not just a one-time nudge on the initial focus event) that
  // the focused field is visible, every time the keyboard-aware geometry
  // actually changes — the keyboard animates open over ~250ms and the
  // sheet's own height/position catch up to it across several
  // resize/scroll events, not instantly, so a single scrollIntoView call
  // made at the moment of focus tends to run against stale geometry and
  // land the field behind the footer. Re-running on every settle keeps it
  // correct through the whole transition.
  useEffect(() => {
    if (!isInputFocused) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isInputFocused, viewportHeight, keyboardInsetPx]);

  function beginDrag(event: PointerEvent<HTMLElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const startHeight = restingHeightPx(state, viewportHeight);
    dragRef.current = {
      startY: event.clientY,
      startHeight,
      maxHeight: Math.max(
        restingHeightPx("peek", viewportHeight),
        restingHeightPx("expanded", viewportHeight),
      ),
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
    };
    setDragHeightPx(startHeight);
  }

  function updateDrag(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    const timeDelta = event.timeStamp - drag.lastTime;
    if (timeDelta > 0) {
      drag.velocity = (drag.lastY - event.clientY) / timeDelta;
    }
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;

    const movedUp = drag.startY - event.clientY;
    setDragHeightPx(Math.min(Math.max(drag.startHeight + movedUp, MINIMIZED_PX), drag.maxHeight));
  }

  function endDrag(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragHeightPx(null);
    if (!drag) return;

    const movedUp = drag.startY - event.clientY; // positive = dragged up
    if (Math.abs(movedUp) <= TAP_MAX_MOVEMENT_PX) {
      if (state === "minimized") onOpen();
      // With no separate "크게 보기" button (showExpandButton={false}),
      // nothing else in this row is tappable besides the back button
      // (which stops propagation and handles its own tap), so the row's
      // own tap takes over that button's job instead of collapsing.
      else if (!showExpandButton) onToggleExpand();
      else onCollapse();
      return;
    }

    const draggedUpEnough =
      movedUp > DRAG_DISTANCE_THRESHOLD_PX || drag.velocity > FLICK_VELOCITY_PX_PER_MS;
    const draggedDownEnough =
      movedUp < -DRAG_DISTANCE_THRESHOLD_PX || drag.velocity < -FLICK_VELOCITY_PX_PER_MS;

    if (draggedUpEnough) {
      if (state === "minimized") onOpen();
      else if (state === "peek") onToggleExpand();
      // already expanded — nothing further up to go.
    } else if (draggedDownEnough) {
      if (state === "expanded") onToggleExpand();
      else if (state === "peek") onCollapse();
      // already minimized — nothing further down to go.
    }
    // Otherwise: didn't clear the threshold — dragHeightPx is already
    // cleared above, so it snaps back to the current state's CSS height.
  }

  function handleMinimizedKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  }

  // The handle row's expand/collapse toggle is otherwise only reachable by
  // pointer (tap/drag) — this keeps it keyboard-operable too, the same way
  // the minimized button already is.
  function handleHandleRowKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggleExpand();
    }
  }

  const dragHandlers = {
    onPointerDown: beginDrag,
    onPointerMove: updateDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  const keyboardExpandedHeightPx =
    isOpen && isInputFocused && viewportHeight
      ? Math.max(MINIMIZED_PX, viewportHeight - KEYBOARD_EXPANDED_TOP_GAP_PX)
      : null;

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      style={{
        bottom: keyboardInsetPx,
        ...(dragHeightPx !== null
          ? { height: `${dragHeightPx}px`, transition: "none" }
          : keyboardExpandedHeightPx !== null
            ? { height: `${keyboardExpandedHeightPx}px` }
            : {}),
      }}
      className={`fixed inset-x-0 z-40 mx-auto w-full max-w-[430px] flex flex-col rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-[height,bottom] duration-200 ease-out ${
        isOpen
          ? state === "expanded"
            ? "h-[78dvh] max-h-[640px]"
            : "h-[46dvh] max-h-[400px]"
          : "h-12"
      }`}
    >
      {isOpen ? (
        <>
          {/* Drag-enabled (dragging from here resizes the sheet, same as
              before). Pointerdown on the button(s) stops propagation so
              their own onClick — not the row's drag/tap logic — handles
              taps. The handle is positioned absolutely so it stays
              centered on the sheet's full width no matter how wide the
              button(s) next to it are.
              With showExpandButton={false}, there's no separate "크게
              보기" button left to tap, so the row itself (effectively
              just the handle) becomes the expand/collapse toggle — see
              endDrag's tap handling — and gets the button semantics/
              keyboard support that button would otherwise have provided. */}
          <div
            {...dragHandlers}
            {...(!showExpandButton
              ? {
                  role: "button" as const,
                  tabIndex: 0,
                  "aria-label": state === "expanded" ? "작게 보기" : "크게 보기",
                  onKeyDown: handleHandleRowKeyDown,
                }
              : {})}
            className="relative flex shrink-0 touch-none items-center px-4 py-3"
          >
            <span className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border-subtle" />
            {showBackButton ? (
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={onCollapse}
                className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-foreground/70 active:bg-background"
              >
                ← 기사로 돌아가기
              </button>
            ) : null}
            {showExpandButton ? (
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={onToggleExpand}
                className="ml-auto rounded-full px-3 py-1.5 text-[12.5px] font-medium text-point active:bg-background"
              >
                {state === "expanded" ? "작게 보기" : "크게 보기"}
              </button>
            ) : null}
          </div>

          <div
            onFocus={handleContentFocus}
            onBlur={handleContentBlur}
            className="flex-1 overflow-y-auto overscroll-contain px-5 py-3"
          >
            {children}
          </div>

          {footer ? <div className="border-t border-border-subtle px-5 py-3">{footer}</div> : null}
        </>
      ) : (
        <button
          type="button"
          {...dragHandlers}
          onKeyDown={handleMinimizedKeyDown}
          aria-label={minimizedLabel}
          className={
            minimizedVariant === "cta"
              ? "flex h-12 w-full touch-none items-center justify-center rounded-t-3xl bg-point text-[15px] font-semibold text-white"
              : "flex h-12 w-full touch-none items-center justify-center px-5"
          }
        >
          {minimizedVariant === "cta" ? (
            minimizedLabel
          ) : (
            <span className="h-1 w-10 shrink-0 rounded-full bg-border-subtle" />
          )}
        </button>
      )}
    </div>
  );
}
