"use client";

/**
 * Only ever mounted on the news-reading/writing screen
 * (src/app/record/new/external/page.tsx). `hidden` covers both "the
 * dictionary sheet is already open" and anything else the caller wants to
 * hide it for — the caller decides, this component just doesn't render.
 *
 * Positioning — both offsets are real DOM measurements the caller takes
 * (via getBoundingClientRect()), not logical/estimated values, so they
 * already fully account for safe-area insets and the live keyboard inset
 * themselves. This component applies them as plain pixel values with no
 * further `calc()`/`env()` addition, to avoid double-counting whatever
 * the caller already measured:
 * - `bottomOffsetPx`: the live distance from the viewport's bottom edge
 *   up to just above whatever's currently pinned to the bottom of this
 *   screen (e.g. the fixed save-button footer), plus the caller's own gap.
 * - `rightOffsetPx`: measured from the actual rendered mobile content
 *   column (see external/page.tsx's pageRootRef), not a fixed `right-Npx`
 *   Tailwind class. A fixed-position element's `right` is always relative
 *   to the true browser viewport, not the centered `max-w-[430px]` app
 *   column RootLayout renders on desktop — on a wide desktop window,
 *   `right-5` alone would land this 20px from the real browser edge, off
 *   in the empty margin outside the visible phone-width card, not "20px
 *   from the card's edge" as intended. Measuring the column's actual edge
 *   and computing `right` from that fixes it for any viewport width,
 *   mobile or desktop, without needing a portal.
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
        bottom: `${bottomOffsetPx}px`,
      }}
      className="fixed z-40 flex h-[56px] w-[56px] flex-col items-center justify-center gap-0 rounded-full border border-border-subtle bg-surface text-point shadow-lg shadow-black/10 active:bg-background"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 7v14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[10px] font-semibold">사전</span>
    </button>
  );
}
