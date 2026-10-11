"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearPendingArticleReturn,
  markArticleReturnBannerShown,
  readPendingArticleReturn,
  type ArticleReturnInfo,
} from "./article-return";
import { track } from "./mixpanel";

/**
 * Home-only: shows the "방금 본 뉴스, 기록해 볼까요?" banner once per
 * genuine "left for an article, came back" trip.
 *
 * Checked from two places, because neither alone covers both return paths:
 * - A plain mount effect: covers a normal (non-bfcache) page load, where
 *   `pageshow` may already have fired before this effect's listener gets
 *   attached.
 * - A `pageshow` listener: the one reliable signal for a Safari
 *   back-forward-cache restore, which resumes this exact page/JS instance
 *   without ever re-running a mount effect on its own.
 * Both funnel into the same readPendingArticleReturn() + "already shown?"
 * check, so calling this twice for one trip (e.g. the mount check *and* an
 * immediate pageshow) is harmless — sessionStorage's `bannerShown` flag is
 * the actual source of truth, not any component-level guard.
 *
 * Known limitation (see completion report): there is no way to detect
 * from here whether the user ever left the tab at all, or came back via
 * some path other than the browser's own back button (e.g. closed the
 * article tab and switched to another app, then reopened 모아요 fresh) —
 * `pageshow`/sessionStorage can only tell "this tab still has a pending
 * entry and is now showing /", not "the user specifically pressed back".
 */
export function useArticleReturnBanner(): {
  info: ArticleReturnInfo | null;
  onRecord: () => void;
  onDismiss: () => void;
} {
  const router = useRouter();
  const [info, setInfo] = useState<ArticleReturnInfo | null>(null);

  const checkAndShow = useCallback(() => {
    const pending = readPendingArticleReturn();
    if (!pending || pending.bannerShown) return;
    markArticleReturnBannerShown();
    setInfo(pending);
    track("article_return_prompt_shown", {
      ...(pending.articleId ? { article_id: pending.articleId } : {}),
      sector: pending.sector,
      source: "home",
      elapsed_seconds: Math.round((Date.now() - pending.openedAt) / 1000),
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see this hook's own doc comment: a one-time external (sessionStorage) read with no render-time alternative.
    checkAndShow();
    window.addEventListener("pageshow", checkAndShow);
    return () => window.removeEventListener("pageshow", checkAndShow);
  }, [checkAndShow]);

  const onRecord = useCallback(() => {
    if (!info) return;
    track("article_return_prompt_clicked", {
      ...(info.articleId ? { article_id: info.articleId } : {}),
      sector: info.sector,
      source: "home",
      elapsed_seconds: Math.round((Date.now() - info.openedAt) / 1000),
    });
    clearPendingArticleReturn();
    setInfo(null);
    const query = new URLSearchParams({ url: info.url, title: info.title, sector: info.sector });
    router.push(`/record/new/external?${query.toString()}`);
  }, [info, router]);

  const onDismiss = useCallback(() => {
    if (!info) return;
    track("article_return_prompt_dismissed", {
      ...(info.articleId ? { article_id: info.articleId } : {}),
      sector: info.sector,
      source: "home",
      elapsed_seconds: Math.round((Date.now() - info.openedAt) / 1000),
    });
    clearPendingArticleReturn();
    setInfo(null);
  }, [info]);

  return { info, onRecord, onDismiss };
}
