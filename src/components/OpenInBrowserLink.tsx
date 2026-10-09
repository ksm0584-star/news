"use client";

import { trackClick } from "@/lib/mixpanel";

/**
 * Small header icon, always available regardless of whether the iframe
 * below is loading, stalled, or displaying fine — a fallback for the case
 * ArticleViewer's timeout/onError can't catch at all (a silent
 * X-Frame-Options/CSP block that still fires `onLoad`). Plugs into
 * BackHeader's `right` slot.
 */
export default function OpenInBrowserLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="브라우저에서 원문 열기"
      onClick={() => trackClick("external_open_new_tab")}
      className="flex h-9 w-9 items-center justify-center rounded-full text-foreground active:bg-background"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
  );
}
