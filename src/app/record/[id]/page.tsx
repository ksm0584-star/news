"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import BackHeader from "@/components/BackHeader";
import SectorBadge from "@/components/SectorBadge";
import LoginPrompt from "@/components/LoginPrompt";
import { deleteRecord } from "@/lib/records";
import { useRecord, useRecords, useReflectionsForRecord } from "@/lib/use-records-store";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/format";
import { track, trackClick } from "@/lib/mixpanel";
import type { Reflection } from "@/lib/types";

const RESULT_LABEL: Record<Reflection["result"], string> = {
  same: "생각이 같아요",
  changed: "생각이 달라졌어요",
  unsure: "아직 모르겠어요",
};

function RecordDetailInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicate = searchParams.get("duplicate") === "1";

  const { user, loading: authLoading } = useAuth();
  const { record, loading: recordLoading } = useRecord(params.id);
  const { reflections } = useReflectionsForRecord(params.id);
  const { records: allRecords } = useRecords();
  const recordsById = new Map(allRecords.map((r) => [r.id, r]));

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function goToHome() {
    router.replace("/");
  }

  if (authLoading || (user && recordLoading)) return null;

  if (!user) {
    return (
      <div>
        <BackHeader title="기록" onBack={goToHome} />
        <LoginPrompt />
      </div>
    );
  }

  if (!record) {
    return (
      <div>
        <BackHeader title="기록" onBack={goToHome} />
        <div className="px-5 py-10 text-center text-sm text-muted">
          기록을 찾을 수 없어요.
        </div>
      </div>
    );
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    track("record_deleted", { record_id: record!.id, sector: record!.sector });
    try {
      await deleteRecord(record!.id);
      router.replace("/");
    } catch {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="pb-10">
      <BackHeader title="기록" onBack={goToHome} />
      {duplicate ? (
        <div className="mx-5 mt-3 rounded-xl bg-background px-4 py-2.5 text-center text-[13px] font-medium text-muted">
          이미 스크랩한 기사예요
        </div>
      ) : null}

      <div className="px-5 py-5">
        {record.imageUrl ? (
          <div className="relative mb-4 h-44 w-full overflow-hidden rounded-2xl bg-background">
            <Image
              src={record.imageUrl}
              alt=""
              fill
              sizes="430px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SectorBadge sector={record.sector} />
            <span className="text-xs text-muted">{formatDate(record.createdAt)}</span>
          </div>
          <Link
            href={`/record/new?editId=${record.id}&from=detail`}
            onClick={() => trackClick("detail_edit_cta", { record_id: record.id })}
            className="text-[12.5px] font-medium text-point"
          >
            기록 수정
          </Link>
        </div>
        <h1 className="text-[18px] font-bold leading-snug text-foreground">
          {record.title}
        </h1>
        {record.url ? (
          <Link
            href={`/record/${record.id}/article`}
            className="mt-1 inline-block truncate text-[12.5px] text-point"
          >
            원문 보기
          </Link>
        ) : null}

        <div className="mt-6">
          <h2 className="mb-2 text-[14px] font-bold text-foreground">나의 메모</h2>
          {record.thought ? (
            <p className="whitespace-pre-line rounded-xl bg-background px-4 py-3.5 text-[14px] leading-6 text-foreground/80">
              {record.thought}
            </p>
          ) : (
            <p className="rounded-xl bg-background px-4 py-3.5 text-[13.5px] text-muted">
              아직 작성한 메모가 없어요
            </p>
          )}
        </div>

        {reflections.length > 0 ? (
          <div className="mt-6">
            <h2 className="mb-2 text-[14px] font-bold text-foreground">
              회고 기록
            </h2>
            <div className="flex flex-col gap-2">
              {reflections.map((reflection) => {
                const otherId =
                  reflection.recordId === record.id
                    ? reflection.comparedRecordId
                    : reflection.recordId;
                const other = recordsById.get(otherId);
                return (
                  <div
                    key={reflection.id}
                    className="rounded-xl border border-border-subtle px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-medium text-foreground">
                        {other ? other.title : "삭제된 기록"}
                      </span>
                      <span className="shrink-0 text-[12px] text-muted">
                        {formatDate(reflection.createdAt)}
                      </span>
                    </div>
                    <span className="mt-1 inline-block text-[12.5px] font-semibold text-point">
                      {RESULT_LABEL[reflection.result]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            trackClick("detail_delete_intent", { record_id: record.id });
            setConfirmingDelete(true);
          }}
          className="mt-8 w-full text-center text-[12.5px] font-medium text-red-500"
        >
          기록 삭제
        </button>
      </div>

      {confirmingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8">
          <div className="w-full max-w-[320px] rounded-2xl bg-surface p-5">
            <p className="text-[15px] font-bold text-foreground">기록을 삭제할까요?</p>
            <p className="mt-1.5 text-[13px] text-muted">
              삭제하면 다시 되돌릴 수 없어요
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-border-subtle py-2.5 text-[13.5px] font-medium text-foreground/70 disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function RecordDetailPage() {
  return (
    <Suspense fallback={null}>
      <RecordDetailInner />
    </Suspense>
  );
}
