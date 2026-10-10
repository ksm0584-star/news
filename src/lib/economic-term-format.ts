/** Shared by the client data-access module and the server API route — no browser- or server-only imports. */

export const MAX_TERM_LENGTH = 40;
export const MAX_DESCRIPTION_LENGTH = 100;

/** Collapses whitespace differences so "기준 금리" and "기준금리 " dedupe to the same row. */
export function normalizeTerm(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}
