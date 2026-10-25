"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import {
  findPastRecordWithThought,
  getRecord,
  getRecordCount,
  getRecordCountForMonth,
  getRecords,
  getRecordsForMonth,
  getReflectionsForRecord,
  peekRecord,
  subscribe,
} from "./record-store";
import { getSectorValuesForCategory, ALL_CATEGORY, type NewsCategory } from "./news-categories";
import { getKstMonthRange } from "./month-range";
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

/**
 * 내 기록 탭의 월별 데이트피커 전용 — useRecords()(전체 조회)와 완전히
 * 분리된 별도 훅이라, mypage/record detail 등 useRecords()를 쓰는 다른
 * 화면에는 영향이 없다. 매 호출을 record-store.ts의 월별 캐시로 보내고,
 * 어떤 기록이든 쓰기가 일어나면(이미 모든 쓰기가 거치는 subscribe() 채널)
 * 그 캐시가 통째로 비워진 뒤 이 훅도 다시 조회한다.
 *
 * `monthHasAnyRecords`는 특정 섹터를 선택했는데 결과가 0건일 때만(그
 * 경우에만 "이 달엔 있는데 이 섹터엔 없음"과 "이 달 자체가 없음"을 구분해야
 * 함) 섹터 조건 없는 카운트를 한 번 더 확인해서 채운다 — "전체"거나 결과가
 * 1건 이상이면 이미 답이 나와 있어 추가 호출 없음.
 */
export function useRecordsForMonth(
  year: number,
  month: number,
  category: NewsCategory,
): { records: NewsRecord[]; loading: boolean; error: boolean; monthHasAnyRecords: boolean | null } {
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState<NewsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [monthHasAnyRecords, setMonthHasAnyRecords] = useState<boolean | null>(null);

  const refetch = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    setLoading(true);
    try {
      const range = getKstMonthRange(year, month);
      const sectorValues = category === ALL_CATEGORY ? null : getSectorValuesForCategory(category);
      const result = await getRecordsForMonth(user, range, sectorValues);
      setRecords(result);
      setError(false);

      if (category === ALL_CATEGORY || result.length > 0) {
        setMonthHasAnyRecords(result.length > 0);
      } else {
        setMonthHasAnyRecords((await getRecordCountForMonth(user, range)) > 0);
      }
    } catch (err) {
      console.error("useRecordsForMonth: failed to fetch records", err);
      setRecords([]);
      setError(true);
      setMonthHasAnyRecords(null);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, year, month, category]);

  // See useRecords above for why this isn't the force-update anti-pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  useEffect(() => subscribe(refetch), [refetch]);

  return { records, loading, error, monthHasAnyRecords };
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

/**
 * Seeds its very first render from peekRecord() — a record already
 * resolved earlier this session (same id, same user) renders immediately,
 * with `loading` starting false, instead of flashing a loading state for
 * data this session already has. A cache miss still starts `loading` true,
 * same as before. Either way `refetch` below re-runs on every id/user
 * change and on every write, so this never risks showing stale data — a
 * cache hit just means that refetch resolves from the already-cached
 * promise instead of a new network round trip.
 */
export function useRecord(id: string): { record: NewsRecord | null; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [record, setRecord] = useState<NewsRecord | null>(() => peekRecord(user, id) ?? null);
  const [loading, setLoading] = useState(() => !id || peekRecord(user, id) === undefined);

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
    if (peekRecord(user, id) === undefined) {
      setLoading(true);
    }
    try {
      setRecord(await getRecord(user, id));
      setLoading(false);
    } catch (err) {
      console.error("useRecord: failed to fetch record", err);
      setRecord(null);
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

/**
 * Batch lookup for the "비교 대상 기록" titles the 회고 기록 section needs —
 * replaces fetching every record via useRecords() just to find a handful of
 * titles by id. Each id goes through record-store.ts's own getRecord()
 * cache (see peekRecord/useRecord above), so an id that's also the record
 * currently being viewed, or was viewed earlier this session, costs no
 * extra request at all.
 */
export function useRecordsByIds(
  ids: string[],
): { recordsById: Map<string, NewsRecord>; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [recordsById, setRecordsById] = useState<Map<string, NewsRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  // Dedupe + stabilize so `refetch` below doesn't re-identify on every
  // render just because the caller passed a fresh array literal with the
  // same contents.
  const uniqueIds = [...new Set(ids)];
  const key = uniqueIds.slice().sort().join(",");

  const refetch = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (uniqueIds.length === 0) {
      setRecordsById(new Map());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await Promise.all(uniqueIds.map((recordId) => getRecord(user, recordId)));
      const map = new Map<string, NewsRecord>();
      results.forEach((record, index) => {
        if (record) map.set(uniqueIds[index], record);
      });
      setRecordsById(map);
    } catch (err) {
      console.error("useRecordsByIds: failed to fetch records", err);
      setRecordsById(new Map());
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, key]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see useRecords above
    refetch();
  }, [refetch]);

  useEffect(() => subscribe(refetch), [refetch]);

  return { recordsById, loading };
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
