import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase/client";

function toError(error: PostgrestError): Error {
  return new Error(`${error.message} (code: ${error.code})`, { cause: error });
}

type ErrorReason = "not_found" | "invalid_input" | "rate_limited" | "upstream_error" | "not_configured";

/** Only ever used for the dictionary_search_fail Mixpanel property — never shown to the user. */
export type DictionarySearchErrorType = "timeout" | "network_error" | "api_error" | "rate_limit" | "unknown";

export type SearchEconomicTermResult =
  // `saved` is false only when a signed-in user's search history write
  // itself failed — never a lie about that, and never affects whether
  // `term`/`description` are shown (see TermDictionarySheet).
  | { ok: true; term: string; description: string; cached: boolean; saved: boolean }
  | { ok: false; reason: ErrorReason; message: string; errorType: DictionarySearchErrorType };

const SEARCH_TIMEOUT_MS = 20_000;

function errorTypeFromReason(reason: ErrorReason): DictionarySearchErrorType {
  switch (reason) {
    case "rate_limited":
      return "rate_limit";
    case "upstream_error":
    case "not_configured":
      return "api_error";
    default:
      return "unknown";
  }
}

/** Calls POST /api/economic-term — see src/app/api/economic-term/route.ts for the full contract. */
export async function searchEconomicTerm(term: string): Promise<SearchEconomicTermResult> {
  const controller = new AbortController();
  // No server-side request timeout exists today, so without this, a stalled
  // Gemini/network call would just hang indefinitely rather than ever
  // surfacing as a distinguishable "timeout" — added specifically so that
  // category is real and not a Mixpanel property that can never fire.
  const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);

  try {
    const res = await fetch("/api/economic-term", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term }),
      signal: controller.signal,
    });
    const body = (await res.json().catch(() => null)) as
      | { ok: true; term: string; description: string; cached: boolean; saved: boolean }
      | { ok: false; reason: ErrorReason; message: string }
      | null;
    if (!body) {
      return {
        ok: false,
        reason: "upstream_error",
        message: "설명을 가져오지 못했어요. 잠시 후 다시 시도해주세요.",
        errorType: "api_error",
      };
    }
    if (body.ok) return body;
    return { ...body, errorType: errorTypeFromReason(body.reason) };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        ok: false,
        reason: "upstream_error",
        message: "응답이 너무 오래 걸려요. 잠시 후 다시 시도해주세요.",
        errorType: "timeout",
      };
    }
    return {
      ok: false,
      reason: "upstream_error",
      message: "네트워크 연결을 확인해주세요.",
      errorType: "network_error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface TermSearch {
  id: string;
  term: string;
  description: string;
  lastSearchedAt: string;
}

type TermSearchRow = {
  id: string;
  term: string;
  description: string;
  last_searched_at: string;
};

function rowToTermSearch(row: TermSearchRow): TermSearch {
  return {
    id: row.id,
    term: row.term,
    description: row.description,
    lastSearchedAt: row.last_searched_at,
  };
}

/** RLS-scoped to the signed-in user — see supabase/migrations/0005_economic_term_searches.sql. */
export async function getTermSearches(): Promise<TermSearch[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("economic_term_searches")
    .select("id, term, description, last_searched_at")
    .order("last_searched_at", { ascending: false });
  if (error) throw toError(error);
  return (data ?? []).map(rowToTermSearch);
}

export async function deleteTermSearch(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("economic_term_searches").delete().eq("id", id);
  if (error) throw toError(error);
}
