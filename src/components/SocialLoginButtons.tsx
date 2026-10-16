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

// Apple's Human Interface Guidelines require the official glyph on a
// black "Sign in with Apple" button — this is that glyph (Simple Icons'
// CC0 "Apple" path, the same outline Apple's own button assets use),
// rendered in `currentColor` so it follows the button's `text-white`.
function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.717-1.48 3.73-2.94 1.098-1.618 1.558-3.197 1.575-3.286-.034-.013-3.023-1.192-3.057-4.745-.03-2.956 2.33-4.33 2.44-4.405-1.398-2.054-3.554-2.285-4.33-2.333-1.586-.098-2.793.968-3.643.968zm3.24-4.906c.82-.996 1.374-2.38 1.224-3.76-1.182.047-2.612.787-3.46 1.783-.76.895-1.38 2.312-1.207 3.645 1.297.1 2.617-.656 3.443-1.668z" />
    </svg>
  );
}

type SocialProvider = "google" | "apple";

interface SocialLoginButtonsProps {
  onGoogle: () => void;
  onApple: () => void;
  /** Which provider's sign-in is currently in flight, if any — disables both buttons and swaps that one's label. */
  loadingProvider: SocialProvider | null;
  className?: string;
}

/**
 * Google + Apple sign-in buttons, reused by /login and /mypage so both
 * screens stay in sync. Both follow the existing `button-48 type-button`
 * text-button rules (DESIGN.md → Components → Button); only
 * background/text color differ per provider, same as the other variants
 * in that table.
 */
export function SocialLoginButtons({
  onGoogle,
  onApple,
  loadingProvider,
  className,
}: SocialLoginButtonsProps) {
  const disabled = loadingProvider !== null;

  return (
    <div className={`flex w-full flex-col gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={onGoogle}
        disabled={disabled}
        className="button-48 w-full gap-2 rounded-xl border border-border-subtle bg-surface type-button text-foreground disabled:opacity-60"
      >
        <GoogleIcon />
        {loadingProvider === "google" ? "이동 중..." : "Google로 계속하기"}
      </button>
      <button
        type="button"
        onClick={onApple}
        disabled={disabled}
        className="button-48 w-full gap-2 rounded-xl bg-black type-button text-white disabled:opacity-60"
      >
        <AppleIcon />
        {loadingProvider === "apple" ? "이동 중..." : "Apple로 계속하기"}
      </button>
    </div>
  );
}
