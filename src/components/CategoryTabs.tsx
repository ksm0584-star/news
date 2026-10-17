"use client";

import { useRef, type KeyboardEvent } from "react";
import { NEWS_CATEGORIES, type NewsCategory } from "@/lib/news-categories";

export default function CategoryTabs({
  selected,
  onSelect,
  ariaLabel = "분야별 뉴스 탐색",
  panelId = "news-explorer-panel",
}: {
  selected: NewsCategory;
  onSelect: (category: NewsCategory) => void;
  /** Defaults match the original home-only usage — only a second mount (e.g. 내 기록) needs to override these. */
  ariaLabel?: string;
  panelId?: string;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusAndSelect(index: number) {
    const nextIndex = (index + NEWS_CATEGORIES.length) % NEWS_CATEGORIES.length;
    onSelect(NEWS_CATEGORIES[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusAndSelect(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusAndSelect(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(NEWS_CATEGORIES.length - 1);
        break;
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1"
    >
      {NEWS_CATEGORIES.map((category, index) => {
        const isSelected = category === selected;
        return (
          <button
            key={category}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={panelId}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(category)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 type-chip ${
              isSelected ? "bg-point text-white" : "bg-background text-foreground/70"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
