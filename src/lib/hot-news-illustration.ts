import type { NewsCategory } from "./news-categories";

/**
 * Fallback illustration for a HOT 뉴스 card when the article has no real,
 * rights-cleared thumbnail (see HotNewsCard.tsx — also used when a real
 * photo URL fails to load at runtime). Pre-rendered static SVGs under
 * public/illustrations/hot-news/, not a per-request image-generation call
 * (MVP scope — see the project's HOT 뉴스 구현 보고). Picking one of these
 * is purely a display concern; it never affects whether an article is
 * selected for HOT 뉴스 (hot-news-matching.ts has no thumbnail gate).
 */
export type IllustrationTheme =
  | "semiconductor-ai-it"
  | "stock-market"
  | "finance-rate-fx"
  | "real-estate"
  | "energy-commodity"
  | "auto-manufacturing"
  | "global-trade"
  | "corporate-earnings"
  | "policy-indicator"
  | "general-economy";

const ILLUSTRATION_THEMES: readonly IllustrationTheme[] = [
  "semiconductor-ai-it",
  "stock-market",
  "finance-rate-fx",
  "real-estate",
  "energy-commodity",
  "auto-manufacturing",
  "global-trade",
  "corporate-earnings",
  "policy-indicator",
  "general-economy",
];

/**
 * Each sector's default theme. The 10-value NewsCategory taxonomy
 * (news-categories.ts) doesn't line up 1:1 with the 10 illustration themes
 * requested for this feature (e.g. there's one "금융" sector but two
 * finance-flavored themes, 증시 vs 금리·환율) — keywordTheme() below refines
 * 금융/정책·거시경제 further using the article's own title. Every other
 * sector maps straight through.
 */
const SECTOR_DEFAULT_THEME: Record<NewsCategory, IllustrationTheme> = {
  전체: "general-economy",
  반도체: "semiconductor-ai-it",
  "AI·테크": "semiconductor-ai-it",
  금융: "finance-rate-fx",
  "바이오·헬스케어": "general-economy",
  에너지: "energy-commodity",
  "자동차·모빌리티": "auto-manufacturing",
  "소비재·유통": "corporate-earnings",
  "부동산·건설": "real-estate",
  "정책·거시경제": "policy-indicator",
  기타: "general-economy",
};

/** Keyword groups checked in this order — first match wins. */
const TITLE_KEYWORD_THEMES: ReadonlyArray<[IllustrationTheme, readonly string[]]> = [
  ["stock-market", ["코스피", "코스닥", "증시", "주가", "상장", "공모주", "IPO"]],
  ["finance-rate-fx", ["금리", "환율", "기준금리", "원달러", "원·달러", "통화정책"]],
  ["global-trade", ["무역", "수출", "수입", "관세", "FTA", "글로벌", "세계경제"]],
  ["energy-commodity", ["유가", "원자재", "원유", "ETN"]],
];

/**
 * Picks the illustration theme for one article — title keywords first
 * (narrows the ambiguous 금융/정책·거시경제 sectors into a more specific
 * theme), then the sector's own default, then the shared fallback. Never
 * throws: an unrecognized sector still resolves to "general-economy".
 */
export function resolveIllustrationTheme(article: {
  title: string;
  sector: NewsCategory;
}): IllustrationTheme {
  for (const [theme, keywords] of TITLE_KEYWORD_THEMES) {
    if (keywords.some((keyword) => article.title.includes(keyword))) return theme;
  }
  return SECTOR_DEFAULT_THEME[article.sector] ?? "general-economy";
}

/** Static public path for a theme's pre-rendered SVG illustration. */
export function illustrationSrc(theme: IllustrationTheme): string {
  return `/illustrations/hot-news/${theme}.svg`;
}

/** Only for tests/diagnostics — the full theme list in file order. */
export function listIllustrationThemes(): readonly IllustrationTheme[] {
  return ILLUSTRATION_THEMES;
}
