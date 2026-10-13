import type { NewsCategory } from "./news-categories";

/**
 * Live home-feed classifier — imported by news-rss.ts's parseRssFeed(),
 * which is what src/app/api/news/route.ts actually calls. Replaced the old
 * first-match classifySector()/SECTOR_KEYWORDS that used to live in
 * news-rss.ts directly (same 9 categories, see news-categories.ts — this
 * file does not add, rename, or remove any category).
 *
 * Built to address the "46.7% of articles land in 기타" finding from the
 * category-accuracy analysis: a richer keyword dictionary, a score-based
 * (not first-match) category pick, and a conservative non-economic filter.
 * Validated across two review rounds against a fixed 180-article live
 * snapshot before being wired in here — see project conversation history
 * for the full before/after numbers.
 */

/**
 * Starts from news-rss.ts's SECTOR_KEYWORDS verbatim (nothing removed —
 * the original ticket is explicit about never deleting an existing
 * keyword) with additions found by manually reading the 84 기타-classified
 * titles from a live snapshot (매일경제/아시아경제/조선일보, 180 articles,
 * 2026-10-14). Each addition below is annotated with the actual 기타
 * title that motivated it.
 *
 * Each category has `strong` and optionally `weak` keywords (see
 * classifySectorV2 below for what that split does). Only 정책·거시경제
 * actually has weak entries today — 정부/정책/규제/국회/경제 were
 * reviewed after a validation pass found they're broad enough to plausibly
 * fire on non-economic politics/diplomacy/society headlines (and "경제"
 * alone is far too generic to decide anything by itself). They're
 * demoted to `weak` rather than deleted, per "기존 키워드를 무조건
 * 삭제하지 말 것" — they still count toward a category's score, just
 * can never be the ONLY reason that category is picked.
 *
 * Known ambiguity, kept as-is (documented, not "fixed" by force):
 * - "배터리" (에너지) vs 자동차·모빌리티's EV-battery coverage: a title
 *   with both "전기차" and "배터리" now scores 자동차·모빌리티 1,
 *   에너지 1 — a tie broken by this array's order (자동차·모빌리티
 *   listed first), matching today's production behavior for that case.
 * - "통신" (AI·테크) vs 금융's market/stock coverage of telecom stocks —
 *   same tie-break-by-order story.
 * - "AI" (AI·테크) is a 2-letter Latin substring match — low but nonzero
 *   risk of firing inside an unrelated acronym. Kept; not observed to
 *   misfire in the live sample checked.
 */
interface CategoryKeywords {
  category: NewsCategory;
  /** At least one of these must match, or the category isn't eligible to be picked at all. */
  strong: string[];
  /** Match adds to the score, but can never by itself make a category eligible — needs ≥1 strong hit too. */
  weak?: string[];
}

