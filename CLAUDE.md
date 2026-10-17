@AGENTS.md

## UI 작업 시 디자인 시스템

화면·컴포넌트·스타일을 새로 만들거나 수정하기 전에 반드시 `DESIGN.md`를 먼저 읽고 따른다.

- 색상은 `src/app/globals.css`에 정의된 토큰 클래스를 쓴다. DESIGN.md의 역할 이름과 실제 클래스 대응: `primary` → `point`, `primary-pressed` → `point-dark`, `muted-foreground` → `muted`, `border` → `border-subtle`, `background`, `foreground`, `surface`.
- 글자 크기·굵기, radius, spacing, 그림자, z-index는 DESIGN.md에 기록된 기존 값 안에서 고른다. 새 값을 만들지 않는다.
- 공통 컴포넌트가 있으면 재사용한다. 예: `ArticleOriginalLink`(원문 보기), `showToast`·`queueToast`(토스트), `SectorBadge`, `BackHeader`, `EmptyState`.
- 공통 컴포넌트가 없는 요소(버튼, 입력창, 칩, 바텀시트, 확인 다이얼로그)는 DESIGN.md Components 섹션의 기존 스타일을 그대로 맞춘다.
- DESIGN.md의 Do's and Don'ts를 지키고, Inconsistencies 섹션의 불일치를 새로 늘리지 않는다.
- UI의 스타일·동작을 바꿨다면 같은 작업에서 DESIGN.md도 실제 구현에 맞게 갱신한다.
