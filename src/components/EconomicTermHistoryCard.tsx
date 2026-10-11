"use client";

import { useEffect, useRef } from "react";
import { formatDate, daysSince } from "@/lib/format";
import { track } from "@/lib/mixpanel";

/**
 * Fires dictionary_history_item_view once per card per page visit, only
 * once it's genuinely been looked at — not merely present in the DOM:
 * ≥50% visible (IntersectionObserver threshold 0.5) AND that holds for a
 * full second (a timer armed on intersect, cancelled on any drop below
 * the threshold before it completes). Scrolling back to an already-fired
 * card never re-fires it (firedRef); a fresh mount of this page (e.g. a
 * later-day revisit) gets a fresh instance of this component, so it can
 * fire again then.
 */
export default function EconomicTermHistoryCard({
  term,
  description,
  lastSearchedAt,
  position,
  historyCount,
  onRequestDelete,
}: {
  term: string;
  description: string;
  lastSearchedAt: string;
  position: number;
  historyCount: number;
  onRequestDelete: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || firedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (timerRef.current) return; // already counting down
          timerRef.current = setTimeout(() => {
            if (firedRef.current) return;
            firedRef.current = true;
            track("dictionary_history_item_view", {
              card_position: position,
              history_count: historyCount,
              days_since_last_search: daysSince(lastSearchedAt),
              source: "search_history",
            });
            observer.disconnect();
          }, 1000);
        } else if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // position/historyCount/lastSearchedAt don't change for a given row
    // within one page visit — this only needs to run once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={cardRef} className="rounded-2xl border border-border-subtle px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-foreground">{term}</p>
          <p className="mt-1 text-[13px] leading-6 text-foreground/80">{description}</p>
          <p className="mt-1.5 text-[11.5px] text-muted">{formatDate(lastSearchedAt)}</p>
        </div>
        <button
          type="button"
          onClick={onRequestDelete}
          className="shrink-0 rounded-full px-2 py-1 text-[12px] font-medium text-red-500 active:bg-background"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
