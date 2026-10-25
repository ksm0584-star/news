export type SourceType = "internal" | "external";

export type ReflectionResult = "same" | "changed" | "unsure" | "hard_to_compare";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  sector: string;
  source: string;
  publishedAt: string;
}

export interface NewsRecord {
  id: string;
  title: string;
  /**
   * The original article's own title — separate from `title` (the user's
   * own record title, independently editable). Only ever set at creation
   * time from a known source (e.g. the RSS article's real title); never
   * backfilled or guessed. Undefined for a record whose original title was
   * never known (e.g. a manually-pasted URL with no title) or saved before
   * this field existed — callers must fall back to something else (the
   * article URL's domain, not `title`) rather than substituting it.
   */
  articleTitle?: string;
  sector: string;
  imageUrl?: string;
  sourceType: SourceType;
  articleId?: string;
  url?: string;
  thought?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reflection {
  id: string;
  recordId: string;
  comparedRecordId: string;
  result: ReflectionResult;
  createdAt: string;
}
