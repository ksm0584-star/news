"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectorBadge from "./SectorBadge";
import CategoryTabs from "./CategoryTabs";
import EmptyState from "./EmptyState";
import { ALL_CATEGORY, type NewsCategory } from "@/lib/news-categories";
import { formatDate } from "@/lib/format";
import { trackClick } from "@/lib/mixpanel";
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
            {filtered.map((article, index) => (
              <Link
                key={article.url}
                href={`/record/new/external?url=${encodeURIComponent(article.url)}&title=${encodeURIComponent(article.title)}&sector=${encodeURIComponent(article.sector)}`}
                onClick={() => trackClick("home_news_item_open", { sector: article.sector })}
                data-onboarding-target={index === 0 ? "news-card-first" : undefined}
                className="flex flex-col gap-1.5 rounded-2xl border border-border-subtle px-4 py-3.5 active:bg-background"
              >
                <p className="text-[14.5px] font-semibold leading-snug text-foreground">
                  {article.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>{article.press}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(article.publishedAt)}</span>
                  <SectorBadge sector={article.sector} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
