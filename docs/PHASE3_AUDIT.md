# FishingKing 3-01 — 기존 프로젝트 및 모바일 대응 감사

확인일: 2026-10-25 (Asia/Seoul). 적용 기준: 사용자 공통 개발 지침 v3.1.
판정: **3-01 현황 감사 완료. 기존 메뉴 UI 검사는 통과했으나 모바일 게임 요구사항 전체를 충족한 상태는 아님.**
새 화면·게임 로직·디자인·서비스 연결은 구현하지 않았으며 다음 실행 단위로 자동 진행하지 않습니다.

## 1. 범위와 보존 확인

- AGENTS.md, docs/ROADMAP_STATUS.md, docs/HANDOFF.md 및 이전 2단계 구현/검증 이력을 확인했습니다.
- 1·2단계는 확정된 저장 정책 기준 완료. 3단계의 디자인/그래픽/입력 구현은 아직 없습니다.
- 현재 브랜치 main, HEAD `006ca9286bcdb9b993b271d6c76d778f23b467bc`.
- origin fetch/push: `https://github.com/jwlee8303-sys/FishingKing.git`.
- 로컬 추적 ref origin/main과 HEAD의 ahead/behind는 0/0. 이번에 fetch하지 않았으므로 원격 서버 최신 상태 재검증과 구분합니다.
- 감사 시작 시 추적 파일 수정 9개, 미추적 파일 6개가 이미 있었습니다. 깨끗한 작업 트리가 아니며 모두 보존했습니다.
- 기존 수정: .gitignore, AGENTS.md, docs/ARCHITECTURE.md, docs/DEPENDENCIES.md,
  docs/HANDOFF.md, docs/ROADMAP_STATUS.md, package.json, package-lock.json, src/services/README.md.
- 기존 미추적: docs/DEPLOYMENT.md, docs/EXTERNAL_SERVICES.md, docs/MCP_CONNECTIONS.md,
  docs/PHASE2_AUDIT.md, src/services/assets.ts, src/types/assets.ts.
- 이번 제품/기존 문서 수정은 없음. 산출물은 이 문서이며 감사 스크립트·JSON·스크린샷은 Git 제외 .local/phase3-01-audit*에만 생성했습니다.
- 브라우저 검사 전 기존 추적/미추적 파일의 SHA-256을 기록했고 검사 후 변경 파일은 0개였습니다.
- GitHub/Supabase/Cloudflare/Penpot/MCP를 재구축하거나 인증·배포·운영 설정을 변경하지 않았습니다.
  R2는 사용자 결정에 따른 의도적 보류, Cloudinary는 미연결, Supabase Storage는 필요 시 검토라는 정책을 유지합니다.
- 인증정보·쿠키·토큰·비밀번호를 조회/출력하는 진단은 하지 않았습니다.

## 2. 설치 환경

아래는 package.json 기재만이 아니라 `npm ls ... --depth=0`으로 실제 설치를 확인한 결과입니다(exit 0).

| 항목 | 설치 버전 |
| --- | --- |
| Node.js | 24.22.0 |
| Vite | 8.3.4 |
| React / React DOM | 19.3.1 / 19.3.1 |
| TypeScript | 6.0.3 |
| Tailwind CSS / @tailwindcss/vite | 4.3.3 / 4.3.3 |
| PixiJS | 8.22.0 |
| @playwright/test | 1.64.1 |
| 검사에 사용한 Chrome | 155.0.8059.86 |

TypeScript strict/noUnusedLocals/noUnusedParameters는 유지되어 있습니다. 패키지 설치/업데이트·잠금 파일 변경은 하지 않았습니다.
이전 실행에서 npm run check(typecheck/lint/unit 3개/build)와 Pages 정적 에셋 검증이 통과한 이력을 확인했습니다.
이번 감사에서 해당 결과를 새로 실행한 것으로 표시하지 않습니다.

## 3. 화면·컴포넌트·라우터·엔진 현황

