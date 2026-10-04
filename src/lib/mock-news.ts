import type { NewsArticle } from "./types";

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    title: "메모리 반도체 가격 3개월 연속 상승, 업황 반등 신호",
    summary:
      "DRAM 고정거래가격이 석 달째 오르며 다운턴 종료 기대감이 커지고 있다.",
    content:
      "시장조사업체는 DRAM 고정거래가격이 전월 대비 상승세를 이어가며 3개월 연속 올랐다고 밝혔다. AI 서버용 고대역폭메모리 수요가 가격 상승을 이끌고 있으며, 주요 제조사들은 감산 기조를 유지하며 공급을 조절하고 있다. 업계에서는 하반기 이후 본격적인 업황 반등이 가능할 것으로 내다보고 있지만, 글로벌 경기 둔화가 수요 회복의 발목을 잡을 수 있다는 우려도 함께 제기된다.",
    imageUrl: "https://picsum.photos/seed/newsnote-semicon/640/420",
    sector: "반도체",
    source: "경제데일리",
    publishedAt: "2026-10-02T08:30:00.000Z",
  },
  {
    id: "news-2",
    title: "한국은행, 기준금리 동결…연내 추가 인하 가능성 열어둬",
    summary:
      "물가 안정과 가계부채 관리 사이에서 금통위가 신중한 선택을 내렸다.",
    content:
      "한국은행 금융통화위원회는 기준금리를 현 수준에서 동결하기로 결정했다. 총재는 물가 상승률이 목표 수준에 근접했지만 가계부채 증가세가 여전히 부담스럽다고 설명했다. 다만 경기 둔화 신호가 뚜렷해질 경우 연내 추가 인하를 검토할 수 있다는 가능성도 함께 열어두면서 시장의 관심이 다음 회의 일정으로 옮겨가고 있다.",
    imageUrl: "https://picsum.photos/seed/newsnote-rate/640/420",
    sector: "금리·통화",
    source: "머니투데이경제",
    publishedAt: "2026-10-01T05:00:00.000Z",
  },
  {
    id: "news-3",
    title: "서울 아파트 거래량 두 달째 증가, 거래 회복 조짐",
    summary: "규제 완화와 금리 동결 기대가 맞물리며 매수 심리가 살아나고 있다.",
    content:
      "서울 아파트 매매 거래량이 두 달 연속 늘어나며 시장에 온기가 돌고 있다는 분석이 나온다. 전문가들은 대출 규제 완화와 기준금리 동결 기대감이 맞물려 실수요자들의 움직임이 빨라졌다고 설명한다. 다만 가격 상승 폭이 제한적인 지역에서는 여전히 관망세가 이어지고 있어 회복 속도는 지역별로 차이를 보일 것으로 예상된다.",
    imageUrl: "https://picsum.photos/seed/newsnote-realestate/640/420",
    sector: "부동산",
    source: "부동산워치",
    publishedAt: "2026-09-29T23:10:00.000Z",
  },
  {
    id: "news-4",
    title: "코스피, 외국인 순매수에 2900선 회복",
    summary: "반도체·2차전지 대형주 중심으로 외국인 자금이 유입됐다.",
    content:
      "코스피지수가 외국인 투자자의 순매수세에 힘입어 2900선을 다시 넘어섰다. 반도체와 2차전지 관련 대형주로 자금이 몰리며 지수를 끌어올렸다는 평가다. 증권가에서는 글로벌 위험자산 선호 심리가 강화된 영향이 크다고 분석하면서도, 미국 통화정책 변수에 따라 변동성이 커질 수 있다고 경고했다.",
    imageUrl: "https://picsum.photos/seed/newsnote-stock/640/420",
    sector: "증시",
    source: "증권경제TV",
    publishedAt: "2026-09-28T07:45:00.000Z",
  },
  {
    id: "news-5",
    title: "원/달러 환율, 1320원대에서 안정세",
    summary: "미 연준의 정책 기조 변화 기대에 환율 상승세가 주춤해졌다.",
    content:
      "원/달러 환율이 1320원대에서 안정적인 움직임을 보이고 있다. 미국 연방준비제도가 추가 인상보다는 동결에 무게를 두는 발언을 내놓으면서 달러 강세가 다소 완화된 영향으로 풀이된다. 외환시장 참가자들은 다음 미국 고용지표 발표가 환율의 다음 방향을 결정할 핵심 변수가 될 것으로 보고 있다.",
    imageUrl: "https://picsum.photos/seed/newsnote-fx/640/420",
    sector: "환율",
    source: "글로벌이코노미",
    publishedAt: "2026-09-27T02:20:00.000Z",
  },
  {
    id: "news-6",
    title: "국제 유가, 중동 긴장 완화에 하락세로 전환",
    summary: "공급 차질 우려가 줄며 유가가 한 주 만에 하락 반전했다.",
    content:
      "국제 유가가 중동 지역의 긴장이 다소 완화되면서 한 주 만에 하락세로 돌아섰다. 주요 산유국의 감산 유지 발표에도 불구하고 공급 차질 우려가 줄어든 점이 가격 하락을 이끌었다. 다만 겨울철 에너지 수요 증가 시즌을 앞두고 있어 변동성은 계속될 것으로 전망된다.",
    imageUrl: "https://picsum.photos/seed/newsnote-energy/640/420",
    sector: "에너지",
    source: "에너지저널",
    publishedAt: "2026-09-25T11:05:00.000Z",
  },
  {
    id: "news-7",
    title: "구리 가격, 공급 부족 우려에 연고점 경신",
    summary: "전력망·전기차 수요 확대가 원자재 시장을 자극하고 있다.",
    content:
      "구리 가격이 주요 광산의 생산 차질과 전력망·전기차 관련 수요 확대가 겹치며 연중 최고치를 다시 썼다. 원자재 투자자들은 공급 부족이 단기간에 해소되기 어렵다고 보고 있으며, 관련 기업들의 실적 전망도 함께 상향되는 분위기다.",
    imageUrl: "https://picsum.photos/seed/newsnote-commodity/640/420",
    sector: "원자재",
    source: "원자재인사이트",
    publishedAt: "2026-09-23T06:40:00.000Z",
  },
  {
    id: "news-8",
    title: "빅테크 AI 투자 경쟁 가속…클라우드 수요 급증",
    summary: "주요 플랫폼 기업들이 올해 AI 설비투자 계획을 잇따라 상향했다.",
    content:
      "주요 빅테크 기업들이 올해 인공지능 관련 설비투자 계획을 잇따라 상향 조정하고 있다. 클라우드 인프라 수요가 예상보다 빠르게 늘면서 관련 반도체·장비 업체들의 수주도 함께 증가하는 모습이다. 시장에서는 투자 경쟁이 과열될 경우 중장기 수익성에 부담이 될 수 있다는 신중론도 나온다.",
    imageUrl: "https://picsum.photos/seed/newsnote-platform/640/420",
    sector: "IT·플랫폼",
    source: "테크경제",
    publishedAt: "2026-09-21T09:15:00.000Z",
  },
];

export function getArticleById(id: string): NewsArticle | undefined {
  return MOCK_NEWS.find((article) => article.id === id);
}
