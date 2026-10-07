"use client";

import Link from "next/link";
import ArticleBottomSheet, { type SheetPanelState } from "./ArticleBottomSheet";
import { splitExternalContent } from "@/lib/external-record-content";
import type { NewsRecord } from "@/lib/types";

/**
 * Read-only counterpart to ExternalArticleWritePanel — same sheet shell,
 * but shows an already-saved record instead of an editable form. "기록
 * 수정" hands off to the existing /record/new?editId= flow rather than
 * editing inline here.
 *
 * Sectioned (기사 정리 / 투자에 적용하기) so a future 경제용어 section can be
 * appended the same way, without restructuring this component.
 */
export default function RecordBottomSheet({
  record,
  panelState,
  onOpen,
  onCollapse,
  onToggleExpand,
}: {
  record: NewsRecord;
  panelState: SheetPanelState;
  onOpen: () => void;
  onCollapse: () => void;
  onToggleExpand: () => void;
}) {
  const { articleSummary, investmentNote } = splitExternalContent(record.thought);

  return (
    <ArticleBottomSheet
      state={panelState}
      ariaLabel="저장된 기록"
      minimizedLabel="기록 보기"
      onOpen={onOpen}
      onCollapse={onCollapse}
      onToggleExpand={onToggleExpand}
      footer={
        <Link
          href={`/record/new?editId=${record.id}&from=detail`}
          className="block w-full rounded-xl bg-point py-3.5 text-center text-[15px] font-semibold text-white active:bg-point-dark"
        >
          기록 수정
        </Link>
      }
    >
      <h1 className="mb-1 text-[16px] font-bold leading-snug text-foreground">{record.title}</h1>
      <p className="mb-4 text-[12px] text-muted">{record.sector}</p>

      <section className="mb-4">
        <h2 className="mb-1.5 text-[13px] font-semibold text-foreground">기사 정리</h2>
        {articleSummary ? (
          <p className="whitespace-pre-line rounded-xl bg-background px-4 py-3.5 text-[14px] leading-6 text-foreground/80">
            {articleSummary}
          </p>
        ) : (
          <p className="rounded-xl bg-background px-4 py-3.5 text-[13.5px] text-muted">
            아직 작성한 메모가 없어요
          </p>
        )}
      </section>

      {investmentNote ? (
        <section className="mb-4">
          <h2 className="mb-1.5 text-[13px] font-semibold text-foreground">투자에 적용하기</h2>
          <p className="whitespace-pre-line rounded-xl bg-background px-4 py-3.5 text-[14px] leading-6 text-foreground/80">
            {investmentNote}
          </p>
        </section>
      ) : null}

      {/* 향후 경제용어 섹션은 여기에 추가 */}
    </ArticleBottomSheet>
  );
}
