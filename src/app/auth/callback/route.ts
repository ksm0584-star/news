import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OAUTH_NEXT_COOKIE, sanitizeNextPath } from "@/lib/oauth-next";

/** Exchanges the OAuth `code` Supabase redirects back with for a session cookie. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Where to return to after login — read from the short-lived cookie
  // signInWithGoogle sets (see oauth-next.ts for why this isn't a `?next=`
  // query string on redirectTo), then cleared so it can't leak into a
  // later, unrelated login.
  const cookieStore = await cookies();
  const rawNext = cookieStore.get(OAUTH_NEXT_COOKIE)?.value ?? null;
  const next = sanitizeNextPath(rawNext ? decodeURIComponent(rawNext) : null);
  cookieStore.delete(OAUTH_NEXT_COOKIE);

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Previously discarded — this is the only server-side signal for why a
    // sign-in failed (e.g. PKCE verifier mismatch, already-used code), and
    // without it there's no way to tell one failure mode from another.
    console.error("auth/callback: exchangeCodeForSession failed", {
      name: error.name,
      status: error.status,
      code: error.code,
      message: error.message,
    });
  } else {
    console.error("auth/callback: no code in callback URL", {
      params: Object.fromEntries(searchParams),
    });
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
