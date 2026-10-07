"use client";

import { forwardRef } from "react";
import { isIframeUnsupported } from "@/lib/iframe-support";
import { trackClick } from "@/lib/mixpanel";

/**
 * Renders an article URL as a plain <iframe>, or a "open in new tab"
 * fallback for domains in src/lib/iframe-support.ts's manually-curated
 * unsupported list (X-Frame-Options/CSP can't be reliably detected from
 * iframe `onload`, so this isn't a runtime check — see that file to add a
 * newly-confirmed domain). Shared by the external-article write screen and
 * the record-detail "원문 보기" screen so the iframe/fallback logic isn't
 * duplicated between them.
 *
 * Forwards a ref to the <iframe> itself (null when the fallback card is
 * shown instead) — callers use it to tell whether focus has moved into the
 * iframe, since cross-origin content never reports clicks/scrolls directly.
 */
const ArticleViewer = forwardRef<
  HTMLIFrameElement,
  {
    url: string;
    /** Optional extra line shown under the fallback's "open in new tab" button — used by the write screen to reassure that draft content survives the tab switch. */
    extraNote?: string;
  }
>(function ArticleViewer({ url, extraNote }, iframeRef) {
  if (isIframeUnsupported(url)) {
    return (
      <div className="flex h-full items-center justify-center px-5 py-6">
        <div className="w-full rounded-2xl border border-border-subtle bg-background p-5 text-center">
          <p className="text-[13.5px] font-semibold text-foreground">
            원문은 새 탭에서 열어 확인해주세요
          </p>
          <p className="mt-1.5 truncate text-[12px] text-muted">{url}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick("external_open_new_tab")}
            className="mt-4 inline-block w-full rounded-xl bg-point py-3 text-[14px] font-semibold text-white active:bg-point-dark"
          >
            원문 새 탭에서 열기
          </a>
          {extraNote ? <p className="mt-3 text-[12px] text-muted">{extraNote}</p> : null}
        </div>
      </div>
    );
  }

  return <iframe ref={iframeRef} src={url} title="원문 기사" className="h-full w-full border-0" />;
});

export default ArticleViewer;
