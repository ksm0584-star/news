"use client";

import { forwardRef } from "react";
import { WRITABLE_CATEGORIES, type NewsCategory } from "@/lib/news-categories";

/**
 * Title/sector/content fields for the external-article write panel only.
 * Deliberately separate from RecordFormFields (used by /record/new) — the
 * content shape here (기사 정리 + 투자에 적용하기) is specific to this
 * screen's bottom-sheet flow and must not change /record/new's form.
 * Same design tokens/classes as RecordFormFields, reused as-is.
 */
const ExternalRecordFields = forwardRef<
  HTMLTextAreaElement,
  {
    title: string;
    onTitleChange: (value: string) => void;
    sector: NewsCategory | "";
    onSectorChange: (category: NewsCategory) => void;
    articleSummary: string;
    onArticleSummaryChange: (value: string) => void;
    investmentNote: string;
    onInvestmentNoteChange: (value: string) => void;
    error: string | null;
  }
>(function ExternalRecordFields(
  {
    title,
    onTitleChange,
    sector,
    onSectorChange,
    articleSummary,
    onArticleSummaryChange,
    investmentNote,
    onInvestmentNoteChange,
    error,
  },
  articleSummaryRef,
) {
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
        기사 정리 *
      </label>
      <textarea
        ref={articleSummaryRef}
        value={articleSummary}
        onChange={(e) => onArticleSummaryChange(e.target.value)}
        placeholder="무슨 일이 일어났나요? 왜 일어났나요? 구체적으로 어떤 내용인가요?"
        rows={5}
        className="mb-4 w-full resize-none rounded-xl border border-border-subtle bg-background px-4 py-3 text-[14px] leading-6 text-foreground outline-none focus:border-point"
      />

      <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
        투자에 적용하기
      </label>
      <textarea
        value={investmentNote}
        onChange={(e) => onInvestmentNoteChange(e.target.value)}
        placeholder="이 변화가 어떤 산업·기업·자산에 영향을 줄까요? 앞으로 어떻게 될 것 같나요?"
        rows={4}
        className="mb-2 w-full resize-none rounded-xl border border-border-subtle bg-background px-4 py-3 text-[14px] leading-6 text-foreground outline-none focus:border-point"
      />
      {error ? <p className="mb-2 text-[13px] text-red-500">{error}</p> : null}
    </>
  );
});

export default ExternalRecordFields;
