"use client";

import NewsCarousel from "@/components/NewsCarousel";
import RecordCard from "@/components/RecordCard";
import FabButton from "@/components/FabButton";
import EmptyState from "@/components/EmptyState";
import { useRecords } from "@/lib/use-store";

export default function HomePage() {
  const records = useRecords();

  return (
    <div className="pb-28">
      <header className="px-5 pt-6 pb-1">
        <h1 className="text-xl font-extrabold text-foreground">뉴스노트</h1>
      </header>

      <NewsCarousel />

      <section className="mt-7 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">내 기록</h2>
          <span className="text-xs text-muted">{records.length}건</span>
        </div>
        {records.length === 0 ? (
          <EmptyState
            title="아직 기록한 뉴스가 없어요"
            description="관심 있는 뉴스를 읽고 생각을 기록해보세요"
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {records.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>

      <FabButton />
    </div>
  );
}
