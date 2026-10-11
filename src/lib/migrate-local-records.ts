import * as remote from "./records";
import {
  peekLocalRecords,
  peekLocalReflections,
  removeLocalRecord,
  removeLocalReflection,
} from "./local-records";

/**
 * Copies every locally-stored (비로그인) record and reflection into the
 * now-signed-in user's Supabase account, then clears only what actually got
 * migrated. Called once right after a genuine sign-in (see auth-context.tsx)
 * and, opportunistically, on every app load while already signed in, so a
 * previous partial failure gets retried on the next chance rather than only
 * on the next fresh login.
 *
 * Safety properties this relies on:
 * - Never touches the account's existing server records — this only ever
 *   calls remote.createRecord/saveReflection (insert/upsert-by-pair), never
 *   a delete or an update of an existing row.
 * - A record with a dedupe key (url or articleId) is naturally idempotent:
 *   remote.createRecord already returns the existing row instead of
 *   inserting a duplicate if the same key was migrated before.
 * - A dedupe-key-less (plain scrap) record is made idempotent here instead,
 *   by removing it from local storage immediately after ITS OWN migration
 *   succeeds — never as a batch-then-clear-all — so a record that failed
 *   stays local and is retried next time, while one that already succeeded
 *   is never re-sent.
 * - One record failing never stops the rest: the loop below catches per
 *   item and keeps going, so "일부만 이전" is a normal, retryable outcome.
 */
export async function migrateLocalRecordsToAccount(): Promise<void> {
  const localRecords = peekLocalRecords();
  if (localRecords.length === 0) return;

  const idMap = new Map<string, string>(); // local record id -> migrated Supabase id

  for (const record of localRecords) {
    try {
      const { record: saved } = await remote.createRecord({
        title: record.title,
        sector: record.sector,
        imageUrl: record.imageUrl,
        sourceType: record.sourceType,
        articleId: record.articleId,
        url: record.url,
        thought: record.thought,
      });
      idMap.set(record.id, saved.id);
      removeLocalRecord(record.id);
    } catch (err) {
      console.error("migrateLocalRecordsToAccount: failed to migrate record", record.id, err);
      // Left in local storage on purpose — retried on the next sign-in or app load.
    }
  }

  if (idMap.size === 0) return;

  for (const reflection of peekLocalReflections()) {
    const recordId = idMap.get(reflection.recordId);
    const comparedRecordId = idMap.get(reflection.comparedRecordId);
    if (!recordId || !comparedRecordId) continue; // one side not migrated (yet) — retried later
    try {
      await remote.saveReflection({ recordId, comparedRecordId, result: reflection.result });
      removeLocalReflection(reflection.id);
    } catch (err) {
      console.error(
        "migrateLocalRecordsToAccount: failed to migrate reflection",
        reflection.id,
        err,
      );
    }
  }
}
