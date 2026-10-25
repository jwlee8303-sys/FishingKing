# FishingKing 3-03 — 디자인 시스템 및 화면 초안

작성일: 2026-10-25 (Asia/Seoul). 상태: **Penpot 초안 제작·재조회 완료, 3-04 구현 인수인계 가능**.
3-04 최신 결과: React UI 구현 완료. 63개 CSS 변수 등록/51개 테마·스타일 직접 참조, 수동 토큰 스냅샷 동기화.
실제 구현·검증 범위는 [PHASE3_04_UI_IMPLEMENTATION.md](PHASE3_04_UI_IMPLEMENTATION.md)를 따릅니다. 아래 3-03 기록은 당시 상태입니다.
3-01 감사와 [SCREEN_DESIGN.md](SCREEN_DESIGN.md), [MOBILE_GAME_UX.md](MOBILE_GAME_UX.md)의 화면·입력 계약을 계승합니다.
이전 문서의 Penpot 미생성/연결 단절 기록은 당시 상태이며 현재 결과는 이 문서를 따릅니다.

## 1. 실제 산출물

기존 프로젝트 `FishingKing - MCP 연결 검증` / `5009c98b-0fb2-816e-8008-d7b0732aaceb`의
파일 `새 파일 1` / `685eebd9-2ce2-80a4-8008-d7b0b4e16646`에 추가했습니다. 프로젝트·파일 신규 생성/이름 변경은 없습니다.

| 페이지 | ID | 실제 내용 |
| --- | --- | --- |
| Page 1 | 685eebd9-2ce2-80a4-8008-d7b0b4e16647 | 원본 보존, 자식 0개 |
| FishingKing / MCP Write Test / 3-03 | a2dba513-1242-80ae-8008-d7c65bf4c976 | 88×88 테스트 요소 1개, 삭제하지 않음 |
| FishingKing / Design System | a2dba513-1242-80ae-8008-d7c68dbaf326 | Foundations, 반응형 규칙·컴포넌트 인스턴스 보드 |
| FishingKing / Components | a2dba513-1242-80ae-8008-d7c68dbbbde5 | 기본 19종 + 상태 19종 = 네이티브 라이브러리 컴포넌트 38개 |
| FishingKing / Screens | a2dba513-1242-80ae-8008-d7c68dbcc9c8 | 일반 화면 30개 + 화면별 상태 보드 5개 |
| FishingKing / Mobile Game | a2dba513-1242-80ae-8008-d7c68dbdf3ba | 게임 기본 6개 + 상태 프레임 7개 + 입력 계약 보드 |

[전체 ID 및 실제 재조회 값](design/penpot-manifest.json), [토큰 값 초안](design/tokens.draft.json),
[요소 검사 결과](design/penpot-verification.json)를 함께 인계합니다. 이 JSON은 수동 명세가 아닌 MCP 재조회 결과를 기준으로 작성했습니다.

## 2. 토큰 — Draft v0.1

기존 토큰·색상·타이포그래피·컴포넌트가 모두 0개임을 확인하고 신규 추가했습니다.
네이티브 활성 토큰 세트는 `FishingKingDraft`, ID `a2dba513-1242-80ae-8008-d7c697a1bb17`, 토큰 63개입니다.
색상 라이브러리 12개, 타이포그래피 라이브러리 6개도 생성했습니다. 네임스페이스는 `fk.`입니다.
3-02의 밝은 팔레트는 제안이었으며 이번 사용자 지시에 따라 Deep Navy/Ocean Blue/Teal/Gold 초안으로 조정했습니다.

