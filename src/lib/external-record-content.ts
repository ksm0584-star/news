/**
 * The `records` table has one `thought` text column (see
 * supabase/migrations/0001_init.sql) — adding a second structured column
 * for "투자에 적용하기" needs a migration, which this task intentionally
 * does not add (see the write-up for the analysis/options). Until that's
 * decided, both fields fold into the existing `thought` column behind this
 * one marker, so every other screen that just reads `record.thought` keeps
 * working unchanged.
 */
const INVESTMENT_NOTE_MARKER = "\n\n[투자에 적용하기]\n";

export function combineExternalContent(articleSummary: string, investmentNote: string): string {
  const summary = articleSummary.trim();
  const note = investmentNote.trim();
  return note ? `${summary}${INVESTMENT_NOTE_MARKER}${note}` : summary;
}

/**
 * Inverse of combineExternalContent, for read-only display. Records without
 * the marker — anything saved via the plain /record/new form, including
 * app-internal articles and edits — show their whole `thought` as
 * articleSummary with an empty investmentNote, which is exactly the "no
 * investment note written" case the UI already hides.
 */
export function splitExternalContent(thought: string | null | undefined): {
  articleSummary: string;
  investmentNote: string;
} {
  if (!thought) return { articleSummary: "", investmentNote: "" };
  const markerIndex = thought.indexOf(INVESTMENT_NOTE_MARKER);
  if (markerIndex === -1) return { articleSummary: thought, investmentNote: "" };
  return {
    articleSummary: thought.slice(0, markerIndex),
    investmentNote: thought.slice(markerIndex + INVESTMENT_NOTE_MARKER.length),
  };
}
