/**
 * Native-only: shows an article URL in a real native WebView via
 * @capgo/capacitor-inappbrowser, not an iframe — iframes are blocked by
 * X-Frame-Options/CSP on sites like Naver News, while a native WebView is a
 * top-level navigation those headers don't restrict.
 *
 * This module must only be reached from code already gated by
 * `isNativePlatform()` (see src/lib/platform.ts). The plugin itself is
 * loaded with a dynamic import so its JS is never fetched in a web build —
 * not just "not called," but not present in the web bundle at all.
 *
 * STATUS: implemented, not yet run on a simulator/device/emulator — there's
 * no Xcode or Android SDK in the environment this was written in. See
 * docs/native-app-status.md before resuming native work.
 */

export interface ArticleWebViewRect {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ArticleWebViewHandle {
  close: () => Promise<void>;
  resize: (rect: ArticleWebViewRect) => Promise<void>;
}

export async function openArticleWebView(
  url: string,
  rect: ArticleWebViewRect,
): Promise<ArticleWebViewHandle> {
  const { InAppBrowser, ToolBarType } = await import("@capgo/capacitor-inappbrowser");
  const { id } = await InAppBrowser.openWebView({
    url,
    toolbarType: ToolBarType.NAVIGATION,
    isPresentAfterPageLoad: false,
    // Ephemeral, isolated store — not shared with the host app's own
    // cookies/session. See docs/native-app-status.md for what was verified
    // about this directly in the plugin's source vs. just documented.
    persistWebViewData: false,
    ...rect,
  });

  return {
    close: () => InAppBrowser.close({ id }).then(() => {}),
    resize: (r) => InAppBrowser.updateDimensions({ id, ...r }).then(() => {}),
  };
}
