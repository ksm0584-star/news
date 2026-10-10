import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. Server-only: never import
 * this from a Client Component or anything bundled to the browser.
 * `SUPABASE_SERVICE_ROLE_KEY` has no `NEXT_PUBLIC_` prefix, so Next.js never
 * inlines it into client bundles, but the import itself must still stay
 * confined to server files (Route Handlers) as a second line of defense.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local.",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
