import { emitChange } from "./records";
import type {
  CreateRecordInput,
  CreateRecordResult,
  UpdateRecordInput,
} from "./records";
import type { MonthRange } from "./month-range";
import type { NewsRecord, Reflection, ReflectionResult } from "./types";

/**
 * localStorage-backed mirror of records.ts, used for anonymous (비로그인)
 * record-keeping. Same function names/shapes as records.ts so record-store.ts
 * can switch between the two with a single `user` check, and reuses
 * records.ts's own emitChange/subscribe channel so every use-records-store.ts
 * hook refetches on a local write exactly like it already does for a
 * Supabase write.
 */

const RECORDS_KEY = "moayo:local-records";
const REFLECTIONS_KEY = "moayo:local-reflections";

function readRecords(): NewsRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Deliberately lets a localStorage failure (private browsing, quota
 * exceeded) throw instead of swallowing it like use-external-draft.ts's
 * best-effort autosave does — this write IS the actual save, so every
 * caller below (createRecord, updateRecord, deleteRecord) must surface a
 * real failure to its own caller instead of reporting success for a write
 * that didn't actually happen.
 */
function writeRecords(records: NewsRecord[]): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

function readReflections(): Reflection[] {
  try {
    const raw = localStorage.getItem(REFLECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** See writeRecords above — must throw on failure, not swallow it. */
function writeReflections(reflections: Reflection[]): void {
  localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(reflections));
}

function newLocalId(prefix: string): string {
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `local-${prefix}-${unique}`;
}

export async function getRecords(): Promise<NewsRecord[]> {
  return [...readRecords()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getRecordCount(): Promise<number> {
  return readRecords().length;
}

export async function getRecord(id: string): Promise<NewsRecord | null> {
  return readRecords().find((record) => record.id === id) ?? null;
}

/** Mirrors records.ts's getRecordsForMonth for a logged-out (local) user — same month/sector semantics, same sort order. */
export async function getRecordsForMonth(
  range: MonthRange,
  sectorValues: string[] | null,
): Promise<NewsRecord[]> {
  const start = new Date(range.startIso).getTime();
  const end = new Date(range.endIsoExclusive).getTime();
  return readRecords()
    .filter((record) => {
      const createdAt = new Date(record.createdAt).getTime();
      if (createdAt < start || createdAt >= end) return false;
      return sectorValues ? sectorValues.includes(record.sector) : true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Mirrors records.ts's getRecordCountForMonth for a logged-out (local) user. */
export async function getRecordCountForMonth(range: MonthRange): Promise<number> {
  const start = new Date(range.startIso).getTime();
  const end = new Date(range.endIsoExclusive).getTime();
  return readRecords().filter((record) => {
    const createdAt = new Date(record.createdAt).getTime();
    return createdAt >= start && createdAt < end;
  }).length;
}

function findExistingByDedupeKey(
  records: NewsRecord[],
  articleId?: string,
  url?: string,
): NewsRecord | null {
  if (!articleId && !url) return null;
  return (
    records.find(
      (record) =>
        (articleId && record.articleId === articleId) || (url && record.url === url),
    ) ?? null
  );
}

export async function createRecord(input: CreateRecordInput): Promise<CreateRecordResult> {
  const records = readRecords();
  const existing = findExistingByDedupeKey(records, input.articleId, input.url);
  if (existing) {
    return { record: existing, duplicate: true };
  }

  const now = new Date().toISOString();
  const record: NewsRecord = {
    id: newLocalId("record"),
    title: input.title,
    sector: input.sector,
    imageUrl: input.imageUrl,
    sourceType: input.sourceType,
    articleId: input.articleId,
    url: input.url,
    thought: input.thought?.trim() ? input.thought.trim() : undefined,
    createdAt: now,
    updatedAt: now,
  };
  writeRecords([record, ...records]);
  emitChange();
  return { record, duplicate: false };
}

export async function updateRecord(id: string, input: UpdateRecordInput): Promise<NewsRecord> {
  const records = readRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) throw new Error("기록을 찾을 수 없어요.");
  const updated: NewsRecord = {
    ...records[index],
    title: input.title,
    sector: input.sector,
    imageUrl: input.imageUrl,
    thought: input.thought?.trim() ? input.thought.trim() : undefined,
    updatedAt: new Date().toISOString(),
  };
  const next = [...records];
  next[index] = updated;
  writeRecords(next);
  emitChange();
  return updated;
}

export async function deleteRecord(id: string): Promise<void> {
  writeRecords(readRecords().filter((record) => record.id !== id));
  // Same cascade Supabase's FK already does for a logged-in user's reflections.
  writeReflections(
    readReflections().filter((r) => r.recordId !== id && r.comparedRecordId !== id),
  );
  emitChange();
}

export async function findPastRecordWithThought(
  sector: string,
  excludeId: string,
): Promise<NewsRecord | null> {
  const candidates = readRecords()
    .filter((record) => record.sector === sector && record.id !== excludeId && record.thought)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return candidates[0] ?? null;
}

export async function getReflectionsForRecord(recordId: string): Promise<Reflection[]> {
  return readReflections().filter(
    (reflection) => reflection.recordId === recordId || reflection.comparedRecordId === recordId,
  );
}

export async function saveReflection(input: {
  recordId: string;
  comparedRecordId: string;
  result: ReflectionResult;
}): Promise<Reflection> {
  const reflections = readReflections();
  const existing = reflections.find(
    (r) => r.recordId === input.recordId && r.comparedRecordId === input.comparedRecordId,
  );
  if (existing) {
    return updateReflection(existing.id, input.result);
  }

  const reflection: Reflection = {
    id: newLocalId("reflection"),
    recordId: input.recordId,
    comparedRecordId: input.comparedRecordId,
    result: input.result,
    createdAt: new Date().toISOString(),
  };
  writeReflections([reflection, ...reflections]);
  emitChange();
  return reflection;
}

export async function updateReflection(id: string, result: ReflectionResult): Promise<Reflection> {
  const reflections = readReflections();
  const index = reflections.findIndex((reflection) => reflection.id === id);
  if (index === -1) throw new Error("회고를 찾을 수 없어요.");
  const updated: Reflection = { ...reflections[index], result };
  const next = [...reflections];
  next[index] = updated;
  writeReflections(next);
  emitChange();
  return updated;
}

/** Below is exposed for migrate-local-records.ts only — raw array access, not the per-id API above. */

export function peekLocalRecords(): NewsRecord[] {
  return readRecords();
}

export function peekLocalReflections(): Reflection[] {
  return readReflections();
}

export function removeLocalRecord(id: string): void {
  writeRecords(readRecords().filter((record) => record.id !== id));
}

export function removeLocalReflection(id: string): void {
  writeReflections(readReflections().filter((reflection) => reflection.id !== id));
}
