"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginRequiredModal from "./LoginRequiredModal";
import { useAuth } from "@/lib/auth-context";
import { trackClick } from "@/lib/mixpanel";

const SIDE_TABS = [
  {
    href: "/",
    label: "뉴스",
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
  },
  {
    href: "/records",
    label: "내 기록",
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
  },
];

/**
 * Only shown on the two top-level tab screens (`/`, `/records`) — every
 * other route (article reading/writing, record detail/edit, login, etc.)
 * keeps its own BackHeader and back-button flow instead, so this checks an
 * allowlist rather than trying to enumerate every screen to hide on.
 *
 * The center "기록하기" item reuses the exact same destination and
 * login-gate behavior FabButton used to provide (that component is no
 * longer mounted anywhere — see the home page) — /record/new and
 * everything downstream of it (URL input, write form, save) is completely
 * unchanged, this is only a different entry point into it.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (pathname !== "/" && pathname !== "/records") return null;

  function handleWriteClick(event: MouseEvent<HTMLAnchorElement>) {
    trackClick("write_nav_center");
    if (!user) {
      event.preventDefault();
      setShowLoginModal(true);
    }
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-border-subtle bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-14">
          <Link
            href={SIDE_TABS[0].href}
            aria-current={pathname === SIDE_TABS[0].href ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              pathname === SIDE_TABS[0].href ? "text-point" : "text-muted"
            }`}
          >
            {SIDE_TABS[0].icon}
            {SIDE_TABS[0].label}
          </Link>

          <Link
            href="/record/new"
            onClick={handleWriteClick}
            className="flex flex-1 flex-col items-center justify-center gap-0.5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-point text-[18px] font-semibold leading-none text-white">
              +
            </span>
            <span className="text-[11px] font-medium text-point">기록하기</span>
          </Link>

          <Link
            href={SIDE_TABS[1].href}
            aria-current={pathname === SIDE_TABS[1].href ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              pathname === SIDE_TABS[1].href ? "text-point" : "text-muted"
            }`}
          >
            {SIDE_TABS[1].icon}
            {SIDE_TABS[1].label}
          </Link>
        </div>
      </nav>

      {showLoginModal ? (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      ) : null}
    </>
  );
}
