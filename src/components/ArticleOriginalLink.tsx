import type { ComponentProps } from "react";

/**
 * The one "원문 보기" link style, taken as-is from the record detail screen.
 * Always the real article URL in the same tab (no target="_blank") so the
 * browser's own back button returns to the caller. Callers keep their own
 * href/tracking handlers and pass layout spacing (e.g. `mt-1`) via
 * className.
 */
export default function ArticleOriginalLink({
  className = "",
  ...props
}: Omit<ComponentProps<"a">, "children" | "rel">) {
  return (
    <a
      rel="noopener noreferrer"
      {...props}
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
