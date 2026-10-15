import Link from "next/link";

export default function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
      <p className="text-[15px] font-bold text-foreground">로그인이 필요해요</p>
      <p className="text-[13px] text-muted">
        로그인하면 내가 저장한 기록을 보고 관리할 수 있어요
      </p>
      <Link
        href="/login"
        className="button-48 mt-2 rounded-xl bg-point px-5 type-button text-white"
      >
        로그인하기
      </Link>
    </div>
  );
}
