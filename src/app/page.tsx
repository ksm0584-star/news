"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NewsCarousel from "@/components/NewsCarousel";
import RecordCard from "@/components/RecordCard";
import FabButton from "@/components/FabButton";
import EmptyState from "@/components/EmptyState";
import LoginPrompt from "@/components/LoginPrompt";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import { useAuth } from "@/lib/auth-context";
import { useRecords } from "@/lib/use-records-store";
import { track } from "@/lib/mixpanel";

export default function HomePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { records, loading: recordsLoading } = useRecords();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    track("home_viewed");
  }, []);

  return (
    <div className="pb-28">
      <header className="flex items-center justify-between px-5 pt-6 pb-1">
        <h1 className="text-xl font-extrabold text-foreground">뉴스노트</h1>
        {authLoading ? null : user ? (
          <button
            type="button"
            onClick={() => signOut()}
            className="text-[12.5px] font-medium text-muted"
          >
            로그아웃
          </button>
        ) : (
          <Link href="/login" className="text-[12.5px] font-medium text-point">
            로그인
          </Link>
        )}
      </header>

      <NewsCarousel />

      <section className="mt-7 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">내 기록</h2>
          {user ? (
            <span className="text-xs text-muted">{records.length}건</span>
          ) : null}
        </div>

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

      <FabButton
        onRequireLogin={() => {
          if (user) return false;
          setShowLoginModal(true);
          return true;
        }}
      />

      {showLoginModal ? (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      ) : null}
    </div>
  );
}
