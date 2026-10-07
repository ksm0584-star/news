/**
 * Native-only: Google forbids signing in inside an embedded WebView, so the
 * OAuth URL must open in the system browser (@capacitor/browser uses
 * SFSafariViewController on iOS / Chrome Custom Tabs on Android, both
 * treated as a trusted user agent by Google) instead of navigating the
 * app's own Capacitor WebView. Supabase then redirects back to our custom
 * URL scheme, which the OS delivers as an `appUrlOpen` event (@capacitor/app)
 * rather than an HTTP request — so unlike the web flow, there is no server
 * route handling this; the code exchange happens client-side.
 *
 * This module must only be reached from code already gated by
 * `isNativePlatform()` (see src/lib/platform.ts) — its dynamic imports keep
 * @capacitor/app and @capacitor/browser out of the web bundle entirely.
 *
 * STATUS: implemented, not yet run end-to-end — needs the custom scheme
 * registered in Supabase's Auth > URL Configuration > Redirect URLs, and a
 * real device/simulator to confirm the deep link actually returns to the
 * app. See docs/native-app-status.md.
 */

import { NATIVE_AUTH_CALLBACK_URL } from "../platform";

export async function openNativeOAuth(url: string): Promise<void> {
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url });
}

async function closeNativeOAuthBrowser(): Promise<void> {
  const { Browser } = await import("@capacitor/browser");
  await Browser.close().catch(() => {});
}

/** Registers the deep-link listener; returns a function that removes it. */
export async function listenForNativeAuthCallback(
  onCode: (code: string) => void,
): Promise<() => void> {
  const { App } = await import("@capacitor/app");
  const handle = await App.addListener("appUrlOpen", ({ url }) => {
    if (!url.startsWith(NATIVE_AUTH_CALLBACK_URL)) return;
    closeNativeOAuthBrowser();
    const code = new URL(url).searchParams.get("code");
    if (code) onCode(code);
  });
  return () => handle.remove();
}
