import { NextResponse, after } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { lookupEconomicTerm } from "@/lib/gemini";
import { MAX_TERM_LENGTH, normalizeTerm } from "@/lib/economic-term-format";
import { checkRateLimit } from "@/lib/rate-limit";

type ErrorReason = "invalid_input" | "not_found" | "rate_limited" | "upstream_error" | "not_configured";

const ERROR_MESSAGES: Record<ErrorReason, { status: number; message: string }> = {
  invalid_input: { status: 400, message: "검색어를 입력해주세요." },
  // Not an error — a legitimate "no match" outcome — but 200 keeps the
  // response contract uniform ({ ok, reason, message }) for the client.
  not_found: { status: 200, message: "용어를 확인할 수 없어요. 다른 용어로 검색해보세요." },
  rate_limited: { status: 429, message: "검색 요청이 많아요. 잠시 후 다시 시도해주세요." },
  upstream_error: { status: 502, message: "설명을 가져오지 못했어요. 잠시 후 다시 시도해주세요." },
  not_configured: { status: 503, message: "경제용어사전을 사용할 수 없어요. 잠시 후 다시 시도해주세요." },
};

function errorResponse(reason: ErrorReason) {
  const { status, message } = ERROR_MESSAGES[reason];
  return NextResponse.json({ ok: false, reason, message }, { status });
}

/**
 * Search order (see supabase/migrations/0006_economic_terms_cache.sql):
 *  1. Public `economic_terms` cache — shared across every user, logged in
 *     or not. A hit here means zero Gemini calls, for anyone.
 *  2. Only on a miss: call Gemini, then write the result into that public
 *     cache (server-only, via the service-role client — the regular
 *     client has no insert/update grant on this table at all).
 *  3. Independent of 1 vs 2: if the caller is signed in, upsert their own
 *     `economic_term_searches` row (personal history for 마이페이지),
 *     unchanged from before.
 * Every stage is timed and logged server-side (never sent to the client)
 * to make the actual bottleneck visible — see the completion report for
 * real measured numbers.
 */
export async function POST(request: Request) {
  const requestStart = Date.now();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("invalid_input");
  }

  const rawTerm = typeof (body as { term?: unknown } | null)?.term === "string"
    ? (body as { term: string }).term
    : "";
  const term = rawTerm.trim();
  if (!term || term.length > MAX_TERM_LENGTH) {
    return errorResponse("invalid_input");
  }

  // Best-effort per-IP guard against repeated/automated calls — see
  // rate-limit.ts for what this does and doesn't cover.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return errorResponse("rate_limited");
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const normalized = normalizeTerm(term);

  const cacheLookupStart = Date.now();
  const { data: cachedTerm, error: cacheLookupError } = await supabase
    .from("economic_terms")
    .select("term, description")
    .eq("normalized_term", normalized)
    .maybeSingle();
  const cacheLookupMs = Date.now() - cacheLookupStart;
  if (cacheLookupError) {
    console.error("economic-term: public cache lookup failed", cacheLookupError);
  }

  let resultTerm: string;
  let resultDescription: string;
  let geminiMs = 0;

  if (cachedTerm) {
    resultTerm = cachedTerm.term;
    resultDescription = cachedTerm.description;
  } else {
    const geminiStart = Date.now();
    const outcome = await lookupEconomicTerm(term);
    geminiMs = Date.now() - geminiStart;

    if (!outcome.ok) {
      console.log(
        `economic-term timing: total=${Date.now() - requestStart}ms cacheLookup=${cacheLookupMs}ms gemini=${geminiMs}ms result=${outcome.error}`,
      );
      return errorResponse(outcome.error);
    }
    if (!outcome.term) {
      // Shouldn't happen — lookupEconomicTerm already guards this — but
      // never forward an empty term to the client or either DB table.
      return errorResponse("upstream_error");
    }
    resultTerm = outcome.term;
    resultDescription = outcome.description;

    // Writes to the *public* cache after the response is already on its
    // way — this write only ever benefits a *future* search by someone
    // else, never this request's own result (already in hand above), so
    // there's nothing for the current user to legitimately wait on here.
    // Runs via Next's after() so it still reliably completes server-side.
    after(async () => {
      const cacheWriteStart = Date.now();
      try {
        const admin = createSupabaseAdminClient();
        const { error: cacheWriteError } = await admin.from("economic_terms").upsert(
          { normalized_term: normalized, term: resultTerm, description: resultDescription },
          { onConflict: "normalized_term" },
        );
        if (cacheWriteError) {
          console.error("economic-term: public cache write failed", cacheWriteError);
        }
      } catch (err) {
        // SUPABASE_SERVICE_ROLE_KEY not configured — degrade to "no shared
        // cache benefit from this search," never fail the search itself.
        console.error("economic-term: public cache write skipped (admin client unavailable)", err);
      }
      console.log(`economic-term timing: cacheWrite (post-response) ${Date.now() - cacheWriteStart}ms`);
    });
  }

  // `saved` is reported to the client (not just logged) so the UI can show
  // "검색 기록 저장에 실패했어요" without ever hiding the Gemini result
  // itself — a personal-history-save hiccup is a separate concern from
  // the search succeeding, and must never be displayed as if it quietly
  // succeeded.
  let saved = true;
  let personalSaveMs = 0;
  if (user) {
    const personalSaveStart = Date.now();
    const { error: upsertError } = await supabase.from("economic_term_searches").upsert(
      {
        term: resultTerm,
        normalized_term: normalized,
        description: resultDescription,
        last_searched_at: new Date().toISOString(),
      },
      { onConflict: "user_id,normalized_term" },
    );
    personalSaveMs = Date.now() - personalSaveStart;
    if (upsertError) {
      console.error("economic-term: failed to save search history", upsertError);
      saved = false;
    }
  }

  console.log(
    `economic-term timing: total=${Date.now() - requestStart}ms (response-blocking) cacheLookup=${cacheLookupMs}ms ` +
      (cachedTerm ? "publicCacheHit" : `gemini=${geminiMs}ms`) +
      ` personalSave=${personalSaveMs}ms (public cache write, if any, logged separately after response is sent)`,
  );

  return NextResponse.json({
    ok: true,
    term: resultTerm,
    description: resultDescription,
    cached: Boolean(cachedTerm),
    saved,
  });
}
