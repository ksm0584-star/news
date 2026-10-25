"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ArticleLinkBanner from "@/components/ArticleLinkBanner";
import BackHeader from "@/components/BackHeader";
import SectorBadge from "@/components/SectorBadge";
import FirstRecordLoginPromptSheet from "@/components/FirstRecordLoginPromptSheet";
import RatingPromptSheet from "@/components/RatingPromptSheet";
import { deleteRecord } from "@/lib/record-store";
import { queueToast, usePendingToastRelease } from "@/lib/toast";
import { useRecord, useRecords, useReflectionsForRecord } from "@/lib/use-records-store";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/format";
import { splitExternalContent } from "@/lib/external-record-content";
import { useArticleTitleLookup } from "@/lib/use-article-title-lookup";
import { track, trackClick } from "@/lib/mixpanel";
import { hasSeenLoginPrompt } from "@/lib/login-prompt";
import { hasSeenRatingPrompt } from "@/lib/rating-prompt";
import type { Reflection } from "@/lib/types";

const RESULT_LABEL: Record<Reflection["result"], string> = {
  same: "생각이 같아요",
  changed: "생각이 달라졌어요",
  unsure: "아직 모르겠어요",
  hard_to_compare: "비교하기 어려워요",
};

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function RecordDetailInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicate = searchParams.get("duplicate") === "1";
  const justSaved = searchParams.get("saved") === "1";
  // Set by the write screen right after a qualifying first-ever anonymous
  // save (see record/new/page.tsx and record/new/external/page.tsx).
  // showLoginPrompt below re-checks hasSeenLoginPrompt() at mount time
  // regardless of this param, so refreshing this same URL after the sheet
  // already showed once correctly does not show it again.
  const firstLocal = searchParams.get("firstLocal") === "1";
  // Set right after a user's 2nd successful new record save (see
  // record/new/page.tsx and record/new/external/page.tsx) — mutually
  // exclusive with firstLocal by construction (a save can't be both the
  // 1st and 2nd), but showRatingPrompt below re-checks hasSeenRatingPrompt()
  // at mount time regardless, same reasoning as showLoginPrompt.
  const showRatingParam = searchParams.get("rating") === "1";

  const { user, loading: authLoading } = useAuth();
  const { record, loading: recordLoading } = useRecord(params.id);
  // Called unconditionally (hook rule) — before the early returns below,
  // using optional chaining since `record` can still be null/undefined at
  // this point. Only actually fetches when there's a real URL AND no
  // already-known article_title (skips the network round trip otherwise —
  // see the hook's own comment for why `null` short-circuits it).
  const needsLiveTitleLookup = Boolean(
    record && !record.articleTitle && record.url && isHttpUrl(record.url),
  );
  const { title: liveArticleTitle, status: liveArticleTitleStatus } = useArticleTitleLookup(
    needsLiveTitleLookup ? (record!.url as string) : null,
  );
  const { reflections } = useReflectionsForRecord(params.id);
  const { records: allRecords } = useRecords();
  const recordsById = new Map(allRecords.map((r) => [r.id, r]));

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(
    () => !user && firstLocal && !hasSeenLoginPrompt(),
  );
  const [showRatingPrompt, setShowRatingPrompt] = useState(
    () => showRatingParam && !hasSeenRatingPrompt(),
  );

  // Fires once per mount, distinguishing a genuine revisit from the
  // immediate landing right after this exact record was just saved/deduped
  // — both of those come from a redirect carrying a query param, so neither
  // one represents the user coming back later to re-read their own record.
  const trackedViewRef = useRef(false);
  useEffect(() => {
    if (!record || trackedViewRef.current) return;
    trackedViewRef.current = true;
    track("record_viewed", {
      record_id: record.id,
      sector: record.sector,
      entry_point: duplicate ? "duplicate_redirect" : justSaved ? "post_save" : "direct",
    });
  }, [record, duplicate, justSaved]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDownOutside(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDownOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDownOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // The in-screen back button can't rely on router.back() alone — a direct
  // URL load or a bfcache-restored tab may have no prior app history at
  // all. So it routes explicitly based on how this screen was reached:
  // just-saved/duplicate redirects (both router.replace, no write screen
  // left in history) still collapse to home as before, and every other
  // entry (내 기록 탭, a future home record-card link carrying
  // `from=home`, or a direct URL with no `from`) returns to 내 기록 — the
  // screen this detail view conceptually belongs to.
  function goBack() {
    if (justSaved || duplicate) {
      router.replace("/");
      return;
    }
    router.push(searchParams.get("from") === "home" ? "/" : "/records");
  }

  usePendingToastRelease(
    authLoading || recordLoading ? "loading" : record ? "ready" : "failed",
  );

  if (authLoading || recordLoading) return null;

  if (!record) {
    return (
      <div>
        <BackHeader title="기록" onBack={goBack} />
        <div className="px-5 py-10 text-center text-sm text-muted">
          기록을 찾을 수 없어요.
        </div>
      </div>
    );
  }

  // External records fold 기사 정리 + 투자에 적용하기 into the one `thought`
  // column (see external-record-content.ts); split it back here for display
  // only. Records without the marker show their whole `thought` as-is.
  const { articleSummary, investmentNote } = splitExternalContent(record.thought);
  // Gates the connected-article banner — a record with no usable URL
  // keeps its original layout exactly (nothing above the title).
  const hasOriginalLink = Boolean(record.url && isHttpUrl(record.url));
  // The banner's actual displayed text — never the domain, never
  // `record.title` (see the banner's own comment below for why). Priority:
  // the record's own saved articleTitle > a successful live lookup > an
  // explicit, honest "확인할 수 없어요" state while loading or on failure.
  const bannerTitle =
    record.articleTitle ??
    (liveArticleTitleStatus === "resolved" && liveArticleTitle
      ? liveArticleTitle
      : liveArticleTitleStatus === "loading"
        ? "원문 제목을 불러오는 중..."
        : "원문 제목을 확인할 수 없어요");

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteRecord(user, record!.id);
      track("record_deleted", { record_id: record!.id, sector: record!.sector });
      queueToast("기록이 삭제되었어요.", { to: "/records" });
      router.replace("/records");
    } catch {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="pb-10">
      <BackHeader title="기록" onBack={goBack} />
      {duplicate ? (
        <div className="mx-5 mt-3 rounded-xl bg-background px-4 py-2.5 text-center text-[13px] font-medium text-muted">
          이미 스크랩한 기사예요
        </div>
      ) : null}

      <div className="px-5 py-5">
        {record.imageUrl ? (
          <div className="relative mb-4 h-44 w-full overflow-hidden rounded-2xl bg-background">
            <Image
              src={record.imageUrl}
              alt=""
              fill
              sizes="430px"
              className="object-cover"
            />
          </div>
        ) : null}

        {hasOriginalLink ? (
          // Always the real article URL, same tab (no target="_blank") so
          // the browser's own back button returns here — unified with the
          // record-writing screen's connected-article banner
          // (ArticleLinkBanner, ArticleOpenExternalBar's "원문 보기" text
          // link → icon+title+chevron banner, 2026-10-26: record detail
          // now follows the same unification). No more iframe-support
          // branch: /record/[id]/article (the old iframe viewer for
          // "supported" domains) is gone.
          //
          // 2026-10-26: moved above the 섹터/날짜/메뉴 row (was below it) —
          // `mb-4` is the same 16px gap `record.imageUrl`'s block above
          // already uses before that row, so the row sits the same
          // distance from whichever block (image or banner) precedes it.
          //
          // 2026-10-26 bug fix: this used to pass `record.title` (the
          // user's own record title) here, which is wrong — a record with
          // a short/unrelated title (e.g. "ㅇㅇ") made the banner show that
          // instead of the real article headline. `record.articleTitle` is
          // the actual original title, saved separately at creation time
          // (see records.ts/local-records.ts).
          //
          // 2026-10-26 (2nd pass): a record saved before `articleTitle`
          // existed has none — rather than falling back to the URL's
          // domain (tried first, then explicitly rejected: a domain name
          // isn't "the original title" either), `bannerTitle` above now
          // looks it up live from the article page's own og:title via
          // useArticleTitleLookup, and shows a distinct, honest
          // "확인할 수 없어요" state if that also fails — never the domain,
          // never `record.title`.
          <ArticleLinkBanner
            href={record.url}
            title={bannerTitle}
            className="mb-4"
            onClick={() => {
              trackClick("external_open_new_tab");
              // Distinct entry_point from the write/edit screen's — this
              // is "reread a saved record's original article," not
              // "attaching/editing a record" (뉴스 열람 구조 개편 3차:
              // /record/[id]/article's old iframe-mount article_opened
              // moves here, to the actual 원문 보기 click, since that
              // route no longer renders an article at all).
              track("article_opened", {
                source_type: "external",
                entry_point: "record_detail",
                record_id: record.id,
                sector: record.sector,
              });
            }}
          />
        ) : null}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SectorBadge sector={record.sector} />
            <span className="text-xs text-muted">{formatDate(record.createdAt)}</span>
          </div>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="기록 관리 메뉴"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[18px] font-bold leading-none text-foreground/70 active:bg-background"
            >
              ···
            </button>
            {menuOpen ? (
              <div
                role="menu"
                aria-label="기록 관리 메뉴"
                className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-xl border border-border-subtle bg-surface py-1 shadow-lg"
              >
                <Link
                  href={`/record/new?editId=${record.id}&from=detail`}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    trackClick("detail_edit_cta", { record_id: record.id });
                  }}
                  className="block px-4 py-2.5 text-[13.5px] font-medium text-foreground active:bg-background"
                >
                  기록 수정
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    trackClick("detail_delete_intent", { record_id: record.id });
                    setConfirmingDelete(true);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-[13.5px] font-medium text-red-500 active:bg-background"
                >
                  기록 삭제
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <h1 className="text-[18px] font-bold leading-snug text-foreground">
          {record.title}
        </h1>

        <div className="mt-6">
          <h2 className="mb-2 text-[14px] font-bold text-foreground">뉴스 기록</h2>
          {articleSummary ? (
            <p className="whitespace-pre-line rounded-xl bg-background px-4 py-3.5 type-memo-body text-foreground/80">
              {articleSummary}
            </p>
          ) : (
            <p className="rounded-xl bg-background px-4 py-3.5 text-[13.5px] text-muted">
              아직 작성한 메모가 없어요
            </p>
          )}
        </div>

        {investmentNote.trim() ? (
          <div className="mt-detail-section-gap">
            <h2 className="mb-2 text-[14px] font-bold text-foreground">투자에 적용하기</h2>
            <p className="whitespace-pre-line rounded-xl bg-background px-4 py-3.5 type-memo-body text-foreground/80">
              {investmentNote}
            </p>
          </div>
        ) : null}

        {reflections.length > 0 ? (
          <div className="mt-detail-section-gap">
            <h2 className="mb-2 text-[14px] font-bold text-foreground">
              회고 기록
            </h2>
            <div className="flex flex-col gap-2">
              {reflections.map((reflection) => {
                const otherId =
                  reflection.recordId === record.id
                    ? reflection.comparedRecordId
                    : reflection.recordId;
                const other = recordsById.get(otherId);
                return (
                  <div
                    key={reflection.id}
                    className="rounded-xl border border-border-subtle px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 type-record-card-title text-foreground">
                        {other ? other.title : "삭제된 기록"}
                      </span>
                      <span className="shrink-0 text-[12px] text-muted">
                        {formatDate(reflection.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-semibold text-point">
                        {RESULT_LABEL[reflection.result]}
                      </span>
                      <Link
                        href={`/record/${record.id}/reflection/${reflection.id}`}
                        onClick={() =>
                          trackClick("reflection_edit_cta", { reflection_id: reflection.id })
                        }
                        className="text-[12px] font-medium text-point"
                      >
                        수정
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {confirmingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8">
          <div className="w-full max-w-[320px] rounded-2xl bg-surface p-5">
            <p className="text-[15px] font-bold text-foreground">기록을 삭제할까요?</p>
            <p className="mt-1.5 text-[13px] text-muted">
              삭제하면 다시 되돌릴 수 없어요
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="button-48 flex-1 rounded-xl border border-border-subtle type-button text-foreground/70 disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="button-48 flex-1 rounded-xl bg-red-500 type-button text-white disabled:opacity-60"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showLoginPrompt ? (
        <FirstRecordLoginPromptSheet onClose={() => setShowLoginPrompt(false)} />
      ) : showRatingPrompt ? (
        <RatingPromptSheet autoTriggered onClose={() => setShowRatingPrompt(false)} />
      ) : null}
    </div>
  );
}

export default function RecordDetailPage() {
  return (
    <Suspense fallback={null}>
      <RecordDetailInner />
    </Suspense>
  );
}
