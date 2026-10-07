"use client";

import { useEffect, useRef, type RefObject } from "react";
import { isNativePlatform } from "../platform";
import { openArticleWebView, type ArticleWebViewHandle } from "./article-webview";

/**
 * Native-only: opens `url` in a real native WebView sized to `areaRef`'s
 * current bounding box, and reflows it to stay clear of the write panel as
 * `panelHeightPx` changes. A complete no-op on the web — see
 * src/lib/native/article-webview.ts for why the plugin itself is never
 * loaded there.
 */
export function useNativeArticleWebView(
  url: string,
  isUrlValid: boolean,
  areaRef: RefObject<HTMLElement | null>,
  panelHeightPx: number | undefined,
): void {
  const handleRef = useRef<ArticleWebViewHandle | null>(null);

  useEffect(() => {
    if (!isNativePlatform() || !isUrlValid) return;
    let cancelled = false;

    (async () => {
      const rect = areaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const handle = await openArticleWebView(url, {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      });
      if (cancelled) {
        handle.close();
        return;
      }
      handleRef.current = handle;
    })();

    return () => {
      cancelled = true;
      handleRef.current?.close();
      handleRef.current = null;
    };
  }, [url, isUrlValid, areaRef]);

  useEffect(() => {
    if (!isNativePlatform()) return;
    const handle = handleRef.current;
    const rect = areaRef.current?.getBoundingClientRect();
    if (!handle || !rect) return;
    handle.resize({
      width: Math.round(rect.width),
      height: Math.round(rect.height - (panelHeightPx ?? 0)),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
    });
  }, [panelHeightPx, areaRef]);
}