| 색상 토큰 접미사 (`fk.color.`) | 값 | 용도 |
| --- | --- | --- |
| background / ink | #071827 | 주요 배경 / 밝은 행동 버튼 위 텍스트 |
| surface | #12344D | 주요 표면, Ocean Blue |
| elevated | #1A4661 | 보조 표면·예약 이미지·비활성 배경 |
| primary / pressed | #2DD4BF / #14B8A6 | 기본 행동·눌림 |
| gold | #F5C451 | 보상 시각 언어·획득 강조 후보·입질 주목, 실제 보상 미구현 |
| text / muted | #F3F8FC / #ADC4D4 | 본문·보조 정보 |
| border | #53778E | 경계 후보 |
| danger / focus | #FF9EAA / #7DDEFF | 오류·키보드 포커스 |

Teal/Gold 버튼에는 `ink`를 씁니다. 흰 텍스트를 무조건 올리지 않습니다.
상태는 색 외에 문구·아이콘·포커스 선으로 구분합니다. 전체 WCAG 인증이나 실기기 접근성 합격 판정은 아닙니다.

| 분류 | 실제 토큰 및 값 |
| --- | --- |
| Typography | `fk.type.family` Noto Sans KR, regular 400 / bold 700; caption 12, label 14, body 16, subtitle 20, title 28, hero 48px |
| Spacing | `fk.space.1`~`8` = 4/8/12/16/20/24/32/48px |
| Radius | `fk.radius.sm/md/lg/pill` = 8/12/16/999px |
| Shadow | `fk.shadow.card` = 0 8px 24px 0 #00000066, drop |
| Button | `fk.button.min/standard/game` = 44/48/60px |
| Icon | `fk.icon.sm/md/lg` = 16/20/24px. 아이콘이 작아도 터치 영역은 44px 이상 |
| Responsive | `fk.layout.mobile/tablet/desktop/content/gutter/nav` = 390/768/1440/1200/16/56px |
| HUD | `fk.hud.portrait/landscape` = 56/44px |
| Touch | direction 132, action 128, gap 8, groupGap 12, panel 176, sceneMin 160, sceneCompact 120px |
| Layer | `fk.layer.content/hud/controls/sheet/alert` = 0/10/20/30/40 |
| Motion | `fk.motion.fast/normal/reduced` = 120/200/0 (ms 변환 규칙 적용) |

폰트 줄 간격은 시각 초안에서 1.4, 모바일 입력은 16px입니다. 폰트 배포/로컬 폴백은 3-04에서 확인합니다.
그림자 토큰은 등록했으며 모든 카드에 적용하지 않았습니다. 주로 표면색 차이로 구분합니다.
색상 채움에는 네이티브 토큰 연결을 적용했습니다. 모든 도형 치수·텍스트를 토큰에 자동 바인딩한 상태는 아닙니다.
Safe Area와 `100dvh`는 런타임 규칙이며 기종별 고정 토큰으로 저장하지 않습니다.

## 3. 공통 컴포넌트

| Penpot 기본 컴포넌트 | 3-04 React 연결 대상 |
| --- | --- |
| AppHeader / DesktopNavigation / MobileNavigation | 기존 AppLayout 확장, NavLink·본문 바로가기 유지 |
| PrimaryButton / SecondaryButton / IconButton | 공통 Button, focus-visible·최소44 |
| FishCard | DiscoveredFishCard; 발견된 fixture만 표시 |
| RankingRow | RankingRow; 모의 목록 배지·지표 미확정 |
| ProfileCard | ProfileSummary / GuestNotice |
| StatusBadge | ModeBadge / GameStatus |
| Modal | 공통 Dialog / PauseMenu; Escape·포커스 복귀 |
| InputField | FormField; label/helper/error 슬롯 |
| LoadingState / EmptyState | 예약 공간 Skeleton / 상황별 빈 상태 |
| GameHUD | React GameHUD; Pixi UI로 이전하지 않음 |
| CastButton / ReelButton / HookButton | TouchActionButton; cast / reel / react 명령 |
| DirectionControl | DirectionPad; 132×132, 44px 셀 |

