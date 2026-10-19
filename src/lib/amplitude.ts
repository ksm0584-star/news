import { init } from "@amplitude/analytics-browser";

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

let initialized = false;

/**
 * Idempotent — safe to call from multiple places, including a Strict Mode
 * double-invoked effect. No-ops when NEXT_PUBLIC_AMPLITUDE_API_KEY isn't set.
 */
export function ensureAmplitudeInit(): void {
  if (!AMPLITUDE_API_KEY) return;
  if (typeof window === "undefined") return;
  // Keep automated/test browsers out of the shared dev+prod Amplitude
  // project, same as mixpanel.ts — navigator.webdriver is set by every
  // mainstream automation tool and never by a real visitor.
  if (navigator.webdriver) return;
  if (initialized) return;
  initialized = true;

  init(AMPLITUDE_API_KEY, {
    autocapture: {
      pageViews: true,
      formInteractions: true,
      // Off by default in @amplitude/analytics-browser — must opt in.
      elementInteractions: true,
    },
  });
}
