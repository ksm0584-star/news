"use client";

import Link from "next/link";

export default function LoginRequiredModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8">
      <div className="w-full max-w-[320px] rounded-2xl bg-surface p-5">
        <p className="text-[15px] font-bold text-foreground">로그인이 필요해요</p>
        <p className="mt-1.5 text-[13px] text-muted">
          기사를 스크랩하려면 먼저 로그인해주세요
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border-subtle py-2.5 text-[13.5px] font-medium text-foreground/70"
          >
            취소
          </button>
          <Link
            href="/login"
            className="flex-1 rounded-xl bg-point py-2.5 text-center text-[13.5px] font-semibold text-white"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
