export const MEMO_REQUIRED_ERROR =
  "핵심 내용, 새로 알게 된 점, 궁금한 점 중 하나를 짧게 남겨주세요.";

/** Reused by every record create/edit path (new, external, inline detail-page memo edit). */
export function isMemoValid(thought: string): boolean {
  return thought.trim().length > 0;
}
