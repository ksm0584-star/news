"use client";

import { forwardRef, useState } from "react";
import { WRITABLE_CATEGORIES, type NewsCategory } from "@/lib/news-categories";

const MEMO_DEFAULT_PLACEHOLDER = "이 뉴스를 읽고 기억하고 싶은 내용을 적어보세요.";

const MEMO_HINTS = [
  {
    label: "이 뉴스의 핵심은 무엇인가요?",
    placeholder: "중요하다고 생각한 내용을 내 말로 짧게 정리해보세요.",
  },
  {
    label: "새로 알게 된 점",
    placeholder: "이번 뉴스를 통해 새롭게 이해한 내용을 적어보세요.",
  },
  {
    label: "궁금한 점",
    placeholder: "이해되지 않거나 더 알아보고 싶은 내용을 적어보세요.",
  },
] as const;

/** Shared title/sector-chip/memo fields — used by the plain write form and the external-article write panel. */
const RecordFormFields = forwardRef<
  HTMLTextAreaElement,
  {
    title: string;
    onTitleChange: (value: string) => void;
    sector: NewsCategory | "";
    onSectorChange: (category: NewsCategory) => void;
    sectorNeedsReselect?: boolean;
    thought: string;
    onThoughtChange: (value: string) => void;
    error: string | null;
  }
>(function RecordFormFields(
  {
    title,
    onTitleChange,
    sector,
    onSectorChange,
    sectorNeedsReselect,
    thought,
    onThoughtChange,
    error,
  },
  thoughtRef,
) {
  const [selectedHint, setSelectedHint] = useState<number | null>(null);
  const placeholder =
    selectedHint === null ? MEMO_DEFAULT_PLACEHOLDER : MEMO_HINTS[selectedHint].placeholder;

  return (
    <>
      <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
        제목 *
      </label>
      <input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        className="mb-4 w-full rounded-xl border border-border-subtle bg-background px-4 py-3 text-[14px] text-foreground outline-none focus:border-point"
      />

      <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
        섹터 *
      </label>
      {sectorNeedsReselect ? (
        <p className="mb-2 text-[12.5px] font-medium text-point">
          분야 체계가 바뀌었어요. 새 분야를 다시 선택해주세요
        </p>
      ) : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {WRITABLE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onSectorChange(category)}
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${
              sector === category
                ? "bg-point text-white"
                : "bg-background text-foreground/70"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
        나의 메모 *
      </label>
      <p className="mb-2 text-[12px] text-muted">
        핵심 내용, 새로 알게 된 점, 궁금한 점 중 하나만 적어도 좋아요.
      </p>
      <div className="mb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {MEMO_HINTS.map((hint, index) => (
          <button
            key={hint.label}
            type="button"
            onClick={() => setSelectedHint((current) => (current === index ? null : index))}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium ${
              selectedHint === index
                ? "bg-point text-white"
                : "bg-background text-foreground/70"
            }`}
          >
            {hint.label}
          </button>
        ))}
      </div>
      <textarea
        ref={thoughtRef}
        value={thought}
        onChange={(e) => onThoughtChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="mb-2 w-full resize-none rounded-xl border border-border-subtle bg-background px-4 py-3 text-[14px] leading-6 text-foreground outline-none focus:border-point"
      />
      {error ? <p className="mb-2 text-[13px] text-red-500">{error}</p> : null}
    </>
  );
});

export default RecordFormFields;
