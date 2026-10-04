"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BackHeader from "@/components/BackHeader";
import SectorBadge from "@/components/SectorBadge";
import { getArticleById } from "@/lib/mock-news";
import { formatDate } from "@/lib/format";

export default function ArticlePage() {
  const params = useParams<{ id: string }>();
  const article = getArticleById(params.id);

  if (!article) {
    return (
      <div>
        <BackHeader title="기사" />
        <div className="px-5 py-10 text-center text-sm text-muted">
          기사를 찾을 수 없어요.
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <BackHeader title="기사" />

      <div className="relative h-56 w-full bg-background">
        <Image
          src={article.imageUrl}
          alt=""
          fill
          sizes="430px"
          className="object-cover"
          priority
        />
      </div>

      <div className="px-5 py-5">
        <div className="mb-3 flex items-center gap-2">
          <SectorBadge sector={article.sector} />
          <span className="text-xs text-muted">
            {formatDate(article.publishedAt)} · {article.source}
          </span>
        </div>
        <h1 className="text-[19px] font-bold leading-snug text-foreground">
          {article.title}
        </h1>
        <p className="mt-4 whitespace-pre-line text-[14.5px] leading-7 text-foreground/80">
          {article.content}
        </p>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
        <div className="pointer-events-auto mx-auto max-w-[430px] border-t border-border-subtle bg-surface/95 px-5 py-3 backdrop-blur">
          <Link
            href={`/record/new?articleId=${article.id}`}
            className="flex w-full items-center justify-center rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white active:bg-point-dark"
          >
            생각 기록하기
          </Link>
        </div>
      </div>
    </div>
  );
}
