export type SourceType = "internal" | "external";

export type ReflectionResult = "same" | "changed" | "unsure";

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
