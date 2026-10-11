import { getRecordCount } from "./local-records";

const SEEN_KEY = "moayo:login-prompt-seen";

/** Whether the first-record login-prompt bottom sheet has ever been shown before, in this browser. */
export function hasSeenLoginPrompt(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Permanent — once shown, the sheet never shows again in this browser. */
export function markLoginPromptSeen(): void {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Private browsing / storage quota can throw — worst case the sheet
    // shows again next time, which is harmless.
  }
}

/**
 * Call right after a logged-out user's record save succeeds. True only when
 * the prompt has never been shown before AND exactly one local record now
 * exists (i.e. this save was the first one) — both conditions matter: the
 * seen-flag alone would still fire on a second save made before the app had
 * a chance to show the sheet for the first one.
 */
export async function shouldOfferFirstRecordLoginPrompt(): Promise<boolean> {
  if (hasSeenLoginPrompt()) return false;
  return (await getRecordCount()) === 1;
}
