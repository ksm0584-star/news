"use client";

import { forwardRef } from "react";
import ArticleBottomSheet, { type SheetPanelState } from "./ArticleBottomSheet";
import ExternalRecordFields from "./ExternalRecordFields";
import type { NewsCategory } from "@/lib/news-categories";

export type { SheetPanelState as WritePanelState };

const ExternalArticleWritePanel = forwardRef<
  HTMLTextAreaElement,
  {
    panelState: SheetPanelState;
    onOpen: () => void;
    onCollapse: () => void;
    onToggleExpand: () => void;
    title: string;
    onTitleChange: (value: string) => void;
    sector: NewsCategory | "";
    onSectorChange: (category: NewsCategory) => void;
    articleSummary: string;
    onArticleSummaryChange: (value: string) => void;
    investmentNote: string;
    onInvestmentNoteChange: (value: string) => void;
    error: string | null;
    submitting: boolean;
    onSubmit: () => void;
    submitLabel?: string;
    submitPendingLabel?: string;
    minimizedVariant?: "handle" | "cta";
  }
>(function ExternalArticleWritePanel(
  {
    panelState,
    onOpen,
    onCollapse,
    onToggleExpand,
    title,
    onTitleChange,
    sector,
    onSectorChange,
    articleSummary,
    onArticleSummaryChange,
    investmentNote,
    onInvestmentNoteChange,
    error,
    submitting,
    onSubmit,
    submitLabel = "저장",
    submitPendingLabel = "저장 중...",
    minimizedVariant = "handle",
  },
  articleSummaryRef,
) {
  return (
    <ArticleBottomSheet
      state={panelState}
      ariaLabel="기록 작성"
      minimizedLabel="기록하기"
      showBackButton={false}
      minimizedVariant={minimizedVariant}
      onOpen={onOpen}
      onCollapse={onCollapse}
      onToggleExpand={onToggleExpand}
      footer={
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="w-full rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white disabled:opacity-60 active:bg-point-dark"
        >
          {submitting ? submitPendingLabel : submitLabel}
        </button>
      }
    >
      <ExternalRecordFields
        ref={articleSummaryRef}
        title={title}
        onTitleChange={onTitleChange}
        sector={sector}
        onSectorChange={onSectorChange}
        articleSummary={articleSummary}
        onArticleSummaryChange={onArticleSummaryChange}
        investmentNote={investmentNote}
        onInvestmentNoteChange={onInvestmentNoteChange}
        error={error}
      />
    </ArticleBottomSheet>
  );
});

export default ExternalArticleWritePanel;
