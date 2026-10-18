"use client";

import { useEffect, useRef, useState } from "react";
import RecordCard from "@/components/RecordCard";
import EmptyState from "@/components/EmptyState";
import CategoryTabs from "@/components/CategoryTabs";
import MonthPicker from "@/components/MonthPicker";
import { ALL_CATEGORY, type NewsCategory } from "@/lib/news-categories";
import { getCurrentKstYearMonth } from "@/lib/month-range";
import { useAuth } from "@/lib/auth-context";
import { useRecordCount, useRecordsForMonth } from "@/lib/use-records-store";
import { track } from "@/lib/mixpanel";
import { usePendingToastRelease } from "@/lib/toast";

export default function RecordsPage() {
  const { loading: authLoading } = useAuth();
  const [{ year, month }, setYearMonth] = useState(getCurrentKstYearMonth);
  const [category, setCategory] = useState<NewsCategory>(ALL_CATEGORY);
  const {
    records,
    loading: recordsLoading,
    error: recordsError,
    monthHasAnyRecords,
  } = useRecordsForMonth(year, month, category);
  const { count: totalRecordCount, loading: totalCountLoading } = useRecordCount();

  usePendingToastRelease(
    authLoading || recordsLoading ? "loading" : recordsError ? "failed" : "ready",
  );

  // Guards against React Strict Mode's dev-only double effect invoke,
  // which would otherwise double-count every records_viewed in
  // development (see record_viewed/dictionary_history_open for the same
  // pattern).
  const trackedViewRef = useRef(false);
  useEffect(() => {
    if (trackedViewRef.current) return;
    trackedViewRef.current = true;
    track("records_viewed");
  }, []);

  function handleCategorySelect(next: NewsCategory) {
    setCategory(next);
    track("records_sector_filter_changed", { selected_sector: next });
  }

  const loading = authLoading || recordsLoading || totalCountLoading;

  const emptyStateTitle =
    totalRecordCount === 0
      ? "아직 작성한 기록이 없어요"
      : category !== ALL_CATEGORY && monthHasAnyRecords
        ? "이 섹터에 작성한 기록이 없어요"
        : `${month}월에 작성한 기록이 없어요`;

  return (
    <div style={{ paddingBottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}>
      <header className="flex items-center justify-between px-5 pt-6 pb-1">
        <h1 className="text-xl font-extrabold text-foreground">내 기록</h1>
        {loading ? null : <span className="text-xs text-muted">{records.length}건</span>}
      </header>

      <div className="mt-3">
        <MonthPicker year={year} month={month} onChange={(y, m) => setYearMonth({ year: y, month: m })} />
      </div>

      <div className="mt-3">
        <CategoryTabs
          selected={category}
          onSelect={handleCategorySelect}
          ariaLabel="분야별 기록 필터"
          panelId="records-explorer-panel"
        />
      </div>

      <section
        id="records-explorer-panel"
        role="tabpanel"
        aria-label={`${category} 기록 목록`}
        className="mt-3 px-5"
      >
        {loading ? null : records.length === 0 ? (
          <EmptyState
            title={emptyStateTitle}
            titleClassName="text-[18px] font-semibold text-foreground"
            description="관심 있는 뉴스를 읽고 생각을 기록해 보세요."
            descriptionClassName="text-[14px] text-muted"
            action={{ label: "뉴스 둘러보기", href: "/" }}
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {records.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
