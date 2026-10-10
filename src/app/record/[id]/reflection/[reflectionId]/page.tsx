"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import LoginPrompt from "@/components/LoginPrompt";
import SectorBadge from "@/components/SectorBadge";
import { updateReflection } from "@/lib/records";
import { useRecord, useReflectionsForRecord } from "@/lib/use-records-store";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/format";
import { track, trackClick } from "@/lib/mixpanel";
import type { ReflectionResult } from "@/lib/types";

const OPTIONS: { value: ReflectionResult; label: string }[] = [
  { value: "same", label: "생각이 같아요" },
  { value: "changed", label: "생각이 달라졌어요" },
  { value: "unsure", label: "아직 모르겠어요" },
  { value: "hard_to_compare", label: "비교하기 어려워요" },
];

/**
 * Edits one existing reflection by its own id (via updateReflection) — never
 * creates a new row. Selecting an option only updates local UI state;
 * nothing is written until "저장" is pressed, so cancelling or navigating
 * back leaves the stored judgment untouched.
 */
export default function ReflectionEditPage() {
  const params = useParams<{ id: string; reflectionId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { record, loading: recordLoading } = useRecord(params.id);
  const { reflections, loading: reflectionsLoading } = useReflectionsForRecord(params.id);

  const reflection = reflections.find((r) => r.id === params.reflectionId);
  const otherId = reflection
    ? reflection.recordId === params.id
      ? reflection.comparedRecordId
      : reflection.recordId
    : "";
  const { record: otherRecord, loading: otherLoading } = useRecord(otherId);

  const [selected, setSelected] = useState<ReflectionResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function goBack() {
    router.replace(`/record/${params.id}`);
  }

  if (authLoading || (user && (recordLoading || reflectionsLoading))) return null;

  if (!user) {
    return (
      <div>
        <BackHeader title="회고 수정" onBack={goBack} />
        <LoginPrompt />
      </div>
    );
  }

  if (!record || !reflection) {
    return (
      <div>
        <BackHeader title="회고 수정" onBack={goBack} />
        <div className="px-5 py-10 text-center text-sm text-muted">
          회고를 찾을 수 없어요.
        </div>
      </div>
    );
  }

  if (otherLoading) return null;

  if (!otherRecord) {
    return (
      <div>
        <BackHeader title="회고 수정" onBack={goBack} />
        <div className="px-5 py-10 text-center text-sm text-muted">
          비교 대상 기록을 찾을 수 없어요.
        </div>
      </div>
    );
  }

  const currentSelection = selected ?? reflection.result;
  const [pastRecord, currentRecord] =
    new Date(record.createdAt) <= new Date(otherRecord.createdAt)
      ? [record, otherRecord]
      : [otherRecord, record];

  async function handleSave() {
    if (saving || currentSelection === reflection!.result) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateReflection(reflection!.id, currentSelection);
      // Moved after the save succeeds — this event's name promises a
      // completed save, unlike the click-intent "complete_reflection_selected"
      // event on the initial-reflection screen, so it shouldn't fire for a
      // save that then fails.
      trackClick("reflection_edit_save", {
        reflection_id: reflection!.id,
        result: currentSelection,
      });
      track("reflection_saved", {
        record_id: params.id,
        compared_record_id: otherId,
        reflection_id: reflection!.id,
        result: currentSelection,
        entry_point: "edit",
      });
      goBack();
    } catch (err) {
      console.error("updateReflection failed:", err);
      setSaving(false);
      setSaveError("저장에 실패했어요. 다시 시도해주세요.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <BackHeader title="회고 수정" onBack={goBack} />

      <div className="flex-1 px-5 py-5">
        <div className="rounded-2xl border border-border-subtle p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <SectorBadge sector={pastRecord.sector} />
            <span className="text-xs text-muted">{formatDate(pastRecord.createdAt)}</span>
          </div>
          <p className="mb-1 text-[13px] font-semibold text-foreground">{pastRecord.title}</p>
          <p className="text-[13.5px] leading-6 text-foreground/80">{pastRecord.thought}</p>
        </div>

        <div className="my-3 flex items-center gap-2 px-1 text-muted">
          <span className="h-px flex-1 bg-border-subtle" />
          <span className="text-[12px]">지금의 생각</span>
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        <div className="rounded-2xl border border-point/30 bg-point/5 p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <SectorBadge sector={currentRecord.sector} />
            <span className="text-xs text-muted">{formatDate(currentRecord.createdAt)}</span>
          </div>
          <p className="mb-1 text-[13px] font-semibold text-foreground">{currentRecord.title}</p>
          <p className="text-[13.5px] leading-6 text-foreground/80">{currentRecord.thought}</p>
        </div>

        <p className="mt-6 mb-3 text-center text-[13.5px] font-medium text-foreground">
          두 생각을 비교해보니 어떤가요?
        </p>
        <div className="flex flex-col gap-2">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              disabled={saving}
              className={`rounded-xl border py-3 text-[14px] font-semibold disabled:opacity-60 ${
                currentSelection === option.value
                  ? "border-point bg-point text-white"
                  : "border-border-subtle text-foreground/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {saveError ? (
          <p className="mt-2 text-center text-[12.5px] text-red-500">{saveError}</p>
        ) : null}
      </div>

      <div className="px-5 py-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={saving}
            className="flex-1 rounded-xl border border-border-subtle py-3.5 text-[14px] font-medium text-foreground/70 disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || currentSelection === reflection.result}
            className="flex-1 rounded-xl bg-point py-3.5 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
