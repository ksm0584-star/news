"use client";

/**
 * Only ever mounted on the news-reading screen (src/app/record/new/external
 * /page.tsx), and only in its iframe+write-sheet view. `hidden` covers both
 * "the write sheet is expanded" and "the dictionary sheet is already open"
 * — the caller computes that, this component just doesn't render.
 *
 * Positioning:
 * - `bottomOffsetPx` tracks the write sheet's *current* height (caller
 *   computes it via useSheetHeightPx) so this sits just above it whether
 *   the sheet is minimized (~48px) or peek (up to ~46dvh/400px).
 * - `rightOffsetPx` is measured by the caller from the actual rendered
 *   mobile content column (see external/page.tsx's pageRootRef), not a
 *   fixed `right-Npx` Tailwind class. A fixed-position element's `right`
 *   is always relative to the true browser viewport, not the centered
 *   `max-w-[430px]` app column RootLayout renders on desktop — on a wide
 *   desktop window, `right-5` alone would land this 20px from the real
 *   browser edge, off in the empty margin outside the visible phone-width
 *   card, not "20px from the card's edge" as intended. Measuring the
 *   column's actual edge and computing `right` from that fixes it for any
 *   viewport width, mobile or desktop, without needing a portal.
 */
export default function TermDictionaryButton({
  hidden,
  rightOffsetPx,
  bottomOffsetPx,
  onClick,
}: {
  hidden: boolean;
  rightOffsetPx: number;
  bottomOffsetPx: number;
  onClick: () => void;
}) {
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="경제용어사전 열기"
      style={{
        right: `${rightOffsetPx}px`,
        bottom: `calc(${bottomOffsetPx}px + env(safe-area-inset-bottom) + 0.75rem)`,
      }}
      className="fixed z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-surface text-point shadow-lg shadow-black/10 active:bg-background"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M20 5.5c0-.83-.67-1.5-1.5-1.5H12v16h6.5c.83 0 1.5-.67 1.5-1.5v-13Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