| 대상 | 현재 구현 |
| --- | --- |
| src/main.tsx | StrictMode, BrowserRouter, global.css 로드 |
| src/App.tsx | 공통 AppLayout 아래 /, /game, /collection, /ranking, /login, wildcard 404 |
| AppLayout | 제목, 본문 바로가기, NavLink 메뉴 5개, Outlet, footer |
| PagePlaceholder | 준비 상태·제목·설명을 표시하는 공통 카드 |
| Home/Game/Collection/Ranking/Login | 모두 준비 화면. 낚시·인증·도감·랭킹 기능 미구현 |
| NotFoundPage | 404 제목과 홈 복귀 링크 |
| src/game/types.ts | GameRenderer 타입에 Application 참조와 destroy 계약만 존재 |
| PixiJS 런타임 | Application 생성/init, canvas, scene, ticker, sprite, resize 구현 없음 |
| 게임 입력 인터페이스 | 캐스팅/릴 감기/입질 명령, Pointer 입력 어댑터 모두 없음 |

React UI와 향후 PixiJS의 디렉터리 경계는 있으나 게임 엔진 자체가 동작하는 상태는 아닙니다.
모의 입력·리사이즈·상태 보존도 앞으로 지정되는 실행 단위의 구현 범위입니다.
완전한 낚시 루프는 5단계 범위를 유지합니다.

## 4. PC 현황과 실제 검증

설정을 바꾸지 않는 Vite 임시 개발 서버와 Playwright Chrome headless로 기존 앱을 검사했습니다.
사용자 로그인 프로필에 연결하거나 기존 Chrome 인증 데이터를 사용하지 않는 독립 테스트 컨텍스트입니다.
검사 후 테스트 브라우저·Vite 서버를 종료했습니다.

| PC 검사 | 결과 |
| --- | --- |
| 1440×900 홈 로드 | HTTP 200, FishingKing 제목 표시 |
| 마우스 메뉴 이동 | /game, /collection, /ranking, /login, / 모두 PASS |
| 각 경로 새로고침 | 페이지 제목 유지, PASS |
| 중첩 미등록 경로 | 404 표시 후 홈 복귀 PASS |
| 가로 스크롤 | 위 5개 화면에서 document.scrollWidth = 1440, 넘침 없음 |
| 키보드 | Tab으로 본문 이동 링크 접근, Enter 후 main 포커스 PASS |
| 콘솔/페이지 예외 | 관찰된 error 0개 |
| 헤더 배치 | row, 제목·메뉴 모두 표시 |

게임 캔버스/게임 상태/입력 폼이 없으므로 PC 게임 조작과 로그인 입력 동작은 검증할 수 없습니다.
이번 검사는 기존 Playwright 전체 스위트 재실행이 아니라 감사용 읽기·조작 시나리오입니다.

## 5. 모바일 세로/가로 현황

### 현재 CSS와 viewport

- index.html: `width=device-width, initial-scale=1.0`.
- maximum-scale/user-scalable 제한 없음. 사이트 전체 확대/터치 제스처를 무조건 차단하지 않습니다.
- viewport-fit=cover는 없고 safe-area-inset-* CSS도 없습니다.
- global.css: body margin 0, min-width 320px, 공통 focus-visible 표시.
- AppLayout: min-h-dvh, w-full/max-w-5xl, 헤더 flex-col → sm:flex-row, 메뉴 flex-wrap.
- 카드/본문에 sm: padding·폰트 분기가 있습니다. 기기별 별도 게임 레이아웃은 없습니다.
- orientation media query/Screen Orientation 강제 잠금은 없습니다. 가로 모드를 강제하지 않습니다.
- 모바일에서 body touch-action은 auto, overflow는 visible입니다. 게임 조작 영역 전용 정책은 아직 없습니다.

### 실제 모바일 에뮬레이션

실제 휴대폰이 아닌 Windows의 Chrome 모바일 에뮬레이션입니다. isMobile=true, hasTouch=true, DPR=3.
Safari/iOS를 재현했다고 표시하지 않습니다.

