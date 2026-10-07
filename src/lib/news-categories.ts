export const NEWS_CATEGORIES = [
  "전체",
  "반도체",
  "AI·테크",
  "금융",
  "바이오·헬스케어",
  "에너지",
  "자동차·모빌리티",
  "소비재·유통",
  "부동산·건설",
  "정책·거시경제",
  "기타",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const ALL_CATEGORY: NewsCategory = "전체";

/** The record-writing screen's chip list — same taxonomy as the home tabs, minus "전체". */
export const WRITABLE_CATEGORIES = NEWS_CATEGORIES.filter(
  (category) => category !== ALL_CATEGORY,
);

/**
 * Maps each sample-news article's old sector label to the news-exploration
 * category it appears under. This is exploration-only grouping — it does
 * not touch Supabase records' `sector` values or retrospective matching,
 * which keep using the raw sector string. A sector with no entry here
 * simply never matches a specific category and stays visible under "전체".
 */
const SECTOR_TO_CATEGORY: Record<string, NewsCategory> = {
  반도체: "반도체",
  "IT·플랫폼": "AI·테크",
  에너지: "에너지",
  // 원자재(원자재 상품 시세)는 새 10개 카테고리 중 어디에도 딱 맞는 자리가 없어 "기타"로 분류.
  원자재: "기타",
  증시: "금융",
  부동산: "부동산·건설",
  "금리·통화": "정책·거시경제",
  환율: "정책·거시경제",
};

export function getCategoryForSector(sector: string): NewsCategory | undefined {
  return SECTOR_TO_CATEGORY[sector];
}

export function matchesCategory(sector: string, category: NewsCategory): boolean {
  return category === ALL_CATEGORY || getCategoryForSector(sector) === category;
}

/**
 * Resolves a record's stored `sector` string (old 8-value taxonomy, or
 * already one of the new writable categories for records saved after this
 * change) to a writable category for the write-screen chips. Returns
 * undefined when it matches neither — e.g. a legacy value with no mapping —
 * so the UI can prompt the user to pick a category instead of guessing.
 */
export function resolveCategoryForSector(sector: string): NewsCategory | undefined {
  if (sector !== ALL_CATEGORY && (WRITABLE_CATEGORIES as readonly string[]).includes(sector)) {
    return sector as NewsCategory;
  }
  return getCategoryForSector(sector);
}
