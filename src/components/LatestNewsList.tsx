"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SectorBadge from "./SectorBadge";
import CategoryTabs from "./CategoryTabs";
import EmptyState from "./EmptyState";
import { ALL_CATEGORY, type NewsCategory } from "@/lib/news-categories";
import { formatDate } from "@/lib/format";
import { track, trackClick } from "@/lib/mixpanel";
import { isHttpUrl, saveArticleReturnInfo } from "@/lib/article-return";
import { getReadArticleUrls, markArticleRead } from "@/lib/read-articles";
import type { LatestNewsItem } from "@/lib/news-rss";

/**
 * Square thumbnail for a card whose article has `imageUrl` (only ever the
 * source feed's own media:content — see news-rss.ts). Hides itself (and
 * nothing else about the card) if the image actually fails to load —
 * `imageUrl` being present just means the feed listed one, not that it's
 * guaranteed to still resolve.
 */
function NewsThumbnail({ src, read }: { src: string; read: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-background">
      <Image
        src={src}
        alt=""
        fill
        sizes="56px"
        className="object-cover"
        onError={() => setFailed(true)}
      />
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          read ? "opacity-10" : "opacity-0"
        }`}
      />
    </div>
  );
}

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

  const filtered = (articles ?? []).filter(
    (article) => category === ALL_CATEGORY || article.sector === category,
  );

  // Fired at the moment the user leaves for the original article — moved
  // here from the record-writing screen's own mount effect, which used to
  // fire this same event once the screen (reached via this exact click)
  // loaded; that screen now skips it for this entry_point specifically so
  // the two don't double-count the same open (see its own comment).
  function handleArticleOpen(article: LatestNewsItem) {
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

  return (
    <section className="pt-5">
      <h2 className="px-5 text-[15px] font-bold text-foreground">최신 경제뉴스</h2>

      <div className="mt-3">
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
              const cardClassName =
                "flex items-center gap-3 rounded-2xl border border-border-subtle px-4 py-3.5 active:bg-background";
              const cardBody = (
                <>
                  {article.imageUrl ? (
                    <NewsThumbnail src={article.imageUrl} read={isRead} />
                  ) : null}
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p
                      className={`type-article-title leading-snug transition-colors duration-300 ${
                        isRead ? "text-[#9CA3AF]" : "text-foreground"
                      }`}
                    >
                      {article.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span>{article.press}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(article.publishedAt)}</span>
                      <SectorBadge sector={article.sector} muted={isRead} />
                    </div>
                  </div>
                </>
              );

              // Safe fallback for a feed entry with no usable URL — falls
              // back to the existing internal write-flow entry point
              // (which already handles a missing/invalid URL gracefully
              // with its own "올바른 기사 주소가 아니에요" message) instead
              // of ever navigating to a broken link.
              if (!isHttpUrl(article.url)) {
                return (
                  <Link
                    key={`${article.title}-${article.publishedAt}`}
                    href={`/record/new/external?title=${encodeURIComponent(article.title)}&sector=${encodeURIComponent(article.sector)}`}
                    onClick={() => handleArticleRead(article)}
                    data-onboarding-target={index === 0 ? "news-card-first" : undefined}
                    className={cardClassName}
                  >
                    {cardBody}
                  </Link>
                );
              }

              return (
                <a
                  key={article.url}
                  href={article.url}
                  onClick={() => handleArticleOpen(article)}
                  data-onboarding-target={index === 0 ? "news-card-first" : undefined}
                  className={cardClassName}
                >
                  {cardBody}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