export const SECTOR_KEYWORDS_V2: CategoryKeywords[] = [
  {
    category: "반도체",
    strong: ["반도체", "메모리", "파운드리", "웨이퍼", "낸드", "D램", "HBM"],
  },
  {
    category: "바이오·헬스케어",
    strong: [
      "바이오",
      "제약",
      "헬스케어",
      "임상",
      "병원",
      "의료",
      "백신",
      // + : 식품의약품안전처 승인/개발 기사 제목에 "제약"/"임상" 없이 이 단어만 쓰이는 경우가 흔함.
      "신약",
      "치료제",
    ],
  },
  {
    category: "자동차·모빌리티",
    strong: [
      "자동차",
      "전기차",
      "현대차",
      "기아",
      "모빌리티",
      "완성차",
      "수소차",
      // + : AI·테크와 의미가 겹치지만, 자동차 업계 뉴스의 관용 표현이라 여기 배치.
      "자율주행",
    ],
  },
  {
    category: "에너지",
    strong: ["에너지", "전력", "원전", "태양광", "석유", "가스", "탈탄소", "전기요금", "배터리"],
  },
  {
    category: "부동산·건설",
    strong: [
      "부동산",
      "아파트",
      "건설",
      "분양",
      "재건축",
      "전세",
      // + : "8월 전국 주택 낙찰가율 평균 70%..." — 비교 실행 결과 "주택" 자체가
      // 사전에 없어서 이런 기사들이 계속 기타로 남는 걸 보고 추가.
      "주택",
      // + : "LH 사장 '집값 급락 가능성...'" 등 — 기존 사전엔 "집값" 계열이 전혀 없었음.
      "집값",
      "전셋값",
      "분양가",
      "매매가",
      // + : "'공공임대 늘려라' 명받은 LH·SH마저... 종부세 40% 급증" — 부동산 세제 기사.
      "종부세",
      "공공임대",
    ],
  },
  {
    category: "소비재·유통",
    strong: [
      "유통",
      "면세점",
      "백화점",
      "편의점",
      "패션",
      "화장품",
      "식품",
      "뷰티",
      "이커머스",
      "쿠팡",
      // + : "소형 가전엔 지갑 연다", "가전 시장 뒷걸음질에도..." — AI·테크가 아니라
      // 가전 유통/소비 쪽 기사였음 (처음엔 AI·테크에 넣었다가 비교 실행 후 옮김).
      "가전",
    ],
  },
  {
    category: "금융",
    strong: [
      "금리",
      "주가",
      "증시",
      "코스피",
      "코스닥",
      "은행",
      "금융",
      "채권",
      "환율",
      "한국은행",
      "펀드",
      // + : "'이러려고 한은 들어갔나'..." — "한국은행"의 약어가 실제 기사 제목에서 훨씬 흔함.
      "한은",
      // + : "'환차익 기회' 돈 몰리는 외화예금", "1333.2원 원화값 2년만에 최고".
      "환차익",
      "원화값",
      "외화예금",
      // + : "韓기업 해외원화 조달 숨통..." — "원화값"엔 안 걸리는 "원화" 단독 용례.
      // 통화 단위를 가리키는 고유어라 오탐 위험이 낮다고 판단.
      "원화",
      // + : "간편송금 타고 번진 보이스피싱...지급정지 3.5배 급증" — 핀테크/금융사기 기사.
      "보이스피싱",
      "지급정지",
      "간편송금",
    ],
  },
  {
    category: "AI·테크",
    strong: [
      "AI",
      "인공지능",
      "빅테크",
      "데이터센터",
      "소프트웨어",
      "플랫폼",
      "로봇",
      "통신",
      "주파수",
      "스타트업",
      // + : "LG전자, 애플과 스마트홈 기기 공동 개발..." — 기존 사전에 IoT/클라우드 어휘가 전무했음.
      // "가전"은 일부러 안 넣음 — 비교 실행해보니 "소형 가전엔 지갑 연다"/"가전 시장
      // 뒷걸음질" 같은 순수 가전 유통/소비 기사까지 AI·테크로 끌고 가는 오분류가
      // 나와서, 유통/소비재 쪽(소비재·유통)에 넣는 게 더 맞다고 판단해 그쪽으로 옮김.
      "스마트홈",
      "클라우드",
    ],
  },
  {
    category: "정책·거시경제",
    strong: [
      // + : "IMF, 올 韓성장률 3.3%로 상향" — 거시 지표 기사에 "성장률"/"GDP" 계열이 없었음.
      "세금",
      "연금",
      "예산",
      "물가",
      "경제단체",
      "성장률",
      "GDP",
      "최저임금",
      // + : "교복 입찰서 51건 담합...대리점 10곳 과징금 1억" — 공정위 제재 기사.
      "담합",
      "과징금",
      "공정위",
    ],
    // 2차 검증 피드백 반영: "정부/정책/규제/국회/경제"는 외교·안보·사회 기사에도
    // 흔히 쓰이는 범용 단어라 — 예: "정부, 북한에 강력 대응" — 단독으로 이
    // 카테고리를 결정하게 두지 않음. 같은 카테고리의 strong 키워드가 이미
    // 하나라도 맞았을 때만 점수에 더해지는 보조 신호로만 작동.
    weak: ["정부", "정책", "국회", "규제", "경제"],
  },
];

export interface ClassificationResult {
  sector: NewsCategory;
  /** Count of distinct matching keywords (strong+weak) per category that was ELIGIBLE (≥1 strong hit) — omits ineligible/zero-score categories. */
  scores: Partial<Record<NewsCategory, number>>;
  /** True when the pick came from a tie broken by SECTOR_KEYWORDS_V2's array order, same rule v1 always used. */
  tieBroken: boolean;
}

/**
 * Score-based classifier: a category is only ELIGIBLE to be picked if at
 * least one of its `strong` keywords appears in the title — `weak`
 * keywords (see SECTOR_KEYWORDS_V2's 정책·거시경제 entry) never qualify a
 * category on their own, only add to an already-eligible category's
 * score. Among eligible categories, score = count of distinct matching
 * keywords (strong+weak, not occurrences — a repeated keyword still
 * counts once). Highest score wins; nothing eligible → "기타", same
 * "no evidence → 기타" bar v1 used, never guesses past that.
 *
 * Ties are broken by SECTOR_KEYWORDS_V2's array order (earlier wins) —
 * the same rule v1 used implicitly for every title, now applied only
 * when two or more categories are genuinely tied instead of on every
 * multi-category title.
 */
