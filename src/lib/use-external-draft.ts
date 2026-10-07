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

function draftKey(url: string): string {
  return `newsnote:external-draft:${url}`;
}

function readDraft(url: string): ExternalDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(url));
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

function writeDraft(url: string, draft: ExternalDraft): void {
  try {
    localStorage.setItem(draftKey(url), JSON.stringify(draft));
  } catch {
    // Best-effort: private browsing / storage quota can throw.
  }
}

function removeDraft(url: string): void {
  try {
    localStorage.removeItem(draftKey(url));
  } catch {
    // Best-effort.
  }
}

/**
 * Persists the external-article write form to localStorage, keyed by the
 * article URL, so switching tabs to read the original article — or the OS
 * backgrounding/evicting the app — never loses what the user typed. A
 * different article URL starts from a blank draft.
 */
export function useExternalDraft(url: string) {
  const [draft, setDraft] = useState<ExternalDraft>(EMPTY_DRAFT);
  const loadedRef = useRef(false);

  useEffect(() => {
    // Reading localStorage is a synchronous external-system read, not
    // derivable state — it can only happen after mount (no `window` during
    // SSR), so there's no render-time alternative to this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(readDraft(url) ?? EMPTY_DRAFT);
    loadedRef.current = true;
  }, [url]);

  useEffect(() => {
    if (!loadedRef.current) return;
    const timeout = setTimeout(() => writeDraft(url, draft), 300);
    return () => clearTimeout(timeout);
  }, [url, draft]);

  return {
    title: draft.title,
    setTitle: (title: string) => setDraft((d) => ({ ...d, title })),
    sector: draft.sector,
    setSector: (sector: NewsCategory | "") => setDraft((d) => ({ ...d, sector })),
    articleSummary: draft.articleSummary,
    setArticleSummary: (articleSummary: string) => setDraft((d) => ({ ...d, articleSummary })),
    investmentNote: draft.investmentNote,
    setInvestmentNote: (investmentNote: string) => setDraft((d) => ({ ...d, investmentNote })),
    clear: () => {
      removeDraft(url);
      setDraft(EMPTY_DRAFT);
    },
  };
}