기본 19종 외에 6종 버튼의 pressed/disabled/focus 18개와 InputField error 1개를 별도 네이티브 컴포넌트로 만들었습니다.
상태별 자산은 이름·경로로 구분하며 Penpot VariantContainer의 속성 전환은 구성하지 않았습니다.
컴포넌트 인스턴스 3개를 Design System 페이지에 배치해 재사용 생성도 확인했습니다.
화면은 편집 가능한 도형·텍스트 기반 초안이며 모든 요소가 라이브러리 인스턴스로 연결된 상태는 아닙니다.
hover 없이도 의미가 전달되며 실제 키보드·터치 이벤트는 아직 구현하지 않았습니다.

## 4. PC·모바일 화면 목록

다음 6개 화면 각각에 320×568, 390×844, 430×932, 844×390, 768×1024, 1440×900의 기본 프레임을 만들었습니다.
총 36개이며 요청의 필수 13개 PC/모바일 프레임을 포함합니다. 3-02의 36개 구조 초안 범위를 유지했습니다.

| 화면 | 기본 배치·의미 |
| --- | --- |
| S01-Main | 소개·낚시 시작·모의 모드·발견 요약·도감/랭킹 접근. PC는 장면과 2열 |
| S02-Fishing | 세로 HUD+장면+하단 두 패드, 가로 좌우 패드+중앙 장면, PC 장면+우측 조작/키 안내 |
| S03-Collection | 발견 자료만 기본 표시, 검색·필터·카드. 미발견 이름/실루엣/전체 종 수 없음 |
| S04-Ranking | 모의 목록·기간 초안·내 상태. 운영 순위 산식/집계 미구현 |
| S05-Profile | 비회원/계정 요약·기록 제한·플레이 환경·로그인. /profile은 다음 단계에 추가 |
| S06-Login | label/input/helper/error/submit·비회원 계속. 인증 방식은 초안, 실제 Auth 미연결 |

일반 페이지별 상태 보드 5개에는 Loading / Empty / Error / Guest / Logged-in / Partial 또는 Keyboard를 구성했습니다.
모든 상태가 36개 viewport 프레임으로 복제된 것은 아닙니다. 상태 보드는 의미와 배치를 인계하는 별도 보드입니다.
로그인 제출 중은 Loading 패널·disabled 버튼으로 표현하며 필드/네트워크/인증 실패는 구현에서 구분해야 합니다.
도감 검색 0건은 필터 초기화, 발견 0건은 낚시 시작으로 구분합니다. 실제 사용자·어종·랭킹 데이터는 사용하지 않았습니다.

게임 추가 7개 프레임: 390×844의 bite/reeling/cancelled, 844×390의 loading/error/paused/empty.
입력 계약 보드에는 charging/disarmed/reeling/cancelled 시각 예시와 취소·동시 입력·회전 규칙을 담았습니다.
장면·물고기 썸네일은 예약 공간/도형 초안입니다. 최종 게임 그래픽·SVG/WebP 에셋은 3-05 범위입니다.

## 5. 모바일 게임 필수 규칙

- 세로: HUD56, DirectionPad132 + gap12 + ActionPad128 = 272px; ActionPad는 60px 2×2 + gap8.
- 가로: HUD44, 좌측132/우측128 조작 열, 중앙 장면 분리. 버튼 위치를 동작 상태 때문에 바꾸지 않습니다.
- SafeAreaFrame 한 계층에서 기본 여백과 네 방향 env inset의 큰 값을 취합니다. 보드의 24/32px 가이드는 기종 상수가 아닙니다.
- 100dvh와 실제 host 측정·주소창 변화를 반영하고 입력 중 rect가 바뀌면 취소합니다. 작은 화면에서 기능을 숨기거나 44px 아래로 축소하지 않습니다.
- 릴 유지·캐스팅 disarmed·해제·취소·입질은 문구로 구분합니다. 입질은 Gold + ！ 알림을 함께 씁니다.
- 기본은 두 엄지의 방향+행동 동시 조작입니다. 한 손 순차 조작은 가능성 검토 대상이며 동시 조작 도달성 합격을 주장하지 않습니다.
- 회전/메뉴/blur/hidden은 입력 neutral, 장면 상태 보존. 자동 누름 복원 없이 새 입력/계속하기로 재개합니다.
- 로그인은 문서 스크롤을 유지하며 키보드 표시 때 하단 바를 접습니다. 게임 고정 높이 규칙을 폼에 적용하지 않습니다.

