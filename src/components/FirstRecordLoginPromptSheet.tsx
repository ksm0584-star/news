"use client";

import { useEffect } from "react";
import Link from "next/link";
import { markLoginPromptSeen } from "@/lib/login-prompt";
import { trackClick, track } from "@/lib/mixpanel";

/**
 * Shown at most once per browser, right after a logged-out user's first
 * ever successful local record save — never for a logged-in user, a
 * second-or-later save, or an edit. The caller decides *whether* to mount
 * this (see record/[id]/page.tsx and record/complete/[id]/page.tsx, both
 * reached right after a save); this component itself marks the prompt as
 * seen on mount, so showing it — regardless of which button is then
 * pressed, or neither — is what permanently retires it.
 */
export default function FirstRecordLoginPromptSheet({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    markLoginPromptSeen();
    track("login_prompt_shown", { source: "first_record_save" });
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="로그인 안내">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-3xl bg-surface p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
        <p className="text-[17px] font-bold text-foreground">첫 기록을 남겼어요! 🎉</p>
        <p className="mt-2 whitespace-pre-line text-[14px] leading-6 text-foreground/80">
          {"지금은 이 브라우저에만 기록이 저장돼요.\n로그인하면 다른 기기에서도 기록을 확인할 수 있어요."}
        </p>
        <p className="mt-2 text-[12.5px] text-muted">
          브라우저 데이터를 삭제하면 기록이 사라질 수 있어요.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href="/login"
            onClick={() => {
              trackClick("login_prompt_login", { source: "first_record_save" });
              onClose();
            }}
            className="block w-full rounded-xl bg-point py-3.5 text-center text-[15px] font-semibold text-white active:bg-point-dark"
          >
            로그인하고 기록 보관하기
          </Link>
          <button
            type="button"
            onClick={() => {
              trackClick("login_prompt_dismiss", { source: "first_record_save" });
              onClose();
            }}
            className="w-full rounded-xl py-3 text-center text-[13.5px] font-medium text-muted"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
