"use client";

import { useSyncExternalStore } from "react";
import {
  findPastRecordWithThought,
  getRecord,
  getRecords,
  getReflectionsForRecord,
  subscribe,
} from "./storage";
import type { NewsRecord, Reflection } from "./types";

const EMPTY_RECORDS: NewsRecord[] = [];
const EMPTY_REFLECTIONS: Reflection[] = [];

export function useRecords(): NewsRecord[] {
  return useSyncExternalStore(subscribe, getRecords, () => EMPTY_RECORDS);
}

export function useRecord(id: string): NewsRecord | undefined {
  return useSyncExternalStore(
    subscribe,
    () => getRecord(id),
    () => undefined,
  );
}

export function useReflectionsForRecord(id: string): Reflection[] {
  return useSyncExternalStore(
    subscribe,
    () => getReflectionsForRecord(id),
    () => EMPTY_REFLECTIONS,
  );
}

export function usePastRecordWithThought(
  sector: string | undefined,
  excludeId: string | undefined,
): NewsRecord | undefined {
  return useSyncExternalStore(
    subscribe,
    () =>
      sector && excludeId
        ? findPastRecordWithThought(sector, excludeId)
        : undefined,
    () => undefined,
  );
}