| 검사 | 세로 390×844 | 가로 844×390 |
| --- | --- | --- |
| 홈 로드 | HTTP 200 | HTTP 200 |
| 터치로 주요 메뉴 5개 접근 | PASS | PASS |
| 각 화면 직접 새로고침 | PASS | PASS |
| 404 후 터치로 홈 복귀 | PASS | PASS |
| 5개 화면 가로 스크롤 | 없음, documentWidth=390 | 없음, documentWidth=844 |
| 메뉴 좌우 잘림 | 측정된 링크 5개 모두 viewport 안 | 측정된 링크 5개 모두 viewport 안 |
| 콘솔/페이지 error | 0개 | 0개 |
| 헤더 배치 | column | row |
| 이미지/canvas/입력 폼 | 각각 0개 | 각각 0개 |

세로·가로 홈 스크린샷을 직접 열어 확인했습니다. 제목·메뉴·카드·footer가 렌더링됩니다.
짧은 가로 화면에서는 콘텐츠가 한 화면보다 길 수 있어 일반 세로 스크롤이 필요합니다. 스크롤 가능한 내용과 잘림을 구분합니다.
별도 게임 HUD/고정 조작 버튼은 없어 해당 영역의 잘림은 아직 평가할 수 없습니다.

추가 /game 폭·높이 조사:

| CSS viewport | documentWidth | 가로 넘침 |
| --- | --- | --- |
| 320×568 | 320 | 없음 |
| 360×640 | 360 | 없음 |
| 667×375 | 667 | 없음 |
| 568×320 | 568 | 없음 |

body min-width가 320px이므로 320px 미만 화면 지원을 보장하지 않습니다.

### 터치 목표 크기 — 권장 44×44 CSS px 미달

세로·가로·PC에서 동일한 크기가 관찰됐습니다.

| 메뉴 | 폭×높이(CSS px) | 44×44 충족 |
| --- | --- | --- |
| 홈 | 38×40 | 미달 |
| 낚시 / 도감 / 랭킹 | 각 52×40 | 높이 미달 |
| 로그인 | 66×40 | 높이 미달 |

탭 작동 여부는 PASS이나 권장 터치 크기 충족을 의미하지 않습니다. 이번 단위에서는 수정하지 않았습니다.

## 6. 모바일 특별 조사 10개 항목

| 항목 | 조사 결과 / 판정 |
| --- | --- |
| 1. viewport | 기본 모바일 메타 있음. viewport-fit 및 Safe Area 연동 없음 |
| 2. CSS 반응형 | sm 분기·flex-wrap·min-h-dvh 있음. 기존 메뉴 UI의 기본 반응형 동작 확인 |
| 3. 세로/가로 | 두 방향 메뉴/페이지 접근 PASS, 가로 강제 없음. 모바일 게임 레이아웃은 없음 |
| 4. canvas resize | canvas/Application이 없어 미구현. renderer.resize/resizeTo/ResizeObserver 없음 |
| 5. 터치/마우스 | 브라우저 기본 링크 클릭/탭만 동작. 앱의 게임 Pointer/touch/mouse 핸들러 없음 |
| 6. 가로 스크롤/잘림 | 검사 크기에서 가로 넘침/메뉴 좌우 잘림 없음. 44px 목표·짧은 화면 스크롤은 후속 설계 필요 |
| 7. 회전 후 유지 | CDP로 390×844→844×390→390×844: /game·낚시 제목·동일 main DOM 노드 유지, 가로 넘침 없음. 게임 장면 상태 보존은 미검증 |
| 8. Safe Area | viewport-fit=cover/env(safe-area-inset-*) 없음. 실제 노치·홈 인디케이터 대응 미검증 |
| 9. 게임/스크롤 충돌 | body touch-action:auto로 전역 차단 없음. 게임 영역이 없어 충돌/영역별 정책은 평가 불가 |
| 10. 테스트 환경 | Chrome 에뮬레이션 가능. Playwright 기본 Chromium/WebKit/Firefox 실행 파일은 현재 기본 경로에 없음. 실제 Android/iPhone 미검증 |

추가 v3.1 항목:

- CDP로 두 손가락 touchStart → touchCancel을 발생시켜 touchstart·pointerdown·pointercancel(포인터 2개) 관찰.
  /game 준비 화면은 예외 없이 유지됐지만 게임 취소·멀티터치 배제/추적 기능은 없습니다. 게임 조작 PASS로 표시하지 않습니다.
