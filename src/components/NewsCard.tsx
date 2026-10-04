import Image from "next/image";
import Link from "next/link";
import type { NewsArticle } from "@/lib/types";

export default function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="flex w-[168px] shrink-0 flex-col gap-2 snap-start"
    >
      <div className="relative h-[112px] w-full overflow-hidden rounded-2xl bg-background">
        <Image
          src={article.imageUrl}
          alt=""
          fill
          sizes="168px"
          className="object-cover"
        />
      </div>
      <span className="text-[13px] font-medium leading-snug text-foreground line-clamp-2">
        {article.title}
      </span>
      <span className="text-xs text-muted">{article.sector}</span>
    </Link>
  );
}
