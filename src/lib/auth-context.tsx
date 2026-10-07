"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";
import { isNativePlatform, NATIVE_AUTH_CALLBACK_URL } from "./platform";

const CONFIG_ERROR = "Supabase가 설정되지 않았어요. 환경변수를 확인해주세요.";

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    supabase.auth.getUser().then(
      ({ data }) => {
        setUser(data.user ?? null);
        setLoading(false);
      },
      (err) => {
        console.error("AuthProvider: failed to fetch user", err);
        setUser(null);
        setLoading(false);
      },
    );

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Native-only: see src/lib/native/google-auth.ts for why this needs the
  // system browser + a deep-link callback instead of a normal redirect, and
  // why the code exchange happens client-side here instead of through the
  // web flow's server-side /auth/callback route (that route never runs
  // natively — a custom URL scheme never reaches the Next.js server).
  // Dynamically imported so @capacitor/app is never loaded on the web.
  useEffect(() => {
    if (!isNativePlatform() || !isSupabaseConfigured()) return;

    let removeListener: (() => void) | undefined;
    let cancelled = false;

    import("./native/google-auth").then(({ listenForNativeAuthCallback }) => {
      if (cancelled) return;
      listenForNativeAuthCallback((code) => {
        const supabase = getSupabaseBrowserClient();
        supabase.auth.exchangeCodeForSession(code).catch((err) => {
          console.error("AuthProvider: native OAuth code exchange failed", err);
        });
      }).then((remove) => {
        if (cancelled) {
          remove();
        } else {
          removeListener = remove;
        }
      });
    });

    return () => {
      cancelled = true;
      removeListener?.();
    };
  }, []);

  async function signInWithGoogle(): Promise<AuthResult> {
    if (!isSupabaseConfigured()) return { error: CONFIG_ERROR };
    const supabase = getSupabaseBrowserClient();

    if (isNativePlatform()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: NATIVE_AUTH_CALLBACK_URL,
          skipBrowserRedirect: true,
        },
      });
      if (error || !data.url) {
        return { error: error?.message ?? "로그인 URL을 가져오지 못했어요." };
      }
      const { openNativeOAuth } = await import("./native/google-auth");
      await openNativeOAuth(data.url);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  }

  async function signOut(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
