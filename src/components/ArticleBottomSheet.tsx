"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

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

const DRAG_TO_COLLAPSE_THRESHOLD_PX = 48;

export default function ArticleBottomSheet({
  state,
  ariaLabel,
  minimizedLabel,
  onOpen,
  onCollapse,
  onToggleExpand,
  children,
  footer,
}: {
  state: SheetPanelState;
  ariaLabel: string;
  minimizedLabel: string;
  onOpen: () => void;
  onCollapse: () => void;
  onToggleExpand: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const isOpen = state !== "minimized";
  const dragStartY = useRef<number | null>(null);

  function handleDragStart(event: PointerEvent<HTMLDivElement>) {
    dragStartY.current = event.clientY;
  }

  function handleDragMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null) return;
    const delta = event.clientY - dragStartY.current;
    if (delta > DRAG_TO_COLLAPSE_THRESHOLD_PX) {
      dragStartY.current = null;
      onCollapse();
    }
  }

  function handleDragEnd() {
    dragStartY.current = null;
  }

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={`fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] flex flex-col rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-[height] duration-200 ease-out ${
        isOpen
          ? state === "expanded"
            ? "h-[78dvh] max-h-[640px]"
            : "h-[46dvh] max-h-[400px]"
          : "h-16"
      }`}
    >
      {isOpen ? (
        <>
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <button
              type="button"
              onClick={onCollapse}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-foreground/70 active:bg-background"
            >
              ← 기사로 돌아가기
            </button>
            <button
              type="button"
              onClick={onToggleExpand}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-point active:bg-background"
            >
              {state === "expanded" ? "작게 보기" : "크게 보기"}
            </button>
          </div>

          {/* Drag handle: swipe down to collapse. Kept separate from the
              scrollable content below so dragging here never fights with
              scrolling the sheet's own content. */}
          <div
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            className="flex shrink-0 touch-none items-center justify-center py-2"
          >
            <span className="h-1 w-10 rounded-full bg-border-subtle" />
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3">{children}</div>

          {footer ? <div className="border-t border-border-subtle px-5 py-3">{footer}</div> : null}
        </>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="flex h-16 w-full items-center justify-center gap-2 px-5"
        >
          <span className="h-1 w-10 shrink-0 rounded-full bg-border-subtle" />
          <span className="text-[14px] font-semibold text-foreground">{minimizedLabel}</span>
        </button>
      )}
    </div>
  );
}
