"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import LoginPrompt from "@/components/LoginPrompt";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import ArticleViewer from "@/components/ArticleViewer";
import ArticleOpenExternalBar from "@/components/ArticleOpenExternalBar";
import OpenInBrowserLink from "@/components/OpenInBrowserLink";
import ExternalRecordFields from "@/components/ExternalRecordFields";
import ExternalArticleWritePanel, {
  type WritePanelState,
} from "@/components/ExternalArticleWritePanel";
import { useAuth } from "@/lib/auth-context";
import { createRecord, findPastRecordWithThought, updateRecord } from "@/lib/records";
import { useRecord } from "@/lib/use-records-store";
import { useExternalDraft } from "@/lib/use-external-draft";
import { useSheetHeightPx } from "@/lib/use-sheet-height";
import { useKeyboardInsetPx } from "@/lib/use-keyboard-inset";
import { useCollapseSheetOnArticleActivity } from "@/lib/use-collapse-sheet-on-article-activity";
import { useNativeArticleWebView } from "@/lib/native/use-native-article-webview";
import { isNativePlatform } from "@/lib/platform";
import { isIframeUnsupported } from "@/lib/iframe-support";
import { resolveCategoryForSector } from "@/lib/news-categories";
import { combineExternalContent, splitExternalContent } from "@/lib/external-record-content";
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
  const editId = searchParams.get("editId");
  const from = searchParams.get("from");
  const isEditMode = Boolean(editId);
  const { record: editingRecord, loading: editingRecordLoading } = useRecord(editId ?? "");

  // Create mode takes the URL from the query string; edit mode takes it
  // from the record being edited — its URL/sourceType never change via
  // updateRecord, so this is always the same article the record was
  // originally saved from.
  const rawUrl = isEditMode ? (editingRecord?.url ?? "") : (searchParams.get("url") ?? "");
  const urlIsValid = isHttpUrl(rawUrl);
  const { user, loading: authLoading } = useAuth();
  // Edit mode's fields are seeded from the record below, not a draft — the
  // localStorage draft (keyed by this same URL) belongs to a *new*-record
  // attempt and must not be read from or overwritten while editing.
  const draft = useExternalDraft(rawUrl, !isEditMode);

  // Edit mode fetches the record over the network, so its fields can arrive
  // a render or two after mount — seed the draft fields from it exactly
  // once, the same way /record/new's edit mode already does.
  const [editDraftApplied, setEditDraftApplied] = useState(!isEditMode);
  useEffect(() => {
    if (isEditMode && editingRecord && !editDraftApplied) {
      const { articleSummary, investmentNote } = splitExternalContent(editingRecord.thought);
      const resolvedSector = resolveCategoryForSector(editingRecord.sector);
      draft.setTitle(editingRecord.title);
      if (resolvedSector) draft.setSector(resolvedSector);
      draft.setArticleSummary(articleSummary);
      draft.setInvestmentNote(investmentNote);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditDraftApplied(true);
    }
  }, [isEditMode, editingRecord, editDraftApplied, draft]);

  const [panelState, setPanelState] = useState<WritePanelState>("minimized");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const panelHeightPx = useSheetHeightPx(panelState);
  const keyboardInsetPx = useKeyboardInsetPx();

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

  // This is the write screen, so the record form should already be visible
  // on entry rather than needing a tap first — but only once we know the
  // user is actually logged in (same gate openPanel already applies), and
  // only if nothing has changed panelState in the meantime.
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (autoOpenedRef.current || authLoading || !user) return;
    autoOpenedRef.current = true;
    setPanelState((current) => (current === "minimized" ? "peek" : current));
  }, [authLoading, user]);

  // Brief grace window before the blur-based "user tapped the article"
  // signal (see the hook below) is allowed to collapse the sheet. Without
  // it, any stray focus shift around initial mount/layout — before the
  // user has had a chance to even see the screen — could instantly
  // collapse a sheet that's now open by default. A direct tap on the
  // non-iframe article area (the pointerdown handler below) isn't gated by
  // this — only the ambiguous blur signal is.
  const [autoCollapseArmed, setAutoCollapseArmed] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAutoCollapseArmed(true), 600);
    return () => clearTimeout(timer);
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
  useCollapseSheetOnArticleActivity(
    panelState !== "minimized" && autoCollapseArmed,
    iframeRef,
    collapsePanel,
  );

  if (isEditMode && editingRecordLoading) {
    return (
      <div>
        <BackHeader title="기록 수정" />
        <div className="px-5 py-10 text-center text-sm text-muted">불러오는 중...</div>
      </div>
    );
  }

  if (isEditMode && !editingRecord) {
    return (
      <div>
        <BackHeader title="기록 수정" />
        <div className="px-5 py-10 text-center text-sm text-muted">
          기록을 찾을 수 없어요.
        </div>
      </div>
    );
  }

  if (isEditMode && !editDraftApplied) {
    return (
      <div>
        <BackHeader title="기록 수정" />
        <div className="px-5 py-10 text-center text-sm text-muted">불러오는 중...</div>
      </div>
    );
  }

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
      if (isEditMode && editingRecord) {
        const updated = await updateRecord(editingRecord.id, {
          title: draft.title.trim(),
          sector: draft.sector,
          thought: combineExternalContent(draft.articleSummary, draft.investmentNote),
        });
        track("record_edited", {
          record_id: updated.id,
          sector: updated.sector,
          has_thought: Boolean(updated.thought),
        });
        const destination =
          from === "complete" ? `/record/complete/${updated.id}` : `/record/${updated.id}`;
        router.replace(destination);
        return;
      }

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
  // Native shows a real native WebView (not an iframe), so this never
  // applies there — only the web iframe path can be blocked by a site's
  // X-Frame-Options/CSP. Only a domain src/lib/iframe-support.ts has
  // actually confirmed blocks framing gets this treatment — never a guess
  // based on how the current load attempt is going.
  const isConfirmedUnsupported = !native && isIframeUnsupported(rawUrl);

  // A blocked domain can't show the article and the write form side by
  // side, so there's nothing for a bottom sheet to sit over — this is a
  // plain scrolling page instead, reusing the same draft/fields/submit
  // logic as the sheet below. The fixed footer rides above the keyboard
  // the same way ArticleBottomSheet's footer does (see useKeyboardInsetPx).
  if (isConfirmedUnsupported) {
    return (
      <div style={{ paddingBottom: `calc(7rem + ${keyboardInsetPx}px)` }}>
        <BackHeader title={isEditMode ? "기록 수정" : "기록하기"} />
        <ArticleOpenExternalBar url={rawUrl} />

        {authLoading ? null : !user ? (
          <div className="px-5 pt-4">
            <LoginPrompt />
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              <ExternalRecordFields
                ref={articleSummaryRef}
                title={draft.title}
                onTitleChange={draft.setTitle}
                sector={draft.sector}
                onSectorChange={draft.setSector}
                articleSummary={draft.articleSummary}
                onArticleSummaryChange={draft.setArticleSummary}
                investmentNote={draft.investmentNote}
                onInvestmentNoteChange={draft.setInvestmentNote}
                error={error}
              />
            </div>

            <div
              style={{ bottom: keyboardInsetPx }}
              className="fixed inset-x-0 z-40 mx-auto w-full max-w-[430px] border-t border-border-subtle bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3"
            >
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white disabled:opacity-60 active:bg-point-dark"
              >
                {submitting
                  ? isEditMode
                    ? "수정 중..."
                    : "저장 중..."
                  : isEditMode
                    ? "수정 완료"
                    : "저장"}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <BackHeader
        title={isEditMode ? "기사 보며 수정하기" : "기사 보며 기록하기"}
        right={native ? undefined : <OpenInBrowserLink url={rawUrl} />}
      />

      <div
        ref={articleAreaRef}
        onPointerDown={() => {
          if (panelState !== "minimized") collapsePanel();
        }}
        className="relative flex-1 overflow-hidden bg-background"
      >
        {native ? null : (
          <ArticleViewer ref={iframeRef} url={rawUrl} bottomInsetPx={panelHeightPx} />
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
        submitLabel={isEditMode ? "수정 완료" : "저장"}
        submitPendingLabel={isEditMode ? "수정 중..." : "저장 중..."}
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
