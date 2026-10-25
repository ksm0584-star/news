---
version: alpha
name: moayo
description: >-
  모아요(MOAYO)에 현재 구현된 UI에서 추출한 디자인 토큰 문서입니다. 모든 값은
  src/app/globals.css, src/app/layout.tsx, src/components/*.tsx, src/app/**/page.tsx에
  실제로 존재하는 값이며 새로 만든 값은 없습니다. 토큰 이름만 역할 기준으로
  붙였고, 아직 코드에는 연결하지 않았습니다(문서 전용).
source:
  globals: src/app/globals.css
  font: src/app/layout.tsx
  ui-library: none # shadcn/ui 미설치. Tailwind v4 유틸리티를 직접 사용
colors:
  # CSS 변수로 정의된 토큰 (괄호 안은 현재 코드상의 이름)
  background: "#f4f5f7" # --background · 앱 바깥 배경 + 채움 표면(입력창/칩/뱃지)
  foreground: "#19202b" # --foreground
  surface: "#ffffff" # --surface · 앱 컬럼, 헤더, 시트, 다이얼로그
  primary: "#3182f6" # --point
  primary-pressed: "#1b64da" # --point-dark · active 상태 전용
  muted-foreground: "#8b95a1" # --muted · 보조 텍스트 색 (배경색 아님)
  border: "#eef0f3" # --border-subtle
  record-action-background: "#eff6ff" # --record-action-background · Figma colors/record-action-background · 홈 뉴스 카드 "기록하기" 액션 배경(RecordCardAction) 전용
  coachmark-emphasis: "#5198ff" # --coachmark-emphasis · 코치마크(OnboardingGuide) 설명 단계 제목 전용 강조색. primary(#3182f6)와 다른 값이며 --point를 바꾸지 않음
  coachmark-dim: "rgba(0,0,0,0.8)" # --coachmark-dim · 코치마크(OnboardingGuide) 스포트라이트 딤 전용. Dialog/Bottom Sheet의 overlay(black/40%)와 다른 값
  # CSS 변수 없이 Tailwind 기본 클래스로 쓰이는 역할 (미토큰화)
  primary-foreground: "white" # text-white on bg-point
  destructive: "red-500" # Tailwind 기본 red-500 · text-red-500 / bg-red-500
  overlay: "black / 40%" # bg-black/40
typography:
  sans:
    fontFamily: "Noto Sans KR"
    loadedWeights: [400, 500, 600, 700, 900] # semibold는 SemiBold(600) 파일로 그려짐
  # 역할 스타일 — globals.css의 @utility, 크기·굵기만 지정(행간은 요소별 기존 값)
  article-title: { fontSize: 14px, fontWeight: semibold } # type-article-title = --text-sm + --font-weight-semibold
  input: { fontSize: 16px, fontWeight: medium } # type-input = --text-base + --font-weight-medium
  chip: { fontSize: 14px, fontWeight: medium, lineHeight: 21px } # type-chip = Figma type-14-medium (--text-sm + --font-weight-medium + --spacing×5.25)
  record-action: { fontSize: 12px, fontWeight: bold, lineHeight: auto } # type-record-action = Figma type-12-bold. 홈 뉴스 카드 "기록하기" 액션(RecordCardAction). 줄 높이 미지정 → 상속 1.5 = 18px(코드 대응값, Components → 기록하기 액션 참고)
  record-card-title: { fontSize: 16px, fontWeight: medium, lineHeight: 24px, lines: 1 } # type-record-card-title, 한 줄 말줄임 포함
  memo-body: { fontSize: 16px, fontWeight: medium, lineHeight: 24px } # type-memo-body = --text-base + --font-weight-medium + --spacing×6
  page-title: { fontSize: 20px, fontWeight: extrabold } # text-xl
  content-title: { fontSize: 18px, fontWeight: bold, lineHeight: snug }
  sheet-title: { fontSize: 17px, fontWeight: bold }
  header-title: { fontSize: 16px, fontWeight: bold } # type-header-title = Figma MOAYO/header-title (--text-base + --font-weight-bold) · /record/new URL 단계 안내 제목에 연결
  section-title: { fontSize: 14px, fontWeight: bold } # type-section-title = --text-sm + --font-weight-bold · 섹터 라벨에 연결
  button: { fontSize: 16px, fontWeight: semibold, lineHeight: 24px } # type-button = Figma type-16-semibold
  body: { fontSize: 14px, fontWeight: normal, lineHeight: 24px } # leading-6
  body-sm: { fontSize: 13.5px }
  label: { fontSize: 14px, fontWeight: semibold } # 입력창·textarea 라벨. 섹터 라벨은 section-title(14px bold)
  caption: { fontSize: 12.5px }
  meta: { fontSize: 12px } # text-xs
  micro: { fontSize: 11.5px }
  nav-label: { fontSize: 12px, fontWeight: medium } # type-nav-label = Figma MOAYO/nav-label(12px로 수정) · BottomNav 탭 라벨에 연결
rounded:
  lg: 8px # rounded-lg · /webview-test에서만 사용
  xl: 12px # rounded-xl · 버튼, 입력창, 채움 박스
  2xl: 16px # rounded-2xl · 카드, 다이얼로그, 썸네일
  3xl: 24px # rounded-t-3xl · 바텀시트 상단만
  full: 9999px # rounded-full · 칩, 뱃지, 아이콘 버튼, FAB(TermDictionaryButton)
spacing:
  app-max-width: 430px # max-w-[430px]
  page-gutter: 20px # px-5
  card-padding-x: 16px # px-4
  card-padding-y: 14px # py-3.5
  stack-gap: 8px # gap-2
  detail-section-gap: 22px # globals.css --spacing-detail-section-gap(--spacing×5.5) → mt-detail-section-gap · 기록 상세 섹션 사이
  form-field-gap: 24px # Figma spacing/form-field-gap · globals.css --spacing-form-field-gap(--spacing×6) → mb-form-field-gap · 기록 폼 입력 항목 사이
  bar-height: 56px # h-14 · BackHeader 전용. BottomNav는 더 이상 이 값을 쓰지 않음(아래 nav-content-height로 분리)
  nav-content-height: 64px # globals.css --spacing-nav-content-height(--spacing×16) → h-nav-content-height · BottomNav 콘텐츠 영역(세이프 에어리어 제외)
  dialog-max-width: 320px # max-w-[320px]
shadows:
  sm: "shadow-sm" # 앱 컬럼
  lg: "shadow-lg" # FAB, 배너, 드롭다운, 토스트
  sheet: "0 -8px 24px rgba(0,0,0,0.12)" # 바텀시트
zIndex:
  dropdown: 10
  banner: 20
  bar: 30 # BackHeader, BottomNav
  floating: 40 # TermDictionaryButton
  modal: 50 # 시트, 다이얼로그, 토스트
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.xl}"
    height: 48px # button-48 · 테두리 포함, 세로 패딩 없음, 글자 가로·세로 가운데
    padding: 0 # w-full (좌우 패딩은 pill·인라인 버튼만 px-4/px-5)
    typography: "{typography.button}" # type-button
  input-default:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    borderColor: "{colors.border}"
    rounded: "{rounded.xl}"
    height: 50px # h-[50px] · 한 줄 input 공통(textarea 제외)
    padding: 0 16px # px-4, 세로 패딩 없음
    typography: "{typography.input}" # type-input · 16px medium, input·textarea·placeholder 공통
  card-outlined:
    borderColor: "{colors.border}"
    rounded: "{rounded.2xl}"
    padding: 14px 16px
  badge-sector:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground} / 70%"
    rounded: "{rounded.full}"
    padding: 4px 10px # py-1 px-2.5
    fontSize: 12px
  chip-selectable:
    backgroundColor: "{colors.background}"
    selectedBackgroundColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: 6px 12px # py-1.5 px-3
    fontSize: 13px
  bottom-sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.3xl}" # 상단만
    padding: 20px
    shadow: "{shadows.sheet}"
  dialog-confirm:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: 20px
    maxWidth: 320px
  bottom-nav:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    height: 64px # 콘텐츠 영역만(세이프 에어리어 패딩은 바깥에 별도 추가). {spacing.nav-content-height}
    activeColor: "{colors.primary}"
    inactiveColor: "{colors.muted-foreground}"
  toast:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.primary-foreground}" # text-white
    typography: "{typography.body-sm}" # 13.5px medium
    rounded: "{rounded.xl}"
    padding: 12px 16px # py-3 px-4
    shadow: "{shadows.lg}"
    zIndex: "{zIndex.modal}"
    duration: 3000ms # TOAST_DURATION_MS, 토스트 전용 상수
---

# 모아요 Design System

