"use client";

import { useState } from "react";

/**
 * /webview-test — technical validation page only, not part of the product.
 *
 * Purpose right now: find out whether a plain <iframe> can show an external
 * news article at all in a normal web app. No Native WebView/Capacitor path
 * here — that's a separate concern, tested elsewhere. No success/failure
 * judgment in code either: the iframe just gets the URL verbatim, and
 * whether it actually shows the article is for you to look at (and to check
 * DevTools Console for X-Frame-Options / CSP frame-ancestors / "Refused to
 * frame" errors).
 *
 * Does not touch any existing route, component, or shared state.
 */

const SAMPLE_OUTLETS = [
  { label: "네이버 뉴스", url: "https://news.naver.com" },
  { label: "한국경제", url: "https://www.hankyung.com" },
  { label: "매일경제", url: "https://www.mk.co.kr" },
  { label: "연합뉴스", url: "https://www.yna.co.kr" },
  { label: "조선비즈", url: "https://biz.chosun.com" },
  { label: "서울경제", url: "https://www.sedaily.com" },
] as const;

export default function WebviewTestPage() {
  const [url, setUrl] = useState("");
  const [iframeSrc, setIframeSrc] = useState("");

  function handleLoad() {
    setIframeSrc(url.trim());
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b border-border-subtle px-4 py-3">
        <h1 className="text-[15px] font-bold text-foreground">
          /webview-test — 웹 iframe 임베드 검증
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          입력한 URL을 그대로 iframe의 src에 넣습니다. 차단을 예상해 대체 화면을 보여주거나 새 탭으로
          돌리지 않으니, 아래 iframe에 기사가 실제로 보이는지 직접 확인하세요.
        </p>
        <p className="mt-1 text-[12px] text-muted">
          개발자도구 Console도 함께 열어 <code>X-Frame-Options</code>,{" "}
          <code>Content-Security-Policy: frame-ancestors</code>,{" "}
          <code>Refused to frame/display</code> 같은 오류가 찍히는지 확인해주세요.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-border-subtle px-4 py-3">
        {SAMPLE_OUTLETS.map((outlet) => (
          <button
            key={outlet.label}
            type="button"
            onClick={() => {
              setUrl(outlet.url);
              setIframeSrc(outlet.url);
            }}
            className="rounded-full bg-background px-3 py-1.5 text-[12px] font-medium text-foreground/70 active:bg-point/10"
          >
            {outlet.label}
          </button>
        ))}
      </div>
      <p className="px-4 pt-2 text-[11px] text-muted">
        버튼은 각 언론사 홈페이지 주소입니다 (특정 기사 URL이 아닙니다 — 실제 기사 주소를 테스트하려면
        아래에 직접 입력해주세요).
      </p>

      <div className="flex gap-2 border-b border-border-subtle px-4 py-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://news.example.com/article/123"
          className="min-w-0 flex-1 rounded-lg border border-border-subtle bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-point"
        />
        <button
          type="button"
          onClick={handleLoad}
          className="shrink-0 rounded-lg bg-point px-3 py-2 text-[13px] font-semibold text-white active:bg-point-dark"
        >
          불러오기
        </button>
      </div>

      <div className="border-b border-border-subtle px-4 py-2">
        <p className="text-[11px] text-muted">현재 iframe src</p>
        <p className="break-all text-[12px] text-foreground">{iframeSrc || "(없음)"}</p>
      </div>

      <div className="flex-1">
        {iframeSrc ? (
          <iframe src={iframeSrc} title="webview-test-article" className="h-full min-h-[70dvh] w-full border-0" />
        ) : (
          <div className="flex h-full min-h-[70dvh] items-center justify-center px-6 text-center text-[13px] text-muted">
            기사 URL을 입력하거나 위 언론사 버튼을 눌러주세요
          </div>
        )}
      </div>
    </div>
  );
}
