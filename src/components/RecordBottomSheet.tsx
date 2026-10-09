"use client";

import Link from "next/link";
import ArticleBottomSheet, { type SheetPanelState } from "./ArticleBottomSheet";
import RecordSummaryContent from "./RecordSummaryContent";
import type { NewsRecord } from "@/lib/types";

/**
 * Read-only counterpart to ExternalArticleWritePanel — same sheet shell,
 * but shows an already-saved record instead of an editable form. "기록
 * 수정" hands off to the existing /record/new?editId= flow rather than
 * editing inline here. Used only for iframe-supported articles — when the
 * article is iframe-unsupported, record/[id]/article/page.tsx shows the
 * record inline on the page instead (no sheet needed there).
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
      <RecordSummaryContent record={record} />
    </ArticleBottomSheet>
  );
}
