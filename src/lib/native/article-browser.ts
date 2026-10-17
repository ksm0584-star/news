/**
 * Native-only: opens an article URL in an SFSafariViewController (iOS) /
 * Chrome Custom Tab (Android) via @capacitor/browser — the same plugin
 * google-auth.ts already uses for OAuth, for the same reason: a modal with
 * its own built-in "완료" (Done) button is a reliable, always-present way
 * back into the app.
 *
 * This replaces relying on Capacitor's *default* WKWebView behavior for a
 * plain `<a href>` to an external origin — canceling the in-webview load
 * and handing it to `UIApplication.shared.open()`, i.e. the real Safari.app
 * (see WebViewDelegationHandler.swift). That default's iOS "back to app"
 * banner was tested on the Simulator and did not reliably appear, so
 * article links now go through this plugin instead, matching the OAuth
 * flow's own return mechanism.
 *
 * This module must only be reached from code already gated by
 * `isNativePlatform()` (see src/lib/platform.ts) — its dynamic import keeps
 * @capacitor/browser's JS out of the web bundle entirely, so the existing
 * plain-anchor behavior on the web is completely untouched.
 */

export async function openArticleInBrowser(url: string): Promise<void> {
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url });
}

/**
 * Registers a listener for the next time the user dismisses the in-app
 * browser (Done button or swipe-down) — the native analog of "the user
 * came back," used to re-check the home screen's article-return banner
 * (see use-article-return-banner.ts). An SFSafariViewController is a modal
 * within the same app process, so the host app is never backgrounded and
 * `visibilitychange` never fires for it, unlike a true app switch.
 *
 * Returns a cleanup function that removes the listener.
 */
export async function listenForArticleBrowserClosed(onClosed: () => void): Promise<() => void> {
  const { Browser } = await import("@capacitor/browser");
  const handle = await Browser.addListener("browserFinished", onClosed);
  return () => {
    handle.remove();
  };
}
