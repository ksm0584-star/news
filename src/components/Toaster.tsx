"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isBottomNavPath } from "@/components/BottomNav";
import {
  TOAST_DURATION_MS,
  dismissToast,
  dropStalePendingToast,
  getToast,
  subscribeToast,
} from "@/lib/toast";

/**
 * Mounted once from the root layout so a toast outlives route changes (see
 * src/lib/toast.ts). The live region itself is always rendered — screen
 * readers only reliably announce content inserted into a region that already
 * existed — and only its content toggles.
 *
 * Bottom offset clears whatever is pinned to the bottom of the current
 * screen: on the three tab screens that's BottomNav (64px content height,
 * `--spacing-nav-content-height`) plus the same 1.25rem gap the bottom
 * sheets use; elsewhere it's just that 1.25rem on its own. Both add the
 * safe-area inset.
 */
export default function Toaster() {
  const toast = useSyncExternalStore(subscribeToast, getToast, () => null);
  const pathname = usePathname();

  useEffect(() => {
    dropStalePendingToast(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => dismissToast(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [toast]);

  const bottom = isBottomNavPath(pathname)
    ? "calc(4rem + 1.25rem + env(safe-area-inset-bottom))"
    : "calc(1.25rem + env(safe-area-inset-bottom))";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{ bottom }}
      className="pointer-events-none fixed inset-x-0 z-50 mx-auto flex w-full max-w-[430px] justify-center px-5"
    >
      {toast ? (
        <p
          key={toast.id}
          className="rounded-xl bg-foreground px-4 py-3 text-center text-[13.5px] font-medium text-white shadow-lg"
        >
          {toast.message}
        </p>
      ) : null}
    </div>
  );
}
