import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

/** Idempotent — safe to call from multiple places, including a Strict Mode double-invoked effect. */
function ensureInit(): boolean {
  if (!MIXPANEL_TOKEN) return false;
  if (typeof window === "undefined") return false;
  // Never send events from an automated/test browser (Playwright, Selenium,
  // Puppeteer, …) into the shared dev+prod Mixpanel project below —
  // navigator.webdriver is set by every mainstream automation tool and
  // never by a real visitor, so this is a no-op for actual users.
  if (navigator.webdriver) return false;
  if (!initialized) {
    mixpanel.init(MIXPANEL_TOKEN, {
      track_pageview: false,
      persistence: "localStorage",
    });
    // Dev and Production currently share one Mixpanel token/project (no
    // per-environment token split exists yet) — tag every event with the
    // build environment so dev-origin events can at least be filtered out
    // of Production dashboards instead of being indistinguishable.
    mixpanel.register({ environment: process.env.NODE_ENV });
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

/** Ties subsequent events to a stable identity after login. Pass only the Supabase user id — never an email or other PII. */
export function identify(userId: string): void {
  if (!ensureInit()) return;
  mixpanel.identify(userId);
}

/** Clears a signed-in identity while preserving returning anonymous visitors. */
export function resetIdentity(): void {
  if (!ensureInit()) return;
  // Auth also reports a null INITIAL_SESSION on every anonymous app load.
  // Resetting then would assign the returning visitor a new device ID.
  if (!mixpanel.get_property("$user_id")) return;
  mixpanel.reset();
  // reset() clears super properties along with identity.
  mixpanel.register({ environment: process.env.NODE_ENV });
}
