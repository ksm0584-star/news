import Image from "next/image";
import Link from "next/link";
import type { NewsRecord } from "@/lib/types";
import { formatDate } from "@/lib/format";
import SectorBadge from "./SectorBadge";

export default function RecordCard({ record }: { record: NewsRecord }) {
  return (
    <Link
      href={`/record/${record.id}`}
      className="flex gap-3 rounded-2xl border border-border-subtle bg-surface p-3.5 active:bg-background"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-background">
        {record.imageUrl ? (
          <Image
            src={record.imageUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <SectorBadge sector={record.sector} />
          <span className="text-xs text-muted">{formatDate(record.createdAt)}</span>
        </div>
        <p className="truncate text-[14px] font-semibold text-foreground">
          {record.title}
        </p>
        <p className="line-clamp-1 text-[13px] text-muted">
          {record.thought ? record.thought : "아직 작성한 생각이 없어요"}
        </p>
      </div>
    </Link>
  );
}
