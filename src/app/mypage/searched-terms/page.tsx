"use client";

import { useEffect, useRef, useState } from "react";
import BackHeader from "@/components/BackHeader";
import LoginPrompt from "@/components/LoginPrompt";
import EmptyState from "@/components/EmptyState";
import EconomicTermHistoryCard from "@/components/EconomicTermHistoryCard";
import { useAuth } from "@/lib/auth-context";
import { deleteTermSearch, getTermSearches, type TermSearch } from "@/lib/economic-terms";
import { track } from "@/lib/mixpanel";

export default function SearchedTermsPage() {
  const { user, loading: authLoading } = useAuth();
  const [terms, setTerms] = useState<TermSearch[] | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    getTermSearches()
      .then((rows) => {
        if (!cancelled) setTerms(rows);
      })
      .catch((err) => {
        console.error("SearchedTermsPage: failed to load", err);
        if (!cancelled) setTerms([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  // Fires once per page visit, only after the real count has loaded — not
  // on every re-render (e.g. the delete-confirm dialog opening/closing
  // also re-renders this component, which must not re-fire this).
  const trackedHistoryOpenRef = useRef(false);
  useEffect(() => {
    if (terms === null || trackedHistoryOpenRef.current) return;
    trackedHistoryOpenRef.current = true;
    track("dictionary_history_open", {
      source: "mypage",
      history_count: terms.length,
      is_logged_in: Boolean(user),
    });
  }, [terms, user]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div>
        <BackHeader title="검색한 경제용어" />
        <LoginPrompt />
      </div>
    );
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteTermSearch(id);
      setTerms((current) => current?.filter((t) => t.id !== id) ?? current);
    } catch (err) {
      console.error("SearchedTermsPage: failed to delete", err);
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

  return (
    <div className="pb-10">
      <BackHeader title="검색한 경제용어" />

      {terms === null ? null : terms.length === 0 ? (
        <div className="px-5 pt-4">
          <EmptyState
            title="아직 검색한 경제용어가 없어요."
            description="뉴스를 읽다가 궁금한 용어를 검색해 보세요."
          />
        </div>
      ) : (
        <>
          <p className="px-5 pt-4 text-[13px] text-muted">총 {terms.length}개</p>
          <div className="mt-2 flex flex-col gap-2.5 px-5 py-3">
            {terms.map((t, index) => (
              <EconomicTermHistoryCard
                key={t.id}
                term={t.term}
                description={t.description}
                lastSearchedAt={t.lastSearchedAt}
                position={index + 1}
                historyCount={terms.length}
                onRequestDelete={() => setConfirmingId(t.id)}
              />
            ))}
          </div>
        </>
      )}

      {confirmingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8">
          <div className="w-full max-w-[320px] rounded-2xl bg-surface p-5">
            <p className="text-[15px] font-bold text-foreground">검색 기록을 삭제할까요?</p>
            <p className="mt-1.5 text-[13px] text-muted">삭제하면 다시 되돌릴 수 없어요</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingId(null)}
                disabled={deletingId !== null}
                className="button-48 flex-1 rounded-xl border border-border-subtle type-button text-foreground/70 disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmingId)}
                disabled={deletingId !== null}
                className="button-48 flex-1 rounded-xl bg-red-500 type-button text-white disabled:opacity-60"
              >
                {deletingId ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
