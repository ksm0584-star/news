"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/mixpanel";

/**
 * Mounted once at the root layout — fires "page_view" on every route change.
 * Guards against firing twice for the same path: React 18 Strict Mode
 * (dev only) mounts this effect twice in a row with an identical pathname,
 * which would otherwise double-count every page_view in development.
 */
export default function AnalyticsPageView() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastTrackedPathRef.current === pathname) return;
    lastTrackedPathRef.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