- 손가락 영역 이탈/pointer capture/lostpointercapture 처리 미구현·미검증.
- 캐스팅·릴 감기·입질 반응·모의 입력 상태 전이는 미구현.
- 로그인 화면에 input/textarea가 없어 가상 키보드·visualViewport·입력 포커스 시 가림 여부를 검사할 수 없습니다.
- 배터리·발열·FPS 제한·백그라운드 ticker 중지는 미구현/미측정. 현재 Pixi 렌더링 루프가 없는 사실과 구분합니다.
- 이미지 로딩·디코딩·오류 대체는 현재 UI에 이미지가 없어 이번 모바일 시나리오에서 검증하지 않았습니다.

## 7. 에셋 현황과 설계/구현 차이

| 항목 | 현재 상태 |
| --- | --- |
| public/assets | images/fish/backgrounds/icons/audio, 각 .gitkeep만 있음. 실제 SVG/WebP/물고기/배경 없음 |
| src/types/assets.ts | AssetDirectory와 폴더/상대 경로 기반 AssetPath만 구현 |
| src/services/assets.ts | getAssetUrl: VITE_ASSET_BASE_URL 또는 BASE_URL+assets/와 상대 경로 결합 |
| 컴포넌트/게임의 이미지 URL | 실제 이미지 사용·하드코딩 없음. getAssetUrl 호출 소비자도 아직 없음 |
| 저장소 독립 논리 Asset ID | HANDOFF에 설계만 존재, AssetId/등록부 미구현 |
| AssetManifest | 미구현 |
| AssetResolver | 이름 있는 독립 계약/모듈 미구현. 현재 함수는 경로 결합 일부 역할만 수행 |
| AssetProvider | 미구현 |
| 로딩 오류 대체 | 미구현 |
| 비공개 에셋 | 현재 파일 없음. 별도 인증 제공자/분리 구조 미구현, Pages 공개 디렉터리에 비공개 파일을 두면 안 됨 |

이전 2단계에서 임시 SVG/WebP 복사·HTTP·바이트·디코딩과 base 경로 조합을 검증했습니다.
그 이력은 정적 제공 구조의 검증이며 이번 모바일 화면 이미지 로딩/오류 대체 검증을 대신하지 않습니다.
Cloudinary/R2 제공자 구현이나 Supabase Storage 업로드가 이미 연결된 것으로 표현하지 않습니다.

## 8. Cloudflare Pages·Vite base와 배포 구조

- 이번 로컬 Vite resolveConfig 조회: base `/`, publicDir `D:/FishingKing/public`, outDir `dist`, SSR=false.
- vite.config.ts에는 React/Tailwind 플러그인만 있고 명시 base/배포 호스트 변경 설정은 없습니다.
- 배포 구조는 public/assets → Vite dist/assets → 기존 Pages 정적 제공입니다.
- 이번 Cloudflare 기존 대시보드 읽기 조회: 프로젝트 fishingking, Git 저장소 jwlee8303-sys/FishingKing,
  build command npm run build, output dist, root 기본값, production branch main, automatic deployments Enabled.
- 배포 설정을 클릭해 변경하지 않았고 Git push/새 배포/새 프로젝트/요금 활성화가 없습니다. 확인용 탭은 닫았습니다.
- 이전 검증 이력: 기존 Preview success 및 전체 커밋 SHA 일치, Production /assets JS·CSS HTTP 200.
  이번 모바일 검사는 로컬 개발 서버 대상이므로 Pages 운영 모바일 검사와 구분합니다.
- 기존 .env 실제 값/배포 비밀/전역 MCP 원문은 조회하지 않았습니다.

## 9. Penpot MCP 읽기·쓰기 기능과 세션

