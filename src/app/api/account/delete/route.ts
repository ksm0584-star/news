import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Deletes the caller's own account. The id to delete comes only from the
 * caller's own cookie-verified session (`getUser()`, re-checked with the
 * Supabase Auth server, not decoded locally) — it is never taken from the
 * request body, so this can only ever delete the signed-in user's own
 * account. `records`/`reflections` both have `on delete cascade` foreign
 * keys to `auth.users` (see supabase/migrations/0001_init.sql), so deleting
 * the auth user also removes all of that user's data; no separate delete
 * step or schema change is needed for that part.
 */
export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch (err) {
    console.error("account/delete: admin client unavailable", err);
    return NextResponse.json({ error: "서버 설정이 완료되지 않았어요." }, { status: 500 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("account/delete: admin.deleteUser failed", {
      status: deleteError.status,
      message: deleteError.message,
    });
    return NextResponse.json({ error: "탈퇴 처리 중 오류가 발생했어요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
