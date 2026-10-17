import type { ComponentProps, MouseEvent } from "react";
import { isNativePlatform } from "@/lib/platform";

/**
 * The one "원문 보기" link style, taken as-is from the record detail screen.
 * On the web, always the real article URL in the same tab (no
 * target="_blank") so the browser's own back button returns to the caller.
 * On the native iOS/Android app, opens in an in-app browser instead (see
 * src/lib/native/article-browser.ts) — a reliable "완료"/Done button back
 * into the app, the same mechanism the OAuth flow already uses, instead of
 * a plain external-origin navigation. Callers keep their own `onClick`
 * (still called first, every platform, for tracking) and layout spacing
 * (e.g. `mt-1`) via className.
 */
export default function ArticleOriginalLink({
  href,
  onClick,
  className = "",
  ...props
}: Omit<ComponentProps<"a">, "children" | "rel">) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (!href || !isNativePlatform()) return;
    event.preventDefault();
    import("@/lib/native/article-browser").then(({ openArticleInBrowser }) =>
      openArticleInBrowser(href),
    );
  }

  return (
    <a
      rel="noopener noreferrer"
      href={href}
      {...props}
      onClick={handleClick}
      className={`inline-block truncate text-[14px] font-semibold text-point ${className}`}
    >
      원문 보기
      {/* SVG instead of the "↗" text glyph: at semibold the glyph's stroke
          renders noticeably thinner than the Hangul stems. ml-0.5 plus the
          path's own inset keeps the old space-before-glyph gap. */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="ml-0.5 inline-block align-text-bottom"
      >
        <path
          d="M7 17 17 7M9 7h8v8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
