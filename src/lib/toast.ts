/**
 * Minimal app-wide toast store. A module-level value (not React state) so a
 * toast raised right before `router.replace()` survives the navigation: the
 * <Toaster> that renders it lives in the root layout, which never unmounts
 * on client-side route changes, and the toast is cleared exactly once when
 * its timer ends — so it can't reappear on a later screen.
 */

export interface Toast {
  id: number;
  message: string;
}

export const TOAST_DURATION_MS = 3000;

let current: Toast | null = null;
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
