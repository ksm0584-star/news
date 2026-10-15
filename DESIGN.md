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
  page-title: { fontSize: 20px, fontWeight: extrabold } # text-xl
  content-title: { fontSize: 18px, fontWeight: bold, lineHeight: snug }
  sheet-title: { fontSize: 17px, fontWeight: bold }
  header-title: { fontSize: 16px, fontWeight: bold }
  section-title: { fontSize: 14px, fontWeight: bold }
  button: { fontSize: 16px, fontWeight: semibold, lineHeight: 24px } # type-button = Figma type-16-semibold
  body: { fontSize: 14px, fontWeight: normal, lineHeight: 24px } # leading-6
  body-sm: { fontSize: 13.5px }
  label: { fontSize: 14px, fontWeight: semibold } # 입력창·textarea 라벨. 섹터 라벨은 13px
  caption: { fontSize: 12.5px }
  meta: { fontSize: 12px } # text-xs
  micro: { fontSize: 11.5px }
  nav-label: { fontSize: 11px, fontWeight: medium }
rounded:
  lg: 8px # rounded-lg · /webview-test에서만 사용
  xl: 12px # rounded-xl · 버튼, 입력창, 채움 박스
  2xl: 16px # rounded-2xl · 카드, 다이얼로그, 썸네일
  3xl: 24px # rounded-t-3xl · 바텀시트 상단만
  full: 9999px # rounded-full · 칩, 뱃지, 아이콘 버튼, FAB
spacing:
  app-max-width: 430px # max-w-[430px]
  page-gutter: 20px # px-5
  card-padding-x: 16px # px-4
  card-padding-y: 14px # py-3.5
  stack-gap: 8px # gap-2
  bar-height: 56px # h-14 · BackHeader, BottomNav
  dialog-max-width: 320px # max-w-[320px]
shadows:
  sm: "shadow-sm" # 앱 컬럼
  lg: "shadow-lg" # FAB, 배너, 팝오버/드롭다운, 토스트
  sheet: "0 -8px 24px rgba(0,0,0,0.12)" # 바텀시트
zIndex:
  dropdown: 10
  banner: 20
  bar: 30 # BackHeader, BottomNav, RecordFab
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
    height: 56px
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

`globals.css`의 `:root`에 CSS 변수 7개가 있고 `@theme inline`으로 Tailwind
색상(`bg-point`, `text-muted` 등)에 매핑됩니다.

| 역할 토큰 | 현재 코드 이름 | 값 | 사용처 |
| --- | --- | --- | --- |
| `background` | `--background` | `#f4f5f7` | body 배경, 입력창·칩·뱃지·정보 박스 채움, `active:` 눌림 배경 |
| `foreground` | `--foreground` | `#19202b` | 기본 텍스트 |
| `surface` | `--surface` | `#ffffff` | 앱 컬럼, 헤더, 하단 내비, 시트, 다이얼로그 |
| `primary` | `--point` | `#3182f6` | CTA 배경, 선택 상태, 링크, 활성 탭, focus 테두리 |
| `primary-pressed` | `--point-dark` | `#1b64da` | `active:bg-point-dark` 전용 |
| `muted-foreground` | `--muted` | `#8b95a1` | 보조 텍스트, 비활성 탭, 닫기 아이콘 |
| `border` | `--border-subtle` | `#eef0f3` | 카드·입력창 테두리, 구분선 |

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

Google 로고의 4색(`#FFC107` 등)은 브랜드 에셋이므로 토큰이 아닙니다.

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
클래스를 직접 쓰면 프리셋 행간이 함께 바뀌므로 쓰지 않음). 예외로 `type-button`은
규칙상 행간 24px을 역할에 포함합니다.

| 역할 | 클래스 | 크기 | 굵기 | 행간(기존 값 유지) | 사용 범위 |
| --- | --- | --- | --- | --- | --- |
| 기사 제목 | `type-article-title` | 14px | Semibold 600 | 홈 뉴스 카드 `leading-snug`(1.375 → 19.25px), 내 기록 카드 상속(1.5 → 21px) | 홈 최신 뉴스 목록(`LatestNewsList`), 내 기록 목록(`RecordCard`) |
| 텍스트 버튼 | `type-button` (Figma `type-16-semibold`) | 16px | Semibold 600 | **24px 지정**(`--spacing` × 6, `leading-6`과 같은 값) | 텍스트 버튼 라벨 전체. 높이·정렬은 `button-48`과 함께 씀(Components → Button) |
| 입력창 내부 텍스트 | `type-input` | 16px | Medium 500 | textarea `leading-6`(24px), 한 줄 input·평가 의견 상속(1.5 → 24px) | 모든 제품 input·textarea의 입력값과 placeholder: URL, 기록 제목(2), 용어 검색, 나의 메모, 기사 정리, 투자에 적용하기, 평가 의견. `/webview-test` 제외 |

