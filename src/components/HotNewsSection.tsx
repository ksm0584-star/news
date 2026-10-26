"use client";

import { useEffect, useRef, useState } from "react";
import HotNewsCard from "./HotNewsCard";
import { track } from "@/lib/mixpanel";
import type { LatestNewsItem } from "@/lib/news-rss";

interface HotNewsResponse {
  effectiveDate: string;
  articles: LatestNewsItem[];
}

/**
 * "지금 주목할 뉴스" — a horizontal-scroll row of admin-curated,
 * keyword-matched articles (see src/lib/hot-news-matching.ts), sourced
 * from GET /api/hot-news (the cron job's latest frozen row set in
 * hot_news_daily — today's KST date if already written, else the most
 * recent prior day, per src/lib/hot-news-lookup.ts). Renders nothing at
 * all — not even the section title — only once nothing at all is
 * available within that lookup's staleness window, per "적합한 기사가
 * 없으면 HOT 섹션을 숨기고 기존 뉴스 목록은 정상적으로 보여줍니다": a
 * fetch failure or a truly empty window never blocks or alters anything
 * below it on the home screen (LatestNewsList is a separate component,
 * untouched either way).
 *
 * Layout borrows the already-designed (but unused in production)
 * NewsCard/NewsCarousel pattern — snap-x horizontal scroll, rounded-2xl
 * image box, type-article-title + line-clamp-2 — rather than reusing those
 * components directly, since they're built around NewsArticle/mock-news.ts
 * (a different, mock data shape) and are explicitly documented in
 * DESIGN.md as unused; this is a new component over the real
 * LatestNewsItem shape instead.
 */
export default function HotNewsSection() {
  const [data, setData] = useState<HotNewsResponse | null>(null);
  const trackedViewRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/hot-news", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: HotNewsResponse) => {
        if (cancelled) return;
        setData(json);
      })
      .catch(() => {
        if (cancelled) return;
        setData({ effectiveDate: "", articles: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Guards against React Strict Mode's dev-only double effect invoke, same
  // pattern as home_viewed in src/app/page.tsx.
  useEffect(() => {
    if (!data || data.articles.length === 0 || trackedViewRef.current) return;
    trackedViewRef.current = true;
    track("hot_news_section_viewed", {
      article_count: data.articles.length,
      effective_date: data.effectiveDate,
    });
  }, [data]);

  if (!data || data.articles.length === 0) return null;

  return (
    <section className="pt-5">
      <h2 className="px-5 text-[15px] font-bold text-foreground">지금 주목할 뉴스</h2>
      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-1 snap-x snap-mandatory scroll-px-5">
        {data.articles.map((article, index) => (
          <HotNewsCard
            key={article.url}
            article={article}
            position={index}
            effectiveDate={data.effectiveDate}
          />
        ))}
      </div>
    </section>
  );
}
