/** Calls the server-side account-deletion route (see src/app/api/account/delete/route.ts). */
export async function deleteAccount(): Promise<void> {
  const res = await fetch("/api/account/delete", { method: "POST" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "탈퇴 처리 중 오류가 발생했어요.");
  }
}