- 색상은 역할에 포함하지 않습니다. 기사 제목은 `text-foreground`(홈은 읽은 기사
  `#9CA3AF`), 입력창은 `text-foreground`를 요소에서 그대로 지정합니다.
- **기사 제목과 라벨 구분**: 입력창 위 "제목 *"은 기사 제목이 아니라 라벨입니다
  (`text-[14px] font-semibold`, Input 섹션 참조). 크기·굵기가 같아도
  `type-article-title`을 쓰지 않습니다.
- **역할 밖의 제목**: 기사 상세 `h1`(19px bold), 기록 상세 `h1`(18px bold)은 페이지
  제목이라, 완료·회고 화면의 비교 카드 제목(13px semibold)은 메모를 보조하는
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
| 18px | 3 | 기록 제목, 온보딩 제목 — bold, `leading-snug` |
| 17px | 5 | 시트·완료·로그인 제목 — bold |
| 16px (`text-base` 포함) | 4 + 역할 37 | 텍스트 버튼(`type-button`, semibold, 29곳), 입력값·placeholder(`type-input`, medium, 8곳), BackHeader 제목, 프로필 이름 — bold |
| 15px | 10 | 다이얼로그·섹션 제목(bold) |
| 14.5px | 4 | 용어 이름(semibold·bold), 마이페이지 로그인 안내(semibold), 기사 본문(`/article/[id]`) |
| 14px (`text-sm` 포함) | 33 + 역할 2 | 본문, 기사 제목(`type-article-title`), 입력창 라벨(semibold), 카드 제목, 섹션 제목, 원문 보기 링크 |
| 13.5px | 16 | 시트 본문, 메뉴 항목, 토스트 |
| 13px | 39 | 섹터 라벨(semibold), 칩(medium), 설명, 에러 |
| 12.5px | 14 | 캡션, 에러, 작은 링크 |
| 12px (`text-xs` 포함) | 21 | 뱃지, 메타 정보(언론사·날짜) |
| 11.5px | 4 | 글자 수, 면책 문구 |
| 11px | 3 | 하단 내비 라벨 — medium |

굵기는 `font-semibold`(23, 역할 스타일 제외), `font-medium`(28), `font-bold`(28),
`font-extrabold`(2)를 쓰고, 행간은 `leading-6`(본문·textarea),
`leading-snug`(제목), `leading-5`, `leading-7`, `leading-none`을 씁니다.
자간(`tracking-*`)은 쓰지 않습니다.

## Layout

전역 spacing 토큰은 없고 Tailwind 기본 스케일(1 step = 4px)을 그대로 씁니다.

- **앱 컬럼**: `mx-auto max-w-[430px] bg-surface`. `fixed` 요소(내비, FAB,
  시트, 배너)도 같은 `inset-x-0 mx-auto max-w-[430px]`로 컬럼에 맞춥니다.
- **좌우 여백**: 페이지 `px-5`(20px, 51회), 카드·입력창 내부 `px-4`(16px, 35회).
- **세로 패딩**: 카드 `py-3.5`(14px), textarea `py-3`(12px), 칩 `py-1.5`(6px).
  텍스트 버튼(`button-48`, 48px)과 한 줄 입력창(`h-[50px]`)은 세로 패딩 대신
  높이로 고정합니다.
- **간격**: `gap-2`(8px)가 기본(35회). 그 외 `gap-3`, `gap-1.5`, `gap-2.5`.
- **고정 바**: BackHeader와 BottomNav 모두 `h-14`(56px).
- **Safe area**: 하단 고정 요소는 `env(safe-area-inset-bottom)`을 더하고, 탭
  화면 본문은 `paddingBottom: calc(7rem + env(safe-area-inset-bottom))`을 inline
  style로 줍니다.
- **z-index**: 10(드롭다운) · 20(배너) · 30(헤더/내비/FAB) · 40(사전 버튼) ·
  50(시트/다이얼로그/온보딩/토스트).

