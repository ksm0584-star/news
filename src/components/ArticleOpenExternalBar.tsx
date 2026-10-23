"use client";

import { trackClick } from "@/lib/mixpanel";
import ArticleLinkBanner from "@/components/ArticleLinkBanner";

/**
 * The connected-article row on the record-writing screen: a full-width
 * news-link banner (ArticleLinkBanner). Deliberately a single low-key row,
 * not an error card: the goal is "read it over here," not "this is broken."
 *
 * No `target="_blank"` on the banner — it opens in the *same* tab, as a
 * normal top-level navigation, so the browser's own back button returns
 * here (this screen's own draft/record state is what survives the round
 * trip, not window/tab state).
 *
 * `onOpenArticle` (optional): the caller's own `article_opened` tracking —
 * this component doesn't know its caller's entry_point/properties, so it
 * just calls this back on an actual click, same moment as the generic
 * `external_open_new_tab` button_click below.
 *
 * 2026-10-24: the ⓘ info button that used to sit beside the banner (and
 * its popover explaining "원문 보기 열면 같은 탭에서 열려요") was removed —
 * the banner is now the only thing in this row and takes the full width.
 */
export default function ArticleOpenExternalBar({
  url,
  title,
  onOpenArticle,
}: {
  url: string;
  title: string;
  onOpenArticle?: () => void;
}) {
  return (
    <div className="px-4 pt-4">
      <ArticleLinkBanner
        href={url}
        title={title}
        onClick={() => {
          trackClick("external_open_new_tab");
          onOpenArticle?.();
        }}
      />
    </div>
  );
}
