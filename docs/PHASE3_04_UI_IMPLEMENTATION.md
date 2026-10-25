# FishingKing 3-04 — React·Tailwind 모바일 UI 구현

확인일: 2026-10-25 (Asia/Seoul). **3-04 UI 구현 완료, 3-05 인수인계 가능.**
실행 주소: http://127.0.0.1:5173/ (기존 개발 서버 재사용). 운영 배포·commit/push 없음.

## 1. 조사·설계 비교와 변경 경계

AGENTS, ROADMAP_STATUS, HANDOFF, PHASE3_AUDIT, SCREEN_DESIGN, MOBILE_GAME_UX,
DESIGN_SYSTEM, PENPOT_MCP_WORKFLOW와 docs/design JSON을 확인했습니다.
기존 main/미커밋 변경을 유지하고 시작 시58개 파일의 SHA-256을 .local/phase3-04/baseline.json에 기록했습니다.
기존 화면은 준비 카드였고 /profile이 없었습니다. 기존 AppLayout/Outlet/NavLink/라우트/404를 확장해 실제 시각 UI를 연결했습니다.
새 서비스·의존성·인증·DB·운영 설정 변경은 없습니다.

Penpot 기존 Remote MCP의 currentFile/getPages/라이브러리 토큰/컴포넌트 구조/대표 게임 프레임을 읽기 전용 재조회했습니다.
파일 ID `685eebd9-2ce2-80a4-8008-d7b0b4e16646`과 Design System·Components·Screens·Mobile Game 페이지 ID가 3-03 manifest와 일치합니다.
토큰63·컴포넌트38·세로/가로 HUD 및 조작 치수를 확인했고 모든 토큰 값은 로컬 스냅샷과 일치했습니다.
증거: Git 제외 `.local/phase3-04/penpot-read.json`. 이번 실행에 Penpot 생성/수정/삭제 호출은 없습니다.

## 2. 토큰 매핑