## Elevation & Depth

깊이는 주로 테두리와 `background` 채움으로 표현하고, 그림자는 3종류만 씁니다.

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `sm` | `shadow-sm` | 앱 컬럼 |
| `lg` | `shadow-lg` | RecordFab, TermDictionaryButton, ArticleReturnBanner, 드롭다운 메뉴, 안내 팝오버, Toast |
| `sheet` | `0 -8px 24px rgba(0,0,0,0.12)` | 바텀시트 3종 |

BackHeader는 그림자 대신 `bg-surface/95 backdrop-blur` + 하단 테두리를 씁니다.
확인 다이얼로그에는 그림자가 없고 `overlay`만 있습니다.

## Shapes

| 토큰 | 값 | 사용 횟수 | 사용처 |
| --- | --- | --- | --- |
| `xl` | 12px | 43 | 버튼, 입력창, 채움 박스, 드롭다운, 리스트 썸네일 |
| `2xl` | 16px | 22 | 카드, 확인 다이얼로그, 대표 이미지, EmptyState |
| `full` | 9999px | 22 | 칩, 뱃지, 아이콘 버튼, FAB, pill 버튼, 아바타 |
| `3xl` | 24px | 3 | 바텀시트 상단(`rounded-t-3xl`) |
| `lg` | 8px | 2 | `/webview-test` 전용 |

### Icons

아이콘 라이브러리 없이 inline SVG를 씁니다. 공통 규칙은 `viewBox="0 0 24 24"`,
`fill="none"`, `stroke="currentColor"`, round cap/join입니다. 크기는
22px(하단 내비·사전 버튼), 24px(FAB), 20px(뒤로가기), 18/16px(닫기),
18px(원문 보기 화살표), 32px(별점)이고 `strokeWidth`는 2(11회)가 기본,
1.8(4회), 2.5(3회), 1.5가 섞여 있습니다. 이미지는 `next/image`를 씁니다.

## Components

공통 컴포넌트로 분리된 것과 각 화면에 inline으로 반복 작성된 것을 구분해
기록합니다. 상태는 `active:`, `disabled:`, `focus:`, 선택(selected)만
존재하며 `hover:`와 `focus-visible:`은 어디에도 없습니다.

### Button — 공통 스타일 `button-48` + `type-button` (컴포넌트 없음)

터치 가능한 액션. 버튼 컴포넌트는 없고, 텍스트 버튼은 `src/app/globals.css`의
공통 스타일 두 개를 참조합니다. "원문 보기"만 예외로 공통 컴포넌트
(`ArticleOriginalLink`)가 있습니다(아래 참고).

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
| primary | `rounded-xl bg-point text-white` (+`active:bg-point-dark`) | 기록 작성 "다음"·"저장", 외부 기록 저장·"URL 다시 입력하기", 기사 상세 "메모 기록하기", 완료 화면 "확인"·"완료", 회고 "저장", 평가 "의견 보내기", 첫 기록 로그인 시트, LoginPrompt "로그인하기"(`px-5`), 용어 "검색"(`px-4`) |
| primary-pill | `rounded-full bg-point text-white px-4`/`px-5` | ArticleReturnBanner "기록하기", OnboardingGuide "다음"·"시작하기" |
| outline | `rounded-xl border border-border-subtle` (+`bg-surface`) | Google 로그인(아이콘 + `gap-2`), 다이얼로그 "취소", 회고 "취소", 용어 "다시 시도"(`px-4`) |
| ghost | `rounded-xl text-muted`, 배경 없음 | 시트 "다음에 할게요"·"나중에 할게요", 완료 화면 "나중에 하기" |
| destructive | `rounded-xl bg-red-500 text-white` | 삭제·탈퇴 확인 다이얼로그 |
| choice | `rounded-xl border`, 선택 시 `border-point bg-point text-white` / 비선택 `border-border-subtle text-foreground/80` | 회고 비교 선택 (완료, 회고 화면) |

- **상태**: 기본·눌림(`active:`)·비활성(`disabled:opacity-60`)·로딩(라벨만
  "저장 중..." 등으로 바뀜)·선택(choice) 모두 같은 요소라 높이와 글자가 같습니다.
- **나란히 놓기**: 다이얼로그의 두 버튼은 `flex gap-2` + `flex-1`. 입력창 옆
  "검색"은 줄을 `flex items-center`로 두어 50px 입력창 세로 가운데에 맞춥니다.
