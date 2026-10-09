"use client";

import { useEffect } from "react";
import Link from "next/link";
import LatestNewsList from "@/components/LatestNewsList";
import { useAuth } from "@/lib/auth-context";
import { track } from "@/lib/mixpanel";

export default function HomePage() {
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    track("home_viewed");
  }, []);

  return (
    <div style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))" }}>
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

      <LatestNewsList />
    </div>
  );
}