export function classifySectorV2(title: string): ClassificationResult {
  const scores: Partial<Record<NewsCategory, number>> = {};
  let best: NewsCategory | null = null;
  let bestScore = 0;
  let tieBroken = false;

  for (const { category, strong, weak = [] } of SECTOR_KEYWORDS_V2) {
    const strongHits = strong.filter((kw) => title.includes(kw)).length;
    if (strongHits === 0) continue; // weak-only matches never qualify a category
    const weakHits = weak.filter((kw) => title.includes(kw)).length;
    const score = strongHits + weakHits;
    scores[category] = score;
    if (score > bestScore) {
      best = category;
      bestScore = score;
      tieBroken = false;
    } else if (score === bestScore && best !== null) {
      tieBroken = true; // first (= earlier-in-array) category already held `best`, so it stays
    }
  }

  return { sector: best ?? "기타", scores, tieBroken };
}

/**
 * Conservative non-economic filter. Fires ONLY when a title both (a)
 * scored zero on every SECTOR_KEYWORDS_V2 category — i.e. it was already
 * headed for "기타", never a classified article — and (b) matches one of
 * the patterns below. This ordering is deliberate: a title with any
 * economic keyword hit is never excluded, no matter what else it
 * mentions, so this can't demote a real economic article.
 *
 * Patterns were chosen from manually reading the 84 기타 titles in the
 * live snapshot and keeping only the ones with no plausible economic
 * reading at all (weather bulletins, violent crime, celebrity gossip,
 * international political/diplomatic news with no economic angle, and
 * local officials' routine PR/site-visit coverage). Deliberately NOT
 * included: anything about regulation, taxes, budgets, or corporate
 * conduct, since those plausibly ARE economic news even without hitting
 * today's keyword list — e.g. "교복 입찰 담합" now scores a hit above and
 * never reaches this filter, but if it hadn't, a 담합/과징금 story still
 * isn't safe to blanket-exclude as "obviously non-economic".
 */
// 지역 공직자 PR성 기사: "<이름> <직함>, ..." 패턴. 의도적으로 "시장"은 제외 —
// "시장"은 "증시장/부동산시장/가전 시장" 같은 핵심 경제 단어와 동음이의라,
// 이 패턴에 넣으면 진짜 시장(market) 관련 경제 기사를 오제외할 위험이 큼.
// 군수/구청장/도의원/시의원은 그런 경제 동음이의어가 없어 상대적으로 안전함.
// (바로 아래 LOCAL_OFFICIAL_ECONOMIC_SIGNAL로 한 번 더 걸러낸다)
const LOCAL_OFFICIAL_PATTERN = /(군수|구청장|도의원|시의원)[,\s]/;

/**
 * 1차 검증에서 "김학영 고양시의원 '킨텍스역... 환승센터로 조성해야'"와
 * "차석호 함안군수, 국도비 확보 550억원 투자유치 성과"가 지역 공직자
 * PR 패턴에 걸려 제외됐는데, 둘 다 실제로는 인프라 개발/투자유치라는
 * 경제적 의미가 있는 기사였다 — "명확하게 비경제 기사인 경우에만
 * 제외"하라는 피드백에 따라, 공직자 패턴이 매치되더라도 이 신호가 함께
 * 있으면 제외하지 않는다.
 */
const LOCAL_OFFICIAL_ECONOMIC_SIGNAL =
  /투자유치|국도비|사업비|예산|지원금|보조금|조성|개발|유치/;

const NON_ECONOMIC_PATTERNS: RegExp[] = [
  // 일기예보
  /^\[내일날씨\]/,
  /날씨/,
  // 강력범죄 (금융사기·경제범죄는 위 키워드 단계에서 이미 걸러짐 — 여긴 순수 강력범죄만)
  /살인|강도|흉기난동|성범죄/,
  LOCAL_OFFICIAL_PATTERN,
  // 지역 축제·문화행사
  /문화제|축제/,
  // 국제 정치/외교 (경제 어젠다 없는 순수 외교·분쟁 기사)
  /젤렌스키|NHK|다카이치 내각/,
  // 연예/가십성 기사
  /인플루언서.*(계약|공개)/,
];

export interface FilterResult {
  excluded: boolean;
  reason?: string;
}

export function evaluateNonEconomicFilter(title: string, v2Scores: ClassificationResult["scores"]): FilterResult {
  const hasAnyEconomicSignal = Object.keys(v2Scores).length > 0;
  if (hasAnyEconomicSignal) return { excluded: false };

  const matched = NON_ECONOMIC_PATTERNS.find((pattern) => pattern.test(title));
  if (!matched) return { excluded: false };

  if (matched === LOCAL_OFFICIAL_PATTERN && LOCAL_OFFICIAL_ECONOMIC_SIGNAL.test(title)) {
    return { excluded: false };
  }

  return { excluded: true, reason: matched.source };
}
