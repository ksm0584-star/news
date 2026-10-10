"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * First-visit, 2-step spotlight coach mark for the home screen: step 1
 * highlights the first news card, step 2 highlights the bottom nav's
 * center "기록하기" button. Both targets already live on this screen, so
 * the whole guide runs without any navigation between steps.
 *
 * Targets are found via `[data-onboarding-target]` attributes (see
 * LatestNewsList.tsx / BottomNav.tsx) rather than refs, since the two
 * elements live in different parts of the component tree (one inside the
 * page, one in the root layout).
 */
const STORAGE_KEY = "newsnote:onboarding-completed-v1";
const POLL_INTERVAL_MS = 200;

type Step = 1 | 2;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TARGET_SELECTOR: Record<Step, string> = {
  1: "news-card-first",
  2: "write-nav",
};

const STEP_COPY: Record<Step, { text: string; cta: string }> = {
  1: { text: "뉴스를 읽고 기록해 보세요!", cta: "다음" },
  2: { text: "URL을 직접 가져와 기록해 보세요!", cta: "시작하기" },
};

function readTargetRect(step: Step): TargetRect | null {
  const el = document.querySelector(`[data-onboarding-target="${TARGET_SELECTOR[step]}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
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

export default function OnboardingGuide() {
  const pathname = usePathname();
  const [step, setStep] = useState<Step | null>(null);
  const [rect, setRect] = useState<TargetRect | null>(null);

  const finish = useCallback(() => {
    markOnboardingCompleted();
    setStep(null);
    setRect(null);
  }, []);

  // Both targets only exist on the home screen. Wait for the first news
  // card to actually render — not while the list is still loading — then
  // start step 1.
  useEffect(() => {
    if (pathname !== "/" || hasCompletedOnboarding()) return;

    const interval = window.setInterval(() => {
      const found = readTargetRect(1);
      if (found) {
        window.clearInterval(interval);
        setStep(1);
        setRect(found);
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [pathname]);

  // Keep the spotlight pinned to its target's real position across resizes
  // and scrolling, for as long as a step is active.
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

  // Leaving the home screen mid-guide (shouldn't normally happen, since
  // neither step offers a way to navigate away) hides the overlay
  // defensively rather than leaving it stuck over the wrong screen.
  if (!step || !rect || pathname !== "/") return null;

  const copy = STEP_COPY[step];

  function handlePrimary() {
    if (step === 1) {
      const next = readTargetRect(2);
      setStep(2);
      setRect(next);
    } else {
      finish();
    }
  }

  const margin = 16;
  const gap = 14;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tooltipWidth = Math.min(260, vw - margin * 2);
  let tooltipLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
  tooltipLeft = Math.min(Math.max(tooltipLeft, margin), vw - tooltipWidth - margin);
  const placeBelow = rect.top < vh / 2;
  let arrowLeft = rect.left + rect.width / 2 - tooltipLeft;
  arrowLeft = Math.min(Math.max(arrowLeft, 20), tooltipWidth - 20);

  const padding = 8;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="앱 사용 가이드"
    >
      {/* Blocks every tap/click on the screen behind the guide. */}
      <div className="absolute inset-0" />

      {/* Spotlight: a transparent "hole" the size of the target, darkened
          everywhere else via a huge box-shadow spread — the standard
          CSS spotlight trick. */}
      <div
        className="absolute rounded-2xl transition-[top,left,width,height] duration-200"
        style={{
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          boxShadow: "0 0 0 2000px rgba(0,0,0,0.65)",
          pointerEvents: "none",
        }}
      />

      {/* Pointer, aimed from the tooltip toward the highlighted element. */}
      <div
        className="absolute h-3 w-3 rotate-45 bg-surface"
        style={{
          left: tooltipLeft + arrowLeft - 6,
          ...(placeBelow
            ? { top: rect.top + rect.height + gap - 6 }
            : { top: rect.top - gap - 6 }),
        }}
      />

      <div
        className="absolute rounded-2xl bg-surface p-4 text-center shadow-lg"
        style={{
          width: tooltipWidth,
          left: tooltipLeft,
          ...(placeBelow
            ? { top: rect.top + rect.height + gap }
            : { bottom: vh - rect.top + gap }),
        }}
      >
        <p className="text-[14px] font-semibold leading-snug text-foreground">{copy.text}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={finish} className="text-[12.5px] font-medium text-muted">
            건너뛰기
          </button>
          <button
            type="button"
            onClick={handlePrimary}
            className="rounded-full bg-point px-4 py-2 text-[13px] font-semibold text-white active:bg-point-dark"
          >
            {copy.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