| 항목 | 확인 결과 |
| --- | --- |
| 서버 | 기존 공식 Remote MCP 재사용, 재설치/키 발급/새 연결 설정 없음 |
| 실제 읽기 | execute_code의 getter와 penpotUtils 읽기 유틸리티 호출 성공 |
| 연결 파일 | 새 파일 1 / 685eebd9-2ce2-80a4-8008-d7b0b4e16646 |
| 현재 페이지 | Page 1 / 685eebd9-2ce2-80a4-8008-d7b0b4e16647 |
| 페이지/레이어 | 페이지 1개, Root Frame(board)의 children=[] |
| 디자인 라이브러리 | components/colors/typographies 각 0개, tokenOverview={} |
| API 안내 | penpot_api_info 호출 성공. createRectangle는 content:write 권한을 요구하는 쓰기 API로 안내됨 |
| 쓰기 가능 기능 | execute_code를 통한 도형 생성/속성 변경·라이브러리/토큰 변경 API가 도구/API 안내에 노출됨 |
| 쓰기 실제 검증 | 미실행. 현재 인증의 실제 쓰기 성공이나 read-only 강제 제한을 단정하지 않음 |
| export_shape | PNG/SVG export 도구 노출 확인, 이번에는 실행하지 않음 |

연결 프로젝트명/ID는 기존 인수인계의 FishingKing - MCP 연결 검증 / 5009c98b-0fb2-816e-8008-d7b0732aaceb입니다.
이번 MCP에서 파일/페이지 ID가 인수인계와 일치함을 재확인했습니다. 프로젝트 ID 자체는 이번에 별도 재조회하지 않았습니다.
File/Page/Shape 생성·수정·삭제·이름 변경·토큰 변경을 하지 않았습니다.

## 10. 테스트 결과와 증거

실행: `node .local/phase3-01-audit.mjs`, exit 0.

| 구분 | 결과 / 범위 |
| --- | --- |
| PC 감사 시나리오 | PASS: 기존 메뉴·라우팅·새로고침·404·키보드 본문 이동·레이아웃·콘솔 |
| 모바일 세로 감사 시나리오 | PASS: 기존 메뉴 탭·라우팅·새로고침·404·가로 넘침·콘솔 |
| 모바일 가로 감사 시나리오 | PASS: 위 기존 화면 범위 동일 |
| 추가 4개 viewport | 가로 넘침 없음 관찰 |
| 회전 에뮬레이션 | 경로/준비 화면/동일 main 유지 확인. 게임 상태 보존 판정 불가 |
| 44×44 권장 터치 크기 | 미달: 높이 40px, 홈 폭 38px. 자동 검사 실패를 숨긴 것이 아니라 감사에서 발견한 요구사항 차이 |
| Safe Area/게임 입력/에셋 오류 대체 | 미구현. PASS 처리하지 않음 |
| 전체 npm check / 기존 E2E 스위트 | 이번 미실행. 감사 스크립트 PASS와 이전 실행 결과를 구분 |
| 실제 Android Chrome / iPhone Safari | 미실행 |

증거(로컬 Git 제외): .local/phase3-01-audit/result.json, baseline.json,
desktop.png, mobile-portrait.png, mobile-landscape.png. 테스트 서버 주소는 result.json의 임시 주소이며 종료 후 재사용을 가정하지 않습니다.

## 11. 미완료 사항·수동 검증·다음 단위

후속 지정 단위에서 다룰 사항:

- 터치 목표 크기·모바일 세로/가로의 게임/HUD 레이아웃, Safe Area 및 가상 키보드 대응.
- React/PixiJS 독립 입력 인터페이스, Pointer capture/취소/이탈/멀티터치 규칙과 모의 게임 입력 검증.
- 상태를 보존하는 canvas resize, 자원 정리·백그라운드/부하 관리 기반.
- Asset ID/Manifest/Resolver/Provider, 비공개 파일 분리, 실제 이미지와 로딩 실패 대체.
- 실제 기기 회전/주소창·홈 인디케이터·키보드·핀치/스크롤·성능 검증.

사용자 수동 작업: 이번 감사 완료를 위해 필요한 작업은 없습니다. 실제 Android/iPhone 합격 판정을 위해서는
후속 구현 후 각 실제 기기에서 검증이 필요합니다. 인증정보 제공/서비스 재연결은 필요 없습니다.

**다음 실행 단위 진행 가능: 가능.** 이번 감사에서 개발을 막는 의존성/기존 연결 장애는 관찰하지 않았습니다.
다만 모바일 게임 지원 완료로 간주하지 않으며, 다음 단위의 작업 범위를 사용자에게 받은 뒤 진행합니다.
