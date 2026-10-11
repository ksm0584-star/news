"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import LatestNewsList from "@/components/LatestNewsList";
import ArticleReturnBanner from "@/components/ArticleReturnBanner";
import RecordFab from "@/components/RecordFab";
import { useArticleReturnBanner } from "@/lib/use-article-return-banner";
import { track } from "@/lib/mixpanel";

export default function HomePage() {
  const { info: articleReturnInfo, onRecord, onDismiss } = useArticleReturnBanner();

  // Guards against React Strict Mode's dev-only double effect invoke,
  // which would otherwise double-count every home_viewed in development
  // (see record_viewed/dictionary_history_open for the same pattern).
  const trackedViewRef = useRef(false);
  useEffect(() => {
    if (trackedViewRef.current) return;
    trackedViewRef.current = true;
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

      {articleReturnInfo ? (
        <ArticleReturnBanner onRecord={onRecord} onDismiss={onDismiss} />
      ) : null}

      {/* Both CTAs write a record, so only one shows at a time — driven by
          the same articleReturnInfo the banner above uses, not a separate
          check. */}
      <RecordFab hidden={Boolean(articleReturnInfo)} />
    </div>
  );
}
