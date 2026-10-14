import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Minimal app-wide toast store. Module-level values (not React state) so
 * they survive client-side navigation: the <Toaster> that renders a toast
 * lives in the root layout, which never unmounts on route changes, and a
 * shown toast is cleared exactly once when its timer ends — so it can't
 * reappear on a later screen.
 *
 * A success that navigates away first (edit/delete → router.replace) uses
 * queueToast() instead of showToast(): the toast waits as `pending` until
 * the destination screen reports its data has actually rendered (see
 * usePendingToastRelease), so it never appears over the old screen or a
 * blank loading state. A pending toast is dropped, never shown later, if
 * the destination fails to load or the user ends up on any other screen.
 */

export interface Toast {
  id: number;
  message: string;
}

interface PendingToast {
  message: string;
  /** Pathname the success happened on — still current until navigation lands. */
  from: string;
  /** Pathname of the screen that should show it once ready. */
  to: string;
}

export const TOAST_DURATION_MS = 3000;

let current: Toast | null = null;
let pending: PendingToast | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Call only after the action it reports has actually succeeded. */
export function showToast(message: string) {
  current = { id: nextId++, message };
  emit();
}

/**
 * Call only after the action succeeded, right before navigating to `to`.
 * Shown once that screen calls usePendingToastRelease("ready").
 */
export function queueToast(message: string, { to }: { to: string }) {
  pending = { message, from: window.location.pathname, to };
}

/** Drops a pending toast once the user is on neither its origin nor its destination. */
export function dropStalePendingToast(pathname: string) {
  if (pending && pathname !== pending.from && pathname !== pending.to) pending = null;
}

/**
 * Called by a navigation destination with its own load state: "ready" only
 * once its real content is rendered, "failed" when it can't show it (e.g.
 * record not found / fetch error) — which discards the toast instead.
 */
export function usePendingToastRelease(status: "loading" | "ready" | "failed") {
  const pathname = usePathname();
  useEffect(() => {
    if (status === "loading" || !pending || pending.to !== pathname) return;
    const { message } = pending;
    pending = null;
    if (status === "ready") showToast(message);
  }, [status, pathname]);
}

export function dismissToast(id: number) {
  if (current?.id !== id) return;
  current = null;
  emit();
}

export function subscribeToast(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getToast() {
  return current;
}
