"use client";

import Link from "next/link";
import { trackClick } from "@/lib/mixpanel";

/**
 * The "기록하기" entry point, now a floating action button instead of
 * BottomNav's old center item (that nav is three equal tabs now: 뉴스/내
 * 기록/마이페이지).
 *
 * Mounted directly by the two pages where starting a new record makes
 * sense (src/app/page.tsx, src/app/records/page.tsx) rather than globally
 * from the root layout — that's what lets the home screen pass `hidden`
 * straight from its own existing article-return-banner state (see
 * page.tsx's `articleReturnInfo`) instead of this component re-deriving
 * "is the banner showing" through a second, separate check. Both CTAs
 * (banner, FAB) are then driven by that one source of truth, never out of
 * sync. Every other screen (마이페이지, record write/detail, etc.) simply
 * never mounts this component, so its exposure there is unaffected.
 *
 * Positioned the same way BottomNav/ArticleReturnBanner already are
 * (`inset-x-0 mx-auto max-w-[430px]`, not a bare `right-4`) so its right
 * edge tracks the mobile-width app column's real edge instead of the raw
 * browser viewport edge on a wide desktop window. `fixed` positioning
 * means toggling `hidden` never shifts any other element's layout.
 *
 * /record/new and everything downstream of it (URL input, write form,
 * save — including the anonymous/local-storage write path) is completely
 * unchanged; this is only a different entry point into it.
 */
export default function RecordFab({ hidden = false }: { hidden?: boolean }) {
  if (hidden) return null;

  return (
    <div
      style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom) + 0.75rem)" }}
      className="pointer-events-none fixed inset-x-0 z-30 mx-auto w-full max-w-[430px] px-4"
    >
      <div className="flex justify-end">
        <Link
          href="/record/new"
          onClick={() => trackClick("write_nav_center")}
          data-onboarding-target="write-nav"
          aria-label="기록하기"
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-point text-white shadow-lg shadow-black/25 active:bg-point-dark"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M14.5 5.5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
