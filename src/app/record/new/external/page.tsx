"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import ArticleOpenExternalBar from "@/components/ArticleOpenExternalBar";
import TermDictionaryButton from "@/components/TermDictionaryButton";
import TermDictionarySheet from "@/components/TermDictionarySheet";
import ExternalRecordFields from "@/components/ExternalRecordFields";
import { useAuth } from "@/lib/auth-context";
import { createRecord, findPastRecordWithThought, updateRecord } from "@/lib/record-store";
import { queueToast } from "@/lib/toast";
import { useRecord } from "@/lib/use-records-store";
import { useExternalDraft } from "@/lib/use-external-draft";
import { useKeyboardInsetPx } from "@/lib/use-keyboard-inset";
import { resolveCategoryForSector, WRITABLE_CATEGORIES } from "@/lib/news-categories";
import { combineExternalContent, splitExternalContent } from "@/lib/external-record-content";
import { isMemoValid } from "@/lib/validate-memo";
import { shouldOfferFirstRecordLoginPrompt } from "@/lib/login-prompt";
import { incrementNewSaveCount, shouldOfferRatingPrompt } from "@/lib/rating-prompt";
import { track } from "@/lib/mixpanel";

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * The record-writing screen for an external article — one common UI for
 * every article now (this used to branch between an iframe+bottom-sheet
 * view and this plain scrolling form depending on iframe support; the
 * iframe branch was removed, this is now the only one, per the "뉴스 열람
 * 구조 개편" 1차 작업). "원문 보기" always opens the real article in the
 * same browser tab (ArticleOpenExternalBar) instead of rendering it inside
 * the app.
 */
function ExternalArticleView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  const from = searchParams.get("from");
  const isEditMode = Boolean(editId);
  // Set only by the return banner's onRecord (see use-article-return-banner.ts)
  // — distinguishes that path from a (hypothetical) direct home-news-list
  // entry landing here with the same title/sector/url shape, for record_started.
  const entryParam = searchParams.get("entry");
  const { record: editingRecord, loading: editingRecordLoading } = useRecord(editId ?? "");

  // Create mode takes the URL from the query string; edit mode takes it
  // from the record being edited — its URL/sourceType never change via
  // updateRecord, so this is always the same article the record was
  // originally saved from.
  const rawUrl = isEditMode ? (editingRecord?.url ?? "") : (searchParams.get("url") ?? "");
  const urlIsValid = isHttpUrl(rawUrl);
  const { user, loading: authLoading } = useAuth();
  // Edit mode is keyed by record id (never the URL) — the article's URL
  // could coincidentally match some unrelated in-progress *new*-record
  // draft, which editing must never read from or overwrite. Keying by id
  // instead also means this safely survives opening the original article
  // in the same tab (this screen unmounts) and coming back via browser
  // back (it remounts and restores from here) just like the create flow
  // already did by URL.
  const draft = useExternalDraft(isEditMode ? `edit:${editId}` : rawUrl);

  // Edit mode fetches the record over the network, so its fields can arrive
  // a render or two after mount. Only seed from the record when there's no
  // already-restored draft for this edit session (see useExternalDraft's
  // `restoredDraft`) — otherwise this would stomp on in-progress edits the
  // user made, navigated away from (e.g. to read the original article),
  // and came back to.
  const [editDraftApplied, setEditDraftApplied] = useState(!isEditMode);
  useEffect(() => {
    if (!isEditMode || !editingRecord || editDraftApplied) return;
    if (draft.restoredDraft === null) return; // wait for the initial read
    if (!draft.restoredDraft) {
      const { articleSummary, investmentNote } = splitExternalContent(editingRecord.thought);
      const resolvedSector = resolveCategoryForSector(editingRecord.sector);
      draft.setTitle(editingRecord.title);
      if (resolvedSector) draft.setSector(resolvedSector);
      draft.setArticleSummary(articleSummary);
      draft.setInvestmentNote(investmentNote);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditDraftApplied(true);
  }, [isEditMode, editingRecord, editDraftApplied, draft]);

  // Create mode only: a caller (e.g. the home screen's news list) can pass
  // ?title=&sector= to pre-fill the form for a specific article. Same
  // restoredDraft-gated pattern as edit mode above — never overwrites a
  // draft the user already started for this exact URL.
  const titleParam = searchParams.get("title");
  const sectorParam = searchParams.get("sector");
  const [prefillApplied, setPrefillApplied] = useState(isEditMode);
  useEffect(() => {
    if (isEditMode || prefillApplied) return;
    if (draft.restoredDraft === null) return; // wait for the initial read
    if (!draft.restoredDraft) {
      if (titleParam) draft.setTitle(titleParam);
      if (sectorParam && (WRITABLE_CATEGORIES as readonly string[]).includes(sectorParam)) {
        draft.setSector(sectorParam as (typeof WRITABLE_CATEGORIES)[number]);
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefillApplied(true);
  }, [isEditMode, prefillApplied, draft, titleParam, sectorParam]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);

  const keyboardInsetPx = useKeyboardInsetPx();
  const articleSummaryRef = useRef<HTMLTextAreaElement>(null);

  // Measures the actual rendered mobile content column (this page's own
  // root div, which fills RootLayout's centered `max-w-[430px]` wrapper)
  // so the dictionary button's `right` offset can be computed from that
  // column's real right edge instead of the raw browser viewport edge —
  // see TermDictionaryButton's own comment for why that distinction
  // matters on a wide desktop window.
  const pageRootRef = useRef<HTMLDivElement>(null);
  const [dictionaryRightPx, setDictionaryRightPx] = useState(16);
  useEffect(() => {
    function updateOffset() {
      const rect = pageRootRef.current?.getBoundingClientRect();
      if (!rect) return;
      setDictionaryRightPx(Math.max(16, Math.round(window.innerWidth - rect.right) + 16));
    }
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  // The dictionary button sits just above the fixed save-button footer.
  // Previously this re-measured the footer's *live rendered* rect
  // (getBoundingClientRect()) every time keyboardInsetPx changed — but
  // that rect is itself produced by a React commit + paint that has to
  // happen first, so on iOS Safari (where keyboardInsetPx can update
  // several times in quick succession while the keyboard animates open or
  // closed) this button could read the footer's rect for the *previous*
  // frame, one step behind — visible as it briefly jumping to, or
  // vanishing to, the wrong spot before catching up. The footer's own
  // *height* never changes with the keyboard (only its `bottom` does, via
  // the same keyboardInsetPx this button also has) — so the only thing
  // worth measuring is that height, once, and then this button's offset is
  // a direct synchronous function of keyboardInsetPx, the same single
  // source of truth the footer itself renders from, instead of a second
  // value derived from the footer's own DOM output a frame later.
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeightPx, setFooterHeightPx] = useState<number | null>(null);
  useEffect(() => {
    if (keyboardInsetPx !== 0 || footerHeightPx !== null) return;
    const rect = footerRef.current?.getBoundingClientRect();
    if (rect) setFooterHeightPx(Math.round(rect.height));
  }, [keyboardInsetPx, footerHeightPx]);
  const dictionaryBottomPx = (footerHeightPx ?? 76) + keyboardInsetPx + 12;

  function openDictionary() {
    track("dictionary_open", {
      source: "article_view",
      page: pathname,
      is_logged_in: Boolean(user),
    });
    setDictionaryOpen(true);
  }

  // Fires once per mount: the true start of a new record's funnel, but
  // only for sessions landing here with title+sector params — currently
  // that's only ever the return banner's onRecord (entryParam set), kept as
  // a fallback to "home_news_list" for any other caller that might reach
  // here the same way. A session that arrived via the plain /record/new
  // URL-paste trampoline already fired record_started there — firing again
  // here would double-count a single funnel start.
  const trackedStartRef = useRef(false);
  useEffect(() => {
    if (isEditMode || authLoading || trackedStartRef.current) return;
    if (!urlIsValid || !titleParam || !sectorParam) return;
    trackedStartRef.current = true;
    track("record_started", {
      entry_point: entryParam === "article_return_prompt" ? "article_return_prompt" : "home_news_list",
      source_type: "external",
      ...(sectorParam ? { sector: sectorParam } : {}),
    });
  }, [isEditMode, authLoading, urlIsValid, titleParam, sectorParam, entryParam]);

  // Fires once per mount, when the attached URL is confirmed usable —
  // distinct from merely typing/pasting a URL (which can still be
  // malformed; see the "올바른 기사 주소가 아니에요" branch below).
  const trackedAttachRef = useRef(false);
  useEffect(() => {
    if (isEditMode || trackedAttachRef.current || !urlIsValid) return;
    trackedAttachRef.current = true;
    track("record_article_attached", {
      source_type: "external",
      ...(sectorParam ? { sector: sectorParam } : {}),
    });
  }, [isEditMode, urlIsValid, sectorParam]);

  // Fires once the edit target has fully loaded (record + any restored
  // draft) and settled onto this screen.
  const trackedEditStartRef = useRef(false);
  useEffect(() => {
    if (!isEditMode || trackedEditStartRef.current) return;
    if (editingRecordLoading || !editingRecord || !editDraftApplied) return;
    trackedEditStartRef.current = true;
    track("record_edit_started", {
      record_id: editingRecord.id,
      sector: editingRecord.sector,
      entry_point: from ?? "unknown",
    });
  }, [isEditMode, editingRecordLoading, editingRecord, editDraftApplied, from]);

  // article_opened means "the user actually opened the original article,"
  // not "this screen (which merely offers a 원문 보기 link) loaded" — a
  // mount-based fire used to conflate those two (every edit-screen visit
  // counted as an "open" even if 원문 보기 was never tapped). Fired instead
  // from ArticleOpenExternalBar's onOpenArticle, at the actual click (뉴스
  // 열람 구조 개편 3차) — see handleOpenArticle below.
  //
  // "home_news_list" is skipped here: that open is already counted at the
  // moment the home news card is tapped (see LatestNewsList.tsx's
  // handleArticleOpen), before Safari even leaves for the article —
  // counting it again if the user re-opens 원문 보기 from this screen
  // would double-count the same funnel step. A `external_open_new_tab`
  // button_click still fires for that re-open either way.
  function handleOpenArticle() {
    track("article_opened", {
      source_type: "external",
      entry_point: isEditMode ? "record_edit" : "manual_url",
      ...(isEditMode && editingRecord
        ? { record_id: editingRecord.id, sector: editingRecord.sector }
        : sectorParam
          ? { sector: sectorParam }
          : {}),
    });
  }

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
            className="button-48 w-full rounded-xl bg-point type-button text-white active:bg-point-dark"
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
      setError("내 생각을 입력해주세요");
      articleSummaryRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode && editingRecord) {
        const updated = await updateRecord(user, editingRecord.id, {
          title: draft.title.trim(),
          sector: draft.sector,
          thought: combineExternalContent(draft.articleSummary, draft.investmentNote),
        });
        draft.clear();
        track("record_edited", {
          record_id: updated.id,
          sector: updated.sector,
          has_thought: Boolean(updated.thought),
        });
        const destination =
          from === "complete" ? `/record/complete/${updated.id}` : `/record/${updated.id}`;
        queueToast("기록이 수정되었어요.", { to: destination });
        router.replace(destination);
        return;
      }

      const { record, duplicate } = await createRecord(user, {
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
        auth_status: user ? "logged_in" : "guest",
      });

      // Only ever true for an anonymous save — see shouldOfferFirstRecordLoginPrompt.
      const firstLocal = !user && (await shouldOfferFirstRecordLoginPrompt());
      // Counts only a genuine new save reaching this point (never an edit,
      // a deduped repeat, or migrate-local-records.ts's own direct calls).
      const newSaveCount = incrementNewSaveCount();
      const showRating = shouldOfferRatingPrompt(newSaveCount);

      const extraParams: string[] = [];
      if (firstLocal) extraParams.push("firstLocal=1");
      if (showRating) extraParams.push("rating=1");
      const extraQuery = extraParams.join("&");

      if (record.thought) {
        const past = await findPastRecordWithThought(user, record.sector, record.id);
        if (past) {
          router.replace(`/record/complete/${record.id}${extraQuery ? `?${extraQuery}` : ""}`);
          return;
        }
      }
      router.push(`/record/${record.id}?saved=1${extraQuery ? `&${extraQuery}` : ""}`);
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

  return (
    <div
      ref={pageRootRef}
      style={{ paddingBottom: `calc(7rem + ${keyboardInsetPx}px)` }}
    >
      <BackHeader title={isEditMode ? "기록 수정" : "기록하기"} />
      <ArticleOpenExternalBar
        url={rawUrl}
        onOpenArticle={!isEditMode && titleParam && sectorParam ? undefined : handleOpenArticle}
      />

      {authLoading ? null : (
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
            ref={footerRef}
            style={{ bottom: keyboardInsetPx }}
            className="fixed inset-x-0 z-40 mx-auto w-full max-w-[430px] border-t border-border-subtle bg-surface px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3"
          >
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="button-48 w-full rounded-xl bg-point type-button text-white disabled:opacity-60 active:bg-point-dark"
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

      {/* Independent of login state — dictionary lookup works whether
          signed in or not, same as before. Hidden only while its own
          sheet is open; there's no write bottom-sheet anymore to also
          check against. */}
      <TermDictionaryButton
        hidden={dictionaryOpen}
        rightOffsetPx={dictionaryRightPx}
        bottomOffsetPx={dictionaryBottomPx}
        onClick={openDictionary}
      />
      {dictionaryOpen ? (
        <TermDictionarySheet onClose={() => setDictionaryOpen(false)} />
      ) : null}
    </div>
  );
}

export default function ExternalArticlePage() {
  return (
    <Suspense fallback={<BackHeader title="" />}>
      <ExternalArticleView />
    </Suspense>
  );
}
