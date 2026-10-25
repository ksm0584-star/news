"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import SectorBadge from "./SectorBadge";
import CategoryTabs from "./CategoryTabs";
import EmptyState from "./EmptyState";
import RecordCardAction from "./RecordCardAction";
import { ALL_CATEGORY, type NewsCategory } from "@/lib/news-categories";
import { distributeAcrossSectors } from "@/lib/distribute-sectors";
import { formatDate } from "@/lib/format";
import { track, trackClick } from "@/lib/mixpanel";
import { isHttpUrl, saveArticleReturnInfo } from "@/lib/article-return";
import { getReadArticleUrls, markArticleRead } from "@/lib/read-articles";
import { isNativePlatform } from "@/lib/platform";
import type { LatestNewsItem } from "@/lib/news-rss";

/**
 * Replaces NewsCarousel on the home screen with a vertical list backed by
 * real articles from GET /api/news (server-side RSS fetch, see
 * src/lib/news-rss.ts). NewsCarousel/mock-news.ts are untouched — this is a
 * separate component, not a rewrite of that one.
 */
export default function LatestNewsList() {
  const [category, setCategory] = useState<NewsCategory>(ALL_CATEGORY);
  const [articles, setArticles] = useState<LatestNewsItem[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [readUrls, setReadUrls] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time external (localStorage) read with no render-time alternative, see use-article-return-banner.ts
    setReadUrls(getReadArticleUrls());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/news")
      .then((res) => res.json())
      .then((data: { articles: LatestNewsItem[]; error?: string }) => {
        if (cancelled) return;
        setArticles(data.articles);
        setLoadFailed(Boolean(data.error) && data.articles.length === 0);
      })
      .catch(() => {
        if (cancelled) return;
        setArticles([]);
        setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // "전체"만 섹터별로 교차 배치 — 개별 섹터 탭은 API가 이미 내려준 최신순
  // 그대로 필터링만 한다(정렬·필터링 동작 변경 없음). distributeAcrossSectors
  // 자체도 이미 불러온 articles를 재배열만 할 뿐 추가 요청을 하지 않는다.
  const filtered =
    category === ALL_CATEGORY
      ? distributeAcrossSectors(articles ?? [])
      : (articles ?? []).filter((article) => article.sector === category);

  // Fired at the moment the user leaves for the original article — moved
  // here from the record-writing screen's own mount effect, which used to
  // fire this same event once the screen (reached via this exact click)
  // loaded; that screen now skips it for this entry_point specifically so
  // the two don't double-count the same open (see its own comment).
  //
  // Native (iOS/Android) only: opens in an in-app browser instead of
  // letting the click fall through to a plain external-origin navigation
  // (see src/lib/native/article-browser.ts for why — a reliable "완료"/Done
  // button back into the app). `event.preventDefault()` stops the
  // native WKWebView from ever starting that navigation in the first
  // place. The web path is untouched: `isNativePlatform()` is false there,
  // so this always returns before reaching preventDefault, and the `<a
  // href>` does its normal same-tab navigation exactly as before.
  function handleArticleOpen(article: LatestNewsItem, event: MouseEvent) {
    trackClick("home_news_item_open", { sector: article.sector });
    track("article_opened", {
      source_type: "external",
      entry_point: "home_news_list",
      sector: article.sector,
    });
    saveArticleReturnInfo({
      url: article.url,
      title: article.title,
      sector: article.sector,
      fromPath: "/",
    });
    handleArticleRead(article);

    if (!isNativePlatform()) return;
    event.preventDefault();
    import("@/lib/native/article-browser").then(({ openArticleInBrowser }) =>
      openArticleInBrowser(article.url),
    );
  }

  // Keyed by URL (see read-articles.ts) — the same article reads as read
  // in every category tab it shows up in, regardless of which click path
  // (external open or the no-URL fallback below) reached it first.
  function handleArticleRead(article: LatestNewsItem) {
    markArticleRead(article.url);
    setReadUrls((prev) => {
      if (prev.has(article.url)) return prev;
      return new Set(prev).add(article.url);
    });
  }

  // Per-card "기록하기" — sends this article straight into the existing
  // external-record flow (see RecordCardAction) without opening the
  // original article first, so it deliberately does NOT call
  // handleArticleOpen/handleArticleRead (those are "the user went to read
  // it" signals; this is "the user wants to record it").
  function handleRecordAction(article: LatestNewsItem) {
    trackClick("home_news_card_record_action", { sector: article.sector });
  }

  function recordHref(article: LatestNewsItem): string {
    const params = new URLSearchParams({ title: article.title, sector: article.sector });
    if (isHttpUrl(article.url)) params.set("url", article.url);
    return `/record/new/external?${params.toString()}`;
  }

  return (
    <section className="mt-6">
      {/* Same h2 typography/padding as HotNewsSection's "지금 주목할 뉴스"
          title (px-5 text-[15px] font-bold text-foreground) for visual
          consistency between the two home-screen sections. CategoryTabs
          itself stays untouched (also used on 내 기록) — the 16px gap below
          this header lives on the wrapping div, not on that component. */}
      <h2 className="px-5 text-[15px] font-bold text-foreground">최신 경제 뉴스</h2>
      <div className="mt-4">
        <CategoryTabs selected={category} onSelect={setCategory} />
      </div>

      <div
        id="news-explorer-panel"
        role="tabpanel"
        aria-label={`${category} 뉴스 목록`}
        className="mt-3 px-5"
      >
        {articles === null ? (
          <div className="flex items-center justify-center py-10 text-[13px] text-muted">
            뉴스를 불러오는 중이에요
          </div>
        ) : loadFailed ? (
          <EmptyState
            title="최신 뉴스를 불러오지 못했어요"
            description="잠시 후 다시 시도해주세요"
          />
        ) : articles.length === 0 ? (
          <EmptyState title="표시할 뉴스가 아직 없어요" description="곧 연결될 예정이에요" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="아직 이 분야의 뉴스가 없어요"
            description="다른 분야를 선택해보세요"
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((article, index) => {
              const isRead = readUrls.has(article.url);
              const hasUrl = isHttpUrl(article.url);
              const cardKey = hasUrl ? article.url : `${article.title}-${article.publishedAt}`;

              return (
                <div
                  key={cardKey}
                  data-onboarding-target={index === 0 ? "news-card-first" : undefined}
                  // iOS WebKit (Safari and this app's own Capacitor WebView
                  // alike) only evaluates `:active` on tap for elements
                  // that have a touch listener of their own — true for the
                  // old plain `<a>` card (anchors are exempt), not for a
                  // bare `<div>`. The now-moved-here `active:bg-background`
                  // needs this no-op listener to keep working on a tap.
                  onTouchStart={() => undefined}
                  className="relative flex items-center gap-1.5 rounded-2xl border border-border-subtle px-4 py-3.5 active:bg-background"
                >
                  {/* Stretched link: covers the whole card so tapping
                      anywhere except the "기록하기" action below keeps the
                      existing open-article (or, for a URL-less entry, the
                      write-flow fallback) behavior. A sibling of
                      RecordCardAction rather than its wrapper — nesting two
                      interactive elements breaks keyboard/screen-reader
                      navigation — positioned (`absolute`) so it paints
                      above the plain-static text below it, and under
                      RecordCardAction's own `relative` stacking. */}
                  {hasUrl ? (
                    <a
                      href={article.url}
                      onClick={(event) => handleArticleOpen(article, event)}
                      aria-label={article.title}
                      className="absolute inset-0 rounded-2xl"
                    />
                  ) : (
                    // Safe fallback for a feed entry with no usable URL —
                    // falls back to the existing internal write-flow entry
                    // point (which already handles a missing/invalid URL
                    // gracefully with its own "올바른 기사 주소가 아니에요"
                    // message) instead of ever navigating to a broken link.
                    <Link
                      href={recordHref(article)}
                      onClick={() => handleArticleRead(article)}
                      aria-label={article.title}
                      className="absolute inset-0 rounded-2xl"
                    />
                  )}

                  {/* min-w-0 flex-1 lets the title shrink/wrap first, so it
                      can never grow under the action button. */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p
                      className={`type-article-title leading-snug transition-colors duration-300 ${
                        isRead ? "text-[#9CA3AF]" : "text-foreground"
                      }`}
                    >
                      {article.title}
                    </p>
                    {/* flex-wrap, chip listed first: when space is tight,
                        only trailing items (date/press) wrap to a second
                        line — the chip, with nothing before it, always
                        stays on the first line. */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <SectorBadge sector={article.sector} muted={isRead} />
                      <span>{formatDate(article.publishedAt)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.press}</span>
                    </div>
                  </div>

                  <RecordCardAction
                    href={recordHref(article)}
                    onClick={() => handleRecordAction(article)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
