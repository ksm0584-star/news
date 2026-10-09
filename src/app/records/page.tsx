"use client";

import { useEffect } from "react";
import RecordCard from "@/components/RecordCard";
import EmptyState from "@/components/EmptyState";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/auth-context";
import { useRecords } from "@/lib/use-records-store";
import { track } from "@/lib/mixpanel";

export default function RecordsPage() {
  const { user, loading: authLoading } = useAuth();
  const { records, loading: recordsLoading } = useRecords();

  useEffect(() => {
    track("records_viewed");
  }, []);

  return (
    <div style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}>
      <header className="flex items-center justify-between px-5 pt-6 pb-1">
        <h1 className="text-xl font-extrabold text-foreground">내 기록</h1>
        {authLoading ? null : user ? (
          <span className="text-xs text-muted">{records.length}건</span>
        ) : null}
      </header>

      <section className="mt-3 px-5">
        {authLoading || (user && recordsLoading) ? null : !user ? (
          <LoginPrompt />
        ) : records.length === 0 ? (
          <EmptyState
            title="아직 기록한 뉴스가 없어요"
            description="관심 있는 뉴스를 읽고 메모를 남겨보세요"
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {records.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
