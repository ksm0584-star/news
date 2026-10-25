"use client";

import { useState } from "react";
import {
  formatKoreanYearMonth,
  getCurrentKstYearMonth,
  isFutureYearMonth,
  shiftMonth,
} from "@/lib/month-range";

/**
 * 내 기록 탭 전용 월 선택 — 좌우 화살표로 한 달씩 이동, 레이블 탭으로 연/월
 * 그리드 바텀시트를 연다. 일 단위 선택은 없다. 시각 스펙은 모두 기존
 * 값 재사용: 바텀시트 셸은 RatingPromptSheet 등과 같은 클래스, 아이콘
 * 버튼은 BackHeader의 뒤로가기 버튼과 같은 크기(36px/20px, strokeWidth 2),
 * 월 그리드 칩은 CategoryTabs/Chip과 같은 `rounded-full type-chip`
 * 선택/미선택 색 규칙을 그대로 쓴다.
 */

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 18L9 12L15 6" : "M9 6L15 12L9 18"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * Only ever mounted while the sheet is open (see MonthPicker below) — so
 * its own `displayedYear` state, initialized from the currently-selected
 * `year`, is naturally fresh on every open without an effect to reset it
 * (a fresh mount already starts from `useState`'s initial value).
 */
function YearMonthSheet({
  year,
  month,
  onSelect,
  onClose,
}: {
  year: number;
  month: number;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}) {
  const [displayedYear, setDisplayedYear] = useState(year);
  const current = getCurrentKstYearMonth();

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="연월 선택">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-3xl bg-surface p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
        <p className="text-[17px] font-bold text-foreground">연월 선택</p>

        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="이전 연도"
            onClick={() => setDisplayedYear((y) => y - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground active:bg-background"
          >
            <ChevronIcon direction="left" />
          </button>
          <span className="text-[18px] font-bold text-foreground">{displayedYear}년</span>
          <button
            type="button"
            aria-label="다음 연도"
            disabled={displayedYear >= current.year}
            onClick={() => setDisplayedYear((y) => y + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground disabled:opacity-60 active:bg-background"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {MONTHS.map((m) => {
            const disabled = isFutureYearMonth(displayedYear, m);
            const selected = displayedYear === year && m === month;
            return (
              <button
                key={m}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(displayedYear, m)}
                aria-current={selected ? "date" : undefined}
                className={`rounded-full px-3 py-1.5 type-chip disabled:opacity-60 ${
                  selected ? "bg-point text-white" : "bg-background text-foreground/70"
                }`}
              >
                {m}월
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MonthPicker({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = getCurrentKstYearMonth();
  const atCurrentMonth = year === current.year && month === current.month;

  function goToMonth(deltaMonths: number) {
    const next = shiftMonth(year, month, deltaMonths);
    onChange(next.year, next.month);
  }

  return (
    <div className="flex items-center justify-center gap-1 px-5">
      <button
        type="button"
        aria-label="이전 달"
        onClick={() => goToMonth(-1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground active:bg-background"
      >
        <ChevronIcon direction="left" />
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="rounded-xl px-2 py-1 text-[18px] font-bold text-foreground active:bg-background"
      >
        {formatKoreanYearMonth(year, month)}
      </button>

      <button
        type="button"
        aria-label="다음 달"
        disabled={atCurrentMonth}
        onClick={() => goToMonth(1)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground disabled:opacity-60 active:bg-background"
      >
        <ChevronIcon direction="right" />
      </button>

      {open ? (
        <YearMonthSheet
          year={year}
          month={month}
          onSelect={(y, m) => {
            onChange(y, m);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
