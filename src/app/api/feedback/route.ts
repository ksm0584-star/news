import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_COMMENT_LENGTH = 500;

/**
 * Accepts a service rating (1-5, required) + optional comment, from a
 * logged-in or anonymous caller. Always writes via the service-role
 * client — see supabase/migrations/0007_app_feedback.sql: that table has
 * no RLS policy and no grant to anon/authenticated at all, so this route
 * is the only possible writer, and nobody (including the submitter) can
 * read feedback back through the browser client.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청이에요." }, { status: 400 });
  }

  const rawRating = (body as { rating?: unknown } | null)?.rating;
  const rating = typeof rawRating === "number" ? Math.trunc(rawRating) : NaN;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, message: "별점을 선택해주세요." }, { status: 400 });
  }

  const rawComment = (body as { comment?: unknown } | null)?.comment;
  const comment =
    typeof rawComment === "string" ? rawComment.trim().slice(0, MAX_COMMENT_LENGTH) : "";

  // Namespaced key — this module's rate limiter is a single shared, process-wide
  // map, and economic-term/route.ts already keys its own calls by bare IP, so a
  // shared prefix keeps this feature's budget from being conflated with that one.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`feedback:${ip}`)) {
    return NextResponse.json(
      { ok: false, message: "요청이 많아요. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch (err) {
    console.error("feedback: admin client unavailable", err);
    return NextResponse.json({ ok: false, message: "서버 설정이 완료되지 않았어요." }, { status: 500 });
  }

  const { error } = await admin.from("app_feedback").insert({
    user_id: user?.id ?? null,
    rating,
    comment: comment || null,
  });

  if (error) {
    console.error("feedback: insert failed", error);
    return NextResponse.json(
      { ok: false, message: "제출에 실패했어요. 다시 시도해주세요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
