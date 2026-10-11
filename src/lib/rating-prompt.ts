const SEEN_KEY = "moayo:rating-prompt-seen";
const SAVE_COUNT_KEY = "moayo:rating-new-save-count";

/** Whether the auto rating prompt has ever been shown before, in this browser. */
export function hasSeenRatingPrompt(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Permanent — once shown (auto) or actually submitted (either entry point), the auto prompt never shows again in this browser. */
export function markRatingPromptSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Private browsing / storage quota can throw — worst case it shows again next time, which is harmless.
  }
}

function readNewSaveCount(): number {
  try {
    const raw = localStorage.getItem(SAVE_COUNT_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

/**
 * Call exactly once per successful NEW record save — never for an edit or
 * a deduped repeat save (callers only reach this after their own
 * `duplicate`/edit-mode branches have already returned), and never from
 * migrate-local-records.ts's login-time local→Supabase migration (that
 * module calls records.ts directly and never touches this counter) — so
 * a returning user's migrated records can never inflate this count.
 * Returns the new count.
 */
export function incrementNewSaveCount(): number {
  const next = readNewSaveCount() + 1;
  try {
    localStorage.setItem(SAVE_COUNT_KEY, String(next));
  } catch {
    // Best-effort — worst case the auto prompt just never fires this session.
  }
  return next;
}

/** True only right after the 2nd qualifying save, and only if the auto prompt has never been shown before. */
export function shouldOfferRatingPrompt(newSaveCount: number): boolean {
  return !hasSeenRatingPrompt() && newSaveCount === 2;
}
