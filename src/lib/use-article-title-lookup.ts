"use client";

import { useEffect, useState } from "react";

/**
 * Session-scoped (in-memory, cleared on page reload) cache of resolved
 * article titles by URL — shared across every useArticleTitleLookup call
 * this tab makes, so revisiting the same record's detail/edit screen never
 * re-fetches a title it already resolved. Caching the *promise* (not just
 * the value) also de-dupes two near-simultaneous lookups of the same URL
 * into a single request, same pattern as record-store.ts's monthCache.
 *
 * Only a *successful* resolution is kept: a null result (network failure,
 * timeout, or the page genuinely had no extractable title) is evicted
 * right after it settles, so a later mount actually retries instead of
 * being stuck repeating the same "확인할 수 없어요" forever — the
 * underlying page may simply have been temporarily unreachable.
 */
const titleCache = new Map<string, Promise<string | null>>();

function lookupArticleTitle(url: string): Promise<string | null> {
  const cached = titleCache.get(url);
  if (cached) return cached;

  const promise = fetch(`/api/article-title?url=${encodeURIComponent(url)}`)
    .then((res) => res.json())
    .then((data: { title: string | null }) => data.title)
    .catch(() => null);
  titleCache.set(url, promise);
  promise.then((title) => {
    if (!title) titleCache.delete(url);
  });
  return promise;
}

/**
 * Live-looks-up a record's original article title via GET /api/article-title
 * when `records.article_title` wasn't saved for it (see that route's own
 * comment). Pass `null` (not an empty string) for `url` to skip the
 * lookup entirely — the caller already has a real `articleTitle` to show
 * and shouldn't pay for a network round trip it doesn't need.
 *
 * `status` starts "idle" (nothing to look up) or "loading" (a `url` was
 * given from the very first render), then settles on "resolved" (a real
 * title came back) or "unavailable" (fetch failed, timed out, or the page
 * had no recognizable title) — callers render a distinct, honest state
 * for each, never substituting the domain or the record's own title for a
 * missing one. A failed lookup never throws — the record screen must
 * render either way.
 *
 * Doesn't handle a `url` that flips from a real value back to `null` after
 * mount (every caller's `url` comes from a record's own stable fields, so
 * this doesn't happen in practice) — only the idle→loading and
 * loading→resolved/unavailable transitions matter here.
 */
export function useArticleTitleLookup(url: string | null): {
  title: string | null;
  status: "idle" | "loading" | "resolved" | "unavailable";
} {
  const [title, setTitle] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "resolved" | "unavailable">(() =>
    url ? "loading" : "idle",
  );

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    lookupArticleTitle(url).then((result) => {
      if (cancelled) return;
      if (result) {
        setTitle(result);
        setStatus("resolved");
      } else {
        setStatus("unavailable");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { title, status };
}
