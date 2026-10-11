import type { User } from "@supabase/supabase-js";
import * as remote from "./records";
import * as local from "./local-records";
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

export async function getRecord(user: User | null, id: string): Promise<NewsRecord | null> {
  return user ? remote.getRecord(id) : local.getRecord(id);
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

export async function getReflectionsForRecord(
  user: User | null,
  recordId: string,
): Promise<Reflection[]> {
  return user ? remote.getReflectionsForRecord(recordId) : local.getReflectionsForRecord(recordId);
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