설치된 Tailwind CSS는 4.3.3입니다. 공식 v4 [Theme variables](https://tailwindcss.com/docs/theme)의 `@theme inline` 방식을 사용했습니다.
원본은 docs/design/tokens.draft.json, 생성 CSS는 src/styles/tokens.css, 소비·Tailwind 별칭은 src/styles/global.css입니다.

- **63개 전체를 CSS 변수로 등록**했습니다. 이번 테마/스타일에서 직접 참조하는 토큰은 **51개**입니다.
- 나머지12개는 regular, icon.sm, layout.mobile/tablet/desktop, touch.panel/sceneMin, layer.content/hud/sheet/alert, motion.normal입니다.
  기준 viewport·후속 스타일용으로 값을 보존하며 모두 화면 동작에 사용한다고 표현하지 않습니다.
- `fk.color.primary` → `--fk-color-primary` → `--color-fk-primary` → `bg-fk-primary` 규칙입니다.
- 점은 하이픈으로, camelCase는 kebab-case로 변환합니다. 예: touch.groupGap → --fk-touch-group-gap.
- 색상12, 폰트/크기/간격/반경/그림자, 버튼44/48/60, 아이콘16/20/24, HUD56/44, 터치132/128/8/12 등 값을 재사용합니다.
- motion 숫자는 CSS에서 ms, layer는 단위 없는 정수, composite shadow는 CSS 그림자로 변환합니다.
- 폰트는 Noto Sans KR 우선·system-ui/sans-serif 폴백입니다. 웹폰트 파일/외부 폰트 서비스는 연결하지 않았습니다.
- 스냅샷 갱신은 **수동**입니다. `node scripts/sync-design-tokens.mjs`로 CSS 생성,
  `node scripts/sync-design-tokens.mjs --check`로 일치 여부를 확인합니다. Penpot 실시간/양방향 동기화는 없습니다.

## 3. Penpot → React 컴포넌트

| Penpot | React 파일·구현 |
| --- | --- |
| AppHeader / DesktopNavigation / MobileNavigation | components/layout/AppHeader.tsx. 공통 navigation.ts와 기존 NavLink 재사용 |
| PrimaryButton / SecondaryButton / IconButton | components/ui.tsx. 공통 기반·normal/active/disabled/focus-visible |
| StatusBadge / Modal / InputField / LoadingState / EmptyState / ProfileCard | components/ui.tsx. 명시적 props·시맨틱 label·dialog·상태 |
| FishCard / RankingRow | components/content.tsx. 발견된 시연 자료·반응형 표 |
| GameHUD / CastButton / ReelButton / HookButton / DirectionControl | components/game/GameControls.tsx. React DOM의 표시 상태만 관리 |

Penpot 기본19종을 구현했으며 추가19개 상태 자산은 별도 중복 컴포넌트 대신 공통 props/CSS로 처리했습니다.
Modal은 native dialog의 포커스 제한·Escape·닫기와 원래 트리거 포커스 복귀를 사용합니다.
AppLayout의 본문 바로가기/Outlet, 기존 페이지·라우트 이름, 404 홈 복귀를 유지했습니다.
PagePlaceholder는 게임 메뉴의 준비 안내에 재사용하고 다른 데이터 오류/빈 상태와 구분했습니다.

## 4. 실제 화면과 데이터 의미

| 경로 | 실제 동작·시각 상태 |
| --- | --- |
| / | 낚시 시작·도감/랭킹/내 정보·로그인·비회원 진입, CSS 낚시터·발견 안내 |
| /game | 전용 HUD·장면 예약 영역·방향/캐스팅/릴/입질·메뉴, 눌림/해제/취소 표시, 입질·로딩·오류 시연 |
| /collection | 기본 발견 목록0건, 검색/수역 필터, 명시적으로 켠 발견 시연 카드·상세 dialog, 검색0건/발견0건/로딩/오류 |
| /ranking | 모의 목록, 전체/어종별·기간 초안 선택, PC 표/모바일 축약 행, 로딩/빈 화면/오류 |
| /profile | 신규 경로, 비회원·로그인 상태 예시, 사용자/발견/포획 슬롯·동작 감소 설정 |
| /login | 계정 입력·필드 오류·인증 미연결 안내·회원가입 안내 dialog·비회원 계속 |
| 기타 경로 | 기존 404·홈 복귀 유지 |

자료는 실제 DB/계정/전체 어종 목록이 아닙니다. 도감은 발견된 시연 자료만 사용하며 미발견 이름·실루엣·전체 종 수를 노출하지 않습니다.
프로필 기록 미연결은 대시로 표시합니다. 로그인 상태 예시는 실제 세션을 만들지 않습니다.
입력값은 서버 전송/저장/로그 출력하지 않고 실제 비밀번호 입력을 요구하지 않습니다.
랭킹 표시 순서는 fixture이며 집계·순위 계산·운영 정책을 구현한 것이 아닙니다.

## 5. 모바일·접근성 구현

- 일반 페이지: 정상 문서 스크롤·하단5메뉴, 태블릿/PC 및 짧은 가로 화면에서는 상단 메뉴. 모든 메뉴 대상 최소44.
- 게임 세로: HUD56, 독립된 중앙 장면, 상태 줄, 하단272px 조작 그룹. 132px D-pad와 128px ActionPad, 행동60px/간격8px.
- 게임 가로: HUD44, 좌측 방향132/중앙 장면/우측 행동128. 상태는 축약 HUD에도 보이며 장면과 버튼이 겹치지 않습니다.
- PC: 장면·우측 조작·도움말. 높이가 짧으면 도움말을 먼저 줄입니다.
- viewport-fit=cover와 네 방향 env(safe-area-inset-*)·기본 padding의 큰 값을 적용했습니다.
  게임은 100svh/100dvh, 일반 shell은 min-height:100dvh입니다. 고정 가로 모드/전체 줌 금지는 없습니다.
- 직접 조작 버튼에만 touch-action:none, 전역 preventDefault/touch-action 차단은 없습니다.
- DOM 버튼의 pointer capture·up/cancel/이탈 및 키보드 Space/Enter에 따른 표시를 구현했습니다.
  blur/resize/VisualViewport resize·scroll/hidden/메뉴 진입 시 표시를 취소합니다. 글로벌 게임 단축키는 아직 없습니다.
- 로그인 입력16px, 폼 스크롤 유지, input 포커스 시 하단 메뉴를 접어 입력을 가리지 않게 했습니다.
- reduced-motion 시스템 설정과 프로필 화면의 동작 감소 표시를 지원합니다. 설정은 저장하지 않습니다.

**위 입력은 UI 표시 수명만 다룹니다.** 3-08의 명령 reducer/역할별 소유권·캐스팅 commit/disarmed 전체 계약,
멀티터치 우선순위·키 C/R/E·Pixi 좌표 변환·세션 보존·physics는 미구현입니다. 표시 해제를 실제 게임 판정으로 사용하지 않습니다.
한 손 도달성·가상 키보드·주소창·노치·배터리/성능의 실기기 합격도 주장하지 않습니다.

## 6. 에셋 연결 준비

components/AssetVisual.tsx로 이미지 사용 지점을 모았습니다. 실제 경로가 전달되면 기존 getAssetUrl(AssetPath)을 사용하고
이미지 실패 시 동일 영역의 CSS 대체 표시를 제공합니다. 현재 소비자는 path를 전달하지 않아 외부/가짜 이미지 URL 요청이 없습니다.
3-05에서는 이 seam에 공개 SVG/WebP를 연결할 수 있습니다. Manifest/Resolver/Provider를 구현한 것으로 표시하지 않습니다.
기존 src/services/assets.ts·src/types/assets.ts는 변경하지 않았고 Pages 기본/R2 보류/Cloudinary 미연결 정책을 유지했습니다.

## 7. 검증

최종 명령·종료 결과는 HANDOFF 최신 3-04 절을 따릅니다.
최종 npm run check exit0, Playwright24개 통과 exit0, 토큰 CSS --check 및 git diff --check exit0을 확인했습니다.
시작58개 파일의 SHA-256 비교에서 범위 밖 변경0, 기존19개 수정·10개 추가와 UTF-8 검증을 확인했습니다.
증거는 `.local/phase3-04/verification.json`에 있습니다. Git의 줄바꿈 안내는 공백 검사 실패가 아닙니다.

| 대상 | 수행 범위 |
| --- | --- |
| npm.cmd run check | TypeScript 전체 프로젝트 → ESLint → Vitest5개 → Vite build |
| Playwright | Chrome, 6 viewport×4 시나리오 = 24개 |
| 라우팅 | 홈·6개 화면 메뉴·직접 새로고침·404·본문 바로가기·활성 링크 |
| 레이아웃 | 가로 넘침 없음, 화면 내 보이는 인터랙션 대상44px, 게임 버튼 간/장면과 겹침 없음 |
| 조작 | 터치 메뉴, CDP touchStart/touchCancel, PC 마우스 이탈, Space 누름/해제·viewport 변경 후 해제 |
| 상태 | 게임 입질·오류/재시도·disabled, 로그인 오류/비회원, dialog Escape·포커스 복귀 |
| Safe Area | 메타/CSS 적용 및 에뮬레이션의 기본 여백 검사. 실제 노치의 nonzero inset 검증은 미수행 |
| PNG | PC 메인·모바일 세로/가로 게임 육안 확인, 테스트별 스크린샷 저장 |
| 콘솔 | 6개 경로 회귀 시 관찰된 pageerror/console error0 |

viewport: 320×568 / 390×844 / 430×932 / 844×390 / 768×1024 / 1440×900.
전부 Windows Chrome 에뮬레이션입니다. 실제 Android/iPhone·iOS Safari·물리 키보드 출현 검사는 미실행입니다.
첫 E2E는17/18 통과: 이미 가로인 화면에 같은 viewport를 지정한 테스트가 resize를 기대해 실패했습니다.
다른 방향으로 실제 크기를 바꾸도록 수정하고 직접 터치 취소·상태 검사까지 확장한24개 실행은 통과했습니다.
초기 lint의 토큰 스크립트 URL 전역 누락은 node:url 명시적 import로 수정했습니다. 검사 규칙을 완화하지 않았습니다.
NO_COLOR/FORCE_COLOR 및 Git 줄바꿈 안내는 실제 검사 실패와 구분합니다.

재현: 기존 로컬 dev 서버를 실행한 상태에서 아래 명령을 사용합니다.

```powershell
npm.cmd run check
node scripts/sync-design-tokens.mjs --check
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:5173'
npm.cmd run test:e2e -- --workers=2
git diff --check
```

## 8. 변경 파일·3-05 인수인계

추가: components/ui.tsx, AssetVisual.tsx, content.tsx, layout/AppHeader.tsx, layout/navigation.ts,
game/GameControls.tsx, pages/ProfilePage.tsx, styles/tokens.css, scripts/sync-design-tokens.mjs, 이 문서.
수정: App.tsx, AppLayout.tsx, PagePlaceholder.tsx, 기존6개 페이지, global.css, index.html,
playwright.config.ts, tests/unit/App.test.tsx, tests/e2e/smoke.spec.ts, DESIGN_SYSTEM/SCREEN_DESIGN/MOBILE_GAME_UX/ROADMAP_STATUS/HANDOFF.
package.json/lockfile·서비스·외부 설정·Penpot 원본은 이번 작업에서 변경하지 않았습니다.

3-05는 대표 물고기/배경 WebP·SVG 아이콘을 기존 public/assets의 용도별 폴더에 제작하고,
AssetVisual의 예약 영역/대체 UI·상대 경로를 재사용하면 됩니다. 3-06~3-07에서 논리 ID로 전환합니다.
실제 어종/그래픽/폰트 파일 확정 전에는 임의 외부 URL을 추가하지 않습니다.
Auth/DB는4단계, 실제 판정·포획/보상은5단계, 데이터 도감/랭킹은6단계입니다.
**3-05 자동 착수 없이 이번 단위를 종료합니다.**
