import type { NewsRecord, Reflection } from "./types";

const RECORDS_KEY = "newsnote:records";
const REFLECTIONS_KEY = "newsnote:reflections";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readList<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, list: T[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(list));
}

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

/** Subscribes a listener to any write made through this module, for use with useSyncExternalStore. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function generateId(): string {
  if (isBrowser() && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Reads below are cached and only recomputed after a write through this
 * module, so repeated calls between writes return the same array/object
 * reference. This is required by useSyncExternalStore (see use-store.ts):
 * if getSnapshot returned a freshly parsed/derived value on every call,
 * React would see a "changed" snapshot on every render and loop forever.
 */

let recordsCache: NewsRecord[] | null = null;
let sortedRecordsCache: NewsRecord[] | null = null;

function loadRecords(): NewsRecord[] {
  if (recordsCache === null) {
    recordsCache = readList<NewsRecord>(RECORDS_KEY);
  }
  return recordsCache;
}

function invalidateRecordsCache(): void {
  recordsCache = null;
  sortedRecordsCache = null;
}

export function getRecords(): NewsRecord[] {
  if (sortedRecordsCache === null) {
    sortedRecordsCache = [...loadRecords()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
  return sortedRecordsCache;
}

export function getRecord(id: string): NewsRecord | undefined {
  return loadRecords().find((record) => record.id === id);
}

export interface CreateRecordInput {
  title: string;
  sector: string;
  imageUrl?: string;
  sourceType: NewsRecord["sourceType"];
  articleId?: string;
  url?: string;
  thought?: string;
}

export function createRecord(input: CreateRecordInput): NewsRecord {
  const now = new Date().toISOString();
  const record: NewsRecord = {
    id: generateId(),
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
  writeList(RECORDS_KEY, [...loadRecords(), record]);
  invalidateRecordsCache();
  emitChange();
  return record;
}

export function updateRecordThought(
  id: string,
  thought: string,
): NewsRecord | undefined {
  const records = loadRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) return undefined;
  const updated: NewsRecord = {
    ...records[index],
    thought: thought.trim() ? thought.trim() : undefined,
    updatedAt: new Date().toISOString(),
  };
  const next = [...records];
  next[index] = updated;
  writeList(RECORDS_KEY, next);
  invalidateRecordsCache();
  emitChange();
  return updated;
}

export interface UpdateRecordInput {
  title: string;
  sector: string;
  imageUrl?: string;
  thought?: string;
}

/** Full edit of a record's title/sector/image/thought (used by the reused write form in edit mode). */
export function updateRecord(
  id: string,
  input: UpdateRecordInput,
): NewsRecord | undefined {
  const records = loadRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index === -1) return undefined;
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
  writeList(RECORDS_KEY, next);
  invalidateRecordsCache();
  emitChange();
  return updated;
}

export function deleteRecord(id: string): void {
  const next = loadRecords().filter((record) => record.id !== id);
  writeList(RECORDS_KEY, next);
  invalidateRecordsCache();
  emitChange();
}

/**
 * Finds the most recent other record in the same sector that has a thought,
 * for the "compare past vs. current thinking" retrospective flow. Records
 * without a thought are excluded from retrospective matching per spec.
 */
export function findPastRecordWithThought(
  sector: string,
  excludeId: string,
): NewsRecord | undefined {
  const candidates = loadRecords()
    .filter(
      (record) =>
        record.id !== excludeId &&
        record.sector === sector &&
        Boolean(record.thought?.trim()),
    )
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  return candidates[0];
}

let reflectionsCache: Reflection[] | null = null;
const reflectionsForRecordCache = new Map<string, Reflection[]>();

function loadReflections(): Reflection[] {
  if (reflectionsCache === null) {
    reflectionsCache = readList<Reflection>(REFLECTIONS_KEY);
  }
  return reflectionsCache;
}

function invalidateReflectionsCache(): void {
  reflectionsCache = null;
  reflectionsForRecordCache.clear();
}

export function getReflections(): Reflection[] {
  return loadReflections();
}

export function getReflectionsForRecord(recordId: string): Reflection[] {
  const cached = reflectionsForRecordCache.get(recordId);
  if (cached) return cached;
  const result = loadReflections().filter(
    (reflection) =>
      reflection.recordId === recordId || reflection.comparedRecordId === recordId,
  );
  reflectionsForRecordCache.set(recordId, result);
  return result;
}

export function saveReflection(
  input: Omit<Reflection, "id" | "createdAt">,
): Reflection {
  const reflection: Reflection = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  writeList(REFLECTIONS_KEY, [...loadReflections(), reflection]);
  invalidateReflectionsCache();
  emitChange();
  return reflection;
}
