# 네이티브 앱(Capacitor) 작업 현황

뉴스노트는 지금 웹 MVP 개발에 집중하기로 했고, 이 문서를 쓴 시점에 만들어둔 Capacitor/네이티브 코드는 보관 상태입니다. 웹 코드와는 분리되어 있고, 웹 빌드/실행에 영향을 주지 않습니다. 나중에 네이티브 앱 개발을 다시 시작할 때 이 문서부터 읽으세요.

## 1. 앱용 파일과 의존성

**루트 파일/디렉터리** (Capacitor CLI가 기대하는 표준 위치라 옮기지 않았습니다):
- `capacitor.config.ts` — `server.url`로 네이티브 WebView가 라이브 Next.js 서버를 그대로 띄우도록 설정 (이유는 파일 내 주석 참고)
- `capacitor-shell/index.html` — Capacitor의 `webDir` 요구사항을 채우기 위한 placeholder. 실제로는 표시되지 않음
- `android/`, `ios/` — `npx cap add android`, `npx cap add ios`로 생성된 네이티브 프로젝트

**웹과 분리된 네이티브 전용 모듈** (`src/lib/native/`):
- `article-webview.ts` — `@capgo/capacitor-inappbrowser`의 `openWebView`/`updateDimensions`/`close`를 감싼 래퍼. 플러그인은 동적 `import()`로만 불러와서, 이 함수가 호출되지 않으면(=웹에서는 호출되지 않음) 플러그인 JS 자체가 로드되지 않습니다.
- `use-native-article-webview.ts` — 위 래퍼를 쓰는 React 훅. `isNativePlatform()`이 false면 완전히 no-op.
- `google-auth.ts` — `@capacitor/browser`(시스템 브라우저로 OAuth 열기)와 `@capacitor/app`(딥링크 콜백 수신)을 동적 `import()`로 감싼 래퍼.

**경계 유틸리티** (웹/네이티브 공통, 가볍고 아이소모픽한 `@capacitor/core`만 사용):
- `src/lib/platform.ts` — `isNativePlatform()`, `NATIVE_AUTH_CALLBACK_URL`

**네이티브에서만 쓰는 지점**:
- `src/lib/auth-context.tsx` — `isNativePlatform()`이 true일 때만 `src/lib/native/google-auth.ts`를 동적 import
- `src/app/record/new/external/page.tsx` — `useNativeArticleWebView()` 훅 호출 (내부적으로 native 전용 분기)

**package.json 의존성** (dependencies):
```
@capacitor/core@^8.5.2
@capacitor/ios@^8.5.2
@capacitor/android@^8.5.2
@capacitor/app@^8.1.2
@capacitor/browser@^8.0.5
@capgo/capacitor-inappbrowser@^8.21.1
```
devDependencies: `@capacitor/cli@^8.5.2`

**웹에서 플러그인이 로드되지 않는다는 검증**: `npm run build` 후 `.next/static/chunks`를 뒤져보면 `@capgo/capacitor-inappbrowser` 관련 코드가 별도 청크 파일 하나에만 들어있고, `/record/new/external` 페이지의 서버 렌더링 HTML에는 그 청크 파일명이 `<script>`/`<link rel="preload">` 어디에도 나타나지 않습니다 — 즉 웹에서는 아예 요청되지 않는 코드입니다. 이건 실제로 확인한 사실입니다.

## 2. 구현된 부분 / 미구현 부분

**구현됨** (코드가 존재하고, 타입체크·lint·빌드를 통과함):
- Capacitor 프로젝트 스캐폴딩 (`capacitor.config.ts`, `android/`, `ios/` — 둘 다 `npx cap add`가 성공적으로 생성)
- 기사 전용 네이티브 WebView 코드 (`openWebView` + 위치/크기 지정 + 패널 높이에 맞춰 `updateDimensions`로 리사이즈 + `close`로 정리)
- 네이티브 Google 로그인 코드 (시스템 브라우저로 열기 → `appUrlOpen` 딥링크 수신 → `exchangeCodeForSession`)

**미구현 / 확정되지 않음**:
- 네이티브 프로젝트의 커스텀 URL 스킴(`com.newsnote.app://auth/callback`) 등록이 iOS `Info.plist`/Android manifest에 실제로 반영됐는지 확인 안 됨 (Capacitor가 `appId` 기준으로 기본 스킴을 설정해주는 것으로 알지만, 직접 열어서 확인하지 않았습니다)
- Supabase 대시보드의 Auth → URL Configuration → Redirect URLs에 네이티브 콜백 URL 추가 — 대시보드 작업이라 여기서 할 수 없음
- iOS 15 이하에서의 `persistWebViewData`/`useSharedDataStore` 동작 차이 (플러그인 문서가 "iOS 17+" 기준으로 설명하는 부분이 있음)
- 네이티브 WebView의 정확한 픽셀 단위(포인트 vs 픽셀) — 플러그인 문서상 `openWebView`의 width/height는 "screen/window points", `updateDimensions`은 "pixels"로 설명이 달라서, 실기기에서 좌표가 어긋날 가능성이 있습니다. 실제 기기 확인 전까지는 추정입니다.
- `useSharedDataStore`/`persistWebViewData: false` 조합이 실제로 호스트 앱 쿠키와 분리되는지는 플러그인 **소스 코드**(iOS Swift)를 읽고 확인한 것이고, 런타임으로 검증한 것은 아닙니다.

