"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import {
  findPastRecordWithThought,
  getRecord,
  getRecordCount,
  getRecords,
  getReflectionsForRecord,
  subscribe,
} from "./record-store";
import type { NewsRecord, Reflection } from "./types";

/**
 * Async data-fetching hooks backed by record-store.ts, which itself routes
 * to Supabase (logged in) or localStorage (logged out) per call. Every hook
 * here fetches on mount/dependency change and refetches whenever a mutation
 * fires through records.ts's shared subscribe() channel (used by both
 * backends), or the signed-in user changes.
 *
 * Only `authLoading` gates these — not `user` itself: an anonymous visitor
 * has real (local) data to show, so there's no "no user → empty" branch
 * here anymore. Each hook still passes `user` through to record-store.ts so
 * it can pick the right backend.
 */

export function useRecords(): { records: NewsRecord[]; loading: boolean; error: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<NewsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  // A failed fetch still renders as an empty list; this lets a caller tell
  // the two apart (e.g. not releasing a pending success toast).
  const [error, setError] = useState(false);

  const refetch = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    setLoading(true);
    try {
      setRecords(await getRecords(user));
      setError(false);
    } catch (err) {
      console.error("useRecords: failed to fetch records", err);
      setRecords([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Deliberate async data fetch; the setState calls happen after an await,
  // not synchronously, so this isn't the "force update" anti-pattern the
  // rule targets. Its suggested fix (useSyncExternalStore) needs a
  // synchronous snapshot, which a network fetch can't provide.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  useEffect(() => subscribe(refetch), [refetch]);

  return { records, loading, error };
}

export function useRecordCount(): { count: number; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    setLoading(true);
    try {
      setCount(await getRecordCount(user));
    } catch (err) {
      console.error("useRecordCount: failed to fetch record count", err);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see useRecords above
    refetch();
  }, [refetch]);

  useEffect(() => subscribe(refetch), [refetch]);

  return { count, loading };
}

export function useRecord(id: string): { record: NewsRecord | null; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [record, setRecord] = useState<NewsRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!id) {
      setRecord(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setRecord(await getRecord(user, id));
    } catch (err) {
      console.error("useRecord: failed to fetch record", err);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see useRecords above
    refetch();
  }, [refetch]);

  useEffect(() => subscribe(refetch), [refetch]);

  return { record, loading };
}

export function useReflectionsForRecord(
  id: string,
): { reflections: Reflection[]; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!id) {
      setReflections([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setReflections(await getReflectionsForRecord(user, id));
    } catch (err) {
      console.error("useReflectionsForRecord: failed to fetch reflections", err);
      setReflections([]);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see useRecords above
    refetch();
  }, [refetch]);

  useEffect(() => subscribe(refetch), [refetch]);

  return { reflections, loading };
}

export function usePastRecordWithThought(
  sector: string | undefined,
  excludeId: string | undefined,
): { past: NewsRecord | null; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [past, setPast] = useState<NewsRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!sector || !excludeId) {
      setPast(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setPast(await findPastRecordWithThought(user, sector, excludeId));
    } catch (err) {
      console.error("usePastRecordWithThought: failed to fetch past record", err);
      setPast(null);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, sector, excludeId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see useRecords above
    refetch();
  }, [refetch]);

  useEffect(() => subscribe(refetch), [refetch]);

  return { past, loading };
}
