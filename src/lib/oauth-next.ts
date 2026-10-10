/**
 * Carries "which page to return to after Google login" across the OAuth
 * round trip via a short-lived cookie, instead of a `?next=...` query
 * string on `redirectTo`.
 *
 * `redirectTo` must stay an exact, query-free match against Supabase's
 * Redirect URL allow-list (Dashboard > Authentication > URL Configuration).
 * Appending a query string to it makes Supabase silently fall back to its
 * configured Site URL instead of honoring this origin — reproduced and
 * confirmed: adding the exact `...?next=%2Fmypage` variant as its own
 * allow-list entry fixed the symptom, proving the query string was the
 * mismatch. Keeping `redirectTo` fixed and carrying `next` separately
 * avoids needing one allow-list entry per possible return path.
 */
export const OAUTH_NEXT_COOKIE = "sb-oauth-next";

/**
 * Client-side only — call right before `signInWithOAuth`. Always writes
 * (setting an empty/expired cookie when there's no `next`) so a stale
 * value from an earlier, abandoned login attempt can never leak into an
 * unrelated later one.
 */
export function setOauthNextCookie(next?: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (next) {
    document.cookie = `${OAUTH_NEXT_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=600; SameSite=Lax${secure}`;
  } else {
    document.cookie = `${OAUTH_NEXT_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
  }
}

/** Only ever a same-origin relative path — rejects anything an open redirect could use. */
export function sanitizeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value;
}
