"use client";

import { useState } from "react";
import { MOCK_NEWS } from "@/lib/mock-news";
import { ALL_CATEGORY, matchesCategory, type NewsCategory } from "@/lib/news-categories";
import CategoryTabs from "./CategoryTabs";
import NewsCard from "./NewsCard";

export default function NewsCarousel() {
  const [category, setCategory] = useState<NewsCategory>(ALL_CATEGORY);
  const articles = MOCK_NEWS.filter((article) => matchesCategory(article.sector, category));

  return (
    <section className="pt-5">
      <h2 className="px-5 text-[15px] font-bold text-foreground">분야별 경제뉴스</h2>
      <p className="px-5 mt-0.5 text-xs text-muted">실제 뉴스가 아닌 샘플 기사예요</p>

      <div className="mt-3">
        <CategoryTabs selected={category} onSelect={setCategory} />
      </div>

      <div id="news-explorer-panel" role="tabpanel" aria-label={`${category} 뉴스 목록`} className="mt-3">
        {articles.length === 0 ? (
          <div className="mx-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-subtle px-6 py-10 text-center">
            <p className="text-[13.5px] font-medium text-muted">
              아직 이 분야의 뉴스가 없어요
            </p>
            <button
              type="button"
              onClick={() => setCategory(ALL_CATEGORY)}
              className="rounded-full bg-point px-4 py-2 text-[12.5px] font-semibold text-white active:bg-point-dark"
            >
              전체 뉴스 보기
            </button>
          </div>
        ) : (
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1 snap-x snap-mandatory scroll-px-5">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
