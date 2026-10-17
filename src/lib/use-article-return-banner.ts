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
import { isNativePlatform } from "./platform";

/**
 * Home-only: shows the "방금 본 뉴스, 기록해 볼까요?" banner once per
 * genuine "left for an article, came back" trip.
 *
 * Checked from four places, because no single one covers every return path:
 * - A plain mount effect: covers a normal (non-bfcache) page load, where
 *   `pageshow` may already have fired before this effect's listener gets
 *   attached.
 * - A `pageshow` listener: the one reliable signal for a Safari
 *   back-forward-cache restore, which resumes this exact page/JS instance
 *   without ever re-running a mount effect on its own.
 * - A `visibilitychange` listener: covers a genuine OS-level backgrounding
 *   of the native app (e.g. the user switches to another app mid-read via
 *   the app switcher, then returns to 모아요 directly) — document becomes
 *   hidden when backgrounded, visible again on return. Harmless on the web
 *   too: it only re-runs the same pending-entry check, a no-op without one.
 * - Native only: a `browserFinished` listener (see
 *   src/lib/native/article-browser.ts) — the actual "came back from the
 *   article" signal on iOS/Android now that article links open in an
 *   in-app browser (SFSafariViewController/Custom Tab) instead of a plain
 *   external-origin navigation. That in-app browser is a modal within the
 *   *same* app process, so the host app is never backgrounded and
 *   `visibilitychange` never fires for it — only this event does, when the
 *   user taps "완료"/Done or swipes it away.
 * All four funnel into the same readPendingArticleReturn() + "already
 * shown?" check, so firing more than one for a single trip (e.g. the mount
 * check *and* an immediate pageshow) is harmless — sessionStorage's
 * `bannerShown` flag is the actual source of truth, not any
 * component-level guard.
 *
 * Known limitation (see completion report): there is still no way to
 * detect from here whether the user ever left the tab/app at all, or came
 * back via some path other than these four signals (e.g. force-quitting
 * and relaunching 모아요 fresh, which starts a new JS instance with no
 * pending sessionStorage entry carried over) — only "this
 * tab/app instance still has a pending entry and is now visible again",
 * not "the user specifically used a back gesture".
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
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") checkAndShow();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Native only — see this hook's own doc comment for why
    // visibilitychange alone doesn't cover the in-app-browser return path.
    // Dynamically imported so @capacitor/browser is never loaded on the web.
    let removeBrowserListener: (() => void) | undefined;
    let cancelled = false;
    if (isNativePlatform()) {
      import("./native/article-browser").then(({ listenForArticleBrowserClosed }) => {
        if (cancelled) return;
        listenForArticleBrowserClosed(checkAndShow).then((remove) => {
          if (cancelled) {
            remove();
          } else {
            removeBrowserListener = remove;
          }
        });
      });
    }

    return () => {
      window.removeEventListener("pageshow", checkAndShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cancelled = true;
      removeBrowserListener?.();
    };
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
    // `entry` tells the destination screen's own record_started this came
    // from the return banner specifically, not a (currently hypothetical)
    // direct home-news-list entry that might also land there with the
    // same title/sector/url shape — see record/new/external/page.tsx.
    const query = new URLSearchParams({
      url: info.url,
      title: info.title,
      sector: info.sector,
      entry: "article_return_prompt",
    });
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
