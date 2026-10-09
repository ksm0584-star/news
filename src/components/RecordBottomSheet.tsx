"use client";

import ArticleBottomSheet, { type SheetPanelState } from "./ArticleBottomSheet";
import RecordSummaryContent from "./RecordSummaryContent";
import type { NewsRecord } from "@/lib/types";

/**
 * Read-only counterpart to ExternalArticleWritePanel — same sheet shell,
 * but shows an already-saved record instead of an editable form. No
 * in-sheet "기록 수정"/"← 기사로 돌아가기"/"크게 보기" controls — editing is
 * reached from the record detail screen's "···" menu instead, the header's
 * own back button already returns there, and the handle itself (via
 * ArticleBottomSheet's showExpandButton={false}) is the expand/collapse
 * toggle now that there's no button left in that row to tap. Used only for
 * iframe-supported articles — when the article is iframe-unsupported,
 * record/[id]/article/page.tsx shows the record inline on the page instead
 * (no sheet needed there).
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
      showBackButton={false}
      showExpandButton={false}
      onOpen={onOpen}
      onCollapse={onCollapse}
      onToggleExpand={onToggleExpand}
    >
      <RecordSummaryContent record={record} />
    </ArticleBottomSheet>
  );
}
