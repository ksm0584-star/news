"use client";

import { useRouter } from "next/navigation";

export default function BackHeader({
  title,
  right,
  onBack,
}: {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border-subtle bg-surface/95 px-3 backdrop-blur">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        aria-label="뒤로가기"
        className="flex h-9 w-9 items-center justify-center rounded-full text-foreground active:bg-background"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="flex-1 truncate text-[16px] font-bold text-foreground">
        {title}
      </h1>
      {right}
    </header>
  );
}