- **적용 범위**: 위 표의 텍스트 버튼 29곳(`<button>`과 버튼 모양 `<Link>`).
- **결정 사항 (2026-10-15)**: ghost(보조) 버튼과 primary-pill 버튼도 의도적으로
  같은 규칙(48px, 16px / 600)을 씁니다. 보조 버튼은 색(`text-muted`)으로만 주 버튼과
  구분하며, 작게 만들려고 크기·굵기를 따로 지정하지 않습니다.
- **제외 범위** (각자 스타일 유지)
  - 아이콘 전용 버튼 — 뒤로가기, 닫기, 더보기, 별점(`h-8`·`h-9` 등)
  - FAB — RecordFab, TermDictionaryButton
  - 칩·탭 — 섹터·메모 힌트 칩, CategoryTabs
  - 하단 내비게이션 — BottomNav
  - 일반 링크·인라인 텍스트 액션 — "원문 보기"(`ArticleOriginalLink`), 완료
    화면 "수정", 안내 팝오버 "닫기", 온보딩 "건너뛰기", 용어 카드 "삭제"
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
- **사용법**: `className`에는 바깥 여백 같은 레이아웃만 넘깁니다(`mt-1` 등).

  ```tsx
  <ArticleOriginalLink href={record.url} onClick={handleOpen} className="mt-1" />
  ```

- **사용 화면**: 기록 상세(`/record/[id]`, 제목 아래), 외부 기사 기록
  작성·수정(`/record/new/external`, `ArticleOpenExternalBar`의 ⓘ 안내 버튼 왼쪽).
- **규칙**: 원문을 여는 링크는 이 컴포넌트를 재사용하고, 문구·스타일을 화면별로
  따로 만들지 않습니다.

### Input / Textarea — 공통 컴포넌트 없음 (inline)

기록 제목·메모, URL, 용어 검색, 평가 의견 입력.

- **기본 스타일 (한 줄 input)**: `rounded-xl border border-border-subtle bg-background
  h-[50px] px-4 type-input text-foreground outline-none focus:border-point`.
  높이는 50px 고정(border 포함, `box-sizing: border-box`)이고 세로 패딩은 두지
  않습니다. 텍스트는 브라우저가 input 안에서 세로 가운데 정렬합니다.
- **Textarea**: 높이 고정 없이 `rows`로 크기를 정합니다. `px-4 py-3 type-input
  leading-6 resize-none`(기록 메모·기사 정리·투자에 적용하기),
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
  input·textarea 위 라벨(제목, 기사 정리, 투자에 적용하기, 나의 메모)에 씁니다.
  **한 줄·여러 줄 입력창의 라벨 아래 간격은 8px**(`mb-2`, 부모 `gap` 없이 라벨
  자체 여백으로 관리)입니다. "나의 메모"처럼 라벨과 입력창 사이에 안내문·칩이
  있으면 라벨 바로 아래만 8px이고, 그 아래 요소들의 기존 여백은 그대로 둡니다.
  라벨이 없는 입력창(URL, 용어 검색, 평가 의견)에는 라벨·여백을 추가하지 않습니다.
  크기만 14px이고 굵기·색·여백은 그대로이며, 행간은 지정하지 않아 상속됩니다
  (`typography.body`의 `leading-6`은 적용하지 않음). 칩 그룹 위 "섹터 *" 라벨은
  입력창 라벨이 아니므로 `mb-1.5 text-[13px]`(6px 간격)을 유지합니다.
- **토큰**: `background`, `foreground`, `border`, `primary`, `destructive`, `rounded.xl`.
- **사용 화면**: RecordFormFields(`/record/new`), ExternalRecordFields
  (`/record/new/external`), TermDictionarySheet, RatingPromptSheet.

### Card

목록 항목과 정보 묶음.

| Variant | 스타일 | 구현 | 사용 화면 |
| --- | --- | --- | --- |
| outlined | `rounded-2xl border border-border-subtle` | `RecordCard`, `EconomicTermHistoryCard`, LatestNewsList 항목(inline), 마이페이지 메뉴(inline) | 내 기록, 검색한 용어, 홈, 마이페이지 |
| filled | `rounded-xl bg-background px-4 py-3.5` | inline | 기록 상세 메모, 용어 검색 결과 |
| highlighted | `rounded-2xl border border-point/30 bg-point/5 p-4` | inline | 완료·회고 화면의 "지금의 생각" |
| dashed | `rounded-2xl border border-dashed border-border-subtle px-6 py-10` | `EmptyState` | 내 기록, 검색한 용어, 홈 |
| floating | outlined + `bg-surface p-4 shadow-lg` | `ArticleReturnBanner` | 홈 |

