"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

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

  const dragHandlers = {
    onPointerDown: beginDrag,
    onPointerMove: updateDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      style={dragHeightPx !== null ? { height: `${dragHeightPx}px`, transition: "none" } : undefined}
      className={`fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] flex flex-col rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-[height] duration-200 ease-out ${
        isOpen
          ? state === "expanded"
            ? "h-[78dvh] max-h-[640px]"
            : "h-[46dvh] max-h-[400px]"
          : "h-12"
      }`}
    >
      {isOpen ? (
        <>
          {/* Handle + expand control share one row: drag-enabled (so
              dragging from here also works), but pointerdown on the
              button(s) stops propagation so their own onClick — not the
              row's drag/tap logic — handles taps. The handle is positioned
              absolutely so it stays centered on the sheet's full width no
              matter how wide the button(s) next to it are. */}
          <div
            {...dragHandlers}
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
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={onToggleExpand}
              className="ml-auto rounded-full px-3 py-1.5 text-[12.5px] font-medium text-point active:bg-background"
            >
              {state === "expanded" ? "작게 보기" : "크게 보기"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3">{children}</div>

          {footer ? <div className="border-t border-border-subtle px-5 py-3">{footer}</div> : null}
        </>
      ) : (
        <button
          type="button"
          {...dragHandlers}
          onKeyDown={handleMinimizedKeyDown}
          aria-label={minimizedLabel}
          className="flex h-12 w-full touch-none items-center justify-center px-5"
        >
          <span className="h-1 w-10 shrink-0 rounded-full bg-border-subtle" />
        </button>
      )}
    </div>
  );
}
