"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import BackHeader from "@/components/BackHeader";
import { getArticleById } from "@/lib/mock-news";
import { SECTORS } from "@/lib/sectors";
import { createRecord, findPastRecordWithThought, updateRecord } from "@/lib/storage";
import { useRecord } from "@/lib/use-store";
import { extractDomain, guessTitleFromUrl } from "@/lib/format";
import { track, trackClick } from "@/lib/mixpanel";

function NewRecordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("articleId");
  const editId = searchParams.get("editId");
  const from = searchParams.get("from");
  const article = articleId ? getArticleById(articleId) : undefined;
  const editingRecord = useRecord(editId ?? "");
  const isEdit = Boolean(editingRecord);

  // Not a plain useState: on a hard page load (SSR/hydration), useRecord's
  // getServerSnapshot is always undefined (localStorage isn't available on
  // the server), so isEdit is briefly false during that first render. A
  // useState initial value would lock onto that stale "url" step forever.
  // Deriving it instead keeps it correct once editingRecord/article resolve.
  const [manualStep, setManualStep] = useState<"url" | "form">("url");
  const step: "url" | "form" = isEdit || article ? "form" : manualStep;
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState(article?.title ?? "");
  const [sector, setSector] = useState(article?.sector ?? "");
  const [thought, setThought] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(article?.imageUrl);
  const [error, setError] = useState<string | null>(null);

  // Same hard-reload hydration gap as above: editingRecord can arrive one
  // render late, so the edit fields are (re-)applied here once it resolves,
  // instead of relying on it being present at the useState initializer above.
  const appliedEditRef = useRef(false);
  useEffect(() => {
    if (editingRecord && !appliedEditRef.current) {
      appliedEditRef.current = true;
      setTitle(editingRecord.title);
      setSector(editingRecord.sector);
      setThought(editingRecord.thought ?? "");
      setImageUrl(editingRecord.imageUrl);
    }
  }, [editingRecord]);

  const sourceType = isEdit
    ? editingRecord!.sourceType
    : article
      ? "internal"
      : "external";

  function handleFetchMeta() {
    if (!url.trim()) {
      setError("기사 URL을 입력해주세요");
      return;
    }
    trackClick("write_fetch_meta");
    setTitle(guessTitleFromUrl(url));
    setImageUrl(undefined);
    setError(null);
    setManualStep("form");
  }

  function handleSubmit() {
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    if (!sector) {
      setError("섹터를 선택해주세요");
      return;
    }

    if (isEdit && editingRecord) {
      updateRecord(editingRecord.id, {
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

    const record = createRecord({
      title: title.trim(),
      sector,
      imageUrl,
      sourceType,
      articleId: article?.id,
      url: article ? undefined : url.trim(),
      thought,
    });
    track("record_saved", {
      record_id: record.id,
      sector: record.sector,
      source_type: record.sourceType,
      has_thought: Boolean(record.thought),
    });

    if (record.thought) {
      const past = findPastRecordWithThought(record.sector, record.id);
      if (past) {
        router.replace(`/record/complete/${record.id}`);
        return;
      }
    }
    router.push(`/record/${record.id}?saved=1`);
  }

  if (step === "url") {
    return (
      <div className="px-5 py-6">
        <p className="mb-2 text-[15px] font-bold text-foreground">
          기사 URL을 붙여넣어주세요
        </p>
        <p className="mb-5 text-[13px] text-muted">
          외부 기사 링크를 입력하면 기사 정보를 불러와요
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
          onClick={handleFetchMeta}
          className="mt-5 w-full rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white active:bg-point-dark"
        >
          불러오기
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
      ) : !article && !isEdit ? (
        <p className="mb-4 text-[13px] text-muted">
          {extractDomain(url)}에서 가져온 기사
        </p>
      ) : null}

      <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
        제목 *
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full rounded-xl border border-border-subtle bg-background px-4 py-3 text-[14px] text-foreground outline-none focus:border-point"
      />

      <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
        섹터 *
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {SECTORS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSector(s)}
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${
              sector === s
                ? "bg-point text-white"
                : "bg-background text-foreground/70"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
        내 생각
      </label>
      <textarea
        value={thought}
        onChange={(e) => setThought(e.target.value)}
        placeholder="이 뉴스에 대한 내 생각을 자유롭게 적어보세요 (선택)"
        rows={5}
        className="mb-2 w-full resize-none rounded-xl border border-border-subtle bg-background px-4 py-3 text-[14px] leading-6 text-foreground outline-none focus:border-point"
      />
      {error ? <p className="mb-2 text-[13px] text-red-500">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-3 w-full rounded-xl bg-point py-3.5 text-[15px] font-semibold text-white active:bg-point-dark"
      >
        저장
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