## 3. 실제로 검증한 것 / 아직 실행 못 한 것

**검증함** (이 환경에서 직접 실행/확인):
- `npx cap add android`, `npx cap add ios` 둘 다 성공 (CocoaPods 없이도 iOS가 스캐폴딩된 건, 이 Capacitor 버전이 플러그인 의존성 해석에 Swift Package Manager를 쓰기 때문으로 보입니다 — `Package.swift` 생성 로그로 확인)
- 웹 빌드(`npm run build`)와 타입체크·lint가 네이티브 코드 추가 후에도 깨지지 않음
- 네이티브 플러그인 코드가 웹 청크에 안 들어가는 것 (위 1번 항목 참고)
- `@capgo/capacitor-inappbrowser`의 Android/iOS 소스를 직접 읽어서: 기본적으로 호스트 앱에 네이티브 기능 브리지를 주지 않고(`window.mobileApp.postMessage`만 존재하되 우리 쪽에서 리스너를 안 붙이면 무해), 쿠키/저장소가 기본값에서 호스트와 분리된다는 것을 코드 레벨로 확인

**아직 실행 못 함** (이 환경에 Xcode 앱·CocoaPods·Android SDK·에뮬레이터/시뮬레이터가 전혀 없어서):
- 네이티브 앱을 실제로 빌드/실행해본 적 없음 (시뮬레이터·에뮬레이터·실기기 전부)
- 기사 네이티브 WebView가 실제로 뜨는지, 위치/크기가 맞는지
- 네이티브 Google 로그인이 끝까지 동작하는지 (시스템 브라우저 → 딥링크 복귀 → 세션 생성)
- 키보드 열림/패널 리사이즈가 네이티브에서 실제로 어떻게 보이는지

## 4. 나중에 재개할 때 필요한 도구·설정·실행 순서

**필요한 도구**:
- iOS: Xcode **앱 전체** (커맨드라인 툴만으론 빌드 불가), 필요 시 CocoaPods
- Android: Android Studio + Android SDK (에뮬레이터 포함)

**설정**:
1. `capacitor.config.ts`의 `server.url`을 상황에 맞게 변경
   - iOS 시뮬레이터: `http://localhost:3000` (호스트와 네트워크 공유)
   - Android 에뮬레이터: `http://10.0.2.2:3000` (호스트 루프백 별칭)
   - 실기기(둘 다): 맥의 LAN IP (`ipconfig getifaddr en0`), 같은 Wi-Fi 필요
   - 프로덕션 전: 배포된 HTTPS 도메인으로 교체, `cleartext` 제거
2. Supabase 대시보드 → Auth → URL Configuration → Redirect URLs에 `com.newsnote.app://auth/callback` 추가

**실행 순서**:
```bash
npm run dev                 # Next.js 서버 먼저 실행
npx cap sync android        # 또는 ios — config/플러그인 변경 후 항상 실행
npx cap open android        # 또는 ios — Android Studio/Xcode 열림
# 각 IDE에서 Run
```

## 5. 재개 시 확인 체크리스트

**기사 WebView**
- [ ] 네이버 뉴스 등 X-Frame-Options로 막는 기사 URL이 네이티브 WebView에서 실제로 열리는지
- [ ] 위치/크기가 화면 레이아웃과 맞는지 (points vs pixels 단위 문제 없는지)
- [ ] 뒤로가기/링크 클릭 등 WebView 내 탐색이 정상인지
- [ ] close() 호출 시 실제로 정리되는지 (메모리 누수 없는지)

**작성 패널**
- [ ] peek/expanded 전환이 자연스러운지
- [ ] 패널이 올라올 때 네이티브 WebView가 겹치지 않고 정확히 줄어드는지
- [ ] "기사로 돌아가기"로 접었다가 다시 열어도 입력 유지되는지

**키보드**
- [ ] 키보드가 열렸을 때 저장 버튼/입력창이 가려지지 않는지
- [ ] iOS/Android 양쪽에서 동작이 다른지 확인

**OAuth**
- [ ] "로그인" 탭 시 시스템 브라우저(SFSafariViewController/Custom Tabs)가 열리는지
- [ ] Google 로그인 완료 후 앱으로 정상 복귀(딥링크)되는지
- [ ] 세션이 생성되고 `useAuth()`가 로그인 상태를 반영하는지
- [ ] Supabase Redirect URLs에 네이티브 콜백이 등록되어 있는지

이 문서에 적힌 내용 중 "검증함"이라고 쓴 것만 실제로 확인된 사실이고, 나머지는 코드 작성 시점의 의도/추정입니다. 재개 시 반드시 하나씩 실기기/시뮬레이터로 다시 확인하세요.
