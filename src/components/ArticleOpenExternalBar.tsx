"use client";

import { useEffect, useRef, useState } from "react";
import { trackClick } from "@/lib/mixpanel";

const INFO_POPOVER_ID = "article-open-external-info";

/**
 * The "원문 보기" row on the record-writing screen. Deliberately a single
 * low-key row, not an error card: the goal is "read it over here," not
 * "this is broken."
 *
 * No `target="_blank"` — this opens in the *same* tab, as a normal
 * top-level navigation, so the browser's own back button returns here
 * (this screen's own draft/record state is what survives the round trip,
 * not window/tab state).
 *
 * Previously mounted only for a domain src/lib/iframe-support.ts had
 * confirmed blocks iframing, so a `track("article_load_failed", {reason:
 * "iframe_blocked"})` on mount was an accurate "this article couldn't be
 * framed" signal. Now that this is the universal record-writing screen for
 * every article (no iframe attempted at all here), that signal would fire
 * for every single write session regardless of whether framing would have
 * worked — not a real failure — so it was removed from this component.
 *
 * `onOpenArticle` (optional): the caller's own `article_opened` tracking —
 * this component doesn't know its caller's entry_point/properties, so it
 * just calls this back on an actual click, same moment as the generic
 * `external_open_new_tab` button_click below.
 */
export default function ArticleOpenExternalBar({
  url,
  onOpenArticle,
}: {
  url: string;
  onOpenArticle?: () => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!infoOpen) return;
    function onPointerDownOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setInfoOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDownOutside);
    return () => document.removeEventListener("pointerdown", onPointerDownOutside);
  }, [infoOpen]);

  return (
    <div ref={containerRef} className="relative flex items-center gap-1 px-4 pt-4">
      <a
        href={url}
        rel="noopener noreferrer"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => {
          trackClick("external_open_new_tab");
          onOpenArticle?.();
        }}
        className="flex items-center gap-1.5 rounded-full bg-point px-4 py-2 text-[13px] font-semibold text-white active:bg-point-dark"
      >
        원문 보기
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 3h6v6M10 14 21 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>

      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => setInfoOpen((open) => !open)}
        aria-label="원문 보기 안내"
        aria-expanded={infoOpen}
        aria-controls={INFO_POPOVER_ID}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-muted active:bg-background"
      >
        ⓘ
      </button>

      {infoOpen ? (
        <div
          id={INFO_POPOVER_ID}
          role="dialog"
          aria-label="원문 보기 안내"
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute left-4 top-full z-10 mt-2 w-64 rounded-xl border border-border-subtle bg-surface p-4 text-[12.5px] leading-5 text-foreground shadow-lg"
        >
          <p>
            언론사 페이지에서 기사를 읽을 수 있어요. 다 읽고 돌아오면
            모아요에서 기록을 계속할 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => setInfoOpen(false)}
            className="mt-3 text-[12.5px] font-semibold text-point"
          >
            닫기
          </button>
        </div>
      ) : null}
    </div>
  );
}
