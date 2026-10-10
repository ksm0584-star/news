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
import { identify, resetIdentity } from "./mixpanel";
import { setOauthNextCookie } from "./oauth-next";

const CONFIG_ERROR = "Supabase가 설정되지 않았어요. 환경변수를 확인해주세요.";

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (next?: string) => Promise<AuthResult>;
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

    // onAuthStateChange fires once immediately (event "INITIAL_SESSION")
    // with the session already in cookies, then again on every later auth
    // change — this is the single source of truth for `user` below. A
    // separate supabase.auth.getUser() call used to run alongside this and
    // raced it: getUser() always makes an extra network round trip to
    // GoTrue to re-validate the token, and whichever of the two resolved
    // last won (both called setUser unconditionally). Right after a brand
    // new sign-up that round trip is slowest, so getUser() would resolve
    // after this listener's correct initial event and overwrite `user`
    // back to null — existing users' sessions aren't new, so that extra
    // call was consistently fast enough to never lose the race.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        identify(session.user.id);
      } else {
        resetIdentity();
      }
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

  async function signInWithGoogle(next?: string): Promise<AuthResult> {
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

    // redirectTo must stay a fixed, query-free URL — it has to match an
    // entry in Supabase's Redirect URL allow-list exactly, and a `?next=`
    // query string attached to it breaks that match (see oauth-next.ts).
    // Where to return to afterwards is carried separately, via a cookie.
    setOauthNextCookie(next);

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
