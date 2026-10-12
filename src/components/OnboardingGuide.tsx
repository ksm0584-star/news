"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * First-visit, 3-step spotlight coach mark for the home screen: step 1
 * highlights the first news card, step 2 highlights the floating
 * "기록하기" button (RecordFab), step 3 highlights the bottom nav's "내
 * 기록" tab. All three targets already live on this screen (RecordFab and
 * the bottom nav are both fixed, rendered from the root layout), so the
 * whole guide runs without any navigation between steps.
 *
 * Deliberately no speech-bubble/tooltip box: a dark overlay with a
 * transparent "hole" over the target, a Primary-colored title + white
 * description floating directly on the overlay, and an SVG arrow between
 * the text and the target — see DESIGN.md note below.
 *
 * Targets are found via `[data-onboarding-target]` attributes (see
 * LatestNewsList.tsx / RecordFab.tsx / BottomNav.tsx) rather than refs,
 * since they live in different parts of the component tree (one inside
 * the page, two in the root layout).
 *
 * No DESIGN.md exists in this repo (checked) — "Primary 컬러" is this
 * app's one accent color, already used everywhere else as `text-point` /
 * `bg-point` (see globals.css's `--point` token), so the step title uses
 * that same token.
 */
const STORAGE_KEY = "moayo:onboarding-completed-v2";
const POLL_INTERVAL_MS = 200;

type Step = 1 | 2 | 3;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TARGET_SELECTOR: Record<Step, string> = {
  1: "news-card-first",
  2: "write-nav",
  3: "records-nav",
};

const STEP_COPY: Record<Step, { title: string; description: string; cta: string }> = {
  1: {
    title: "관심 있는 뉴스를 발견해요",
    description: "뉴스를 읽고 나만의 생각을 기록해 보세요.",
    cta: "다음",
  },
  2: {
    title: "외부 뉴스도 기록할 수 있어요",
    description: "다른 곳에서 발견한 뉴스 링크를 첨부해 기록해 보세요.",
    cta: "다음",
  },
  3: {
    title: "기록을 모아 다시 돌아봐요",
    description: "과거의 생각을 확인하고 달라진 관점을 발견해 보세요.",
    cta: "시작하기",
  },
};

function queryTarget(step: Step): HTMLElement | null {
  return document.querySelector(`[data-onboarding-target="${TARGET_SELECTOR[step]}"]`);
}

/** A rect this small/off-screen means "not actually visible yet" — never worth spotlighting. */
function isRectVisible(rect: TargetRect): boolean {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.top < window.innerHeight &&
    rect.top + rect.height > 0 &&
    rect.left < window.innerWidth &&
    rect.left + rect.width > 0
  );
}

function readTargetRect(step: Step): TargetRect | null {
  const el = queryTarget(step);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const found: TargetRect = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
  return isRectVisible(found) ? found : null;
}

function hasCompletedOnboarding(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markOnboardingCompleted(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private browsing / storage disabled — the guide just won't persist
    // "completed" across visits for this user, which is a safe fallback.
  }
}

/**
 * Clears the "seen it" flag so the guide auto-starts again on the next
 * visit to "/" — used by mypage's "가이드 다시보기" entry point instead of a
 * dedicated query-param trigger, so this component needs no
 * useSearchParams (and no Suspense boundary) of its own.
 */
export function resetOnboardingGuide(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best-effort — worst case the manual replay doesn't auto-start.
  }
}

