"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import SectorBadge from "@/components/SectorBadge";
import { saveReflection } from "@/lib/storage";
import { useRecord, usePastRecordWithThought } from "@/lib/use-store";
import { formatDate } from "@/lib/format";
import { trackClick } from "@/lib/mixpanel";
import type { ReflectionResult } from "@/lib/types";

const OPTIONS: { value: ReflectionResult; label: string }[] = [
  { value: "same", label: "생각이 같아요" },
  { value: "changed", label: "달라졌어요" },
  { value: "unsure", label: "아직 모르겠어요" },
];

export default function CompareRecordPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const record = useRecord(params.id);
  const past = usePastRecordWithThought(record?.sector, record?.id);
  const [selected, setSelected] = useState<ReflectionResult | null>(null);

  function goToHome() {
    router.replace("/");
  }

  if (!record) {
    return (
      <div>
        <BackHeader title="저장 완료" onBack={goToHome} />
        <div className="px-5 py-10 text-center text-sm text-muted">
          기록을 찾을 수 없어요.
        </div>
      </div>
    );
  }

  function goToDetail(exitLabel: string) {
    trackClick(exitLabel, { record_id: record!.id });
    router.push(`/record/${record!.id}`);
  }

  function handleSelect(result: ReflectionResult) {
    if (!past) return;
    trackClick("complete_reflection_selected", { record_id: record!.id, result });
    setSelected(result);
    saveReflection({ recordId: record!.id, comparedRecordId: past.id, result });
  }

  if (!past) {
    return (
      <div className="flex min-h-screen flex-col">
        <BackHeader title="저장 완료" onBack={goToHome} />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 text-center">
          <p className="text-[17px] font-bold text-foreground">저장했어요</p>
          <p className="text-[13.5px] text-muted">
            같은 섹터의 과거 생각이 아직 없어요
          </p>
        </div>
        <div className="px-5 py-5">
          <button
            type="button"
            onClick={() => goToDetail("complete_confirm")}
            className="w-full rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white"
          >
            확인
          </button>
          <Link
            href={`/record/new?editId=${record.id}&from=complete`}
            onClick={() => trackClick("complete_edit_cta", { record_id: record.id })}
            className="mt-3 block text-center text-[12.5px] font-medium text-point"
          >
            내용 수정하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BackHeader title="저장 완료" onBack={goToHome} />

      <div className="px-5 pt-6 pb-4 text-center">
        <p className="text-[17px] font-bold text-foreground">저장했어요</p>
        <p className="mt-1 text-[13.5px] text-muted">
          같은 섹터 &apos;{record.sector}&apos;의 과거 생각과 비교해볼까요?
        </p>
      </div>

      <div className="flex-1 px-5">
        <div className="rounded-2xl border border-border-subtle p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <SectorBadge sector={past.sector} />
            <span className="text-xs text-muted">{formatDate(past.createdAt)}</span>
          </div>
          <p className="mb-1 text-[13px] font-semibold text-foreground">
            {past.title}
          </p>
          <p className="text-[13.5px] leading-6 text-foreground/80">
            {past.thought}
          </p>
        </div>

        <div className="my-3 flex items-center gap-2 px-1 text-muted">
          <span className="h-px flex-1 bg-border-subtle" />
          <span className="text-[12px]">지금의 생각</span>
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        <div className="rounded-2xl border border-point/30 bg-point/5 p-4">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SectorBadge sector={record.sector} />
              <span className="text-xs text-muted">{formatDate(record.createdAt)}</span>
            </div>
            <Link
              href={`/record/new?editId=${record.id}&from=complete`}
              onClick={() => trackClick("complete_edit_cta", { record_id: record.id })}
              className="text-[12.5px] font-medium text-point"
            >
              수정
            </Link>
          </div>
          <p className="mb-1 text-[13px] font-semibold text-foreground">
            {record.title}
          </p>
          <p className="text-[13.5px] leading-6 text-foreground/80">
            {record.thought}
          </p>
        </div>

        <p className="mt-6 mb-3 text-center text-[13.5px] font-medium text-foreground">
          두 생각을 비교해보니 어떤가요?
        </p>
        <div className="flex flex-col gap-2">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`rounded-xl border py-3 text-[14px] font-semibold ${
                selected === option.value
                  ? "border-point bg-point text-white"
                  : "border-border-subtle text-foreground/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        {selected ? (
          <button
            type="button"
            onClick={() => goToDetail("complete_done")}
            className="w-full rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white"
          >
            완료
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goToDetail("complete_skip")}
            className="w-full rounded-xl py-3.5 text-[13.5px] font-medium text-muted"
          >
            나중에 하기
          </button>
        )}
      </div>
    </div>
  );
}
