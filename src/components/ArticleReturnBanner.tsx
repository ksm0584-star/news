"use client";

/**
 * Home-only floating CTA banner — not a toast (no auto-dismiss timer) and
 * not a modal/bottom-sheet (doesn't block the rest of the screen). Sits
 * just above BottomNav (64px content height + safe-area + an 8px gap), using the same
 * `inset-x-0 mx-auto max-w-[430px]` centering BottomNav itself uses, so it
 * stays aligned with the app's mobile-width column on a wide desktop
 * window without needing a separate measured offset.
 *
 * This component only ever renders on the home screen, where RecordFab is
 * also only ever mounted — but whenever this banner is showing, the home
 * page passes RecordFab `hidden={Boolean(articleReturnInfo)}`, so the two
 * are never visible at the same time. No extra clearance for the FAB's own
 * height is needed here (there used to be — removed, since it just left a
 * large empty gap once the FAB started hiding behind this banner instead
 * of sitting beside it).
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
      <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface p-4 shadow-lg">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-foreground">
            방금 본 뉴스, 기록해 볼까요?
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted">떠오른 생각을 남겨보세요.</p>
          <button
            type="button"
            onClick={onRecord}
            className="button-48 mt-3 rounded-full bg-point px-4 type-button text-white active:bg-point-dark"
          >
            기록하기
          </button>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="닫기"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted active:bg-background"
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
      </div>
    </div>
  );
}
