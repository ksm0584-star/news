import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

/** Idempotent — safe to call from multiple places, including a Strict Mode double-invoked effect. */
function ensureInit(): boolean {
  if (!MIXPANEL_TOKEN) return false;
  if (typeof window === "undefined") return false;
  if (!initialized) {
    mixpanel.init(MIXPANEL_TOKEN, {
      track_pageview: false,
      persistence: "localStorage",
    });
    initialized = true;
  }
  return true;
}

/** No-ops when NEXT_PUBLIC_MIXPANEL_TOKEN isn't set. */
export function track(eventName: string, props?: Record<string, unknown>): void {
  if (!ensureInit()) return;
  mixpanel.track(eventName, props);
}

/** Fires a "page_view" event with the current path. */
export function trackPageView(path: string): void {
  track("page_view", { path });
}

/** Fires a "button_click" event for a named CTA, for funnel/engagement tracking. */
export function trackClick(label: string, props?: Record<string, unknown>): void {
  track("button_click", { label, ...props });
}
