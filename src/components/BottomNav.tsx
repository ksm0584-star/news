"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@/lib/mixpanel";

const TABS = [
  {
    href: "/",
    label: "뉴스",
    tab: "news",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M7 8h6M7 11h6M7 14h3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M17 7h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    onboardingTarget: undefined,
  },
  {
    href: "/records",
    label: "내 기록",
    tab: "records",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
    onboardingTarget: "records-nav",
  },
  {
    href: "/mypage",
    label: "마이페이지",
    tab: "mypage",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    onboardingTarget: undefined,
  },
] as const;

/**
 * Only shown on the three top-level tab screens (`/`, `/records`,
 * `/mypage`) — every other route (article reading/writing, record
 * detail/edit, login, etc.) keeps its own BackHeader and back-button flow
 * instead, so this checks an allowlist rather than trying to enumerate
 * every screen to hide on.
 *
 * The old center "기록하기" item is gone — that entry point is now the
 * floating RecordFab (mounted directly by src/app/page.tsx and
 * src/app/records/page.tsx), shown only on the two screens where writing a
 * new record makes sense (`/`, `/records`), independent of this nav's own
 * three tabs.
 */
export default function BottomNav() {
  const pathname = usePathname();

  if (!TABS.some((tab) => tab.href === pathname)) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-border-subtle bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-14">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={() => track("bottom_nav_clicked", { tab: tab.tab })}
            aria-current={pathname === tab.href ? "page" : undefined}
            data-onboarding-target={tab.onboardingTarget}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              pathname === tab.href ? "text-point" : "text-muted"
            }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
