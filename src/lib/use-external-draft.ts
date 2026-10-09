"use client";

import { useEffect, useRef, useState } from "react";
import type { NewsCategory } from "./news-categories";

export interface ExternalDraft {
  title: string;
  sector: NewsCategory | "";
  articleSummary: string;
  investmentNote: string;
}

const EMPTY_DRAFT: ExternalDraft = {
  title: "",
  sector: "",
  articleSummary: "",
  investmentNote: "",
};

function draftKey(storageKey: string): string {
  return `newsnote:external-draft:${storageKey}`;
}

function readDraft(storageKey: string): ExternalDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(storageKey));
    if (!raw) return null;
    // `thought` is read for compatibility with drafts saved before the
    // 기사 정리/투자에 적용하기 split — it maps onto the new articleSummary field.
    const parsed = JSON.parse(raw) as
      | (Partial<ExternalDraft> & { thought?: string })
      | null;
    const articleSummary =
      typeof parsed?.articleSummary === "string"
        ? parsed.articleSummary
        : typeof parsed?.thought === "string"
          ? parsed.thought
          : null;
    if (typeof parsed?.title !== "string" || articleSummary === null) return null;
    return {
      title: parsed.title,
      sector: parsed.sector ?? "",
      articleSummary,
      investmentNote: typeof parsed.investmentNote === "string" ? parsed.investmentNote : "",
    };
  } catch {
    return null;
  }
}

function writeDraft(storageKey: string, draft: ExternalDraft): void {
  try {
    localStorage.setItem(draftKey(storageKey), JSON.stringify(draft));
  } catch {
    // Best-effort: private browsing / storage quota can throw.
  }
}

function removeDraft(storageKey: string): void {
  try {
    localStorage.removeItem(draftKey(storageKey));
  } catch {
    // Best-effort.
  }
}

/**
 * A draft with nothing in any field is never meaningfully "a draft to
 * restore" — treating it as one is exactly how an edit session that
 * mounts before its record has finished loading can end up overwriting
 * real saved content with blanks: the write effect below persists
 * whatever's in state ~300ms after mount, which is still EMPTY_DRAFT if
 * the record fetch hasn't resolved yet, and a later visit to the same
 * edit session would then see "a draft exists" and skip reseeding from
 * the record entirely. Treating an all-empty draft as equivalent to no
 * draft at all — on both read and write — closes that race and also
 * self-heals any such empty entry a past visit already left behind.
 */
function isEmptyDraft(draft: ExternalDraft): boolean {
  return !draft.title && !draft.sector && !draft.articleSummary && !draft.investmentNote;
}

/**
 * Persists the external-article write form to localStorage, keyed by
 * `storageKey` — the article URL for a new record (so a different article
 * URL starts blank), or something caller-chosen and distinct for other
 * cases (e.g. an edit session, keyed by record id so it can never collide
 * with an unrelated new-record draft for the same URL). Survives switching
 * tabs, navigating to the original article in the same tab and coming back,
 * or the OS backgrounding/evicting the app.
 *
 * `enabled` (default true): when false, this is just plain in-memory field
 * state — no localStorage read or write at all.
 *
 * `restoredDraft` in the return value is `null` until the initial
 * localStorage read finishes (or immediately, when `enabled` is false),
 * then `true`/`false` for whether a saved draft actually existed — callers
 * that only want to seed fields from elsewhere when there's nothing to
 * restore can wait on this instead of guessing from current field values.
 */
export function useExternalDraft(storageKey: string, enabled = true) {
  const [draft, setDraft] = useState<ExternalDraft>(EMPTY_DRAFT);
  const [restoredDraft, setRestoredDraft] = useState<boolean | null>(enabled ? null : false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    // Reading localStorage is a synchronous external-system read, not
    // derivable state — it can only happen after mount (no `window` during
    // SSR), so there's no render-time alternative to this effect.
    const stored = readDraft(storageKey);
    const hasContent = stored !== null && !isEmptyDraft(stored);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(hasContent ? stored : EMPTY_DRAFT);
    setRestoredDraft(hasContent);
    loadedRef.current = true;
  }, [storageKey, enabled]);

  useEffect(() => {
    if (!enabled || !loadedRef.current) return;
    const timeout = setTimeout(() => {
      if (isEmptyDraft(draft)) {
        removeDraft(storageKey);
      } else {
        writeDraft(storageKey, draft);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [storageKey, draft, enabled]);

  return {
    title: draft.title,
    setTitle: (title: string) => setDraft((d) => ({ ...d, title })),
    sector: draft.sector,
    setSector: (sector: NewsCategory | "") => setDraft((d) => ({ ...d, sector })),
    articleSummary: draft.articleSummary,
    setArticleSummary: (articleSummary: string) => setDraft((d) => ({ ...d, articleSummary })),
    investmentNote: draft.investmentNote,
    setInvestmentNote: (investmentNote: string) => setDraft((d) => ({ ...d, investmentNote })),
    restoredDraft,
    clear: () => {
      if (!enabled) return;
      removeDraft(storageKey);
      setDraft(EMPTY_DRAFT);
    },
  };
}
