"use client";

import type { ComponentProps, MouseEvent } from "react";
import { ChevronRight } from "lucide-react";
import { isNativePlatform } from "@/lib/platform";

/**
 * Horizontal "연결된 기사" banner for the record-writing screen — icon +
 * title + chevron, replacing the old 원문 보기 text link in that spot. Opens
 * the article the same way ArticleOriginalLink does: in-app browser on
 * native, same-tab navigation on web (so the browser back button returns
 * here). Callers keep their own `onClick` for tracking, called first on
 * every platform.
 */
export default function ArticleLinkBanner({
  href,
  title,
  onClick,
  className = "",
  ...props
}: Omit<ComponentProps<"a">, "children" | "rel"> & { title: string }) {
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
      aria-label={`${title} 원문 보기`}
      className={`flex h-16 items-center gap-3 rounded-xl border border-border-subtle bg-surface px-4 active:bg-background ${className}`}
    >
      {/* public/icon/newspaper_icon 1.svg — its viewBox is cropped to the
          artwork's own bounds (12 11 40 42, was 0 0 64 64 with ~22px of
          transparent margin baked in), so this renders at a true ~22px
          visually instead of a tiny glyph inside a bigger empty box.
          `h-[22px] w-[22px]` (not just the width/height attrs) is needed
          because Tailwind's preflight sets `img { height: auto }`, which
          would otherwise override the height attribute and stretch this
          slightly non-square (40:42) source to 22×23. The square box plus
          the SVG's default `preserveAspectRatio` (meet, not stretch) keeps
          the glyph undistorted with a sub-pixel letterbox instead. */}
      <img
        src="/icon/newspaper_icon%201.svg"
        alt=""
        width={22}
        height={22}
        className="h-[22px] w-[22px] shrink-0"
      />
      <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">
        {title}
      </span>
      <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden="true" />
    </a>
  );
}