## 6. Penpot → Tailwind / 코드 매핑 규칙

3-04에서 `src/styles/global.css`에 변수와 Tailwind v4 `@theme`를 추가할 예정이며 이번에는 적용하지 않았습니다.

| Penpot | CSS/Tailwind 계획 |
| --- | --- |
| fk.color.primary | --fk-color-primary → @theme --color-fk-primary → bg-fk-primary |
| fk.color.background/text | --color-fk-background / --color-fk-text → bg-/text-fk-* |
| fk.type.body / family | --text-fk-body / --font-fk-sans → text-fk-body / font-fk-sans |
| fk.space.4 | --spacing-fk-4:16px → gap-fk-4 / p-fk-4 |
| fk.radius.md | --radius-fk-md:12px → rounded-fk-md |
| fk.shadow.card | --shadow-fk-card → shadow-fk-card |
| button/icon/hud/touch/layout | --fk-* 전용 변수, min-width/min-height/grid에 사용. viewport 치수를 그대로 breakpoint로 사용하지 않음 |
| layer / motion | z-index는 number, duration은 ms 부여. reduced-motion에서는 0ms |

점→하이픈은 CSS 이름으로의 기계적 변환에 한하며 의미 대응은 표와 JSON으로 관리합니다.
자동 양방향 동기화 도구는 없으며 JSON→CSS 변환/토큰 변경 반영은 3-04에서 검증합니다. 새 패키지는 설치하지 않았습니다.
게임 배경·물고기는 PixiJS, GameHUD·모든 필수 조작은 React에 매핑합니다.
SVG 아이콘·WebP는 논리 Asset ID → Manifest/Resolver → 기존 `src/services/assets.ts`로 해석합니다.
`icon.menu`, `fish.discovered.thumbnail`, `background.lake.day`는 인계용 ID 후보이며 등록부/실제 파일 존재를 보장하지 않습니다.
개별 저장소 URL을 디자인·컴포넌트·게임 로직에 하드코딩하지 않습니다. Pages 기본, R2 보류, Cloudinary 미연결을 유지합니다.

## 7. 검증과 남은 범위

MCP 읽기·쓰기·재조회, 토큰63·컴포넌트38·기본36프레임·게임상태7 재조회 성공.
원본 Page 1 구조 동일, 기본/게임 상태 프레임 경계 이탈 0, 전체 작업 페이지의 텍스트 박스 넘침 0, 식별된 터치 영역 44px 미달 0을 확인했습니다.
기본 모바일 세로 게임·모바일 가로 게임·PC 메인·320px 프로필의 PNG를 육안 확인했습니다.
320px 프로필/PC 제목 여백/작은 메인 제목을 보정했고 프로필·PC 메인은 보정 후 PNG도 재확인했습니다.
전체 프레임의 모든 시각·겹침·글자 확대 상황을 육안 검수한 것은 아닙니다. 기하 검사와 런타임 접근성 검사는 구분합니다.

미완료는 최종 그래픽, 모든 화면의 인터랙티브 프로토타입, VariantContainer 전환, 전체 치수 토큰 바인딩,
React/Tailwind 구현·실기기 Safe Area/주소창/키보드/한 손 도달·성능 검증입니다. 물리·포획·보상·Auth·DB·랭킹 산식도 미구현입니다.
이번 요청은 화면 초안 제작 단위로 완료하며 3-04를 자동 시작하지 않습니다. 추가 연결 수동 작업은 필요 없습니다.
