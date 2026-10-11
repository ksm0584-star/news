"use client";

import { useEffect, useState } from "react";
import { markRatingPromptSeen } from "@/lib/rating-prompt";
import { track, trackClick } from "@/lib/mixpanel";

const MAX_COMMENT_LENGTH = 500;

type SubmitState = "idle" | "submitting" | "success" | "error";

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      className={filled ? "text-point" : "text-border-subtle"}
      aria-hidden="true"
    >
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.8 4.6 1.2 6.6L12 17.6l-5.9 3 1.2-6.6-4.8-4.6 6.6-.8L12 2.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Reused for both entry points — the auto popup (right after a user's 2nd
 * successful new record save, see record/new/page.tsx and
 * record/new/external/page.tsx) and mypage's always-available "서비스
 * 평가하기" row. `autoTriggered` only controls whether *showing* this
 * marks the one-time auto-prompt flag seen (mypage's manual open must
 * never affect that flag just by being opened) — an actual successful
 * submit always marks it seen, from either entry point, since there's no
 * reason to auto-nag someone who already gave feedback.
 */
export default function RatingPromptSheet({
  autoTriggered,
  onClose,
}: {
  autoTriggered: boolean;
  onClose: () => void;
}) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<SubmitState>("idle");

  useEffect(() => {
    if (autoTriggered) markRatingPromptSeen();
    track("rating_prompt_shown", { source: autoTriggered ? "auto_second_save" : "mypage" });
    // Fire once per mount only — autoTriggered is fixed for the lifetime of a given sheet instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state !== "success") return;
    const timeout = setTimeout(onClose, 1500);
    return () => clearTimeout(timeout);
  }, [state, onClose]);

  function handleDismiss() {
    if (state === "submitting") return;
    trackClick("rating_prompt_dismiss", { source: autoTriggered ? "auto_second_save" : "mypage" });
    onClose();
  }

  async function handleSubmit() {
    if (rating === null || state === "submitting") return;
    setState("submitting");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      if (!res.ok) throw new Error(`feedback submit failed: ${res.status}`);
      markRatingPromptSeen();
      track("rating_prompt_submitted", {
        rating,
        has_comment: Boolean(comment.trim()),
        source: autoTriggered ? "auto_second_save" : "mypage",
      });
      setState("success");
    } catch (err) {
      console.error("RatingPromptSheet: submit failed", err);
      setState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="서비스 평가">
      <div className="absolute inset-0 bg-black/40" onClick={handleDismiss} />

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] rounded-t-3xl bg-surface p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
        {state === "success" ? (
          <div className="py-6 text-center">
            <p className="text-[16px] font-bold text-foreground">소중한 의견 감사해요!</p>
            <p className="mt-1.5 text-[13px] text-muted">
              더 나은 모아요를 만드는 데 큰 도움이 될 거예요.
            </p>
          </div>
        ) : (
          <>
            <p className="text-[17px] font-bold text-foreground">모아요는 어떠셨나요?</p>
            <p className="mt-1.5 text-[13px] text-muted">
              더 나은 기록 경험을 위해 의견을 들려주세요.
            </p>

            <div className="mt-4 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n}점`}
                  aria-pressed={rating !== null && n <= rating}
                  className="p-0.5"
                >
                  <StarIcon filled={rating !== null && n <= rating} />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
              maxLength={MAX_COMMENT_LENGTH}
              placeholder="좋았던 점이나 아쉬운 점을 자유롭게 남겨주세요."
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border border-border-subtle bg-background px-3.5 py-3 text-[13.5px] text-foreground outline-none focus:border-point"
            />
            <p className="mt-1 text-right text-[11.5px] text-muted">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </p>

            {state === "error" ? (
              <p className="mt-1 text-[12.5px] text-red-500">
                제출에 실패했어요. 다시 시도해주세요.
              </p>
            ) : null}

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={rating === null || state === "submitting"}
                className="w-full rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white disabled:opacity-60 active:bg-point-dark"
              >
                {state === "submitting" ? "보내는 중..." : "의견 보내기"}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                disabled={state === "submitting"}
                className="w-full rounded-xl py-3 text-center text-[13.5px] font-medium text-muted disabled:opacity-60"
              >
                다음에 할게요
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
