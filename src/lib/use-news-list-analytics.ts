"use client";

import { useEffect, useRef, type RefObject } from "react";
import { track } from "./mixpanel";
import { newsListDepth } from "./article-analytics";

/** Once per home-list mount and category/article, including Strict Mode effect replay.
 * Revisiting a category does not re-count; a new home visit starts a new exposure.
 */
export function useNewsListAnalytics(
  root: RefObject<HTMLDivElement | null>,
  category: string,
  articleIds: string,
  articleCount: number,
): void {
  const impressions = useRef(new Set<string>());
  const depths = useRef(new Set<string>());

  useEffect(() => {
    const list = root.current;
    if (!list || articleCount === 0) return;
    const common = { entry_point: "home_news_list", selected_category: category, article_count: articleCount };
    const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-news-article-id]"));
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
      if (document.visibilityState !== "visible") return;
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
        const card = entry.target as HTMLElement;
        const articleId = card.dataset.newsArticleId;
        if (!articleId) continue;
        const key = `${category}:${articleId}`;
        if (!impressions.current.has(key)) {
          impressions.current.add(key);
          track("news_card_impression", {
            ...common,
            article_id: articleId,
            sector: card.dataset.newsSector,
            position: Number(card.dataset.newsPosition), // 1-based in filtered list
          });
        }
        observer?.unobserve(card);
      }
    }, { threshold: 0.5 });
    cards.forEach((card) => observer?.observe(card));

    let frame = 0;
    const measure = () => {
      frame = 0;
      if (document.visibilityState !== "visible") return;
      const rect = list.getBoundingClientRect();
      const progress = newsListDepth(rect.top, rect.height, window.innerHeight);
      for (const depth of [25, 50, 75, 100]) {
        const key = `${category}:${depth}`;
        if (progress >= depth && !depths.current.has(key)) {
          depths.current.add(key);
          track("news_list_scroll_depth", { ...common, scroll_depth: depth });
        }
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const onVisibilityChange = () => {
      schedule();
      // A hidden-tab intersection callback was deliberately ignored. Observe
      // again on return so an unchanged visible card still gets its impression.
      if (document.visibilityState === "visible") {
        cards.forEach((card) => {
          observer?.unobserve(card);
          observer?.observe(card);
        });
      }
    };
    schedule();
    // Capture also covers scrolling in an ancestor rather than the window.
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    resizeObserver?.observe(list);
    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [root, category, articleIds, articleCount]);
}
