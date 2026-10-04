export const SECTORS = [
  "반도체",
  "금리·통화",
  "부동산",
  "증시",
  "환율",
  "원자재",
  "IT·플랫폼",
  "에너지",
] as const;

export type Sector = (typeof SECTORS)[number];
