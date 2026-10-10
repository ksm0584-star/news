"use client";

import { useEffect } from "react";
import Link from "next/link";
import LatestNewsList from "@/components/LatestNewsList";
import { track } from "@/lib/mixpanel";

export default function HomePage() {
  useEffect(() => {
    track("home_viewed");
  }, []);

  return (
    <div style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}>
      <header className="flex items-center justify-between px-5 pt-6 pb-1">
        <h1 className="text-xl font-extrabold text-foreground">모아요</h1>
        <Link
          href="/mypage"
          aria-label="마이페이지"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted active:bg-border-subtle"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
            <path
              d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </header>

      <LatestNewsList />
    </div>
  );
}
