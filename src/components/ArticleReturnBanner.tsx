"use client";

/**
 * Home-only floating CTA banner — not a toast (no auto-dismiss timer) and
 * not a modal/bottom-sheet (doesn't block the rest of the screen). Sits
 * just above BottomNav (64px content height + safe-area + an 8px gap), using the same
 * `inset-x-0 mx-auto max-w-[430px]` centering BottomNav itself uses, so it
 * stays aligned with the app's mobile-width column on a wide desktop
 * window without needing a separate measured offset.
 *
 * This component only ever renders on the home screen. The floating
 * "기록하기" FAB (`RecordFab`) that used to also float here — and later on
 * `/records` — has been removed entirely (recording now starts from each
 * news card's own "기록하기" action instead), so there's no second floating
 * CTA here to coordinate visibility with.
 */
export default function ArticleReturnBanner({
  onRecord,
  onDismiss,
}: {
  onRecord: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      style={{ bottom: "calc(4rem + env(safe-area-inset-bottom) + 0.5rem)" }}
      className="fixed inset-x-0 z-20 mx-auto w-full max-w-[430px] px-4"
    >
      {/* relative so the close button can sit absolutely in the corner —
          title/subtext are centered across the card's full width, so they
          can no longer share a flex row with it (that row's own layout
          would narrow and off-center the text column instead). */}
      <div className="relative rounded-2xl border border-border-subtle bg-surface px-4 py-5 shadow-lg">
        <button
          type="button"
          onClick={onDismiss}
          aria-label="닫기"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted active:bg-background"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <p className="text-center text-[18px] font-bold leading-snug text-foreground">
          방금 본 뉴스, 기록해 볼까요?
        </p>
        {/* mt-1.5 (6px) — the same title↔description gap EmptyState uses
            (its `gap-1.5` flex-col), reused rather than picking a new
            arbitrary value. */}
        <p className="mt-1.5 text-center text-[16px] font-medium text-muted">떠오른 생각을 남겨보세요.</p>
        <button
          type="button"
          onClick={onRecord}
          className="button-48 mt-8 w-full rounded-xl bg-point type-button text-white active:bg-point-dark"
        >
          기록하기
        </button>
      </div>
    </div>
  );
}
