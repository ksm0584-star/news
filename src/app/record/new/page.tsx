"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import BackHeader from "@/components/BackHeader";
import LoginPrompt from "@/components/LoginPrompt";
import { getArticleById } from "@/lib/mock-news";
import { resolveCategoryForSector, type NewsCategory } from "@/lib/news-categories";
import { createRecord, findPastRecordWithThought, updateRecord } from "@/lib/records";
import { useRecord } from "@/lib/use-records-store";
import { useAuth } from "@/lib/auth-context";
import { track, trackClick } from "@/lib/mixpanel";
import { isMemoValid, MEMO_REQUIRED_ERROR } from "@/lib/validate-memo";
import RecordFormFields from "@/components/RecordFormFields";

function NewRecordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("articleId");
  const editId = searchParams.get("editId");
  const from = searchParams.get("from");
  const article = articleId ? getArticleById(articleId) : undefined;
  const { user, loading: authLoading } = useAuth();
  const { record: editingRecord, loading: editingRecordLoading } = useRecord(editId ?? "");
  const isEditMode = Boolean(editId);

  const step: "url" | "form" = isEditMode || article ? "form" : "url";
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState(article?.title ?? "");
  const [sector, setSector] = useState<NewsCategory | "">(
    article ? resolveCategoryForSector(article.sector) ?? "" : "",
  );
  const [thought, setThought] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(article?.imageUrl);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // True when an edited record's legacy sector has no new-category mapping,
  // so the chip grid starts unselected and the user must pick one themselves.
  const [sectorNeedsReselect, setSectorNeedsReselect] = useState(false);
  const memoInputRef = useRef<HTMLTextAreaElement>(null);

  // A record saved through the external-article flow has a URL — editing
  // it now reuses that same write screen's UI (iframe/plain-page + shared
  // form) instead of this older plain form, so it's redirected there. Only
  // a URL-less (app-internal/scrap) record still edits here.
  useEffect(() => {
    if (editId && editingRecord && editingRecord.url) {
      const query = new URLSearchParams({ editId });
      if (from) query.set("from", from);
      router.replace(`/record/new/external?${query.toString()}`);
    }
  }, [editId, editingRecord, from, router]);

  // Edit mode fetches the record over the network, so it can arrive a render
  // or two after mount. Apply it to the form exactly once, when it shows up.
  const [editApplied, setEditApplied] = useState(!editId);
  // Seeding local editable fields from an async-loaded record, exactly once;
  // guarded by editApplied so it can't loop or re-run on every render.
  useEffect(() => {
    if (editId && editingRecord && !editingRecord.url && !editApplied) {
      const resolvedSector = resolveCategoryForSector(editingRecord.sector);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(editingRecord.title);
      setSector(resolvedSector ?? "");
      setSectorNeedsReselect(!resolvedSector);
      setThought(editingRecord.thought ?? "");
      setImageUrl(editingRecord.imageUrl);
      setEditApplied(true);
    }
  }, [editId, editingRecord, editApplied]);

  const sourceType = isEditMode && editingRecord
    ? editingRecord.sourceType
    : article
      ? "internal"
      : "external";

  function handleContinueToArticle() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("기사 URL을 입력해주세요");
      return;
    }
    trackClick("write_url_next");
    router.push(`/record/new/external?url=${encodeURIComponent(trimmedUrl)}`);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    if (!sector) {
      setError("섹터를 선택해주세요");
      return;
    }
    if (!isMemoValid(thought)) {
      setError(MEMO_REQUIRED_ERROR);
      memoInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode && editingRecord) {
        await updateRecord(editingRecord.id, {
          title: title.trim(),
          sector,
          imageUrl,
          thought,
        });
        track("record_edited", {
          record_id: editingRecord.id,
          sector,
          has_thought: Boolean(thought.trim()),
        });
        const destination =
          from === "complete"
            ? `/record/complete/${editingRecord.id}`
            : `/record/${editingRecord.id}`;
        router.replace(destination);
        return;
      }

      const { record, duplicate } = await createRecord({
        title: title.trim(),
        sector,
        imageUrl,
        sourceType,
        articleId: article?.id,
        url: article ? undefined : url.trim(),
        thought,
      });

      if (duplicate) {
        router.replace(`/record/${record.id}?duplicate=1`);
        return;
      }

      track("record_saved", {
        record_id: record.id,
        sector: record.sector,
        source_type: record.sourceType,
        has_thought: Boolean(record.thought),
      });

      if (record.thought) {
        const past = await findPastRecordWithThought(record.sector, record.id);
        if (past) {
          router.replace(`/record/complete/${record.id}`);
          return;
        }
      }
      router.push(`/record/${record.id}?saved=1`);
    } catch (err) {
      const cause = err instanceof Error ? err.cause : undefined;
      const c = cause as { message?: string; code?: string; details?: string } | undefined;
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Record save failed:", errorMessage, c?.code ?? "", c?.details ?? "");
      setSubmitting(false);
      setError(
        process.env.NODE_ENV === "development"
          ? `저장 실패: ${errorMessage}`
          : "저장에 실패했어요. 다시 시도해주세요.",
      );
    }
  }

  if (authLoading) return null;

  if (!user) {
    return <LoginPrompt />;
  }

  if (isEditMode && (editingRecordLoading || editingRecord?.url || !editApplied)) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted">불러오는 중...</div>
    );
  }

  if (step === "url") {
    return (
      <div className="px-5 py-6">
        <p className="mb-2 text-[15px] font-bold text-foreground">
          기사 URL을 붙여넣어주세요
        </p>
        <p className="mb-5 text-[13px] text-muted">
          외부 기사 링크를 첨부하고 제목과 메모를 직접 적어보세요
        </p>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
          className="w-full rounded-xl border border-border-subtle bg-background px-4 py-3.5 text-[14px] text-foreground outline-none focus:border-point"
        />
        {error ? <p className="mt-2 text-[13px] text-red-500">{error}</p> : null}
        <button
          type="button"
          onClick={handleContinueToArticle}
          className="mt-5 w-full rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white active:bg-point-dark"
        >
          다음
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-6">
      {imageUrl ? (
        <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl bg-background">
          <Image src={imageUrl} alt="" fill sizes="430px" className="object-cover" />
        </div>
      ) : null}

      <RecordFormFields
        ref={memoInputRef}
        title={title}
        onTitleChange={setTitle}
        sector={sector}
        onSectorChange={(category) => {
          setSector(category);
          setSectorNeedsReselect(false);
        }}
        sectorNeedsReselect={sectorNeedsReselect}
        thought={thought}
        onThoughtChange={setThought}
        error={error}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-3 w-full rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white disabled:opacity-60 active:bg-point-dark"
      >
        {submitting ? "저장 중..." : "저장"}
      </button>
    </div>
  );
}

function NewRecordHeader() {
  const searchParams = useSearchParams();
  const isEdit = Boolean(searchParams.get("editId"));
  return <BackHeader title={isEdit ? "기록 수정" : "기록하기"} />;
}

export default function NewRecordPage() {
  return (
    <div>
      <Suspense fallback={<BackHeader title="기록하기" />}>
        <NewRecordHeader />
      </Suspense>
      <Suspense fallback={null}>
        <NewRecordForm />
      </Suspense>
    </div>
  );
}
