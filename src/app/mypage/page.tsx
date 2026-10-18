"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import { resetOnboardingGuide } from "@/components/OnboardingGuide";
import RatingPromptSheet from "@/components/RatingPromptSheet";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { useAuth } from "@/lib/auth-context";
import { useRecordCount } from "@/lib/use-records-store";
import { deleteAccount } from "@/lib/account";
import { trackClick } from "@/lib/mixpanel";

type SocialProvider = "google" | "apple";

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

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const { count, loading: countLoading } = useRecordCount();

  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [showRatingSheet, setShowRatingSheet] = useState(false);

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

  async function handleLogin(provider: SocialProvider) {
    setLoadingProvider(provider);
    setLoginError(null);
    // No explicit return path — login always lands on the home screen
    // regardless of where it was started from (see auth-context.tsx:
    // omitting `next` here means signInWithGoogle/signInWithApple doesn't
    // set the oauth-next cookie, so /auth/callback falls back to its
    // default, "/").
    const { error } = await (provider === "google" ? signInWithGoogle() : signInWithApple());
    if (error) {
      setLoadingProvider(null);
      setLoginError(error);
    }
    // On success the browser is redirected to the provider — nothing else to do here.
  }

  function handleReplayGuide() {
    trackClick("mypage_replay_guide");
    resetOnboardingGuide();
    router.push("/");
  }

  function handleOpenRating() {
    trackClick("mypage_rate_service");
    setShowRatingSheet(true);
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
    <div style={{ paddingBottom: "calc(7.5rem + env(safe-area-inset-bottom))" }}>
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
            나의 생각을 안전하게 보관해 보세요
          </p>
          <p className="text-[13px] text-muted">
            로그인하면 다른 기기에서도 기록을 확인할 수 있어요.
          </p>
          {loginError ? <p className="text-[13px] text-red-500">{loginError}</p> : null}
          <SocialLoginButtons
            onGoogle={() => handleLogin("google")}
            onApple={() => handleLogin("apple")}
            loadingProvider={loadingProvider}
            className="mt-2"
          />
        </div>
      )}

      {user ? (
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
      ) : null}

      <section className="px-5 py-3">
        <h2 className="text-[14px] font-bold text-foreground">도움말</h2>
        <button
          type="button"
          onClick={handleReplayGuide}
          className="mt-2.5 block w-full rounded-2xl border border-border-subtle px-4 py-3.5 text-left text-[14px] font-medium text-foreground active:bg-background"
        >
          앱 사용 가이드 다시보기
        </button>
        <button
          type="button"
          onClick={handleOpenRating}
          className="mt-2.5 block w-full rounded-2xl border border-border-subtle px-4 py-3.5 text-left text-[14px] font-medium text-foreground active:bg-background"
        >
          서비스 평가하기
        </button>
      </section>

      {user ? (
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
                className="button-48 flex-1 rounded-xl border border-border-subtle type-button text-foreground/70 disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={withdrawing}
                className="button-48 flex-1 rounded-xl bg-red-500 type-button text-white disabled:opacity-60"
              >
                {withdrawing ? "탈퇴 처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showRatingSheet ? (
        <RatingPromptSheet autoTriggered={false} onClose={() => setShowRatingSheet(false)} />
      ) : null}
    </div>
  );
}
