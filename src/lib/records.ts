import type { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase/client";
import type { NewsRecord, Reflection, ReflectionResult, SourceType } from "./types";

/**
 * Supabase returns query errors as a plain PostgrestError object, not an
 * Error instance — throwing it as-is surfaces as an unhelpful "[object
 * Object]" in Next.js's error overlay and in unhandled-rejection reporting.
 * Wrap it in a real Error, keeping the original for inspection via `cause`.
 */
function toError(error: PostgrestError): Error {
  return new Error(`${error.message} (code: ${error.code})`, { cause: error });
}

/**
 * Supabase-backed replacement for the old localStorage store. Every query
 * here is implicitly scoped to the signed-in user by Postgres RLS (see
 * supabase/migrations/0001_init.sql) — there is no client-side user_id
 * filtering to get wrong, because the database itself refuses to return or
 * mutate another user's rows.
 */

type RecordRow = {
  id: string;
  title: string;
  sector: string;
  image_url: string | null;
  source_type: SourceType;
  article_id: string | null;
  url: string | null;
  thought: string | null;
  created_at: string;
  updated_at: string;
};

type ReflectionRow = {
  id: string;
  record_id: string;
  compared_record_id: string;
  result: ReflectionResult;
  created_at: string;
};

function rowToRecord(row: RecordRow): NewsRecord {
  return {
    id: row.id,
    title: row.title,
    sector: row.sector,
    imageUrl: row.image_url ?? undefined,
    sourceType: row.source_type,
    articleId: row.article_id ?? undefined,
    url: row.url ?? undefined,
    thought: row.thought ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToReflection(row: ReflectionRow): Reflection {
  return {
    id: row.id,
    recordId: row.record_id,
    comparedRecordId: row.compared_record_id,
    result: row.result,
    createdAt: row.created_at,
  };
}

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

/** Subscribes a listener to any write made through this module — used by use-records-store.ts to refetch. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function getRecords(): Promise<NewsRecord[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw toError(error);
  return (data ?? []).map(rowToRecord);
}

export async function getRecord(id: string): Promise<NewsRecord | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw toError(error);
  return data ? rowToRecord(data) : null;
}

async function findExistingByDedupeKey(
  articleId?: string,
  url?: string,
): Promise<NewsRecord | null> {
  if (!articleId && !url) return null;
  const supabase = getSupabaseBrowserClient();
  const query = supabase.from("records").select("*").limit(1);
  const { data, error } = await (articleId
    ? query.eq("article_id", articleId)
    : query.eq("url", url!)
  ).maybeSingle();
  if (error) throw toError(error);
  return data ? rowToRecord(data) : null;
}

export interface CreateRecordInput {
  title: string;
  sector: string;
  imageUrl?: string;
  sourceType: SourceType;
  articleId?: string;
  url?: string;
  thought?: string;
}

export interface CreateRecordResult {
  record: NewsRecord;
  /** True when an existing scrap for the same article/URL was returned instead of inserting a new one. */
  duplicate: boolean;
}

export async function createRecord(input: CreateRecordInput): Promise<CreateRecordResult> {
  const existing = await findExistingByDedupeKey(input.articleId, input.url);
  if (existing) {
    return { record: existing, duplicate: true };
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("records")
    .insert({
      title: input.title,
      sector: input.sector,
      image_url: input.imageUrl ?? null,
      source_type: input.sourceType,
      article_id: input.articleId ?? null,
      url: input.url ?? null,
      thought: input.thought?.trim() ? input.thought.trim() : null,
    })
    .select()
    .single();

  if (error) {
    // 23505 = unique_violation — a concurrent insert raced us to the same dedupe key.
    if (error.code === "23505") {
      const fallback = await findExistingByDedupeKey(input.articleId, input.url);
      if (fallback) return { record: fallback, duplicate: true };
    }
    throw toError(error);
  }

  emitChange();
  return { record: rowToRecord(data), duplicate: false };
}

export interface UpdateRecordInput {
  title: string;
  sector: string;
  imageUrl?: string;
  thought?: string;
}

export async function updateRecord(id: string, input: UpdateRecordInput): Promise<NewsRecord> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("records")
    .update({
      title: input.title,
      sector: input.sector,
      image_url: input.imageUrl ?? null,
      thought: input.thought?.trim() ? input.thought.trim() : null,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw toError(error);
  emitChange();
  return rowToRecord(data);
}

export async function deleteRecord(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("records").delete().eq("id", id);
  if (error) throw toError(error);
  emitChange();
}

/**
 * Finds the most recent other record in the same sector that has a thought,
 * for the "compare past vs. current thinking" retrospective flow. Records
 * without a thought are excluded from retrospective matching per spec.
 */
export async function findPastRecordWithThought(
  sector: string,
  excludeId: string,
): Promise<NewsRecord | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("sector", sector)
    .neq("id", excludeId)
    .not("thought", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw toError(error);
  return data ? rowToRecord(data) : null;
}

export async function getReflectionsForRecord(recordId: string): Promise<Reflection[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("reflections")
    .select("*")
    .or(`record_id.eq.${recordId},compared_record_id.eq.${recordId}`);
  if (error) throw toError(error);
  return (data ?? []).map(rowToReflection);
}

/**
 * Upserts by (record_id, compared_record_id) — the DB doesn't enforce this
 * pairing as unique yet (see supabase/migrations/0002_reflections_unique.sql,
 * not applied automatically), so this function does the check itself:
 * re-selecting the same comparison just updates the one existing row
 * instead of inserting a duplicate. A genuinely different pair (either id
 * differs) is a separate reflection and still gets its own row, preserving
 * history across different comparisons.
 */
export async function saveReflection(input: {
  recordId: string;
  comparedRecordId: string;
  result: ReflectionResult;
}): Promise<Reflection> {
  const supabase = getSupabaseBrowserClient();
  const { data: existing, error: findError } = await supabase
    .from("reflections")
    .select("id")
    .eq("record_id", input.recordId)
    .eq("compared_record_id", input.comparedRecordId)
    .maybeSingle();
  if (findError) throw toError(findError);

  if (existing) {
    return updateReflection(existing.id, input.result);
  }

  const { data, error } = await supabase
    .from("reflections")
    .insert({
      record_id: input.recordId,
      compared_record_id: input.comparedRecordId,
      result: input.result,
    })
    .select()
    .single();
  if (error) throw toError(error);
  emitChange();
  return rowToReflection(data);
}

/** Updates one reflection by its own id — unambiguous, never touches any other row. */
export async function updateReflection(id: string, result: ReflectionResult): Promise<Reflection> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("reflections")
    .update({ result })
    .eq("id", id)
    .select()
    .single();
  if (error) throw toError(error);
  emitChange();
  return rowToReflection(data);
}