function Arrow({ direction }: { direction: "up" | "down" }) {
  return (
    <svg width="26" height="34" viewBox="0 0 26 34" fill="none" aria-hidden="true">
      {direction === "up" ? (
        <path
          d="M13 34V9M13 9L4 18M13 9l9 9"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M13 0v25M13 25l-9-9M13 25l9-9"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function OnboardingGuide() {
  const pathname = usePathname();
  const [step, setStep] = useState<Step | null>(null);
  const [rect, setRect] = useState<TargetRect | null>(null);

  const finish = useCallback(() => {
    markOnboardingCompleted();
    setStep(null);
    setRect(null);
  }, []);

  // Scrolls the target into view (a no-op for the bottom nav's fixed
  // targets, meaningful for the in-flow first news card if the page was
  // already scrolled — e.g. a manual replay from mypage) and only then
  // measures it, one frame later so the scroll has actually applied.
  const activateStep = useCallback((target: Step) => {
    const el = queryTarget(target);
    el?.scrollIntoView({ block: "center", inline: "nearest" });
    requestAnimationFrame(() => {
      setStep(target);
      setRect(readTargetRect(target));
    });
  }, []);

  // All three targets only exist on the home screen. Wait for the first
  // news card to actually render — not while the list is still loading —
  // then start step 1.
  useEffect(() => {
    if (pathname !== "/" || hasCompletedOnboarding()) return;

    const interval = window.setInterval(() => {
      if (readTargetRect(1)) {
        window.clearInterval(interval);
        activateStep(1);
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [pathname, activateStep]);

  // Keeps the spotlight pinned to its target's real position across
  // resizes (incl. orientation change). If the target becomes
  // momentarily unmeasurable or scrolls/resizes off-screen, this hides
  // the spotlight (rect -> null) rather than ever drawing it at a stale
  // or wrong position, and the poll below recovers it once it's back.
  useEffect(() => {
    if (!step) return;
    const activeStep = step;

    function reposition() {
      setRect(readTargetRect(activeStep));
    }
    reposition();

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [step]);

  // Recovery poll: only runs while a step is active but its target isn't
  // currently measurable (e.g. briefly off-screen) — re-checks until it
  // reappears instead of leaving the guide permanently hidden.
  useEffect(() => {
    if (!step || rect) return;
    const activeStep = step;
    const interval = window.setInterval(() => {
      const found = readTargetRect(activeStep);
      if (found) {
        window.clearInterval(interval);
        setRect(found);
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [step, rect]);

  // Leaving the home screen mid-guide (shouldn't normally happen, since no
  // step offers a way to navigate away) hides the overlay defensively
  // rather than leaving it stuck over the wrong screen.
  if (!step || !rect || pathname !== "/") return null;

  const activeStep = step;
  const copy = STEP_COPY[activeStep];

  function handlePrimary() {
    if (activeStep === 3) {
      finish();
    } else {
      activateStep((activeStep + 1) as Step);
    }
  }

  const margin = 16;
  const spotlightPadding = 8;
  const arrowGap = 4; // between the spotlight's edge and the arrow
  const arrowHeight = 34;
  const textGap = 6; // between the arrow and the text block
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const blockWidth = Math.min(300, vw - margin * 2);
  let blockLeft = rect.left + rect.width / 2 - blockWidth / 2;
  blockLeft = Math.min(Math.max(blockLeft, margin), vw - blockWidth - margin);

  // The arrow tracks the target's real horizontal center, clamped to stay
  // visually attached to the text block even when the block itself got
  // clamped away from center (target near a screen edge) — so it never
  // drifts off pointing at empty space.
  const arrowMargin = 24;
  let arrowCenterX = rect.left + rect.width / 2 - blockLeft;
  arrowCenterX = Math.min(Math.max(arrowCenterX, arrowMargin), blockWidth - arrowMargin);

  const placeBelow = rect.top < vh / 2;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="앱 사용 가이드"
    >
      {/* Blocks every tap/click (and scroll gesture) behind the guide. */}
      <div className="absolute inset-0" />

      {/* Spotlight: a transparent "hole" the size of the target, darkened
          everywhere else via a huge box-shadow spread — the standard CSS
          spotlight trick. */}
      <div
        className="absolute rounded-2xl transition-[top,left,width,height] duration-200"
        style={{
          top: rect.top - spotlightPadding,
          left: rect.left - spotlightPadding,
          width: rect.width + spotlightPadding * 2,
          height: rect.height + spotlightPadding * 2,
          boxShadow: "0 0 0 2000px rgba(0,0,0,0.72)",
          pointerEvents: "none",
        }}
      />

      {/* Arrow, pointing from the text block toward the highlighted element. */}
      <div
        className="absolute"
        style={{
          left: blockLeft + arrowCenterX - 13,
          ...(placeBelow
            ? { top: rect.top + rect.height + spotlightPadding + arrowGap }
            : { top: rect.top - spotlightPadding - arrowGap - arrowHeight }),
        }}
      >
        <Arrow direction={placeBelow ? "up" : "down"} />
      </div>

      <div
        className="absolute text-center"
        style={{
          width: blockWidth,
          left: blockLeft,
          ...(placeBelow
            ? { top: rect.top + rect.height + spotlightPadding + arrowGap + arrowHeight + textGap }
            : { bottom: vh - rect.top + spotlightPadding + arrowGap + arrowHeight + textGap }),
        }}
      >
        <p className="text-[18px] font-bold leading-snug text-point">{copy.title}</p>
        <p className="mt-2 text-[14px] leading-6 text-white">{copy.description}</p>

        <div className="mt-6 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={finish}
            className="text-[13px] font-medium text-white/70"
          >
            건너뛰기
          </button>
          <button
            type="button"
            onClick={handlePrimary}
            className="rounded-full bg-point px-5 py-2.5 text-[13.5px] font-semibold text-white active:bg-point-dark"
          >
            {copy.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
