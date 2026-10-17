"use client";

import Link from "next/link";

/**
 * Per-article "기록하기" action on a home news card (Figma node 109:1347,
 * frame "개편안 2") — distinct from ArticleReturnBanner's "기록하기" (only
 * shown after returning from reading): this one sends THIS card's article
 * straight into the existing external-record flow in one tap, without
 * first opening the original article. (The floating FAB that used to be a
 * global entry to a blank /record/new, `RecordFab`, has since been removed
 * entirely.)
 *
 * Visual spec: filled pill, no icon (replaces 개편안 1's pencil-icon +
 * inline-link design entirely) — `bg-record-action-background` (#EFF6FF,
 * Colors → 기록 액션 배경), `text-point`, `rounded-lg` (8px), `px-3 py-2`
 * (12px/8px), label in `type-record-action` (12px Bold — both in
 * globals.css). No border/shadow. Figma's visual size is 69×30px; the
 * actual rendered pill is close but not pixel-identical (~34px tall) —
 * see `type-record-action`'s own comment for why, and the Components →
 * 기록하기 액션 doc for the full comparison.
 *
 * Distinct from `button-48`/`type-button` (the 48px/16px rule for CTA
 * buttons, DESIGN.md → Components → Button) — this is its own
 * news-card-only action, not a general-purpose button variant.
 *
 * Rendered as a sibling of the card's own stretched open/record-prefill
 * link (not nested inside it — nesting two interactive elements breaks
 * keyboard/screen-reader navigation), with `relative` so it paints above
 * that link and intercepts its own taps independently. The `before:`
 * pseudo-element extends the real touch target ~8px on every side without
 * taking up any layout space of its own (this pill's own box is only
 * ~69×34px, short of Apple's 44×44pt touch-target guidance on its own).
 */
export default function RecordCardAction({
  href,
  onClick,
}: {
  href: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative shrink-0 whitespace-nowrap rounded-lg bg-record-action-background px-3 py-2 type-record-action text-point before:absolute before:-inset-2 before:content-['']"
    >
      기록하기
    </Link>
  );
}
