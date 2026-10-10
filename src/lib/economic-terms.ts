import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase/client";

function toError(error: PostgrestError): Error {
  return new Error(`${error.message} (code: ${error.code})`, { cause: error });
}

export type SearchEconomicTermResult =
  // `saved` is false only when a signed-in user's search history write
  // itself failed — never a lie about that, and never affects whether
  // `term`/`description` are shown (see TermDictionarySheet).
  | { ok: true; term: string; description: string; cached: boolean; saved: boolean }
  | { ok: false; reason: "not_found" | "invalid_input" | "rate_limited" | "upstream_error" | "not_configured"; message: string };

/** Calls POST /api/economic-term — see src/app/api/economic-term/route.ts for the full contract. */
export async function searchEconomicTerm(term: string): Promise<SearchEconomicTermResult> {
  try {
    const res = await fetch("/api/economic-term", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term }),
    });
    const body = (await res.json().catch(() => null)) as SearchEconomicTermResult | null;
    if (!body) {
      return { ok: false, reason: "upstream_error", message: "설명을 가져오지 못했어요. 잠시 후 다시 시도해주세요." };
    }
    return body;
  } catch {
    return { ok: false, reason: "upstream_error", message: "네트워크 연결을 확인해주세요." };
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
