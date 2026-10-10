"use client";

import { useEffect, useRef, useState } from "react";
import { track, trackClick } from "@/lib/mixpanel";

const INFO_POPOVER_ID = "article-open-external-info";

/**
 * Shown in place of the iframe for a domain src/lib/iframe-support.ts has
 * confirmed blocks framing — never mounted alongside an iframe attempt, and
 * never mounted just because loading is slow or erroring (that's still
 * ArticleViewer's own timeout/retry UI). Deliberately a single low-key row,
 * not an error card: the goal is "read it over here instead," not "this is
 * broken."
 *
 * No `target="_blank"` — this opens in the *same* tab, as a normal
 * top-level navigation, so the browser's own back button returns here
 * (this screen's own draft/record state is what survives the round trip,
 * not window/tab state).
 */
export default function ArticleOpenExternalBar({ url }: { url: string }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // The only caller mounts this for a domain iframe-support.ts has
  // *confirmed* blocks framing — see the matching comment in
  // ArticleUnavailableNotice.tsx, which covers the same case for the
  // other screen this can appear on.
  const trackedRef = useRef(false);
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    track("article_load_failed", { reason: "iframe_blocked" });
  }, []);

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
    <div ref={containerRef} className="relative flex items-center gap-2 px-4 pt-4">
      <a
        href={url}
        rel="noopener noreferrer"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => trackClick("external_open_new_tab")}
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
        aria-label="원문 표시 제한 안내"
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
          aria-label="원문 표시 제한 안내"
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute left-4 top-full z-10 mt-2 w-64 rounded-xl border border-border-subtle bg-surface p-4 text-[12.5px] leading-5 text-foreground shadow-lg"
        >
          <p>
            일부 뉴스 사이트는 보안 정책에 따라 앱 내부에서 원문 표시가
            제한될 수 있어요. 외부에서 기사를 읽은 뒤에도 모아요에서
            기록을 계속할 수 있어요.
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