- **Size**: 패딩이 `p-3.5` / `px-4 py-3.5` / `p-4` 세 가지.
- **State**: 링크형 카드만 `active:bg-background`.
- **토큰**: `surface`, `background`, `border`, `primary`, `rounded.2xl`, `rounded.xl`.

### Badge / Chip

- **Badge** — `SectorBadge` (공통). 기사·기록의 분야 표시. `rounded-full
  bg-background px-2.5 py-1 text-xs font-medium text-foreground/70`.
  Variant: 기본 / `muted`(`text-foreground/40`, 읽은 기사). 사용: 홈, 내 기록,
  기록 상세·완료·회고, 기사 상세.
- **Chip** — 공통 컴포넌트 없음 (inline). 분야·메모 힌트 선택. `rounded-full
  px-3 py-1.5 text-[13px] font-medium`. State: 선택 `bg-point text-white` /
  비선택 `bg-background text-foreground/70`. 사용: CategoryTabs,
  RecordFormFields(분야, 메모 힌트), ExternalRecordFields.
- **토큰**: `background`, `foreground`, `primary`, `primary-foreground`, `rounded.full`.

### Tabs

- `CategoryTabs` (공통). 홈 뉴스 목록의 분야 필터. `role="tablist"`, 방향키
  이동 지원, 가로 스크롤(`no-scrollbar`).
- 시각 스타일은 Chip과 동일. Variant·Size 없음. State: 선택 / 비선택.
- 사용 화면: 홈(LatestNewsList).

### Dialog / Bottom Sheet

| 종류 | 스타일 | 구현 | 사용 화면 |
| --- | --- | --- | --- |
| Bottom Sheet | `fixed bottom-0 max-w-[430px] rounded-t-3xl bg-surface p-5` + `shadows.sheet`, safe-area 하단 패딩 | `RatingPromptSheet`, `FirstRecordLoginPromptSheet`, `TermDictionarySheet` (각자 셸을 직접 작성) | 기록 완료·상세, 마이페이지, 외부 기록 작성 |
| Confirm Dialog | 중앙 정렬, `max-w-[320px] rounded-2xl bg-surface p-5`, 버튼 2개(outline + destructive) | inline 3곳 | 기록 상세(삭제), 마이페이지(탈퇴), 검색한 용어(삭제) |
| Popover / Menu | `rounded-xl border border-border-subtle bg-surface shadow-lg z-10` | inline 2곳 | 기록 상세 더보기 메뉴, ArticleOpenExternalBar 안내 |

- 공통: `fixed inset-0 z-50` + `bg-black/40` overlay, `role="dialog"`.
- **Size**: Bottom Sheet는 내용 높이(용어 사전만 `max-h-[80dvh]`), Dialog는 320px 고정.
- **State**: 열림/닫힘만 존재. 진입·퇴장 애니메이션 없음.
- **토큰**: `surface`, `overlay`, `border`, `rounded.3xl`, `rounded.2xl`, `shadows.sheet`.

### Bottom Navigation

- `BottomNav` (공통, `layout.tsx`에서 마운트). `/`, `/records`, `/mypage`에서만 노출.
- `fixed bottom-0 max-w-[430px] h-14 border-t border-border-subtle bg-surface`,
  safe-area 하단 패딩. 탭 3개(뉴스·내 기록·마이페이지), 22px 아이콘 +
  `text-[11px] font-medium` 라벨.
- Variant·Size 없음. State: 활성 `text-point` / 비활성 `text-muted`.
- **토큰**: `surface`, `border`, `primary`, `muted-foreground`.

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
    `calc(3.5rem + 0.75rem + 3.5rem + 0.75rem + env(safe-area-inset-bottom))`.
    순서대로 BottomNav 높이, RecordFab 간격, RecordFab 높이, 간격입니다.
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

### 그 외 공통 컴포넌트

- `BackHeader` — `sticky top-0 h-14 border-b bg-surface/95 backdrop-blur`,
  뒤로가기 + 16px bold 제목 + 우측 슬롯. 탭 화면을 제외한 9개 화면.
