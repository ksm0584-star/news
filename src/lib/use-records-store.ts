"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import {
  findPastRecordWithThought,
  getRecord,
  getRecords,
  getReflectionsForRecord,
  subscribe,
} from "./records";
import type { NewsRecord, Reflection } from "./types";

/**
 * Async replacement for the old useSyncExternalStore-based hooks: Supabase
 * reads are network calls, not synchronous localStorage reads, so every hook
 * here fetches on mount/dependency change and refetches whenever a mutation
 * fires through records.ts's subscribe(), or the signed-in user changes.
 */

export function useRecords(): { records: NewsRecord[]; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<NewsRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setRecords(await getRecords());
    } catch (err) {
      console.error("useRecords: failed to fetch records", err);
      setRecords([]);
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

  return { records, loading };
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
    if (!user || !id) {
      setRecord(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setRecord(await getRecord(id));
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
    if (!user || !id) {
      setReflections([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setReflections(await getReflectionsForRecord(id));
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
    if (!user || !sector || !excludeId) {
      setPast(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setPast(await findPastRecordWithThought(sector, excludeId));
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
