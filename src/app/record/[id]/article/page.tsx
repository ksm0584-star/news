"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import LoginPrompt from "@/components/LoginPrompt";
import ArticleViewer from "@/components/ArticleViewer";
import ArticleUnavailableNotice from "@/components/ArticleUnavailableNotice";
import OpenInBrowserLink from "@/components/OpenInBrowserLink";
import RecordBottomSheet from "@/components/RecordBottomSheet";
import RecordSummaryContent from "@/components/RecordSummaryContent";
import type { SheetPanelState } from "@/components/ArticleBottomSheet";
import { useRecord } from "@/lib/use-records-store";
import { useAuth } from "@/lib/auth-context";
import { useCollapseSheetOnArticleActivity } from "@/lib/use-collapse-sheet-on-article-activity";
import { isIframeUnsupported } from "@/lib/iframe-support";

/**
 * Read-only "원문 보기" screen reached from the record detail page: the
 * article iframe/fallback plus a Bottom Sheet showing the saved record
 * (reusing the same sheet shell the write screen uses). No editing here —
 * "기록 수정" in the sheet hands off to the existing edit flow. Back always
 * returns to whatever screen linked here (the record detail), via the
 * default router.back() behavior in BackHeader.
 */
export default function RecordArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { record, loading: recordLoading } = useRecord(params.id);

  const [panelState, setPanelState] = useState<SheetPanelState>("minimized");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Mobile back-button UX: while the sheet is open, back should collapse it
  // instead of leaving the screen — same pattern as the write screen.
  const pushedHistoryRef = useRef(false);

  useEffect(() => {
    function onPopState() {
      if (pushedHistoryRef.current) {
        pushedHistoryRef.current = false;
        setPanelState("minimized");
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function openPanel() {
    if (!pushedHistoryRef.current) {
      window.history.pushState({ newsnoteRecordSheet: true }, "");
      pushedHistoryRef.current = true;
    }
    setPanelState("peek");
  }

  function collapsePanel() {
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      window.history.back();
    }
    setPanelState("minimized");
  }

  // Closes the sheet when the user goes back to reading — see the hook's
  // own comment for what it can and can't detect across the iframe boundary.
  useCollapseSheetOnArticleActivity(panelState !== "minimized", iframeRef, collapsePanel);

  if (authLoading || (user && recordLoading)) return null;

  if (!user) {
    return (
      <div>
        <BackHeader title="원문" />
        <LoginPrompt />
      </div>
    );
  }

  if (!record || !record.url) {
    return (
      <div>
        <BackHeader title="원문" onBack={() => router.replace(`/record/${params.id}`)} />
        <div className="px-5 py-10 text-center text-sm text-muted">
          원문 주소를 찾을 수 없어요.
        </div>
      </div>
    );
  }

  // iframe-unsupported articles get no Bottom Sheet — there's no article
  // view worth protecting/switching back to, so the saved record just
  // shows as a normal page below the guidance card.
  if (isIframeUnsupported(record.url)) {
    return (
      <div className="pb-10">
        <BackHeader title="원문" />
        <div className="px-5 py-5">
          <ArticleUnavailableNotice url={record.url} />
        </div>
        <div className="px-5 pb-5">
          <RecordSummaryContent record={record} />
          <Link
            href={`/record/new?editId=${record.id}&from=detail`}
            className="mt-2 block w-full rounded-xl bg-point py-3.5 text-center text-[15px] font-semibold text-white active:bg-point-dark"
          >
            기록 수정
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <BackHeader title="원문" right={<OpenInBrowserLink url={record.url} />} />
      <div
        onPointerDown={() => {
          if (panelState !== "minimized") collapsePanel();
        }}
        className="relative flex-1 overflow-hidden bg-background"
      >
        <ArticleViewer ref={iframeRef} url={record.url} />
      </div>

      <RecordBottomSheet
        record={record}
        panelState={panelState}
        onOpen={openPanel}
        onCollapse={collapsePanel}
        onToggleExpand={() =>
          setPanelState((current) => (current === "expanded" ? "peek" : "expanded"))
        }
      />
    </div>
  );
}
