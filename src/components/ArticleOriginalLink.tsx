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
      className={`inline-block truncate text-[14px] text-point ${className}`}
    >
      원문 보기 ↗
    </a>
  );
}
