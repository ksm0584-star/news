"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import ArticleViewer from "@/components/ArticleViewer";
import ExternalArticleWritePanel, {
  type WritePanelState,
} from "@/components/ExternalArticleWritePanel";
import { useAuth } from "@/lib/auth-context";
import { createRecord, findPastRecordWithThought } from "@/lib/records";
import { useExternalDraft } from "@/lib/use-external-draft";
import { useSheetHeightPx } from "@/lib/use-sheet-height";
import { useCollapseSheetOnArticleActivity } from "@/lib/use-collapse-sheet-on-article-activity";
import { useNativeArticleWebView } from "@/lib/native/use-native-article-webview";
import { isNativePlatform } from "@/lib/platform";
import { combineExternalContent } from "@/lib/external-record-content";
import { isMemoValid } from "@/lib/validate-memo";
import { track, trackClick } from "@/lib/mixpanel";

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function ExternalArticleView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url") ?? "";
  const urlIsValid = isHttpUrl(rawUrl);
  const { user, loading: authLoading } = useAuth();
  const draft = useExternalDraft(rawUrl);

  const [panelState, setPanelState] = useState<WritePanelState>("minimized");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const panelHeightPx = useSheetHeightPx(panelState);

  const articleAreaRef = useRef<HTMLDivElement>(null);
  const articleSummaryRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useNativeArticleWebView(rawUrl, urlIsValid, articleAreaRef, panelHeightPx);

  // Mobile back-button UX: while the panel is open, back should collapse it
  // instead of leaving the screen. We push one history entry when it opens
  // and consume it on close, so a second back press behaves normally.
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
    if (authLoading) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!pushedHistoryRef.current) {
      window.history.pushState({ newsnoteWritePanel: true }, "");
      pushedHistoryRef.current = true;
    }
    trackClick("external_write_open");
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

  if (!urlIsValid) {
    return (
      <div>
        <BackHeader title="기사 보며 기록하기" />
        <div className="px-5 py-10 text-center text-sm text-muted">
          올바른 기사 주소가 아니에요. 다시 입력해주세요.
        </div>
        <div className="px-5 pb-6">
          <Link
            href="/record/new"
            className="block w-full rounded-xl bg-point py-3.5 text-center text-[15px] font-semibold text-white active:bg-point-dark"
          >
            URL 다시 입력하기
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    if (!draft.title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    if (!draft.sector) {
      setError("섹터를 선택해주세요");
      return;
    }
    if (!isMemoValid(draft.articleSummary)) {
      setError("기사 정리를 입력해주세요");
      articleSummaryRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { record, duplicate } = await createRecord({
        title: draft.title.trim(),
        sector: draft.sector,
        sourceType: "external",
        url: rawUrl,
        thought: combineExternalContent(draft.articleSummary, draft.investmentNote),
      });

      draft.clear();

      if (duplicate) {
        router.replace(`/record/${record.id}?duplicate=1`);
        return;
      }

      track("record_saved", {
        record_id: record.id,
        sector: record.sector,
        source_type: record.sourceType,
        has_thought: Boolean(record.thought),
      });

      if (record.thought) {
        const past = await findPastRecordWithThought(record.sector, record.id);
        if (past) {
          router.replace(`/record/complete/${record.id}`);
          return;
        }
      }
      router.push(`/record/${record.id}?saved=1`);
    } catch (err) {
      const cause = err instanceof Error ? err.cause : undefined;
      const c = cause as { code?: string; details?: string } | undefined;
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Record save failed:", errorMessage, c?.code ?? "", c?.details ?? "");
      setSubmitting(false);
      setError(
        process.env.NODE_ENV === "development"
          ? `저장 실패: ${errorMessage}`
          : "저장에 실패했어요. 다시 시도해주세요.",
      );
    }
  }

  const native = isNativePlatform();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <BackHeader title="기사 보며 기록하기" />

      <div
        ref={articleAreaRef}
        onPointerDown={() => {
          if (panelState !== "minimized") collapsePanel();
        }}
        className="relative flex-1 overflow-hidden bg-background"
      >
        {native ? null : (
          <ArticleViewer
            ref={iframeRef}
            url={rawUrl}
            extraNote="새 탭에서 읽고 돌아와도 작성 중인 내용은 그대로 남아있어요"
          />
        )}
      </div>

      <ExternalArticleWritePanel
        ref={articleSummaryRef}
        panelState={panelState}
        onOpen={openPanel}
        onCollapse={collapsePanel}
        onToggleExpand={() =>
          setPanelState((current) => (current === "expanded" ? "peek" : "expanded"))
        }
        title={draft.title}
        onTitleChange={draft.setTitle}
        sector={draft.sector}
        onSectorChange={draft.setSector}
        articleSummary={draft.articleSummary}
        onArticleSummaryChange={draft.setArticleSummary}
        investmentNote={draft.investmentNote}
        onInvestmentNoteChange={draft.setInvestmentNote}
        error={error}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {showLoginModal ? (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      ) : null}
    </div>
  );
}

export default function ExternalArticlePage() {
  return (
    <Suspense fallback={<BackHeader title="기사 보며 기록하기" />}>
      <ExternalArticleView />
    </Suspense>
  );
}
