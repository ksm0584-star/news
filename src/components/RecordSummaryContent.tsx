import { splitExternalContent } from "@/lib/external-record-content";
import type { NewsRecord } from "@/lib/types";

/**
 * A saved record's read-only content (title/sector + 기사 정리 + 투자에
 * 적용하기), with no "기록 수정" button or container of its own — callers
 * place that and any wrapping shell (RecordBottomSheet's sheet, or a plain
 * page section) around it. Shared so this doesn't get reimplemented per
 * screen.
 *
 * Sectioned so a future 경제용어 section can be appended the same way,
 * without restructuring this component.
 */
export default function RecordSummaryContent({ record }: { record: NewsRecord }) {
  const { articleSummary, investmentNote } = splitExternalContent(record.thought);

  return (
    <>
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
    </>
  );
}
