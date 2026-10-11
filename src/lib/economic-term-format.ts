/** Shared by the client data-access module and the server API route — no browser- or server-only imports. */

export const MAX_TERM_LENGTH = 40;
/** 공백 포함 최대 글자 수 — 2~3문장으로 의미와 경제적 영향을 함께 설명하기에 100자는 부족하다고 판단해 200자로 상향. */
export const MAX_DESCRIPTION_LENGTH = 200;

/** Collapses whitespace differences so "기준 금리" and "기준금리 " dedupe to the same row. */
export function normalizeTerm(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}
