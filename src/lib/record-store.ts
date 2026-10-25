import type { User } from "@supabase/supabase-js";
import * as remote from "./records";
import * as local from "./local-records";
import { subscribe } from "./records";
import type { MonthRange } from "./month-range";
import type { NewsRecord, Reflection, ReflectionResult } from "./types";

/**
 * Auth-aware facade in front of records.ts (Supabase) and local-records.ts
 * (localStorage) — every function takes the caller's current `user` (from
 * useAuth()) and routes to one backend or the other. Callers already have
 * `user` on hand wherever they call these, so this stays a synchronous
 * routing decision instead of this module re-deriving auth state itself
 * (which would risk staleness against what the UI already decided to
 * render). Logged-in and logged-out data never mix: a logged-in user's
 * reads/writes only ever touch Supabase, an anonymous one only ever touches
 * localStorage — the one deliberate crossover is migrate-local-records.ts,
 * which copies local → Supabase once, right after a real sign-in.
 */

export { subscribe } from "./records";
export type { CreateRecordInput, CreateRecordResult, UpdateRecordInput } from "./records";

export async function getRecords(user: User | null): Promise<NewsRecord[]> {
  return user ? remote.getRecords() : local.getRecords();
}

export async function getRecordCount(user: User | null): Promise<number> {
  return user ? remote.getRecordCount() : local.getRecordCount();
}

/**
 * Caches getRecordsForMonth/getRecordCountForMonth results by exact
 * (user, range, sector) key, so re-visiting a month/sector combo already
 * seen this session skips the request entirely — until any write
 * (createRecord/updateRecord/deleteRecord, either backend, both already
 * call records.ts's emitChange()) clears the whole cache below. Caching the
 * *promise* (not just the resolved value) also de-dupes two near-simultaneous
 * calls for the same key into a single request, and a rejected promise is
 * evicted immediately so a failed fetch never poisons the cache.
 */
const monthCache = new Map<string, Promise<NewsRecord[]>>();
const monthCountCache = new Map<string, Promise<number>>();
/**
 * Same promise-caching pattern as monthCache, for getRecord/
 * getReflectionsForRecord — keyed by user id (or "anon") + id, so signing
 * out, switching accounts, or an anonymous visitor never serves another
 * account's cached record: a different user simply gets a different key,
 * never stale data left under the old one. `recordSnapshots` additionally
 * keeps the last *resolved* value per key (written once a getRecord() call
 * settles) so a component can synchronously seed its first render from
 * already-known data via peekRecord() instead of flashing a loading state
 * for data it already has — see use-records-store.ts's useRecord.
 */
const recordCache = new Map<string, Promise<NewsRecord | null>>();
const recordSnapshots = new Map<string, NewsRecord | null>();
const reflectionsCache = new Map<string, Promise<Reflection[]>>();
subscribe(() => {
  monthCache.clear();
  monthCountCache.clear();
  recordCache.clear();
  recordSnapshots.clear();
  reflectionsCache.clear();
});

function recordCacheKey(user: User | null, id: string): string {
  return `${user?.id ?? "anon"}|${id}`;
}

export function peekRecord(user: User | null, id: string): NewsRecord | null | undefined {
  return recordSnapshots.get(recordCacheKey(user, id));
}

export function getRecord(user: User | null, id: string): Promise<NewsRecord | null> {
  const key = recordCacheKey(user, id);
  const cached = recordCache.get(key);
  if (cached) return cached;

  const promise = (user ? remote.getRecord(id) : local.getRecord(id))
    .then((record) => {
      recordSnapshots.set(key, record);
      return record;
    })
    .catch((err) => {
      recordCache.delete(key);
      throw err;
    });
  recordCache.set(key, promise);
  return promise;
}

export function getReflectionsForRecord(user: User | null, recordId: string): Promise<Reflection[]> {
  const key = recordCacheKey(user, recordId);
  const cached = reflectionsCache.get(key);
  if (cached) return cached;

  const promise = (user
    ? remote.getReflectionsForRecord(recordId)
    : local.getReflectionsForRecord(recordId)
  ).catch((err) => {
    reflectionsCache.delete(key);
    throw err;
  });
  reflectionsCache.set(key, promise);
  return promise;
}

function monthCacheKey(user: User | null, range: MonthRange, sectorValues: string[] | null): string {
  const sectorKey = sectorValues ? [...sectorValues].sort().join(",") : "*";
  return `${user?.id ?? "anon"}|${range.startIso}|${range.endIsoExclusive}|${sectorKey}`;
}

export function getRecordsForMonth(
  user: User | null,
  range: MonthRange,
  sectorValues: string[] | null,
): Promise<NewsRecord[]> {
  const key = monthCacheKey(user, range, sectorValues);
  const cached = monthCache.get(key);
  if (cached) return cached;

  const promise = (user ? remote.getRecordsForMonth(range, sectorValues) : local.getRecordsForMonth(range, sectorValues))
    .catch((err) => {
      monthCache.delete(key);
      throw err;
    });
  monthCache.set(key, promise);
  return promise;
}

export function getRecordCountForMonth(user: User | null, range: MonthRange): Promise<number> {
  const key = monthCacheKey(user, range, null);
  const cached = monthCountCache.get(key);
  if (cached) return cached;

  const promise = (user ? remote.getRecordCountForMonth(range) : local.getRecordCountForMonth(range))
    .catch((err) => {
      monthCountCache.delete(key);
      throw err;
    });
  monthCountCache.set(key, promise);
  return promise;
}

export async function createRecord(
  user: User | null,
  input: remote.CreateRecordInput,
): Promise<remote.CreateRecordResult> {
  return user ? remote.createRecord(input) : local.createRecord(input);
}

export async function updateRecord(
  user: User | null,
  id: string,
  input: remote.UpdateRecordInput,
): Promise<NewsRecord> {
  return user ? remote.updateRecord(id, input) : local.updateRecord(id, input);
}

export async function deleteRecord(user: User | null, id: string): Promise<void> {
  return user ? remote.deleteRecord(id) : local.deleteRecord(id);
}

export async function findPastRecordWithThought(
  user: User | null,
  sector: string,
  excludeId: string,
): Promise<NewsRecord | null> {
  return user
    ? remote.findPastRecordWithThought(sector, excludeId)
    : local.findPastRecordWithThought(sector, excludeId);
}

export async function saveReflection(
  user: User | null,
  input: { recordId: string; comparedRecordId: string; result: ReflectionResult },
): Promise<Reflection> {
  return user ? remote.saveReflection(input) : local.saveReflection(input);
}

export async function updateReflection(
  user: User | null,
  id: string,
  result: ReflectionResult,
): Promise<Reflection> {
  return user ? remote.updateReflection(id, result) : local.updateReflection(id, result);
}
