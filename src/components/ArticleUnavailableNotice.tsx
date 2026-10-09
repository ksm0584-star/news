"use client";

import { trackClick } from "@/lib/mixpanel";

/**
 * Guidance shown in place of the iframe — either because the URL is on
 * src/lib/iframe-support.ts's confirmed-unsupported list, or because the
 * user hit ArticleViewer's "원문이 보이지 않나요?" escape hatch for a URL
 * not yet confirmed either way. Sized to its own content, not a fixed
 * height, so the caller's layout (plain page vs. small banner) controls
 * how much room it takes.
 */
export default function ArticleUnavailableNotice({ url }: { url: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-background p-5 text-center">
      <p className="text-[14px] font-semibold text-foreground">원문을 불러올 수 없어요</p>
      <p className="mt-1.5 text-[12.5px] leading-5 text-muted">
        해당 언론사의 정책으로 앱 안에서 기사를 표시할 수 없어요.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick("external_open_new_tab")}
        className="mt-4 inline-block w-full rounded-xl bg-point py-3 text-[14px] font-semibold text-white active:bg-point-dark"
      >
        원문 보러 가기 ↗
      </a>
    </div>
  );
}
