"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useKeyboardInsetPx } from "@/lib/use-keyboard-inset";
import { searchEconomicTerm } from "@/lib/economic-terms";
import { MAX_TERM_LENGTH } from "@/lib/economic-term-format";

type SearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; term: string; description: string; saved: boolean }
  | { status: "not_found" }
  | { status: "error"; message: string };

/**
 * The caller only mounts this while open (`{dictionaryOpen ? <TermDictionarySheet .../> : null}`,
 * same pattern as LoginRequiredModal) rather than this component tracking
 * an `open` prop itself — so every open is a genuine fresh mount, and
 * search/query state is naturally gone the next time it opens without
 * needing an effect to reset it.
 */
export default function TermDictionarySheet({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<SearchState>({ status: "idle" });
  // Guards a response landing after this sheet unmounted (closed) or after
  // a newer search started — not a UI concern by itself, just correctness
  // for the setState calls in handleSearch below.
  const requestRef = useRef(0);
  const keyboardInsetPx = useKeyboardInsetPx();

  useEffect(() => {
    return () => {
      requestRef.current += 1;
    };
  }, []);

  async function handleSearch() {
    const term = query.trim();
    if (!term || state.status === "loading") return;
    const requestId = ++requestRef.current;
    setState({ status: "loading" });
    const result = await searchEconomicTerm(term);
    if (requestRef.current !== requestId) return;
    if (result.ok) {
      setState({
        status: "success",
        term: result.term,
        description: result.description,
        saved: result.saved,
      });
    } else if (result.reason === "not_found") {
      setState({ status: "not_found" });
    } else {
      setState({ status: "error", message: result.message });
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="경제용어사전">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        style={{ bottom: keyboardInsetPx }}
        className="fixed inset-x-0 z-50 mx-auto flex max-h-[80dvh] w-full max-w-[430px] flex-col rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-[15px] font-bold text-foreground">경제용어사전</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted active:bg-background"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 px-5 pb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_TERM_LENGTH}
            placeholder="예) 기준금리"
            aria-label="경제용어 검색"
            className="flex-1 rounded-xl border border-border-subtle bg-background px-3.5 py-2.5 text-[14px] text-foreground outline-none focus:border-point"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={state.status === "loading" || !query.trim()}
            className="rounded-xl bg-point px-4 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60 active:bg-point-dark"
          >
            검색
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
          {state.status === "idle" ? (
            <p className="py-8 text-center text-[13.5px] text-muted">
              궁금한 경제용어를 검색해 보세요.
            </p>
          ) : state.status === "loading" ? (
            <div className="flex items-center justify-center py-8">
              <span
                aria-label="검색 중"
                className="h-5 w-5 animate-spin rounded-full border-2 border-border-subtle border-t-point"
              />
            </div>
          ) : state.status === "success" ? (
            <div className="rounded-xl bg-background px-4 py-3.5">
              <p className="text-[14.5px] font-bold text-foreground">{state.term}</p>
              <p className="mt-1.5 text-[13.5px] leading-6 text-foreground/80">
                {state.description}
              </p>
              <p className="mt-2 text-[11.5px] text-muted">
                AI가 생성한 설명으로, 부정확할 수 있어요.
              </p>
              {state.saved ? null : (
                <p className="mt-1 text-[11.5px] text-red-500">
                  검색 기록 저장에 실패했어요. 설명은 그대로 확인할 수 있어요.
                </p>
              )}
            </div>
          ) : state.status === "not_found" ? (
            <p className="py-8 text-center text-[13.5px] text-muted">
              용어를 확인할 수 없어요. 다른 용어로 검색해보세요.
            </p>
          ) : (
            <div className="py-6 text-center">
              <p className="text-[13.5px] text-red-500">{state.message}</p>
              <button
                type="button"
                onClick={handleSearch}
                className="mt-3 rounded-xl border border-border-subtle px-4 py-2 text-[13px] font-medium text-foreground active:bg-background"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