이 문서는 모아요에 **이미 구현되어 있는** UI를 그대로 기록한 것입니다. 값은
전부 코드에서 추출했고, 한 역할에 여러 값이 쓰이는 경우 통일하지 않고
[Inconsistencies](#inconsistencies) 섹션에 남겼습니다. 토큰은 아직 코드에
연결되어 있지 않습니다.

## Overview

모바일 폭(최대 430px) 단일 컬럼 앱입니다. 회색 배경(`background`) 위에 흰색
앱 컬럼(`surface`)이 가운데 놓이고, 파란색 `primary` 하나만 강조색으로
씁니다. 화면은 얇은 테두리(`border`)와 옅은 회색 채움으로 구획하며 그림자는
떠 있는 요소에만 씁니다. UI 라이브러리 없이 Tailwind v4 유틸리티를 각 파일에
직접 작성하고 있고, 다크 모드는 없습니다.

## Colors

`globals.css`의 `:root`에 CSS 변수 10개가 있습니다. 그중 9개는 `@theme inline`으로
Tailwind 색상(`bg-point`, `text-muted` 등)에 매핑됩니다. 나머지 1개
(`--coachmark-dim`)는 Tailwind 클래스가 아니라 인라인 스타일에서 `var()`로
직접 참조하는 값이라 매핑하지 않았습니다 — 아래 표의 사용처 참고.

| 역할 토큰 | 현재 코드 이름 | 값 | 사용처 |
| --- | --- | --- | --- |
| `background` | `--background` | `#f4f5f7` | body 배경, 입력창·칩·뱃지·정보 박스 채움, `active:` 눌림 배경 |
| `foreground` | `--foreground` | `#19202b` | 기본 텍스트 |
| `surface` | `--surface` | `#ffffff` | 앱 컬럼, 헤더, 하단 내비, 시트, 다이얼로그 |
| `primary` | `--point` | `#3182f6` | CTA 배경, 선택 상태, 링크, 활성 탭, focus 테두리 |
| `primary-pressed` | `--point-dark` | `#1b64da` | `active:bg-point-dark` 전용 |
| `muted-foreground` | `--muted` | `#8b95a1` | 보조 텍스트, 비활성 탭, 닫기 아이콘 |
| `border` | `--border-subtle` | `#eef0f3` | 카드·입력창 테두리, 구분선 |
| `record-action-background` | `--record-action-background` | `#eff6ff` | 홈 뉴스 카드 "기록하기" 액션 배경(`RecordCardAction`) 전용 — Figma `colors/record-action-background` |
| `coachmark-emphasis` | `--coachmark-emphasis` | `#5198ff` | 코치마크(`OnboardingGuide`) 설명 단계 제목(`text-coachmark-emphasis`) 전용 강조 텍스트 색 |
| `coachmark-dim` | `--coachmark-dim` | `rgba(0,0,0,0.8)` | 코치마크(`OnboardingGuide`) 스포트라이트 오버레이의 딤(`boxShadow`에 `var(--coachmark-dim)`로 사용) 전용 |

`record-action-background`는 `primary`를 어떤 투명도로 흰 배경 위에 얹어도
나오지 않는 고유 값이라(확인함), `bg-point/N` 조합을 재사용하지 않고 새
토큰으로 추가했습니다. `foreground`·`surface`·`primary` 등 다른 역할과
섞어 쓰지 않습니다.

`coachmark-emphasis`·`coachmark-dim`도 같은 이유로 새 토큰입니다.
`coachmark-emphasis`(`#5198ff`)는 `primary`(`#3182f6`)와 가깝지만 다른 값이고,
코치마크 제목에만 씁니다 — `primary`를 이 값으로 바꾸면 버튼·링크·활성 탭 등
`primary`를 쓰는 다른 모든 화면이 함께 바뀌므로 그렇게 하지 않았습니다.
`coachmark-dim`(검정 80%)은 `overlay`(검정 40%, Dialog / Bottom Sheet 전용)와
적용 범위가 다른 별개 토큰입니다 — 코치마크의 스포트라이트는 CSS 클래스가
아니라 인라인 `boxShadow`로 그려지므로, `--coachmark-dim`을 `var()`로
참조해 값을 한 곳(`globals.css`)에서만 관리합니다.

CSS 변수가 없는 역할은 Tailwind 기본 클래스로 직접 씁니다.

| 역할 | 현재 구현 | 사용 횟수 |
| --- | --- | --- |
| `primary-foreground` | `text-white` | 29 |
| `destructive` | `text-red-500` / `bg-red-500` | 14 / 3 |
| `overlay` | `bg-black/40` | 6 |

`foreground`에 투명도를 준 `text-foreground/80`(본문 설명),
`/70`(비선택 칩·뱃지·취소 버튼), `/40`(읽은 기사 뱃지)이 2차 텍스트 색으로
쓰입니다. `primary` 틴트는 `bg-point/5` + `border-point/30`(강조 카드)입니다.
`secondary`, `accent`, `ring`, `card`, `popover` 역할은 존재하지 않습니다.

Google 로고의 4색(`#FFC107` 등)은 브랜드 에셋이므로 토큰이 아닙니다. Apple
로그인 버튼의 검정 배경(`bg-black`)과 흰색 로고도 Apple Human Interface
Guidelines가 고정한 값이라 같은 이유로 토큰이 아닙니다.

## Typography

서체는 **Noto Sans KR** 하나이며(`next/font/google`, weight 400/500/600/700/900),
제목·본문·버튼이 모두 같은 패밀리를 씁니다. mono 서체는 없습니다.

크기는 대부분 `text-[13px]` 같은 임의 값으로 지정합니다. 실제 사용 중인
크기는 14단계입니다. 아래 두 역할만 공통 스타일로 정의돼 있습니다.

### 역할 스타일 (공통 타이포그래피)

`src/app/globals.css`에 Tailwind `@utility`로 정의합니다. 크기는 Tailwind 기본
크기 토큰(`--text-sm` 14px, `--text-base` 16px)을, 굵기는 기본 굵기 토큰을
참조하므로 새 크기 값을 만들지 않습니다. **행간은 지정하지 않습니다.** 요소에
이미 있는 `leading-*` 또는 상속 행간이 그대로 유지됩니다(`text-sm`/`text-base`
클래스를 직접 쓰면 프리셋 행간이 함께 바뀌므로 쓰지 않음). 예외로 `type-button`,
`type-memo-body`, `type-record-card-title`은 규칙상 행간 24px을, `type-chip`은 21px을
역할에 포함합니다.

| 역할 | 클래스 | 크기 | 굵기 | 행간(기존 값 유지) | 사용 범위 |
| --- | --- | --- | --- | --- | --- |
| 칩 | `type-chip` (Figma `type-14-medium`) | 14px | Medium 500 | **21px 지정**(`--spacing` × 5.25) | 홈·내 기록 분야 필터(`CategoryTabs`), 기록 작성·수정의 섹터 선택 칩(`RecordFormFields`, `ExternalRecordFields`) — 선택·미선택 공통. 메모 힌트 칩(12.5px), 뱃지, 버튼, 라벨은 제외 |
| 헤더 제목 | `type-header-title` (Figma `MOAYO/header-title`) | 16px | Bold 700 | 지정 안 함(상속, 1.5 → 24px) | 기록 작성 첫 단계(`/record/new` URL 입력)의 "기사 URL을 붙여넣어주세요" 안내 제목(`mb-2`, `text-foreground`). DESIGN.md의 기존 `typography.header-title`을 코드로 옮긴 것. BackHeader 제목·프로필 이름 등 다른 16px Bold는 아직 `text-[16px] font-bold`를 직접 씀(결과는 같음) |
| 섹션 제목 | `type-section-title` | 14px | Bold 700 | 지정 안 함(상속, 1.5 → 21px) | 기록 작성·수정 화면(일반 `RecordFormFields`, 외부 기사 `ExternalRecordFields`)의 "섹터 *" 라벨(`mb-2`, 아래 8px). DESIGN.md의 기존 `typography.section-title`을 코드로 옮긴 것 |
| 기사 제목 | `type-article-title` | 14px | Semibold 600 | 홈 뉴스 카드 `leading-snug`(1.375 → 19.25px), 내 기록 카드 상속(1.5 → 21px) | 홈 최신 뉴스 목록(`LatestNewsList`), 내 기록 목록(`RecordCard`) |
| 뉴스 카드 액션 | `type-record-action` (Figma `type-12-bold`) | 12px | Bold 700 | 지정 안 함(상속, 1.5 → 18px) | 홈 뉴스 카드의 "기록하기" 액션(`RecordCardAction`, Components → 기록하기 액션 참고) |
| 텍스트 버튼 | `type-button` (Figma `type-16-semibold`) | 16px | Semibold 600 | **24px 지정**(`--spacing` × 6, `leading-6`과 같은 값) | 텍스트 버튼 라벨 전체. 높이·정렬은 `button-48`과 함께 씀(Components → Button) |
| 기록 카드 제목 | `type-record-card-title` | 16px | Medium 500 | **24px 지정**(`--spacing` × 6) | ① 기록 상세(`/record/[id]`) "회고 기록" 목록 카드의 비교 기록 제목(날짜와 같은 flex 줄, `min-w-0 flex-1` + 날짜 `shrink-0`) ② 투자회고(회고 수정, `/record/[id]/reflection/[reflectionId]`) 화면의 과거·지금 기록 카드 제목 2곳. **한 줄 + 말줄임(…)** 을 역할에 포함(`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`). 완료 화면 등 다른 화면의 기록 제목, 카드 본문·날짜·뱃지는 제외 |
| 메모 본문 | `type-memo-body` | 16px | Medium 500 | **24px 지정**(`--spacing` × 6, `leading-6`과 같은 값) | 기록 상세(`/record/[id]`)의 메모 본문: "뉴스 기록"(기존 '나의 메모') 상자와 "투자에 적용하기" 상자. 섹션 제목, 빈 메모 안내(13.5px muted), 작성·수정 화면 입력창은 제외 |
| 입력창 내부 텍스트 | `type-input` | 16px | Medium 500 | textarea `leading-6`(24px), 한 줄 input·평가 의견 상속(1.5 → 24px) | 모든 제품 input·textarea의 입력값과 placeholder: URL, 기록 제목(2), 용어 검색, 나의 메모, 내 생각(2026-10-20부터, 이전 '기사 정리'), 투자에 적용하기, 평가 의견. `/webview-test` 제외 |
| 하단 내비 라벨 | `type-nav-label` (Figma `MOAYO/nav-label`) | 12px(2026-10-17까지 11px) | Medium 500 | 지정 안 함(상속) | `BottomNav`의 탭 라벨 3곳(뉴스·내 기록·마이페이지). 아이콘은 24×24px(기존 22px), 콘텐츠 높이는 `h-nav-content-height`(64px, 기존 56px) |

- 색상은 역할에 포함하지 않습니다. 기사 제목은 `text-foreground`(홈은 읽은 기사
  `#9CA3AF`), 입력창은 `text-foreground`를 요소에서 그대로 지정합니다.
- **기사 제목과 라벨 구분**: 입력창 위 "제목 *"은 기사 제목이 아니라 라벨입니다
  (`text-[14px] font-semibold`, Input 섹션 참조). 크기·굵기가 같아도
  `type-article-title`을 쓰지 않습니다.
- **역할 구분**: `type-record-card-title`·`type-input`·`type-memo-body`는 크기·굵기
  (16px / 500)가 같아도 용도가 달라 따로 정의합니다(입력값 / 메모 본문 / 한 줄 제목).
  서로 바꿔 쓰지 않습니다. `type-record-action`도 `type-nav-label`과 크기(12px)와
  줄 높이 처리(둘 다 지정 안 함, 상속)는 같지만 굵기(Bold 700 vs Medium 500)와 용도
  (뉴스 카드 액션 라벨 vs 하단 내비 탭 라벨)가 달라 따로 정의했습니다.
- **한 줄 말줄임 규칙**: `type-record-card-title`은 블록 요소에 써서 부모 폭에 맞춰
  잘리게 합니다. flex·grid의 자식으로 쓸 때는 그 자식(또는 감싸는 flex 자식)에
  `min-w-0`을 함께 줘야 말줄임이 작동합니다. 기록 상세 회고 목록은 제목에
  `min-w-0 flex-1`, 날짜에 `shrink-0`을 줘서 날짜 자리를 확보합니다. 투자회고
  카드는 블록 카드 안의 `<p>`라 `min-w-0` 없이 작동합니다(320px·393px, 긴 한글·
  공백 없는 제목으로 확인).
- **역할 밖의 제목**: 기사 상세 `h1`(19px bold), 기록 상세 `h1`(18px bold)은 페이지
  제목이라, 완료 화면의 비교 카드 제목(13px semibold)은 메모를 보조하는
  문맥 표시라 이 역할에 넣지 않았습니다. 홈에서 쓰지 않는 `NewsCard`
  (NewsCarousel)도 제외합니다.
- **굵기 로딩**: `src/app/layout.tsx`가 400/500/600/700/900을 불러옵니다.
  `type-article-title`과 모든 `font-semibold`는 SemiBold(600) 파일로,
  `type-input`은 Medium(500) 파일로 그려집니다(Chrome DevTools 확인). 600을
  추가하기 전에는 semibold가 Bold(700)로 대체 표시됐습니다.

| 크기 | 사용 횟수 | 주 용도 |
| --- | --- | --- |
| 20px (`text-xl`) | 2 | 탭 화면 제목 — extrabold |
| 19px | 1 | 기사 제목 (`/article/[id]`) |
| 18px | 5 | 기록 제목, 온보딩 제목 — bold, `leading-snug`; `MonthPicker`의 연·월 레이블(트리거 버튼, bold, 2026-10-25, 15px에서 변경) + 연도 선택 시트 안 연도 레이블(bold, 2026-10-26, 트리거와 통일) |
| 17px | 5 | 시트·완료·로그인 제목 — bold |
| 16px (`text-base` 포함) | 4 + 역할 38 | 텍스트 버튼(`type-button`, semibold, 30곳), 입력값·placeholder(`type-input`, medium, 8곳), URL 단계 안내 제목(`type-header-title`, bold), BackHeader 제목, 프로필 이름 — bold, 내 기록 빈 상태 제목(`type-header-title`, bold, 2026-10-26부터) |
| 15px | 8 | 다이얼로그·섹션 제목(bold) |
| 14.5px | 4 | 용어 이름(semibold·bold), 마이페이지 로그인 안내(semibold), 기사 본문(`/article/[id]`) |
| 14px (`text-sm` 포함) | 32 + 역할 7 | 칩(`type-chip`, medium), 본문, 기사 제목(`type-article-title`), 입력창 라벨(semibold), 섹터 라벨(`type-section-title`, bold), 카드 제목, 섹션 제목, 원문 보기 링크, 내 기록 빈 상태 설명(medium, 역할 밖, 2026-10-26부터 — 일치하는 named 토큰 없어 임의값 유지) |
| 13.5px | 17 | 시트 본문, 메뉴 항목, 토스트, ArticleReturnBanner 메시지(2026-10-18, 스낵바로 개편되며 18px bold 제목 + 16px medium 설명 2줄에서 Toast와 같은 13.5px medium 한 줄로 변경) |
| 13px | 34 | 설명, 에러 |
| 12.5px | 13 | 캡션, 에러, 작은 링크 |
| 12px (`text-xs` 포함) | 21 + 역할 3 | 뱃지, 메타 정보(날짜·언론사), 하단 내비 라벨(`type-nav-label`, medium, 3곳 — 2026-10-17까지 11px) |
| 11.5px | 4 | 글자 수, 면책 문구 |
| 10px | 1 (2026-10-20 추가) | FAB(`TermDictionaryButton`) "사전" 라벨 — semibold, `text-[10px] font-semibold` (named 토큰 아님, 역할 전용) |

굵기는 `font-semibold`(23, 역할 스타일 제외), `font-medium`(28), `font-bold`(28),
`font-extrabold`(2)를 쓰고, 행간은 `leading-6`(본문·textarea),
`leading-snug`(제목), `leading-5`, `leading-7`, `leading-none`을 씁니다.
자간(`tracking-*`)은 쓰지 않습니다.

## Layout

spacing은 Tailwind 기본 스케일(1 step = 4px)을 그대로 쓰며, 이름 있는 간격 토큰은
`form-field-gap`(24px, 아래 "입력 항목 간격")과 `detail-section-gap`(22px, 아래
"기록 상세 섹션") 두 개입니다.

- **앱 컬럼**: `mx-auto max-w-[430px] bg-surface`. `fixed` 요소(내비, 시트,
  배너)도 같은 `inset-x-0 mx-auto max-w-[430px]`로 컬럼에 맞춥니다.
- **좌우 여백**: 페이지 `px-5`(20px, 51회), 카드·입력창 내부 `px-4`(16px, 35회).
- **세로 패딩**: 카드 `py-3.5`(14px), textarea `py-3`(12px), 칩 `py-1.5`(6px).
  텍스트 버튼(`button-48`, 48px)과 한 줄 입력창(`h-[50px]`)은 세로 패딩 대신
  높이로 고정합니다.
- **간격**: `gap-2`(8px)가 기본(35회). 그 외 `gap-3`, `gap-1.5`, `gap-2.5`.
- **입력 항목 간격 (`form-field-gap`, 24px)**: 기록 작성·수정 화면(일반
  `RecordFormFields`, 외부 기사 `ExternalRecordFields`)에서 한 입력 항목의 마지막
  요소와 다음 항목 라벨 사이는 24px입니다.
  - Figma `spacing/form-field-gap` = 코드 `--spacing-form-field-gap`
    (`src/app/globals.css`의 `@theme inline`, 값 `calc(var(--spacing) * 6)`).
    Tailwind가 이 토큰으로 `mb-form-field-gap`·`gap-form-field-gap` 등을 만듭니다.
  - 사용: 각 항목의 마지막 요소(제목 입력창, 섹터 칩 묶음, 내 생각 textarea)에
    `mb-form-field-gap`. 숫자 클래스(`mb-4`, `mb-6`)로 다시 지정하지 않고, 값을
    바꿀 때는 토큰 한 곳만 고칩니다. 부모 `gap`은 쓰지 않아 여백이 겹치지 않습니다.
  - textarea처럼 기본이 inline인 요소가 항목 끝에 오면 `block`을 함께 줍니다
    (없으면 줄 아래 여유 약 5px이 더해져 29px이 됨).
  - 라벨 아래 8px(`mb-2`, 라벨 ↔ 자기 입력창·칩)과 구분합니다. 8px는 항목 안,
    24px는 항목 사이입니다.
  - 마지막 항목 아래(`mb-2`, 에러 문구)와 저장 버튼까지의 간격, 페이지 여백은
    이 토큰과 무관하게 기존 값을 유지합니다.
- **기록 상세 섹션**: 섹션 제목 `mb-2 text-[14px] font-bold` + filled 박스
  (본문 `whitespace-pre-line type-memo-body text-foreground/80`).
  - **섹션 사이 22px**: "뉴스 기록" → "투자에 적용하기" → "회고 기록"처럼 제목 있는
    섹션끼리는 `mt-detail-section-gap`(22px). 코드 토큰
    `--spacing-detail-section-gap`(`src/app/globals.css` `@theme inline`,
    `calc(var(--spacing) * 5.5)`) 한 곳에서 관리합니다. 투자에 적용하기가 숨겨지면
    뉴스 기록 → 회고 기록이 바로 22px입니다.
  - **머리 영역 아래 24px**: 기사 제목·원문 보기 → 첫 섹션 "뉴스 기록"은 섹션 사이가
    아니므로 기존 `mt-6`(24px)을 유지합니다.
  - 22px는 4px 스케일 밖의 값이라 숫자 클래스(`mt-[22px]`)로 쓰지 않고 토큰으로만
    씁니다. 작성·수정 화면의 입력 항목 간격(24px, `form-field-gap`)과는 별개입니다.
  - 카드·테두리는 추가하지 않습니다.
  - 외부 기사 기록의 `thought`를 `splitExternalContent`로 나눠 표시만 분리하며
    (저장 형식은 그대로), 투자에 적용하기를 쓰지 않은 기록은 그 섹션을 숨깁니다.
    일반 기록은 `thought` 전체가 "뉴스 기록"에 표시됩니다.
- **고정 바**: BackHeader는 `h-14`(56px, 변경 없음). BottomNav의 콘텐츠 영역은
  별도 토큰 `h-nav-content-height`(64px, `--spacing-nav-content-height`,
  Layout → Bottom Navigation 참고)를 씁니다 — 두 바는 더 이상 같은 값을
  공유하지 않으므로, 하나를 바꿔도 다른 바는 영향받지 않습니다.
- **Safe area**: 하단 고정 요소는 `env(safe-area-inset-bottom)`을 더하고, 탭
  화면 본문은 `paddingBottom: calc(7.5rem + env(safe-area-inset-bottom))`을
  inline style로 줍니다. 세 탭(`/`, `/records`, `/mypage`) 모두 같은 값을
  쓰는데, 숫자 자체는 BottomNav 64px에 과거 `RecordFab`(56px)을 더해 정했던
  값이 그대로 남아 있는 것입니다 — `RecordFab`은 2026-10-17 `/records`에서도
  제거되어 이제 이 세 화면 어디에도 FAB이 없지만, 패딩 숫자는 바꾸지
  않았습니다(Bottom Navigation 섹션의 "의존 값" 참고).
- **z-index**: 10(드롭다운) · 20(배너) · 30(헤더/내비) · 40(사전 버튼) ·
  50(시트/다이얼로그/온보딩/토스트).

## Elevation & Depth

깊이는 주로 테두리와 `background` 채움으로 표현하고, 그림자는 3종류만 씁니다.

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `sm` | `shadow-sm` | 앱 컬럼 |
| `lg` | `shadow-lg` | TermDictionaryButton, ArticleReturnBanner, 드롭다운 메뉴, Toast |
| `sheet` | `0 -8px 24px rgba(0,0,0,0.12)` | 바텀시트 3종 |

BackHeader는 그림자 대신 `bg-surface/95 backdrop-blur` + 하단 테두리를 씁니다.
확인 다이얼로그에는 그림자가 없고 `overlay`만 있습니다.

## Shapes

| 토큰 | 값 | 사용 횟수 | 사용처 |
| --- | --- | --- | --- |
| `xl` | 12px | 43 | 버튼, 입력창, 채움 박스, 드롭다운 |
| `2xl` | 16px | 22 | 카드, 확인 다이얼로그, 대표 이미지, EmptyState |
| `full` | 9999px | 18 | 칩, 뱃지, 아이콘 버튼, FAB(TermDictionaryButton), pill 버튼, 아바타 |
| `3xl` | 24px | 3 | 바텀시트 상단(`rounded-t-3xl`) |
| `lg` | 8px | 3 | `/webview-test`(2곳) + 홈 뉴스 카드 "기록하기" 액션(`RecordCardAction`) |

### Icons

아이콘 라이브러리 없이 inline SVG를 씁니다. 공통 규칙은 `viewBox="0 0 24 24"`,
`fill="none"`, `stroke="currentColor"`, round cap/join입니다. 크기는
24px(하단 내비), 22px(사전 버튼), 20px(뒤로가기), 18/16px(닫기),
18px(원문 보기 화살표), 32px(별점)이고 `strokeWidth`는 2(11회)가 기본,
1.8(4회), 2.5(3회), 1.5가 섞여 있습니다. 이미지는 `next/image`를 씁니다.

**예외(2026-10-24, 2곳)**: `ArticleLinkBanner`(Components → 뉴스 링크 배너)는
두 가지를 예외로 씁니다 — ① 화살표는 `lucide-react`의 `ChevronRight`(20px,
크기·레시피는 위 inline SVG 세트와 같아 시각적 이질감은 없음), ② 뉴스
아이콘은 inline SVG도 `lucide-react`도 아닌 정적 파일
`public/icon/newspaper_icon 1.svg`를 `<img>`로 참조(22px, 디자인팀 고정
에셋이라 모양·색을 그대로 유지해야 해서 inline SVG로 옮기지 않음). 둘 다
이 배너 하나만의 예외이고 다른 화면 아이콘은 전부 기존처럼 inline
SVG입니다. 자세한 변경 이력은 아래 뉴스 링크 배너 섹션 참고.

## Components

공통 컴포넌트로 분리된 것과 각 화면에 inline으로 반복 작성된 것을 구분해
기록합니다. 상태는 `active:`, `disabled:`, `focus:`, 선택(selected)만
존재하며 `hover:`와 `focus-visible:`은 어디에도 없습니다.

### Button — 공통 스타일 `button-48` + `type-button` (컴포넌트 없음)

터치 가능한 액션. 버튼 컴포넌트는 없고, 텍스트 버튼은 `src/app/globals.css`의
공통 스타일 두 개를 참조합니다. 예외는 두 곳입니다: "원문 보기"는 공통 컴포넌트
(`ArticleOriginalLink`, 아래 참고)이고, Google/Apple 로그인 버튼은 `/login`과
`/mypage`가 함께 쓰는 `SocialLoginButtons`(아래 "그 외 공통 컴포넌트")입니다.

| 항목 | 값 | 코드 |
| --- | --- | --- |
| 높이 | **48px**, 테두리 포함(`box-sizing: border-box`), 세로 패딩 없음 | `button-48` (`--spacing` × 12) |
| 정렬 | 글자 가로·세로 가운데 (`inline-flex items-center justify-center text-center`) | `button-48` |
| 글자 | **16px / Semibold 600 / 줄 높이 24px** | `type-button` (`--text-base`, `--font-weight-semibold`, `--spacing` × 6) |
| Figma | 텍스트 스타일 `type-16-semibold` = 코드 `type-button` | — |
| 유지 (버튼별) | 배경·글자색, 테두리, radius, 좌우 패딩, 폭(`w-full`·`flex-1`), 여백, `active:`·`disabled:` | 각 버튼 className |

```tsx
<button className="button-48 w-full rounded-xl bg-point type-button text-white disabled:opacity-60 active:bg-point-dark">
  저장
</button>
```

| Variant | 스타일 (`button-48 type-button` + 아래) | 사용 화면 |
| --- | --- | --- |
| primary | `rounded-xl bg-point text-white` (+`active:bg-point-dark`) | 기록 작성 "다음"·"저장", 외부 기록 저장·"URL 다시 입력하기", 기사 상세 "메모 기록하기", 완료 화면 "확인"·"완료", 회고 "저장", 평가 "의견 보내기", 첫 기록 로그인 시트, LoginPrompt "로그인하기"(`px-5`), 용어 "검색"(`px-4`), 내 기록 빈 상태 EmptyState `action` "뉴스 둘러보기"(`px-5`) |
| primary-pill | `rounded-full bg-point text-white px-4`/`px-5` | OnboardingGuide "다음"·"시작하기" |
| outline | `rounded-xl border border-border-subtle` (+`bg-surface`) | Google 로그인(아이콘 + `gap-2`, `SocialLoginButtons`), 다이얼로그 "취소", 회고 "취소", 용어 "다시 시도"(`px-4`) |
| apple | `rounded-xl bg-black text-white`(아이콘 + `gap-2`) | Apple 로그인(`SocialLoginButtons`) |
| ghost | `rounded-xl text-muted`, 배경 없음 | 시트 "다음에 할게요"·"나중에 할게요", 완료 화면 "나중에 하기" |
| destructive | `rounded-xl bg-red-500 text-white` | 삭제·탈퇴 확인 다이얼로그 |
| choice | `rounded-xl border`, 선택 시 `border-point bg-point text-white` / 비선택 `border-border-subtle text-foreground/80` | 회고 비교 선택 (완료, 회고 화면) |

- **상태**: 기본·눌림(`active:`)·비활성(`disabled:opacity-60`)·로딩(라벨만
  "저장 중..." 등으로 바뀜)·선택(choice) 모두 같은 요소라 높이와 글자가 같습니다.
- **나란히 놓기**: 다이얼로그의 두 버튼은 `flex gap-2` + `flex-1`. 입력창 옆
  "검색"은 줄을 `flex items-center`로 두어 50px 입력창 세로 가운데에 맞춥니다.
- **적용 범위**: 위 표의 텍스트 버튼 29곳(`<button>`과 버튼 모양 `<Link>`) +
  `SocialLoginButtons`의 Google·Apple 버튼 2곳.
- **결정 사항 (2026-10-15)**: ghost(보조) 버튼과 primary-pill 버튼도 의도적으로
  같은 규칙(48px, 16px / 600)을 씁니다. 보조 버튼은 색(`text-muted`)으로만 주 버튼과
  구분하며, 작게 만들려고 크기·굵기를 따로 지정하지 않습니다.
- **제외 범위** (각자 스타일 유지)
  - 아이콘 전용 버튼 — 뒤로가기, 닫기, 더보기, 별점(`h-8`·`h-9` 등)
  - FAB — TermDictionaryButton
  - 칩·탭 — 섹터·메모 힌트 칩, CategoryTabs
  - 하단 내비게이션 — BottomNav
  - 일반 링크·인라인 텍스트 액션 — "원문 보기"(`ArticleOriginalLink`), 완료
    화면 "수정", 온보딩 "건너뛰기", 용어 카드 "삭제"
  - 뉴스 카드 전용 액션 — 홈 뉴스 카드 "기록하기"(`RecordCardAction`, 배경 있는
    필 모양이라 위 "일반 링크·인라인 텍스트 액션"과도 다름 — Components →
    기록하기 액션 참고)
  - 스낵바 전용 액션 — `ArticleReturnBanner` "기록하기"(2026-10-18,
    `rounded-full bg-point px-3 py-2 type-record-action text-white`
    — radius는 같은 날 `rounded-lg`(8px)에서 `rounded-full`(완전히 둥근
    모서리, Shapes `full` 토큰)로 다시 변경. `RecordCardAction`과 같은
    작은 필 모양·패딩·서체 역할을 재사용하되 배경·글자색·radius는 Primary
    블루 배경 + 흰 글자 + 완전히 둥근 모서리로 다름 — 아래 "그 외 공통
    컴포넌트" 참고)
  - 목록·메뉴 행 — 마이페이지 메뉴 카드·로그아웃·탈퇴, 기록 상세 더보기 메뉴
    항목, 뉴스·기록 카드
  - `/webview-test`
- **토큰**: `primary`, `primary-pressed`, `primary-foreground`, `border`,
  `muted-foreground`, `destructive`, `rounded.xl`, `rounded.full`, `typography.button`.

#### 원문 보기 링크 — `ArticleOriginalLink` (공통)

기사 원문(언론사 페이지)을 여는 링크. 기록 상세 화면의 기존 링크를 공통
컴포넌트로 옮긴 뒤 크기(14px)·굵기(semibold)·아이콘(SVG)을 조정했습니다.

| 항목 | 값 | 토큰 |
| --- | --- | --- |
| 문구 | `원문 보기` + 화살표 아이콘 (컴포넌트 고정) | — |
| 색상 | `text-point` (`#3182f6`), 아이콘도 `currentColor`로 같은 색 | `colors.primary` |
| 서체 | `text-[14px] font-semibold`(600), 행간 미지정(상속) | 크기만 `typography.body`와 같음(행간 24px은 미적용) |
| 실제 렌더링 굵기 | Noto Sans KR **SemiBold(600)** 인스턴스로 그려짐 (600 로드 후) | — |
| 아이콘 | inline SVG `width/height 18`, `viewBox 0 0 24 24`, path `M7 17 17 7M9 7h8v8`, `stroke="currentColor"`, `strokeWidth 2.5`, round cap/join, `aria-hidden` | — |
| 아이콘 배치 | `ml-0.5 inline-block align-text-bottom` (글자와 세로 중심 차이 약 0.3px) | — |
| 배경·테두리·radius·padding | 없음 | — |
| 표시 | `inline-block truncate` | — |
| 눌림 상태 | 없음 (`active:` 미지정) | — |

- **동작**: `<a rel="noopener noreferrer">`, `target` 없음 → 같은 탭에서 열고
  브라우저 뒤로가기로 돌아옵니다. `href`와 클릭 추적은 호출하는 쪽이 넘깁니다.
- **아이콘을 SVG로 쓰는 이유**: semibold 적용 후 텍스트 기호 `↗`의 획(약
  1.4px)이 한글 획(약 2.0px)보다 눈에 띄게 얇았습니다. 18px·`strokeWidth 2.5`
  SVG는 획 약 1.9px, 화살표 크기 약 9.5px로 기존 기호와 같은 크기를 유지합니다.
  이 측정은 600 로드 전, 링크가 Bold(700)로 그려질 때 기준입니다. 지금은
  SemiBold(600)로 그려져 한글 획이 조금 얇아졌으며, 화살표 획 굵기는 다시
  비교하지 않았습니다.
- **접근성 이름**: 아이콘이 `aria-hidden`이라 링크 이름은 `원문 보기`입니다.
- **사용법**: `className`에는 바깥 여백 같은 레이아웃만 넘깁니다. 호출하는
  쪽이 자기 위에 오는 요소와의 간격을 직접 정하므로, 앞에 다른 요소가
  없거나 그 요소가 이미 아래쪽 여백을 갖고 있다면(기록 상세처럼) 이
  컴포넌트 자체에는 `className`을 아예 안 줄 수도 있습니다.

  ```tsx
  <ArticleOriginalLink href={record.url} onClick={handleOpen} className="mt-1" />
  ```

- **사용 화면**: 기록 상세(`/record/[id]`, **2026-10-17부터 제목 위** —
  섹터/날짜 행 바로 다음, 제목이 `mt-1`로 이 링크와의 간격을 가짐)만
  사용합니다. **2026-10-23**: 외부 기사 기록 작성·수정(`/record/new/external`)
  에서는 더 이상 쓰지 않습니다 — 아래 `ArticleLinkBanner`로 교체됐습니다.
  (옛 "`ArticleOpenExternalBar`는 상쇄 margin 없음" 메모는 이 텍스트 링크가
  ⓘ 버튼과 나란히 있던 그 레이아웃 전용이라 함께 제거했습니다.)
- **규칙**: 원문을 여는 링크(배너가 아니라 인라인 텍스트로 여는 경우)는 이
  컴포넌트를 재사용하고, 문구·스타일을 화면별로 따로 만들지 않습니다.

#### 뉴스 링크 배너 — `ArticleLinkBanner` (공통, 2026-10-23)

연결된 기사를 여는 가로형 배너. 기록 작성 화면의 "원문 보기" 텍스트 링크
(`ArticleOriginalLink`)를 대체합니다 — 그 화면은 항상 기사 하나에 연결된
상태로만 진입하므로(URL이 없으면 `/record/new`의 URL 입력 단계로 먼저
보냄), 배너는 그 화면이 렌더링되는 한 항상 표시됩니다.

| 항목 | 값 | 토큰 |
| --- | --- | --- |
| 높이 | **64px** (`h-16`) | — |
| 배경 | `bg-surface` (흰색) | `colors.surface` |
| 테두리 | `border border-border-subtle` | `colors.border` |
| radius | `rounded-xl` (12px) | `rounded.xl` |
| 좌우 패딩 | `px-4` (16px) | — |
| 아이콘 | 단독 표시(감싸는 박스·배경·테두리·radius 없음), 22×22px, 정적 SVG 파일의 원본 색 그대로 | — (파일에 색이 고정돼 있어 토큰 연결 없음) |
| 제목 | `text-[14px] font-medium text-foreground`, `truncate`(한 줄 말줄임) | — |
| 화살표 | `lucide-react`의 `ChevronRight`, 20×20px, `text-muted` | `colors.muted-foreground` |
| 간격(아이콘↔제목, 제목↔화살표) | `gap-3`(12px) | — |
| 눌림 상태 | `active:bg-background` | `colors.background` |
| 그림자 | 없음(떠 있는 요소가 아니라 Do's and Don'ts의 "그림자는 떠 있는 요소에만" 규칙대로 생략) | — |

- **아이콘**: **2026-10-24 변경(3차)** — 처음엔 40×40px 뉴트럴 배경 박스 안에
  `lucide-react`의 outline `Newspaper`를 넣었다가(1차), 박스를 걷어내고
  손으로 그린 filled inline SVG로 바꿨습니다(2차). 이번엔 디자인팀이 만든
  고정 에셋 **`public/icon/newspaper_icon 1.svg`**로 다시 교체했습니다(3차,
  최종) — `<img src="/icon/newspaper_icon%201.svg" width={22} height={22}>`로
  참조하며, 파일 안의 모양·색(연한 파랑 `#EFF6FF` 배경 페이지 +
  `#3182F6` 접힌 모서리·텍스트 줄)을 그대로 씁니다. `#EFF6FF`는
  `colors.record-action-background`와, `#3182F6`는 `colors.primary`와 같은
  값이지만, 이 아이콘은 파일 자체에 색이 박혀 있어 CSS 토큰 클래스로
  다시 칠하지 않습니다(파일을 바꾸면 자동으로 따라옴).
  **next/image를 쓰지 않은 이유**: 이 프로젝트의 `next.config.ts`에
  `images.dangerouslyAllowSVG`가 꺼져 있어(기본값) `next/image`가 SVG를
  거부합니다 — 이 아이콘 하나 때문에 전역 이미지 설정을 바꾸는 대신 평범한
  `<img>`를 씁니다(`@next/next/no-img-element` 경고 1건, 빌드를 막지
  않음). Layout 섹션의 "이미지는 `next/image`를 씁니다" 규칙의 예외입니다.
  **viewBox 크롭(2026-10-24, 4차)**: 파일의 원래 `viewBox`는 `0 0 64 64`였지만
  실제 그림(스트로크 포함 좌표 전체)은 `x: 12~52, y: 11~53`(40×42)만
  차지해, 가장자리에 그래픽이 없는 투명 여백이 있었습니다. 처음엔 그 파일을
  그대로 22×22에 욱여넣어 아이콘이 체감상 훨씬 작아 보였는데
  (렌더 결과 글자/화살표 대비 왜소), 이 여백이 "불필요한" 것으로 확인돼
  `viewBox`를 그 실제 그림 영역(`12 11 40 42`)으로 좁혔습니다 — **패스
  좌표는 1도 건드리지 않고** `viewBox`(와 거기 맞춘 `width`/`height` 속성,
  `64 64` → `40 42`)만 바꿨으므로 모양·색·비율은 원본 그대로이고, 보이는
  영역만 실제 그림에 딱 맞게 잘렸습니다. `<img>`에는 `h-[22px] w-[22px]`
  클래스를 함께 줬습니다 — Tailwind preflight가 `img { height: auto }`를
  강제해 `height={22}` 속성만으로는 40:42 비율 그대로 22×23.1로 늘어났기
  때문입니다(클래스가 그 규칙보다 우선 적용되어 정확히 22×22 정사각형을
  만듭니다). 정사각형 박스 + SVG 기본 `preserveAspectRatio`(`xMidYMid
  meet`, stretch 아님)가 비율을 유지한 채 가로 쪽에 0.5px 미만의 여백만
  남기므로 찌그러지지 않습니다.
- **아이콘 라이브러리 예외(화살표만)**: Icons 섹션의 "아이콘 라이브러리
  없이 inline SVG" 규칙의 유일한 예외는 화살표(`ChevronRight`) 하나입니다
  — 기존 inline SVG 관례(`viewBox 0 0 24 24`, `stroke="currentColor"`,
  round cap/join, `strokeWidth 2`)와 시각적으로 같은 레시피라
  `lucide-react`를 그대로 씁니다. 뉴스 아이콘은 위처럼 정적 파일 참조로
  바뀌어 inline SVG도 `lucide-react`도 아니지만, 화살표 하나 때문에
  `package.json`의 `lucide-react` 의존성은 유지됩니다. 다른 화면의 아이콘
  (하단 내비, 뒤로가기, 원문 보기 화살표 등)은 전부 기존처럼 inline SVG —
  이 배너의 화살표 하나만의 예외이고 늘리지 않습니다.
- **동작**: `ArticleOriginalLink`와 같은 `<a rel="noopener noreferrer">`,
  `target` 없음(같은 탭에서 열고 브라우저 뒤로가기로 돌아옴), 네이티브
  iOS/Android 앱에서는 인앱 브라우저로 여는 동작(`src/lib/native/article-browser.ts`)도
  동일하게 재사용합니다. 접근성 이름은 `aria-label="{제목} 원문 보기"`.
- **사용법**: 배너 전체가 하나의 링크입니다 — 안에 별도 버튼을 중첩하지
  않습니다. `className`에는 바깥 레이아웃(`flex-1` 등)만 넘깁니다.

  ```tsx
  <ArticleLinkBanner href={rawUrl} title={articleTitle} onClick={trackOpen} />
  ```

- **사용 화면**: 외부 기사 기록 작성·수정(`/record/new/external`,
  `ArticleOpenExternalBar` 안에서 `px-4 pt-4` 패딩만 받고 가로 폭 전체를
  차지 — **2026-10-24**: 배너 옆에 있던 ⓘ 안내 버튼·팝오버가 제거되며,
  배너가 그 행의 유일한 요소가 됐습니다. Components → "`ArticleOpenExternalBar`의
  ⓘ 버튼 (제거됨, 2026-10-24)" 참고).
- **기록 제목 자동 입력 제거(2026-10-23)**: 이 배너가 생기기 전에는 홈
  "기록하기"·복귀 배너 "기록하기"로 진입할 때 쿼리로 넘어온 기사 제목이
  기록 제목 입력창(`ExternalRecordFields`의 "제목 *")에 그대로 채워졌습니다.
  이제 그 자동 입력은 제거되어 새 기록은 제목이 항상 빈 칸에서 시작하고,
  연결된 기사 제목은 이 배너에서만 보여줍니다. 수정 화면은 영향 없음 —
  저장된 기록 제목을 그대로 불러오는 기존 동작을 유지합니다(이 배너의
  제목도 수정 화면에서는 같은 저장된 제목을 재사용 — 기사 원문의 제목을
  별도로 저장해 두지 않기 때문).

#### 기록하기 액션 — `RecordCardAction` (공통, Figma 노드 `109:1347`, 프레임 "개편안 2")

홈 뉴스 카드마다 붙는 "기록하기" 액션. 기사를 먼저 열지 않고 그 기사의 URL을
바로 기존 외부 기록 작성 화면(`/record/new/external`)으로 넘깁니다.
**2026-10-17 디자인 교체**: 연필 아이콘 + 배경 없는 14px 인라인 링크였던
"개편안 1" 디자인("기록하기 액션" 이전 버전)을 아래 배경 있는 필 버튼("개편안
2")으로 완전히 대체했습니다 — 아이콘 없음, 새 배경 토큰 사용.

| 항목 | 값 | 토큰 |
| --- | --- | --- |
| 문구 | `기록하기` (고정, 아이콘 없음) | — |
| 배경 | `bg-record-action-background` (`#EFF6FF`) | `colors.record-action-background` (Figma `colors/record-action-background`) |
| 글자색 | `text-point` | `colors.primary` |
| radius | `rounded-lg` (8px) | `rounded.lg` |
| 패딩 | 좌우 12px(`px-3`), 상하 8px(`py-2`) — 둘 다 Tailwind 기본 4px 스케일 값, 새 임의값 없음 | — |
| 서체 | `type-record-action` (12px Bold 700, 줄 높이 미지정 → 상속 1.5 = 18px) | Typography → 역할 스타일 |
| 테두리·그림자 | 없음 | — |
| Figma 시각 크기 | 69×30px | — |
| 실제 렌더링 크기 | 약 69×34px(패딩 8+8 + 줄 높이 18px) — Figma의 줄 높이가 "Auto"라 Figma 자체도 강제 값을 안 주므로, 코드도 `type-header-title`·`type-section-title`과 같은 규칙대로 줄 높이를 지정하지 않고 상속에 맡겼습니다. 그 결과 세로로 4px 더 큽니다(폭은 거의 동일) — 고정 `h-[30px]`를 주지 않은 의도적 차이입니다 | — |
| 터치 영역 | `before:absolute before:-inset-2`로 시각 영역 바깥 8px까지 확장(레이아웃 크기에는 영향 없음) — 실제 박스(약 69×34px)만으로는 Apple HIG의 44×44pt 권장 터치 영역에 못 미쳐서 필요 | — |
| 눌림 상태 | 없음(`active:` 미지정) | — |

- **버튼 규칙의 예외**: Button 섹션의 `button-48`/`type-button`(48px, 16px Semibold)은
  저장·다음 같은 CTA용 규칙입니다. 이 액션은 배경·radius·패딩이 있어 CTA 버튼처럼
  보이지만 크기·서체가 전혀 다른 "뉴스 카드 전용 액션"이라 그 규칙을 쓰지 않습니다
  (Button 섹션 "제외 범위" 참고). Chip과도 다릅니다 — Chip은 `type-chip`(14px
  Medium, 21px 지정)과 `rounded-full`을 쓰고 선택 상태가 있지만, 이 액션은
  `type-record-action`(12px Bold, 줄 높이 상속)과 `rounded-lg`를 쓰고 상태가 없습니다.
- **배치**: 카드 오른쪽. 왼쪽 기사 정보(제목+메타 정보)를 감싸는 텍스트 column과
  이 액션 사이 간격이 **6px**(`gap-1.5`, 카드 최상위 행 자체의 `gap`). `shrink-0`이라
  제목이 길어져도 액션 폭은 줄지 않고, 제목 쪽(`min-w-0 flex-1`)이 먼저
  줄바꿈됩니다 — 320px·393px에서도 겹치지 않습니다. 세로 정렬은 카드 최상위 행의
  `items-center`가 맡습니다. **2026-10-18**: 썸네일(`NewsThumbnail`)이 삭제되며
  텍스트 column을 감싸던 바깥 `flex items-center gap-3` 묶음(썸네일↔텍스트 간격용)도
  함께 제거해, 텍스트 column이 이제 이 gap-1.5 행의 직계 자식입니다.
- **DOM 구조**: 카드를 감싸던 기존 `<a>`를, 카드 전체를 덮는 절대 위치
  `<a>`(원문 열기/기록 작성 폴백용 "스트레치드 링크")로 바꾸고 `RecordCardAction`은 그
  형제로 둡니다. `<a>` 안에 `<button>`/`<Link>`를 중첩하면 키보드·스크린리더 탐색이
  깨지기 때문입니다. `RecordCardAction`에 `relative`를 줘서 그 스트레치드 링크 위에
  그려지게 합니다.
- **동작**: 클릭 시 해당 기사의 `url`·`title`·`sector`를 query string으로 붙여
  `/record/new/external`로 이동(URL이 없는 피드 항목은 `url` 없이 `title`·`sector`만,
  `ArticleReturnBanner`의 "기록하기"가 쓰는 것과 같은 패턴). 카드의 원문 열기용
  `handleArticleOpen`/`handleArticleRead`(읽음 처리, `article_opened` 트래킹, 복귀
  배너용 `saveArticleReturnInfo`)는 호출하지 않습니다 — 이 액션은 "읽으러 간다"가
  아니라 "바로 기록한다"는 별도 의도라서입니다. 로그인 여부는 확인하지 않습니다
  (`/record/new/external`의 저장 로직이 비로그인 사용자도 로컬 저장으로 처리하는
  기존 동작을 그대로 재사용). **2026-10-17**: 홈 화면의 `RecordFab`(카드 오른쪽
  하단에 떠 있던 전역 "기록하기" 진입점)은 제거되어, 이제 홈에서 기록을 시작하는
  방법은 이 액션뿐입니다. `RecordFab`은 그 뒤 `/records`(내 기록 탭)에서도
  제거되고 컴포넌트 자체도 삭제되어, 이제 앱 어디에도 이 FAB이 남아 있지 않습니다.
- **사용 화면**: 홈 최신 뉴스 목록(`LatestNewsList`)의 모든 카드.

### Input / Textarea — 공통 컴포넌트 없음 (inline)

기록 제목·메모, URL, 용어 검색, 평가 의견 입력.

- **기본 스타일 (한 줄 input)**: `rounded-xl border border-border-subtle bg-background
  h-[50px] px-4 type-input text-foreground outline-none focus:border-point`.
  높이는 50px 고정(border 포함, `box-sizing: border-box`)이고 세로 패딩은 두지
  않습니다. 텍스트는 브라우저가 input 안에서 세로 가운데 정렬합니다.
- **Textarea**: 높이 고정 없이 `rows`로 크기를 정합니다. `px-4 py-3 type-input
  leading-6 resize-none`(기록 메모·내 생각·투자에 적용하기),
  `px-3.5 py-3 type-input resize-none`(평가 의견, 행간 미지정이라 상속값 1.5 = 24px).
  - **평가 의견 크기 (결정 사항, 2026-10-15)**: `rows={3}` × 줄 높이 24px + 패딩·테두리
    = **높이 98px**로 유지합니다. 글자를 16px로 키우면서 86.75px에서 늘어난 값이며,
    다른 textarea와 같은 줄 높이 24px를 지키려고 `leading-5` 등으로 줄이지 않습니다.
- **글자**: 한 줄 input과 textarea 모두 역할 스타일 `type-input`(16px Medium 500,
  Typography → 역할 스타일)을 씁니다. placeholder는 별도 지정 없이 입력창의 크기·
  굵기를 상속합니다(색은 브라우저 기본 반투명). 숫자 클래스(`text-[16px]`,
  `font-medium`)를 직접 쓰지 말고 `type-input`을 씁니다. 16px 이상이면 iOS Safari가
  입력창에 포커스할 때 화면을 확대하지 않습니다.
- **Variant**: 없음.
- **Size**: 한 줄 input은 모두 `h-[50px]`. 좌우 패딩만 다름 — 기록 제목·URL
  `px-4`, 용어 검색 `px-3.5`. 용어 검색처럼 버튼과 한 줄에 놓을 때는 input에
  `min-w-0 flex-1`, 버튼에 `shrink-0`을 줍니다(없으면 Safari에서 input 기본 너비가
  버튼을 밀어 글자가 두 줄로 꺾임). 줄 컨테이너는 `flex items-center`라서 48px
  "검색" 버튼이 50px 입력창의 세로 가운데에 놓입니다(위아래 1px).
  `/webview-test`(제품 외 검증 페이지)의 input은 이 규칙에서 제외.
- **State**: `focus:border-point`만 존재. 에러는 입력창이 아니라 아래쪽
  `text-red-500` 문구로 표시. placeholder 색은 지정하지 않음(브라우저 기본).
- **Label**: `mb-2 block text-[14px] font-semibold text-foreground`. 한 줄
  input·textarea 위 라벨(제목, 내 생각, 투자에 적용하기, 나의 메모)에 씁니다.
  - **라벨 아래 8px**: 라벨 ↔ 자기 입력창·칩. `mb-2`, 부모 `gap` 없이 라벨 자체
    여백으로 관리합니다.
  - **입력 항목 사이 24px**: 앞 항목 마지막 요소 ↔ 다음 라벨. `mb-form-field-gap`
    (Figma `spacing/form-field-gap`, Layout → 입력 항목 간격).

  ```tsx
  <label className="mb-2 block text-[14px] font-semibold text-foreground">제목 *</label>
  <input className="mb-form-field-gap w-full … h-[50px] px-4 type-input" />
  <label className="mb-2 block type-section-title text-foreground">섹터 *</label>
  <div className="mb-form-field-gap flex flex-wrap gap-2">{/* 칩 */}</div>
  ```

  "나의 메모"처럼 라벨과 입력창 사이에 안내문·칩이
  있으면 라벨 바로 아래만 8px이고, 그 아래 요소들의 기존 여백은 그대로 둡니다.
  라벨이 없는 입력창(URL, 용어 검색, 평가 의견)에는 라벨·여백을 추가하지 않습니다.
  크기만 14px이고 굵기·색·여백은 그대로이며, 행간은 지정하지 않아 상속됩니다
  (`typography.body`의 `leading-6`은 적용하지 않음).
- **섹터 라벨**: 칩 그룹 위 "섹터 *" 라벨은 `mb-2 block type-section-title
  text-foreground` — 14px Bold 700, 아래 간격 8px. 일반 기록·외부 기사 기록의
  작성·수정 화면 모두 같습니다. 참조 스타일은 Typography의 `section-title`
  (`type-section-title`)이며, 입력창 라벨(semibold)과 굵기만 다릅니다. 섹터 칩의
  글자·크기·간격은 Chip 규칙 그대로입니다.
- **토큰**: `background`, `foreground`, `border`, `primary`, `destructive`, `rounded.xl`.
- **사용 화면**: RecordFormFields(`/record/new`), ExternalRecordFields
  (`/record/new/external`), TermDictionarySheet, RatingPromptSheet.

### Card

목록 항목과 정보 묶음.

| Variant | 스타일 | 구현 | 사용 화면 |
| --- | --- | --- | --- |
| outlined | `rounded-2xl border border-border-subtle` | `RecordCard`, `EconomicTermHistoryCard`, LatestNewsList 항목(inline), 마이페이지 메뉴(inline) | 내 기록, 검색한 용어, 홈, 마이페이지 |
| filled | `rounded-xl bg-background px-4 py-3.5` | inline | 기록 상세 "뉴스 기록"·"투자에 적용하기", 용어 검색 결과 |
| highlighted | `rounded-2xl border border-point/30 bg-point/5 p-4` | inline | 완료·회고 화면의 "지금의 생각" |
| dashed | `rounded-2xl border border-dashed border-border-subtle px-6 py-10` | `EmptyState` | 내 기록, 검색한 용어, 홈 |

**2026-10-18**: `ArticleReturnBanner`는 세로형 floating 카드(outlined +
`bg-surface shadow-lg`)에서 가로형 스낵바로 개편되며 이 Card 분류를
벗어났습니다 — `bg-surface`·테두리 없이 `bg-foreground`(진한 Neutral,
Toast와 같은 토큰)를 쓰고 `rounded-full`(완전히 둥근 모서리)이라, 아래
Toast 섹션 뒤의 "그 외 공통 컴포넌트" 항목에서 별도로 다룹니다.

- **Size**: 패딩이 `p-3.5` / `px-4 py-3.5` / `p-4` 세 가지.
- **State**: 링크형 카드만 `active:bg-background`.
- **토큰**: `surface`, `background`, `border`, `primary`, `rounded.2xl`, `rounded.xl`.

#### HOT 뉴스 카드 — `HotNewsSection`/`HotNewsCard` (2026-10-24)

홈 화면 최상단의 "지금 주목할 뉴스" — 관리자가 등록한 경제 이슈 키워드와
기존 RSS 기사를 매칭한 결과(최대 5개)를 가로 스크롤 카드로 보여줍니다
(선정 로직은 `src/lib/hot-news-matching.ts`, 자세한 내용은 프로젝트
리서치/구현 보고 참고 — **실시간 조회수 기반 인기 순위가 아님**). **언론사와
무관하게 전체 RSS 기사가 선정 대상**입니다 — 썸네일 보유는 선정 단계의
조건이 아니라, 후보가 동률일 때 실제 사진을 우선하는 타이브레이커일
뿐입니다(2026-10-25 재변경 — 하루 전 버전은 썸네일을 필수 조건으로 걸어
매일경제만 선정되던 문제가 있었음, 아래 일러스트 폴백으로 해결).

| 항목 | 값 | 토큰 |
| --- | --- | --- |
| 카드 폭 | `w-[240px]` (고정, `shrink-0`) | — |
| 썸네일 비율 | `aspect-video`(16:9) | — |
| 썸네일 radius·채움 | `rounded-2xl bg-background`(실사진 없을 때 아래 일러스트가 같은 박스를 채움) | `rounded.2xl`, `colors.background` |
| 제목 | `type-article-title leading-snug line-clamp-2`(한 줄 역할과 동일, 2줄 말줄임만 추가) | Typography → 역할 스타일 |
| 보조 정보 | `SectorBadge`(공통) + 언론사명(`text-xs text-muted`) | — |
| 카드 사이 간격 | `gap-3`(12px) | — |
| 가로 스크롤 | `overflow-x-auto snap-x snap-mandatory scroll-px-5 no-scrollbar`, 카드 `snap-start` — 다음 카드 일부가 항상 보이도록 폭을 일부러 뷰포트에 딱 안 맞게 잡음 | — |
| 순위 숫자 | 없음(의도적으로 표시 안 함) | — |
| "기록하기" 버튼 | 없음(홈 뉴스 목록의 `RecordCardAction`과 달리 카드 전체가 원문 열기 전용) | — |

- **레이아웃 출처**: 가로 스크롤 image-first 카드라는 형태 자체는 미사용
  컴포넌트 `NewsCarousel`/`NewsCard`(아래 "미사용 컴포넌트" 참고)에서 처음
  설계됐던 패턴을 그대로 가져왔습니다 — `rounded-2xl` 이미지 박스 +
  `line-clamp-2` 제목 + `snap-x` 스크롤. 다만 `NewsCard`는
  `NewsArticle`/`mock-news.ts`(샘플 데이터) 전용으로 짜여 있어 그 컴포넌트
  자체를 재사용하지 않고, 실제 RSS 데이터(`LatestNewsItem`) 위에 새로
  작성했습니다 — `NewsCarousel`/`NewsCard`는 여전히 어디에서도 import되지
  않습니다.
- **주제 일러스트 폴백(2026-10-25 추가)**: 실제 썸네일(`imageUrl`, 소스별
  `allowThumbnail` 허용 여부 — `src/lib/news-rss.ts` 참고, 바뀌지 않음)이
  없거나 런타임에 로드가 실패하면, 같은 `aspect-video` 박스에 **사전 제작한
  SVG 주제 일러스트**(`public/illustrations/hot-news/*.svg`, 10종: 반도체·AI·IT /
  국내 증시·주식 / 금리·환율·금융 / 부동산 / 에너지·원자재 / 자동차·제조업 /
  글로벌 경제·무역 / 기업 실적·산업 / 정부 정책·경제 지표 / 기타 경제
  뉴스)을 대신 채웁니다. 어떤 일러스트를 쓸지는 `src/lib/hot-news-illustration.ts`의
  `resolveIllustrationTheme()`이 기사 제목 키워드(우선) → 섹터 기본값(차순)
  순으로 고릅니다. 일러스트는 외부 이미지 생성 API 없이 직접 제작한 정적
  SVG이며(플랫 에디토리얼 스타일, 텍스트/로고/워터마크 없음, 보도사진처럼
  보이지 않게), `next/image`가 아니라 일반 `<img>`로 렌더링합니다
  (`ArticleLinkBanner`와 같은 이유 — next.config.ts에
  `images.dangerouslyAllowSVG` 미설정). 실사진 카드와 구분하는 별도 라벨은
  달지 않습니다(2026-10-25 — 이전엔 "주제 일러스트" 배지가 있었으나 요청에
  따라 제거, 선정/표시 로직 자체는 그대로).
- **동작**: 카드 전체가 `<a>` 하나 — 클릭 시 `ArticleOriginalLink`/
  `LatestNewsList`와 같은 원문 열기 동작(네이티브 앱은 인앱 브라우저,
  웹은 같은 탭)과 `saveArticleReturnInfo`(복귀 시 "기록하기" 유도 배너)를
  그대로 재사용합니다.
- **데이터 없음**: `GET /api/hot-news`가 오늘(KST) 데이터를 못 찾으면
  섹션 전체(제목 포함)가 렌더링되지 않습니다 — 아래 최신 뉴스 목록에는
  영향 없음.
- **사용 화면**: 홈(`/`), 최신 뉴스 목록보다 위.

#### 최신 경제 뉴스 헤더 — `LatestNewsList` (2026-10-25)

섹터 필터(`CategoryTabs`) 바로 위에 **"최신 경제 뉴스"** `<h2>`를
추가했습니다 — "지금 주목할 뉴스"와 **완전히 같은 타이포그래피·여백**
(`px-5 text-[15px] font-bold text-foreground`)이라 두 섹션 제목이 시각적으로
짝을 이룹니다. 헤더 → `CategoryTabs` 간격은 `mt-4`(16px, 별도 wrapper
`<div>`에 적용 — `CategoryTabs` 자체는 내 기록 화면에서도 재사용되므로
컴포넌트를 고치지 않음). HOT 뉴스 섹션 → 이 섹션 전체 간격은 `mt-6`(24px,
기존 `mt-3`에서 변경) — 기록 상세 화면에서 "머리 영역 아래"에 쓰는 것과
같은 24px 값이라 새 토큰을 만들지 않았습니다.

### Badge / Chip

- **Badge** — `SectorBadge` (공통). 기사·기록의 분야 표시. `rounded-full
  bg-background px-2.5 py-1 text-xs font-medium text-foreground/70`.
  Variant: 기본 / `muted`(`text-foreground/40`, 읽은 기사). 사용: 홈, 내 기록,
  기록 상세·완료·회고, 기사 상세.
  - **홈 뉴스 카드 메타 줄**(`LatestNewsList`) — 제목 아래 한 줄
    (`flex flex-wrap items-center gap-2`)에 섹터 칩 → 날짜 → 언론사 순으로
    표시. 칩이 맨 앞이라 공간이 부족해 줄바꿈될 때도 뒤의 날짜·언론사만
    다음 줄로 밀리고 칩은 항상 첫 줄에 남습니다.
  - **AI 칩**(`TermDictionarySheet`, 2026-10-17) — `SectorBadge`와 똑같은
    시각 레시피를 그대로 쓰지만 공통 컴포넌트가 아니라 인라인 `<button>`입니다
    (`SectorBadge`는 `<span>`이라 탭 동작을 넣을 수 없어 별도 작성 —
    다른 `SectorBadge` 사용처에는 영향 없음). 경제용어 검색 결과 카드의
    용어 제목 오른쪽에 `shrink-0`으로 고정 — 제목이 길어 줄바꿈돼도 칩
    크기는 바뀌지 않습니다(`RecordCardAction`과 같은 `before:absolute
    before:-inset-2` 터치 영역 확장 포함, 시각 박스만으로는 44×44pt에
    못 미쳐서). 탭하면(호버 아님) 바로 아래 "AI가 생성한 설명으로,
    부정확할 수 있어요." 안내가 토글로 나타납니다 — 이전엔 카드 하단에
    항상 떠 있던 문구였는데, 이 칩을 탭해야만 보이도록 바뀌었습니다.
- **Chip** — 공통 컴포넌트 없음 (inline), 글자는 공통 스타일 `type-chip`.
  분야 선택. `rounded-full px-3 py-1.5 type-chip`.
  - 글자: **14px / Medium 500 / 줄 높이 21px** — `type-chip` = Figma `type-14-medium`
    (`--text-sm`, `--font-weight-medium`, `--spacing` × 5.25). 높이는 패딩 포함 33px.
  - State: 선택 `bg-point text-white` / 비선택 `bg-background text-foreground/70`.
    두 상태 모두 같은 `type-chip`을 쓰고 색만 다릅니다.
  - 칩 사이 간격 `gap-2`(8px). 홈·내 기록 필터는 한 줄 가로 스크롤(`whitespace-nowrap`),
    섹터 칩은 `flex-wrap`으로 줄바꿈(393px 3줄, 320px 4줄).
  - 사용: CategoryTabs(홈·내 기록 분야 필터), RecordFormFields·ExternalRecordFields(섹터 선택).
  - 예외: 메모 힌트 칩(RecordFormFields)은 `text-[12.5px] font-medium`으로 별도 유지.

  ```tsx
  <button className={`rounded-full px-3 py-1.5 type-chip ${
    selected ? "bg-point text-white" : "bg-background text-foreground/70"
  }`}>반도체</button>
  ```
- **토큰**: `background`, `foreground`, `primary`, `primary-foreground`, `rounded.full`.

### Tabs

- `CategoryTabs` (공통). 분야 필터. `role="tablist"`, 방향키 이동 지원,
  가로 스크롤(`no-scrollbar`).
- 시각 스타일은 Chip과 동일(`type-chip`, 14px Medium). Variant·Size 없음. State: 선택 / 비선택.
- **`ariaLabel`·`panelId` props** (기본값은 홈의 기존 문구·id를 그대로 유지):
  각 화면의 `aria-label`과 연결된 `role="tabpanel"`의 `id`가 서로 달라야 해서
  2026-10-17 내 기록 탭 재사용 시 추가했습니다. 두 화면이 동시에 마운트되는
  일이 없어 `id` 자체가 겹쳐도 동작엔 문제가 없었겠지만, 스크린리더가 읽는
  의미(`aria-label`)까지는 화면마다 달라야 해서 prop으로 분리했습니다.
- **필터 로직은 화면마다 다름**: 홈은 서버에서 받아온 기사 목록을
  `article.sector === category`로 직접 비교(기사는 항상 최신 10개 분류
  체계로 분류되어 들어옴, `news-classification-v2.ts`) — 클라이언트에
  이미 있는 목록만 다시 필터링하므로 선택이 바뀌어도 추가 요청이 없습니다.
  내 기록은 과거 8개 분류 체계로 저장된 기록이 섞여 있을 수 있어
  **2026-10-17부터 쿼리 단계에서** `getSectorValuesForCategory(category)`
  (`news-categories.ts` — `resolveCategoryForSector`의 역매핑, 구분류
  이름까지 포함)로 구한 sector 값 목록을 월별 쿼리의 `sector IN (...)`
  조건에 그대로 넘깁니다(Components → 그 외 공통 컴포넌트의
  `MonthPicker` 참고). 즉 섹터를 바꾸면 선택된 월 안에서 새 쿼리가 한 번
  나갑니다(전체 기록을 받아와 클라이언트에서 거르지 않음).
- 사용 화면: 홈(`LatestNewsList`, `ariaLabel`/`panelId` 기본값, 매번
  클라이언트 재필터링), 내 기록(`RecordsPage`, `ariaLabel="분야별 기록
  필터"`, `panelId="records-explorer-panel"`, `MonthPicker` 아래 배치,
  섹터 변경 시 쿼리 재요청).

### Dialog / Bottom Sheet

| 종류 | 스타일 | 구현 | 사용 화면 |
| --- | --- | --- | --- |
| Bottom Sheet | `fixed bottom-0 max-w-[430px] rounded-t-3xl bg-surface p-5` + `shadows.sheet`, safe-area 하단 패딩 | `RatingPromptSheet`, `FirstRecordLoginPromptSheet`, `TermDictionarySheet`, `MonthPicker`의 연월 선택 시트(`YearMonthSheet`) (각자 셸을 직접 작성) | 기록 완료·상세, 마이페이지, 외부 기록 작성, 내 기록 |
| Confirm Dialog | 중앙 정렬, `max-w-[320px] rounded-2xl bg-surface p-5`, 버튼 2개(outline + destructive) | inline 3곳 | 기록 상세(삭제), 마이페이지(탈퇴), 검색한 용어(삭제) |
| Popover / Menu | `rounded-xl border border-border-subtle bg-surface shadow-lg z-10` | inline 1곳 | 기록 상세 더보기 메뉴 (2026-10-24까지는 `ArticleOpenExternalBar`의 ⓘ 안내 팝오버도 이 스타일을 썼으나, 그 버튼 자체가 제거되며 함께 없어짐) |

- 공통: `fixed inset-0 z-50` + `bg-black/40` overlay, `role="dialog"`. 코치마크
  (`OnboardingGuide`, 그 외 공통 컴포넌트 참고)의 검정 80% 딤(`coachmark-dim`)은
  이 `overlay`(검정 40%)와 별개 토큰이라, 바꿔도 서로 영향을 주지 않습니다.
- **Size**: Bottom Sheet는 내용 높이(용어 사전만 `max-h-[80dvh]`), Dialog는 320px 고정.
- **State**: 열림/닫힘만 존재. 진입·퇴장 애니메이션 없음.
- **토큰**: `surface`, `overlay`, `border`, `rounded.3xl`, `rounded.2xl`, `shadows.sheet`.
- **`ArticleOpenExternalBar`의 ⓘ 버튼 (제거됨, 2026-10-24)** — "원문 보기 열면
  같은 탭에서 열리고 돌아올 수 있다"는 안내 팝오버를 여는 버튼이 뉴스 링크
  배너 옆에 있었으나, 요청에 따라 버튼과 팝오버 모두 제거했습니다.
  `ArticleOpenExternalBar`는 이제 `ArticleLinkBanner`만 감싸는 얇은
  래퍼(`px-4 pt-4` 패딩만 유지)이고, 배너가 그 행의 가로 폭 전체를
  차지합니다. 버튼 자체의 과거 크기·터치 영역 조정 이력(2026-10-17)은
  더 이상 적용 대상이 없어 함께 제거했습니다.

### Bottom Navigation

- `BottomNav` (공통, `layout.tsx`에서 마운트). `/`, `/records`, `/mypage`에서만 노출.
- `fixed bottom-0 max-w-[430px] border-t border-border-subtle bg-surface`,
  safe-area 하단 패딩(바깥). 탭 3개(뉴스·내 기록·마이페이지).

| 항목 | 값 | 코드 | Figma |
| --- | --- | --- | --- |
| 콘텐츠 높이 | **64px** (세이프 에어리어 제외, 아이콘+라벨 영역만) | `h-nav-content-height` (`globals.css` `--spacing-nav-content-height`, `--spacing` × 16) | — |
| 아이콘 | **24×24px** (기존 22px에서 변경) | `<svg width="24" height="24" viewBox="0 0 24 24">` | — |
| 라벨 | **12px / Medium 500** (기존 11px에서 변경, 굵기는 유지) | `type-nav-label` (`globals.css`, `--text-xs` + `--font-weight-medium`) | `MOAYO/nav-label` (12px로 수정) |
| 정렬 | 아이콘·라벨을 64px 안에서 가운데 정렬, 둘 사이 8px 중 절반(`gap-0.5`, 2px) | `flex flex-col items-center justify-center gap-0.5` | — |

- **BackHeader와의 분리**: BackHeader는 여전히 `h-14`(56px, 변경 없음).
  BottomNav의 콘텐츠 높이는 별도 토큰(`--spacing-nav-content-height`, 64px)이라
  둘은 더 이상 같은 값을 공유하지 않습니다 — 이 중 하나를 바꿔도 다른 바는
  영향받지 않습니다.
- **의존 값 (BottomNav 높이가 바뀌면 함께 확인해야 함)**: BottomNav 콘텐츠가
  56px → 64px(+8px = +0.5rem)로 바뀌면서, nav 높이를 끌어다 쓰는 다른 inline
  style도 같은 양만큼 올렸습니다.
  | 위치 | 이전 | 이후 |
  | --- | --- | --- |
  | 탭 화면 본문 하단 패딩(`/`, `/records`, `/mypage`) | `calc(7rem + env(safe-area-inset-bottom))` | `calc(7.5rem + env(safe-area-inset-bottom))` |
  | `RecordFab` bottom 오프셋(2026-10-17 컴포넌트 자체가 삭제되어 이 행은 더 이상 존재하지 않음) | `calc(3.5rem + env(safe-area-inset-bottom) + 0.75rem)` | `calc(4rem + env(safe-area-inset-bottom) + 0.75rem)` |
  | `ArticleReturnBanner` bottom 오프셋 | `calc(3.5rem + env(safe-area-inset-bottom) + 0.5rem)` | `calc(4rem + env(safe-area-inset-bottom) + 0.5rem)` |
  | `Toaster`의 하단 내비 경로 오프셋(첫 항만 nav, 둘째 `3.5rem`은 RecordFab 자체 높이라 변경 없음) | `calc(3.5rem + 0.75rem + 3.5rem + 0.75rem + …)` | `calc(4rem + 0.75rem + 3.5rem + 0.75rem + …)`(이후 `RecordFab` 삭제로 다시 바뀜 — 아래 Toast 섹션 참고) |
  | `/record/new/external` 하단 패딩 | `calc(7rem + …)` | **변경 안 함** — 이 화면은 BottomNav를 쓰지 않아(`isBottomNavPath` 목록 밖) nav 높이와 무관한 값입니다 |
- Variant·Size 없음. State: 활성 `text-point` / 비활성 `text-muted`.
- **토큰**: `surface`, `border`, `primary`, `muted-foreground`, `spacing.nav-content-height`, `typography.nav-label`.

### Toast

작업 결과를 잠깐 알려주는 메시지. 현재는 기록 수정·삭제 성공에만 쓰입니다.

- **구현**: `src/lib/toast.ts`(상태·`showToast`·`queueToast`·
  `usePendingToastRelease`) + `src/components/Toaster.tsx`(렌더링). `Toaster`는
  `layout.tsx`에 한 번만 마운트되어 있습니다. 화면에 `<Toaster />`를 따로 넣지
  않습니다.
- **사용법**
  - 현재 화면에 바로 표시: 작업이 끝난 다음 줄에서 `showToast("문구")`.
  - 성공 후 다른 화면으로 이동: 이동 직전에 `queueToast("문구", { to: 도착 경로 })`
    로 대기시키고, 도착 화면이 `usePendingToastRelease(상태)`로 표시 시점을
    알립니다. 기록 수정·삭제는 이 방식을 씁니다.

  ```ts
  // 출발 화면 (src/app/record/[id]/page.tsx)
  await deleteRecord(user, record.id);
  queueToast("기록이 삭제되었어요.", { to: "/records" });
  router.replace("/records");

  // 도착 화면 (src/app/records/page.tsx) — 조기 return보다 위에서 호출
  usePendingToastRelease(
    authLoading || recordsLoading ? "loading" : recordsError ? "failed" : "ready",
  );
  ```

| 항목 | 값 | 토큰 |
| --- | --- | --- |
| 배경 | `bg-foreground` (`#19202b`) | `colors.foreground` |
| 텍스트 | `text-white` | `colors.primary-foreground` |
| 서체 | `text-[13.5px] font-medium text-center`, 행간 미지정(상속) | `typography.body-sm` |
| radius | `rounded-xl` (12px) | `rounded.xl` |
| padding | `px-4 py-3` (16px / 12px) | — (Textarea와 같은 값) |
| shadow | `shadow-lg` | `shadows.lg` |
| z-index | `z-50` | `zIndex.modal` |
| 폭 | 문구 길이만큼. 앱 컬럼(`max-w-[430px]`) 안에서 좌우 `px-5` 여백 | `spacing.app-max-width`, `spacing.page-gutter` |

- **위치**: 하단 가운데. `fixed inset-x-0 mx-auto max-w-[430px]`로 앱 컬럼에
  맞춥니다. 하단 오프셋은 inline style이며 경로에 따라 둘 중 하나입니다.
  - 하단 내비 경로(`/`, `/records`, `/mypage`, `isBottomNavPath()`로 판별):
    `calc(4rem + 1.25rem + env(safe-area-inset-bottom))`. 순서대로 BottomNav
    콘텐츠 높이(64px), 그 외 경로와 같은 1.25rem 간격입니다. **2026-10-17**:
    `RecordFab`이 `/records`에서도 제거되어 세 탭 모두 FAB이 없어졌으므로,
    FAB 높이·간격만큼 더하던 기존 값(`calc(4rem + 0.75rem + 3.5rem + 0.75rem + …)`)에서
    FAB 관련 부분을 걷어내고 그 외 경로와 같은 1.25rem 간격만 남겼습니다.
  - 그 외 경로: `calc(1.25rem + env(safe-area-inset-bottom))`.
- **표시 시점**: `queueToast`로 대기한 토스트는 도착 화면의 로딩이 끝나 실제
  콘텐츠가 렌더링된 뒤(`"ready"`) 표시됩니다. 이동 중이나 로딩 화면 위에는
  뜨지 않습니다. 임의의 지연은 쓰지 않습니다.

  | 도착 화면 | `"ready"` 조건 | `"failed"` 조건 |
  | --- | --- | --- |
  | `/record/[id]` | 인증·기록 로딩 끝, 기록 있음 | 기록 없음(찾을 수 없음·조회 실패) |
  | `/record/complete/[id]` | 인증·기록·과거 기록 로딩 끝, 기록 있음 | 기록 없음 |
  | `/records` | 인증·목록 로딩 끝(빈 목록 포함) | 목록 조회 오류(`useRecords().error`) |

- **표시 시간**: 화면에 표시된 시점부터 3000ms(`TOAST_DURATION_MS`) 뒤 자동으로
  사라집니다.
  애니메이션 없이 즉시 나타나고 즉시 사라지며, 닫기 버튼은 없습니다.
  컨테이너가 `pointer-events-none`이라 탭할 수 없고, 아래 요소의 터치를 막지
  않습니다.
- **페이지 이동**: 상태가 모듈 변수에 있고 `Toaster`가 루트 레이아웃에 있어,
  표시된 토스트는 클라이언트 이동 중에도 남은 시간 동안 유지됩니다. 시간이
  끝나면 지워지므로 재렌더링·뒤로가기·탭 이동으로 다시 나타나지 않습니다.
  새로고침 등 전체 페이지 로드에서는 표시 중·대기 중 토스트 모두 사라집니다.
- **대기 토스트 폐기**: 대기 토스트는 표시되는 순간 한 번만 꺼내집니다. 도착
  화면이 `"failed"`를 알리거나, 사용자가 출발·도착 화면이 아닌 다른 경로로
  이동하면(`Toaster`가 경로 변경 시 확인) 표시하지 않고 버립니다.
- **중복 처리**: 한 번에 하나만 표시합니다. 표시 중에 새 토스트가 표시되면
  기존 토스트를 새 문구로 교체하고 3초를 다시 셉니다. 대기 토스트도 하나만
  보관하며(나중 것이 덮어씀), 대기열은 없습니다.
- **접근성**: 컨테이너에 `role="status"`, `aria-live="polite"`를 적용합니다.
  이 영역은 항상 렌더링되고(비어 있음) 문구만 바뀌므로 스크린리더가 변경을
  읽습니다.
- **Variant·Size**: 없음. 성공/에러 구분, 아이콘, 액션 버튼은 지원하지 않습니다.
- **사용 화면**: 기록 수정(`/record/new`, `/record/new/external` → 기록 상세
  또는 완료 화면), 기록 삭제(`/record/[id]` → 내 기록 `/records`).

#### 사용 규칙

| 상황 | 문구 | 호출 위치 |
| --- | --- | --- |
| 기록 수정 성공 | `기록이 수정되었어요.` | `updateRecord()` 완료 뒤 `router.replace` 직전 `queueToast` → 기록 상세(또는 완료 화면)에 기록이 표시된 뒤 |
| 기록 삭제 성공 | `기록이 삭제되었어요.` | `deleteRecord()` 완료 뒤 `router.replace("/records")` 직전 `queueToast` → 갱신된 목록 또는 빈 상태가 표시된 뒤 |

- 저장·삭제 함수가 오류 없이 끝난 뒤에만 호출합니다. 요청 중이거나 실패하면
  호출하지 않습니다(실패는 기존 에러 문구로 안내).
- 성공 후 다른 화면으로 이동한다면 `showToast` 대신 `queueToast`를 쓰고, 도착
  화면에 `usePendingToastRelease`를 추가합니다.
- 다른 화면에서 토스트가 필요하면 이 공통 구현을 재사용하고 별도 토스트를 만들지
  않습니다.
- 성공 토스트를 띄우려고 지연(`setTimeout` 등)을 넣지 않습니다.

### FAB — TermDictionaryButton (공통)

기록 작성(외부 기사, `/record/new/external`) 화면에서 경제용어사전을 여는
원형 플로팅 버튼. Button 섹션의 `button-48` 규칙 밖(제외 범위)이라 별도로 적습니다.

| 항목 | 값 | 토큰 |
| --- | --- | --- |
| 크기 | **56×56px**(2026-10-20부터, 이전 68px → 그 이전 48px) | — |
| 배경·테두리 | `bg-surface`(`#FFFFFF`) + `border border-border-subtle` | `colors.surface`, `colors.border` |
| 모양 | `rounded-full` | `rounded.full` |
| 그림자 | `shadow-lg shadow-black/10` | `shadows.lg` |
| 내부 배치 | **세로**(2026-10-20부터, 이전 아이콘만 가운데) — `flex-col items-center justify-center gap-0`(2026-10-20부터, 이전 `gap-0.5`/2px), 아이콘 위 + "사전" 텍스트 아래, 간격 0px | 이 버튼만의 값 — BottomNav의 `gap-0.5`(Layout → Bottom Navigation)와 다름(Inconsistencies 참고) |
| 아이콘 | book-open 모양 inline SVG, **22×22px**, `strokeWidth 1.8`, `text-point` | Icons → 22px(사전 버튼) |
| 텍스트 | "사전", `text-[10px] font-semibold`(2026-10-20부터, 이전 `type-nav-label` 12px Medium) + `text-point` | 이 버튼 전용 값(Typography → 크기 표 "10px" 행) — 색만 BottomNav의 활성 탭과 같은 `primary` |
| z-index | 40 | `zIndex.floating` |
| 눌림 상태 | `active:bg-background` | — |
| 클릭 영역 | 56×56px 원형 전체가 하나의 `<button>` — 아이콘·텍스트 모두 같은 클릭 영역, 분리된 하위 클릭 핸들러 없음 | — |

- **위치**: `fixed`. `right`/`bottom`은 호출부(`/record/new/external`)가
  `getBoundingClientRect()`로 직접 측정해 inline style로 내려주고, 이
  컴포넌트는 그 값을 그대로 적용합니다. `bottom`은 저장 버튼 푸터의 실제
  높이 + 키보드 인셋 + 12px 간격으로 계산되므로(`dictionaryBottomPx`,
  `external/page.tsx`), 버튼 자체 높이가 바뀌어도(48→68→56px) 이 계산에는
  영향이 없습니다 — `bottom`은 버튼의 아래쪽 모서리를 기준으로 하는
  값이라 버튼은 항상 저장 버튼 위 12px에 고정되고, 높이 변화는 위쪽으로만
  반영됩니다(저장 버튼과 겹치지 않음). iOS Safari 키보드가 열리고 닫힐
  때도 같은 `keyboardInsetPx`를 저장 버튼 푸터와 공유해 둘 다 함께
  움직이므로 화면 밖으로 벗어나지 않습니다. `right`은 앱 컬럼의 실제
  오른쪽 끝에서 계산해 데스크톱 넓은 화면에서도 카드 바깥으로 벗어나지
  않습니다.
- **사용 화면**: `/record/new/external`(외부 기사 기록 작성·수정)에서만 마운트.

### 그 외 공통 컴포넌트

- `BackHeader` — `sticky top-0 h-14 border-b bg-surface/95 backdrop-blur`,
  뒤로가기 + 16px bold 제목 + 우측 슬롯. 탭 화면을 제외한 9개 화면.
- `EmptyState` — dashed 카드. 기본 제목 14px semibold + 설명 13px
  muted(둘 다 선택) — `titleClassName`/`descriptionClassName`으로 호출부가
  재정의 가능(기본값은 이 두 역할 밖 크기를 그대로 둠). **내 기록**만
  `type-header-title`(16px Bold — Figma `MOAYO/header-title`, 2026-10-26
  변경. 이전엔 18px bold 역할 밖 크기였음) 제목 + `text-[14px] font-medium
  text-muted`(2026-10-26, 16px Medium에서 변경) 설명으로 재정의. 제목은
  BackHeader·`/record/new` URL 단계 안내와 같은 기존 named 토큰을 그대로
  재사용했고, 설명의 14px Medium은 일치하는 named 토큰이 없어(`type-chip`은
  14px medium이지만 `line-height: 21px`까지 지정된 칩 전용 토큰이라 본문
  설명에 끌어쓰지 않음) 기존 "역할 밖" 관례대로 `text-[14px]` 임의값 +
  굵기 클래스로 적용했습니다. 새 named 토큰은 추가하지 않았습니다.
  `records/page.tsx`에 `EmptyState` 호출부가 하나뿐이라 제목 3갈래(전체 /
  섹터별 / 월별) 모두 같은 타이포그래피를 공유합니다. 선택적 `action`(label + href)을
  주면 설명 아래 `mt-2`로 버튼 variant primary(`button-48 rounded-xl
  bg-point px-5 type-button text-white active:bg-point-dark`, `Link`)가
  뜸 — 내 기록 빈 상태의 "뉴스 둘러보기"(`href="/"`)가 유일한 사용처.
  **2026-10-18**: 이 `action`은 선택한 월이 이번 달일 때만 전달되고(과거
  달을 보고 있으면 `undefined`라 버튼 자체가 렌더링되지 않음). 설명 문구는
  `action`과 별개로 3갈래 — 이번 달은 "관심 있는 뉴스를 읽고 생각을 기록해
  보세요.", 과거 달이면서 사용자가 어딘가엔 기록이 있으면(`useRecordCount`)
  "다른 달에 남긴 생각들을 살펴보세요.", 과거 달인데 기록이 아예 하나도
  없으면 — 다른 달에 기록이 있다는 오해를 주지 않도록 — `description` 자체를
  주지 않아 설명 문구가 아예 렌더링되지 않습니다. 타이틀 문구(전체/섹터/월
  3분기) 로직과 `EmptyState` 자체는 변경 없음 — 레이아웃·버튼 스타일 모두 동일.
- `MonthPicker` — 내 기록 전용 월 선택. 레이블(`text-[18px] font-bold`,
  2026-10-25까지 15px) + 좌우 화살표(`BackHeader` 뒤로가기와 같은
  `h-9 w-9 rounded-full`, 20px 아이콘). 레이블 탭 시 연/월 그리드
  바텀시트(위 Dialog / Bottom Sheet의 `YearMonthSheet`, 시트 안 연도
  레이블도 트리거 레이블과 같은 `text-[18px] font-bold` —
  2026-10-26부터, 이전엔 15px로 서로 달랐음)가 열리고, 월 칩은 Chip
  규칙(`rounded-full type-chip`,
  선택 `bg-point text-white`)을 그대로 씀. 현재 KST 월보다 미래인 달은
  `disabled:opacity-60`로 비활성. 일 단위 선택 없음. 사용 화면: 내 기록.
- `LoginPrompt` — 로그인 유도 블록 (검색한 용어).
- `ArticleReturnBanner` — 홈 전용, 기사 복귀 후 뜨는 가로형 스낵바.
  **2026-10-18 전면 개편** (세로형 floating 카드 → 토스 스타일 컴팩트
  스낵바, Figma 없이 기존 Toast 레시피를 재사용해 구성):
  - **컨테이너**: `flex items-center gap-3 rounded-full bg-foreground/70
    px-4 py-3 shadow-lg`. 배경은 Toast와 같은 `bg-foreground`(진한
    Neutral, `#19202b`) — 이 앱에서 `foreground`를 배경으로 쓰는
    2번째이자 마지막 사례(Inconsistencies → Toast 참고). **2026-10-18**:
    배경만 70% 불투명도로 — Tailwind의 컬러 opacity modifier(`/70`)를 써서
    `background-color`의 alpha만 0.7로 낮추고, 엘리먼트 자체의 CSS
    `opacity`는 그대로 1이라 안의 흰 글자·버튼은 100% 불투명 유지(등장/
    퇴장 애니메이션이 쓰는 `opacity-0`/`opacity-100` 전환과는 별개 속성).
    radius는 `rounded-full`(기존 "충분히 둥근" 값 중 가장 큰 것, 칩·뱃지·
    pill 버튼과 같은 토큰). 패딩은 Toast의 `px-4 py-3`를 그대로 재사용 —
    기존 세로형 카드의 `px-4 py-5`보다 상하가 훨씬 낮아 컴팩트해짐. 좌우
    바깥 여백은 바뀌지 않은 바깥 wrapper의 `px-4`. 전체 딤 없음, `z-20`
    (바뀌지 않음).
  - **메시지**: `min-w-0 flex-1 truncate text-[13.5px] font-medium
    text-white` — Toast와 같은 13.5px medium(`typography.body-sm`)
    서체를 재사용하고 색만 Toast와 동일한 `text-white`. 기존 서브텍스트
    "떠오른 생각을 남겨보세요."는 제거하고 제목 한 줄만 남김. `truncate`
    + `min-w-0 flex-1`이라 버튼 쪽이 아무리 좁아도 메시지만 말줄임되고
    버튼은 밀려나지 않습니다.
  - **"기록하기" 버튼**: `shrink-0 rounded-full bg-point px-3 py-2
    type-record-action text-white active:bg-point-dark` — `button-48`
    계열이 아니라 `RecordCardAction`과 같은 "작은 필 버튼" 레시피(Button
    → 제외 범위 → "스낵바 전용 액션" 참고)를 재사용하고 배경·글자색·radius만
    Primary 블루 + 흰색 + 완전히 둥근 모서리로 바꿨습니다(2026-10-18,
    처음엔 `rounded-lg`였다가 변경). `shrink-0`이라 메시지가 길어도
    버튼 크기는 고정입니다.
  - **닫기(X) 버튼 제거**: 더 이상 수동으로 닫을 UI가 없고, 8초
    자동 닫힘(`AUTO_DISMISS_MS`)만 있습니다.
  - **애니메이션**: 마운트 한 프레임 뒤 `opacity-0 translate-y-2` →
    `opacity-100 translate-y-0`으로 전환(`transition-[opacity,transform]
    duration-200 ease-out`)해 아래에서 살짝 떠오르며 나타나고, 자동 닫힘
    시에도 같은 클래스를 반대로 적용해 200ms 페이드·슬라이드 아웃 뒤에야
    실제로 DOM에서 제거됩니다(바운스 없음). `motion-reduce:transition-none`
    으로 `prefers-reduced-motion`을 존중합니다.
  - **자동 닫힘·재노출**: `use-article-return-banner.ts`의 기존
    `onDismiss`(클리어 + `article_return_prompt_dismissed` 트래킹 +
    `setInfo(null)`)를 그대로 재사용 — 더 이상 X 클릭이 아니라 8초
    타이머가 호출합니다. "기록하기"를 누르는 순간(`onPointerDown`)엔 이
    타이머를 즉시 취소해, 누르고 있는 도중 타이머가 끝나 클릭이
    증발하는 일이 없게 했습니다. 호출 측(`src/app/page.tsx`)은
    `<ArticleReturnBanner key={articleReturnInfo.openedAt} .../>`로
    복귀 시각을 `key`로 줘서, 이 배너가 떠 있는 동안 새 기사로 다시
    돌아오면(새 `openedAt`) 컴포넌트가 통째로 리마운트되어 타이머·등장
    애니메이션이 그 기사 기준으로 새로 시작됩니다.
  - **기존 로직 재사용**: 기사 복귀 감지(`use-article-return-banner.ts`의
    4가지 트리거), "기록하기" 클릭 시 기사 데이터 전달·라우팅, 로그인
    여부 미확인, Mixpanel 이벤트(`article_return_prompt_shown`·
    `_clicked`·`_dismissed`) — 전부 변경 없음. 바뀐 건 UI·타이밍뿐입니다.
- `OnboardingGuide` — 스포트라이트 코치마크. 딤은 검정 80%(`coachmark-dim`,
  `var(--coachmark-dim)`를 `boxShadow`에 사용) — Dialog / Bottom Sheet의
  `overlay`(검정 40%, 위 Dialog / Bottom Sheet 섹션)와는 별개 토큰이라 코치마크만
  바뀌고 다른 모달·바텀시트 딤에는 영향이 없습니다. 각 단계 제목은
  `text-coachmark-emphasis`(`#5198ff`) — 설명 문구(흰색, 유지)·버튼(`bg-point`
  유지)·화살표(흰색 SVG, 유지)와는 다른, 코치마크 제목 전용 색입니다. 모든
  단계(1·2단계)에 동일하게 적용되며 딤·강조색 모두 단일 토큰이라 단계마다
  값이 갈리지 않습니다. 설명 문구 박스 너비는 기본 300px(`spacing.dialog-max-width`인
  320px보다 작음) 고정이지만, 2단계만 문장이 길어 마지막 어절이 혼자
  줄바꿈되는 문제가 있어 2단계에 한해 320px(`spacing.dialog-max-width`와
  동일 값 재사용)로 넓히고 `break-keep`(단어 중간 줄바꿈 방지)을 적용했습니다.
  1단계와 화살표·스포트라이트·버튼 위치 계산은 영향 없음.
  - **단계별 버튼 구성**: 버튼 영역은 `flex items-center justify-center gap-5`.
    1단계는 "건너뛰기"(`text-[13px] font-medium text-white/70`, `finish` 호출) +
    "다음"(`button-48 rounded-full bg-point type-button text-white`,
    `handlePrimary`) 두 개를 나란히 둡니다. 2단계는 "건너뛰기"를 렌더링하지
    않고 "시작하기" 버튼만 남깁니다 — `justify-center`가 전체 너비(`blockWidth`)
    기준으로 중앙 정렬하므로, 자식이 하나여도 추가 레이아웃 코드 없이 그 버튼이
    가로 중앙에 옵니다. 두 단계 모두 같은 버튼 스타일·클릭 동작(`handlePrimary` →
    2단계에서는 `finish` 호출)을 그대로 씁니다.
- `SocialLoginButtons` — Google·Apple 로그인 버튼 세로 묶음(`gap-2`). 로그인 중인
  provider만 "이동 중..."으로 라벨이 바뀌고, 응답을 기다리는 동안 두 버튼 모두
  `disabled`. `/login`, `/mypage`(비로그인 상태)에서 재사용.

## Do's and Don'ts

- Do: 색은 `globals.css`에 정의된 토큰 클래스(`bg-point`, `text-muted`,
  `border-border-subtle` 등)로 쓴다.
- Do: 고정 요소는 `inset-x-0 mx-auto max-w-[430px]`로 앱 컬럼에 맞추고
  하단에는 `env(safe-area-inset-bottom)`을 더한다.
- Do: 버튼·입력창은 `rounded-xl`, 카드는 `rounded-2xl`, 칩·뱃지는 `rounded-full`을 쓴다.
- Do: 누를 수 있는 요소에는 `active:` 피드백을, 비활성에는 `disabled:opacity-60`을 준다.
- Do: 텍스트 버튼은 `button-48 type-button`을 쓰고 색·테두리·radius·좌우 패딩만 따로 준다. `py-*`·`text-[..]`·`font-*`로 높이와 글자를 다시 지정하지 않는다.
- Don't: 컴포넌트에 hex 값을 직접 쓰지 않는다 (`text-[#9CA3AF]` 같은 사례를 늘리지 않는다).
- Don't: 기존 14단계에 없는 새 글자 크기를 추가하지 않는다.
- Don't: 그림자를 정적인 카드에 쓰지 않는다 — 떠 있는 요소에만 쓴다.
- Don't: shadcn/ui 등 UI 라이브러리를 임의로 설치하지 않는다.

## Inconsistencies

통일하지 않고 그대로 기록한 불일치 항목입니다.

### 색상

- **destructive 토큰 부재** — 에러 문구·삭제 버튼이 Tailwind 기본 `red-500`을
  17곳에서 직접 사용.
- **읽은 기사 색 불일치** — 같은 행에서 제목은 `text-[#9CA3AF]`(하드코딩),
  뱃지는 `text-foreground/40` (`LatestNewsList`, `SectorBadge`).
- **2차 텍스트 색이 두 계열** — `text-muted`(63회)와 `text-foreground/70`·`/80`
  (22회)이 비슷한 역할에 혼용.
- **`background`의 이중 역할** — 페이지 배경과 입력창·칩의 채움색이 같은 토큰.
  `--muted`는 이름과 달리 텍스트 색.

### 타이포그래피

- **로드되지 않은 굵기 사용** — `font-extrabold`(800, 2회)를 쓰지만 800은
  로드하지 않아 Black(900)으로 대체 렌더링됨(Chrome에서 "내 기록" 제목 확인).
  900은 이 대체 용도 외에 `font-black`으로는 쓰이지 않음. (`font-semibold`는
  600을 로드하면서 이 항목에서 빠짐.)
- **0.5px 단위 크기** — 11.5 / 12.5 / 13.5 / 14.5px이 정수 단계와 뒤섞여 14단계.
- **같은 크기의 두 가지 표기** — `text-xs`와 `text-[12px]`, `text-sm`과
  `text-[14px]`, `text-base`와 `text-[16px]`. Tailwind 프리셋은 행간까지
  지정하므로 결과도 미세하게 다름.
- **콘텐츠 제목 크기** — 기사 상세 19px vs 기록 상세 18px.
- **섹션 제목 표기** — `type-section-title`은 섹터 라벨에만 연결돼 있고, 기록
  상세·마이페이지의 14px Bold 섹션 제목은 아직 `text-[14px] font-bold`를 직접 씀
  (결과는 같음). `type-header-title`도 마찬가지로 URL 단계 안내 제목에만 연결돼
  있고, BackHeader 제목·프로필 이름·평가 완료 문구는 `text-[16px] font-bold`를 직접 씀.

### 컴포넌트

- **Button** — primary 버튼 중 4곳에 `active:bg-point-dark` 누락
  (`record/complete` 2곳, `reflection`, `LoginPrompt`). 텍스트 버튼의 높이·글자는
  `button-48 type-button`으로 통일됨. 버튼 범위에서 뺀 작은 인라인 액션
  (용어 카드 "삭제" 12px, 완료 화면 링크형 12.5px, 온보딩
  "건너뛰기" 13px)은 각자 크기를 유지.
- **Chip** — 같은 스타일이 4개 파일에 복제(글자는 `type-chip`으로 통일). 메모 힌트 칩만 12.5px.
- **Input** — 한 줄 input 높이는 `h-[50px]`로 통일됨. 좌우 패딩은 `px-4` /
  `px-3.5`(용어 검색) 2종, textarea 패딩은 `px-4 py-3` / `px-3.5 py-3` 2종.
- **Card** — 패딩 3종(`p-3.5`, `px-4 py-3.5`, `p-4`). 마이페이지 "내 활동"
  채움 박스만 `rounded-2xl`(다른 채움 박스는 `rounded-xl`).
- **Confirm Dialog** — 동일 마크업이 3개 페이지에 복제.
- **Bottom Sheet** — 셸(overlay + 컨테이너)이 3개 컴포넌트에 복제.
  Escape 닫기는 `FirstRecordLoginPromptSheet`에만 구현.
- **닫기 아이콘** — 시트 18px vs 배너 16px. 아이콘 `strokeWidth` 4종.
- **FAB 아이콘-텍스트 간격** — `TermDictionaryButton`만 `gap-0`(0px, 2026-10-20부터).
  BottomNav는 같은 "아이콘 위 + 라벨 아래" 구성에 `gap-0.5`(2px)를 씀.
- **FAB 라벨 크기·굵기** — `TermDictionaryButton`의 "사전" 라벨만
  10px/semibold(2026-10-20부터, 신규 크기 단계). BottomNav는 같은 자리에
  12px/medium `type-nav-label`을 씀 — 더 이상 이 토큰을 공유하지 않음.
- **하단 오프셋** — `7.5rem`, `4rem + 0.5rem`, Toast의 `4rem + 1.25rem` /
  `1.25rem`이 inline style 매직 넘버로 흩어져 있음(토큰을 참조하지 않고 각자
  숫자로 적힘). 전부 BottomNav 크기를 직접 더한 값이라 BottomNav 크기가
  바뀌면 함께 고쳐야 함 — 2026-10-17 BottomNav 콘텐츠 높이를 56px→64px로
  바꾸면서 이 값들을 전부 +0.5rem(nav 쪽 항만) 올렸지만, 여러 파일에 나뉜
  숫자를 손으로 맞추는 구조 자체는 바뀌지 않았음(Bottom Navigation → "의존
  값" 표 참고). `RecordFab`·`FabButton`은 이후 모두 삭제되어 이 숫자들에서
  빠졌습니다.
- **Toast**
  - "서버 요청 성공 뒤 표시"는 로그인 사용자에게만 해당합니다. 비로그인
    사용자는 localStorage 저장이 끝난 뒤 표시됩니다.
  - Supabase 삭제(`records.ts`의 `deleteRecord`)는 지워진 행이 0개여도 오류를
    내지 않아, 실제로 삭제되지 않은 경우에도 삭제 토스트가 뜰 수 있습니다.
  - 오프셋은 경로만 보고 정합니다. 홈에서 ArticleReturnBanner가 보일 때는
    배너와 겹칠 수 있습니다.
  - 퇴장 애니메이션과 수동 닫기가 없습니다.
  - `foreground`를 배경색으로 쓰는 사례 2곳 중 하나입니다(다른 곳은 텍스트
    색) — 나머지 하나는 2026-10-18부터 `ArticleReturnBanner`(아래
    "그 외 공통 컴포넌트" 참고).
- **미사용 컴포넌트** — `NewsCarousel`(및 이를 통해서만 쓰이는 `NewsCard`)은
  어디에서도 import하지 않음. **2026-10-24**: 이 둘의 가로 스크롤 카드
  레이아웃은 새 `HotNewsSection`/`HotNewsCard`(Components → Card → "HOT
  뉴스 카드")가 패턴만 가져다 썼을 뿐, `NewsCarousel`/`NewsCard` 자체는
  여전히 import되지 않습니다.

## 향후 토큰화가 필요한 항목

1. `destructive`, `primary-foreground`, `overlay` — CSS 변수 추가.
2. 읽음(dimmed) 텍스트 색과 2차 텍스트 색 — 하나의 역할 토큰으로 정리.
3. 글자 크기 스케일 — 14단계를 역할 기반 스케일로 축소.
4. 폰트 굵기 — 로드 weight와 사용 클래스 일치.
5. 그림자(`sheet`, FAB)와 z-index 계층.
6. 레이아웃 상수 — 앱 최대 폭 430px, 바 높이 56px, 하단 오프셋.
7. 공통 컴포넌트 추출 후보 — Button, Input/Textarea, Chip, BottomSheet, ConfirmDialog.
