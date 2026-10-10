const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const hits = new Map<string, number[]>();

/**
 * Basic per-key sliding-window limiter — server-only (Route Handlers).
 * In-memory, so it's scoped to a single server instance: it resets on a
 * cold start and isn't shared across multiple concurrent instances on
 * Vercel. That's a real gap for a high-traffic deployment (a shared store
 * like Redis would close it), but it's still a meaningful guard against a
 * single client hammering the Gemini-backed endpoint, which is this
 * feature's actual concern for now.
 */
export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
