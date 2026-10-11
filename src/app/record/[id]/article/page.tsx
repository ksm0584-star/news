"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Compatibility shim — this route used to show a saved record's original
 * article in an iframe (뉴스 열람 구조 개편 1~2차 removed that iframe
 * everywhere else; 3차 removes it here too). Kept instead of deleted so an
 * old bookmark, browser history entry, or anyone who still has this exact
 * URL open doesn't hit a 404: it immediately sends them to the record
 * detail screen, which has its own "원문 보기" link straight to the real
 * article (see src/app/record/[id]/page.tsx). No other functionality ever
 * lived on this route — it only ever existed to host the iframe.
 */
export default function RecordArticleRedirectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/record/${params.id}`);
  }, [params.id, router]);

  return null;
}
