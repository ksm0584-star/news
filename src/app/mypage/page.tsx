"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import { useAuth } from "@/lib/auth-context";
import { useRecordCount } from "@/lib/use-records-store";
import { deleteAccount } from "@/lib/account";

function DefaultAvatar() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-muted">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.088 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { count, loading: countLoading } = useRecordCount();

  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Auth state isn't known yet — rendering either branch here would flash
  // the wrong one for a moment once it resolves, so show nothing until then.
  if (authLoading) return null;

  const avatarUrl: string | null =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;
  const displayName: string =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "사용자";

  async function handleGoogleLogin() {
    setLoggingIn(true);
    setLoginError(null);
    // No explicit return path — login always lands on the home screen
    // regardless of where it was started from (see auth-context.tsx:
    // omitting `next` here means signInWithGoogle doesn't set the
    // oauth-next cookie, so /auth/callback falls back to its default, "/").
    const { error } = await signInWithGoogle();
    if (error) {
      setLoggingIn(false);
      setLoginError(error);
    }
    // On success the browser is redirected to Google — nothing else to do here.
  }

  async function handleLogout() {
    await signOut();
    router.replace("/");
  }

  async function handleConfirmWithdraw() {
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      await deleteAccount();
      try {
        await signOut();
      } catch {
        // Account is already gone server-side — a failure here is expected
        // and harmless, the redirect below still leaves the user logged out.
      }
      router.replace("/");
    } catch (err) {
      setWithdrawing(false);
      setWithdrawError(err instanceof Error ? err.message : "탈퇴 처리 중 오류가 발생했어요.");
    }
  }

  return (
    <div className="pb-10">
      <BackHeader title="마이페이지" />

      {user ? (
        <div className="flex items-center gap-3 px-5 py-6">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <DefaultAvatar />
          )}
          <div className="min-w-0">
            <p className="truncate text-[16px] font-bold text-foreground">{displayName}</p>
            <p className="truncate text-[13px] text-muted">{user.email}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <DefaultAvatar />
          <p className="text-[14.5px] font-semibold text-foreground">
            로그인하고 나의 생각을 모아보세요
          </p>
          {loginError ? <p className="text-[13px] text-red-500">{loginError}</p> : null}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loggingIn}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface py-3.5 text-[15px] font-semibold text-foreground disabled:opacity-60"
          >
            <GoogleIcon />
            {loggingIn ? "이동 중..." : "구글로 로그인"}
          </button>
        </div>
      )}

      {user ? (
        <>
          <section className="px-5 py-3">
            <h2 className="text-[14px] font-bold text-foreground">내 활동</h2>
            <div className="mt-2.5 rounded-2xl bg-background px-4 py-4 text-[14px] font-medium text-foreground">
              {countLoading
                ? null
                : count > 0
                  ? `지금까지 ${count}개의 생각을 모았어요`
                  : "아직 모아둔 생각이 없어요"}
            </div>
            <Link
              href="/mypage/searched-terms"
              className="mt-2.5 block w-full rounded-2xl border border-border-subtle px-4 py-3.5 text-left text-[14px] font-medium text-foreground active:bg-background"
            >
              검색한 경제용어
            </Link>
          </section>

          <section className="px-5 py-3">
            <h2 className="text-[14px] font-bold text-foreground">계정 관리</h2>
            <div className="mt-2.5 overflow-hidden rounded-2xl border border-border-subtle">
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-3.5 text-left text-[14px] font-medium text-foreground active:bg-background"
              >
                로그아웃
              </button>
              <button
                type="button"
                onClick={() => setConfirmingWithdraw(true)}
                className="block w-full border-t border-border-subtle px-4 py-3.5 text-left text-[14px] font-medium text-red-500 active:bg-background"
              >
                회원 탈퇴
              </button>
            </div>
          </section>
        </>
      ) : null}

      {confirmingWithdraw ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8">
          <div className="w-full max-w-[320px] rounded-2xl bg-surface p-5">
            <p className="text-[15px] font-bold text-foreground">정말 탈퇴하시겠어요?</p>
            <p className="mt-1.5 text-[13px] leading-5 text-muted">
              탈퇴하면 계정과 저장한 기록이 삭제되며,
              <br />
              삭제된 데이터는 복구할 수 없어요.
            </p>
            {withdrawError ? (
              <p className="mt-2 text-[12.5px] font-medium text-red-500">{withdrawError}</p>
            ) : null}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmingWithdraw(false);
                  setWithdrawError(null);
                }}
                disabled={withdrawing}
                className="flex-1 rounded-xl border border-border-subtle py-2.5 text-[13.5px] font-medium text-foreground/70 disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={withdrawing}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60"
              >
                {withdrawing ? "탈퇴 처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
