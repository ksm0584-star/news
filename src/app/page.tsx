"use client";

import { useEffect, useRef } from "react";
import LatestNewsList from "@/components/LatestNewsList";
import ArticleReturnBanner from "@/components/ArticleReturnBanner";
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
    <div style={{ paddingBottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}>
      <header className="flex items-center justify-between px-5 pt-6 pb-1">
        <h1 className="text-xl font-extrabold text-foreground">모아요</h1>
      </header>

      <LatestNewsList />

      {articleReturnInfo ? (
        <ArticleReturnBanner onRecord={onRecord} onDismiss={onDismiss} />
      ) : null}
    </div>
  );
}