- `EmptyState` — dashed 카드. 제목 14px semibold + 설명 13px muted.
- `LoginPrompt` — 로그인 유도 블록 (검색한 용어).
- `OnboardingGuide` — 스포트라이트 코치마크 (`rgba(0,0,0,0.72)`).

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
- **FAB 그림자 색** — `shadow-black/25`(RecordFab), `shadow-black/10`
  (TermDictionaryButton), `shadow-point/30`(FabButton).

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
- **섹션 제목 크기** — 홈 "최신 경제뉴스" 15px vs 마이페이지·기록 상세 14px.

### 컴포넌트

- **Button** — primary 버튼 중 4곳에 `active:bg-point-dark` 누락
  (`record/complete` 2곳, `reflection`, `LoginPrompt`). 텍스트 버튼의 높이·글자는
  `button-48 type-button`으로 통일됨. 버튼 범위에서 뺀 작은 인라인 액션
  (용어 카드 "삭제" 12px, 안내 팝오버 "닫기"·완료 화면 링크형 12.5px, 온보딩
  "건너뛰기" 13px)은 각자 크기를 유지.
- **Chip** — 같은 스타일이 4개 파일에 복제. 메모 힌트 칩만 12.5px.
- **Input** — 한 줄 input 높이는 `h-[50px]`로 통일됨. 좌우 패딩은 `px-4` /
  `px-3.5`(용어 검색) 2종, textarea 패딩은 `px-4 py-3` / `px-3.5 py-3` 2종.
- **Card** — 패딩 3종(`p-3.5`, `px-4 py-3.5`, `p-4`). 마이페이지 "내 활동"
  채움 박스만 `rounded-2xl`(다른 채움 박스는 `rounded-xl`).
- **Confirm Dialog** — 동일 마크업이 3개 페이지에 복제.
- **Bottom Sheet** — 셸(overlay + 컨테이너)이 3개 컴포넌트에 복제.
  Escape 닫기는 `FirstRecordLoginPromptSheet`에만 구현.
- **닫기 아이콘** — 시트 18px vs 배너 16px. 아이콘 `strokeWidth` 4종.
- **하단 오프셋** — `7rem`, `3.5rem + 0.75rem`, `3.5rem + 0.5rem`, `5rem`,
  Toast의 `3.5rem + 0.75rem + 3.5rem + 0.75rem` / `1.25rem`이 inline style
  매직 넘버로 흩어져 있음. Toast 오프셋은 BottomNav·RecordFab 크기를 직접
  더한 값이라 두 요소의 크기가 바뀌면 함께 고쳐야 함.
- **Toast**
  - "서버 요청 성공 뒤 표시"는 로그인 사용자에게만 해당합니다. 비로그인
    사용자는 localStorage 저장이 끝난 뒤 표시됩니다.
  - Supabase 삭제(`records.ts`의 `deleteRecord`)는 지워진 행이 0개여도 오류를
    내지 않아, 실제로 삭제되지 않은 경우에도 삭제 토스트가 뜰 수 있습니다.
  - 오프셋은 경로만 보고 정합니다. `/mypage`에는 FAB이 없지만 FAB 높이만큼
    떠 있고, 홈에서 ArticleReturnBanner가 보일 때(FAB 숨김)는 배너와 겹칠 수
    있습니다.
  - 퇴장 애니메이션과 수동 닫기가 없습니다.
  - `foreground`를 배경색으로 쓰는 유일한 사례입니다(다른 곳은 텍스트 색).
- **미사용 컴포넌트** — `FabButton`, `NewsCarousel`(및 이를 통해서만 쓰이는
  `NewsCard`)은 어디에서도 import하지 않음.

## 향후 토큰화가 필요한 항목

1. `destructive`, `primary-foreground`, `overlay` — CSS 변수 추가.
2. 읽음(dimmed) 텍스트 색과 2차 텍스트 색 — 하나의 역할 토큰으로 정리.
3. 글자 크기 스케일 — 14단계를 역할 기반 스케일로 축소.
4. 폰트 굵기 — 로드 weight와 사용 클래스 일치.
5. 그림자(`sheet`, FAB)와 z-index 계층.
6. 레이아웃 상수 — 앱 최대 폭 430px, 바 높이 56px, 하단 오프셋.
7. 공통 컴포넌트 추출 후보 — Button, Input/Textarea, Chip, BottomSheet, ConfirmDialog.
