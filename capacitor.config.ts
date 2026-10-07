import type { CapacitorConfig } from "@capacitor/cli";

/**
 * DEV-ONLY config. The native WebView loads the live Next.js server (via
 * `server.url`) instead of a bundled static export, because `src/proxy.ts`
 * (session-refresh middleware) and `src/app/auth/callback/route.ts` (OAuth
 * code exchange) both need a running server — a static Capacitor bundle
 * can't run either. Ionic's own guidance is that `server.url` is meant for
 * local dev / live-reload, not production; before shipping to real users,
 * point this at your deployed HTTPS URL instead (and switch `cleartext` off).
 *
 * `localhost` reaches the Mac's dev server from the iOS Simulator (it shares
 * the host's network namespace), but NOT from the Android emulator — there,
 * use `http://10.0.2.2:3000` (the emulator's host-loopback alias). A
 * physical device on either platform needs your machine's real LAN IP
 * (`ipconfig getifaddr en0` on macOS), with that IP added to Supabase's
 * Auth > URL Configuration > Redirect URLs allowlist for the OAuth flow
 * to be able to redirect back to it.
 */
const config: CapacitorConfig = {
  appId: "com.newsnote.app",
  appName: "뉴스노트",
  webDir: "capacitor-shell",
  server: {
    // TEMPORARY while validating /webview-test on the iOS Simulator — there's
    // no address bar in the native shell, so this is how the app lands
    // directly on that screen. Revert to "http://localhost:3000" afterward.
    url: "http://localhost:3000/webview-test",
    cleartext: true,
  },
};

export default config;
