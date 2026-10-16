"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { useAuth } from "@/lib/auth-context";

type SocialProvider = "google" | "apple";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signInWithGoogle, signInWithApple } = useAuth();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "로그인에 실패했어요. 다시 시도해주세요." : null,
  );
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  if (user) return null;

  async function handleLogin(provider: SocialProvider) {
    setLoadingProvider(provider);
    setError(null);
    const { error } = await (provider === "google" ? signInWithGoogle() : signInWithApple());
    if (error) {
      setLoadingProvider(null);
      setError(error);
    }
    // On success the browser is redirected to the provider — nothing else to do here.
  }

  return (
    <div className="flex flex-col items-center px-5 py-16 text-center">
      <p className="mb-2 text-[17px] font-bold text-foreground">
        모아요에 로그인하세요
      </p>
      <p className="mb-8 text-[13px] text-muted">간편하게 로그인하고 시작해요</p>

      {error ? <p className="mb-4 text-[13px] text-red-500">{error}</p> : null}

      <SocialLoginButtons
        onGoogle={() => handleLogin("google")}
        onApple={() => handleLogin("apple")}
        loadingProvider={loadingProvider}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div>
      <BackHeader title="로그인" />
      <Suspense fallback={null}>
        <LoginInner />
      </Suspense>
    </div>
  );
}
