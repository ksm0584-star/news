"use client";

import { useVisualViewportHeight } from "./use-visual-viewport-height";
import type { SheetPanelState } from "@/components/ArticleBottomSheet";

export const SHEET_MINIMIZED_HEIGHT_PX = 64;

/**
 * Matches ArticleBottomSheet's own CSS sizing (h-[46dvh]/h-[78dvh], each
 * capped by a max-height) — the sheet's visible size is pure CSS now, this
 * is only a JS pixel *estimate* for native-webview resizing (see
 * useNativeArticleWebView), which needs a concrete number.
 */
const SHEET_FRACTION: Record<Exclude<SheetPanelState, "minimized">, number> = {
  peek: 0.46,
  expanded: 0.78,
};

export function useSheetHeightPx(state: SheetPanelState): number {
  const viewportHeight = useVisualViewportHeight();
  if (state === "minimized") return SHEET_MINIMIZED_HEIGHT_PX;
  if (!viewportHeight) return SHEET_MINIMIZED_HEIGHT_PX;
  return Math.round(viewportHeight * SHEET_FRACTION[state]);
}
