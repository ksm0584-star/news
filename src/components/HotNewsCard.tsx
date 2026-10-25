"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import SectorBadge from "./SectorBadge";
import { track, trackClick } from "@/lib/mixpanel";
import { saveArticleReturnInfo } from "@/lib/article-return";
import { markArticleRead } from "@/lib/read-articles";
import { isNativePlatform } from "@/lib/platform";
import { illustrationSrc, resolveIllustrationTheme } from "@/lib/hot-news-illustration";
import type { LatestNewsItem } from "@/lib/news-rss";

/**
 * One "지금 주목할 뉴스" card — thumbnail + title + sector/press, no rank
 * number (explicitly not shown — this isn't a live popularity ranking) and
 * no "기록하기" action (unlike RecordCardAction's home-list cards). The
 * whole card is the click target, the same 원문-open pattern as
 * LatestNewsList.handleArticleOpen (saveArticleReturnInfo + markArticleRead
 * + native in-app-browser handling) — duplicated here rather than
 * extracted into a shared hook, since this task is scoped to not touching
 * LatestNewsList.tsx at all.
 *
 * Image: a real, rights-cleared article photo (`article.imageUrl`, gated by
 * news-rss.ts's own allowThumbnail policy — unaffected by this component)
 * is shown when present and loads successfully; otherwise a pre-rendered,
 * sector-matched SVG illustration (hot-news-illustration.ts) fills the same
 * box. (2026-10-25: this used to carry a "주제 일러스트" label pill —
 * removed per explicit request; selection/display logic is unchanged.)
 */
export default function HotNewsCard({
  article,
  position,
  effectiveDate,
}: {
  article: LatestNewsItem;
  /** 0-based slot index — lets Mixpanel analysis compare performance by card position. */
  position: number;
  /** Today's KST date string — joins the view/click/open events for CTR analysis. */
  effectiveDate: string;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showRealPhoto = Boolean(article.imageUrl) && !photoFailed;
  const illustrationUrl = illustrationSrc(resolveIllustrationTheme(article));

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackClick("home_hot_news_card_click", {
      sector: article.sector,
      position,
      effective_date: effectiveDate,
    });
    // Reuses the existing article_opened taxonomy (not a new event name) so
    // it keeps landing in the same funnel as every other "원문 열람"
    // source — entry_point is what distinguishes HOT 뉴스 from the main
    // list (home_news_list) and every other caller, so this never
    // double-counts against those.
    track("article_opened", {
      source_type: "external",
      entry_point: "home_hot_news",
      sector: article.sector,
      effective_date: effectiveDate,
    });
    saveArticleReturnInfo({
      url: article.url,
      title: article.title,
      sector: article.sector,
      fromPath: "/",
    });
    markArticleRead(article.url);

    if (!isNativePlatform()) return;
    event.preventDefault();
    import("@/lib/native/article-browser").then(({ openArticleInBrowser }) =>
      openArticleInBrowser(article.url),
    );
  }

  return (
    <a
      href={article.url}
      onClick={handleClick}
      aria-label={article.title}
      className="flex w-[240px] shrink-0 flex-col gap-2 snap-start"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-background">
        {showRealPhoto ? (
          <Image
            src={article.imageUrl as string}
            alt=""
            fill
            sizes="240px"
            className="object-cover"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          // Pre-rendered static SVG (see hot-news-illustration.ts) — plain
          // <img>, not next/image: next.config.ts has no
          // images.dangerouslyAllowSVG, same reasoning as ArticleLinkBanner's
          // news icon.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={illustrationUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <p className="type-article-title line-clamp-2 leading-snug text-foreground">
        {article.title}
      </p>
      <div className="flex items-center gap-2 text-xs text-muted">
        <SectorBadge sector={article.sector} />
        <span className="truncate">{article.press}</span>
      </div>
    </a>
  );
}
