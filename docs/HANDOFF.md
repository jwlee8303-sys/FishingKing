# FishingKing 인수인계

확인일: 2026-10-25 (Asia/Seoul)
경로: D:\FishingKing
상태: **1·2단계 완료, 3-01~3-04 완료, 3-05 후속 지시 대기**

## 최신 인수인계 — 3-04 / 2026-10-25

이 절이 아래 과거 기록보다 우선합니다. **3-04 완료, 3-05 자동 진행 없음.**

- 기존 Penpot Remote 읽기 성공, 파일/4페이지/컴포넌트38/실제 토큰63 재확인. Penpot 원본 수정 없음.
- 메인/낚시/도감/랭킹/내 정보/로그인6개와404 구현. /profile 신규, 기존 AppLayout/NavLink/Outlet/본문 바로가기/페이지/404/에셋 함수 재사용.
- 공통19종·버튼 normal/pressed/disabled/focus 구현. 네이티브 dialog의 Escape/포커스 제한·복귀 지원.
- 토큰63개 생성CSS 등록·51개 현재 스타일 참조·12개 기준/후속 값 보존. node scripts/sync-design-tokens.mjs [--check]로 수동 동기화.
- 게임은 React DOM UI 시연. 세로 HUD56+하단272px패드, 가로 HUD44+좌132/중앙장면/우128, 최소44/행동60·간격8 적용.
  100dvh/Safe Area/터치 영역 분리. 눌림·해제·pointercancel/이탈·blur/resize/VisualViewport/메뉴의 표시 해제만 구현.
- 실제 명령 reducer·역할 소유권·멀티터치 선점·C/R/E·Pixi·physics/포획은 후속. UI 시연을 실제 판정/서버 기록으로 사용하지 않음.
- 도감은 기본 빈 발견 목록·명시적으로 켠 발견 시연 자료만 검색. 랭킹은 모의 목록. 프로필/로그인 예시는 실제 인증 없음.
- 신규 이미지는 CSS 예약 표시. AssetVisual.tsx가 향후 실제 경로를 기존 getAssetUrl에 위임. 서비스·AssetPath는 변경 없음.
- 최종 npm.cmd run check exit0: TypeScript/lint/단위5/Vite build 통과.
- 최종 로컬 검증: `.local/phase3-04/verify.cjs` exit0. 시작58개 파일 대비 승인 범위19개 수정·10개 추가,
  UTF-8/기존 서비스·패키지·사용자 설정 보존 확인. 토큰 스냅샷/CSS63개 일치, git diff --check exit0(줄바꿈 안내만 있음).
- 최종 Chrome Playwright: 320×568,390×844,430×932,844×390,768×1024,1440×900 ×4 = **24 passed**, exit0.
  실제 touchStart/touchCancel, 메뉴 탭, 라우트/새로고침/404, 최소44, 버튼/장면 겹침0, 가로 넘침0, 회전/포커스·콘솔 오류0 확인.
  PC 메인·모바일 세로/가로 게임 PNG 육안 확인. 실제 Android/iPhone·노치/주소창/가상 키보드/성능은 미검증.
- package.json/lockfile·서비스·기존 설정/사용자 변경 보존. GitHub/Supabase/Cloudflare/인증·운영 배포 변경 및 commit/push 없음.
- 구현·변경 파일·3-05 인수인계: PHASE3_04_UI_IMPLEMENTATION.md. 토큰 원본/3-03 식별자 JSON은 보존.
- 기존 로컬 dev 서버 http://127.0.0.1:5173/ 유지. Playwright는 PLAYWRIGHT_CHANNEL=chrome, PLAYWRIGHT_BASE_URL 지정으로 재현.
- 3-05에서는 대표 물고기/배경 WebP·SVG 아이콘을 기존 public/assets에 제작해 AssetVisual의 예약 공간·상대 경로를 연결.
  Manifest/Resolver/Provider는3-06~3-07, 입력/Pixi는3-08, Auth/DB는4단계의 책임을 유지.

## 이전 인수인계 — 3-03 / 2026-10-25

이 절이 아래 과거의 Penpot 연결 실패·미생성·3단계 미착수 설명보다 우선합니다.
**이번 3-03 실행 단위 완료. 다음 3-04는 별도 지시 후 진행합니다.**

- 기존 Remote MCP 등록 enabled/Remote HTTP 확인, 실제 읽기 및 격리 쓰기(도형 생성→이름/색 변경→별도 재조회) 성공.
- 기존 파일 새 파일 1 / 685eebd9-2ce2-80a4-8008-d7b0b4e16646 유지. 원본 Page 1의 자식0·구조 동일 확인.
- 작업 페이지: FishingKing / Design System, Components, Screens, Mobile Game. 별도 MCP Write Test / 3-03도 증거로 유지.
- 토큰63, 색상12, 타이포그래피6, 라이브러리 컴포넌트38(기본19+상태19) 재조회. 상태 자산은 개별 컴포넌트이며 VariantContainer 전환은 후속.
- 6화면×6 viewport 기본36 프레임, 게임상태7, 일반 상태 보드5, 입력 계약 보드1, Foundations/반응형 보드2 제작.
- 네이티브 토큰 채움 연결 및 컴포넌트 복제 인스턴스3개 확인. 모든 치수/텍스트 토큰 바인딩·전체 화면 인스턴스화·자동 CSS 동기화는 미구현.
- 이전 No Penpot instance connected는 최초 재조회에서 재현되지 않음. 작업 중120초 시간 초과/heartbeat129초 단절은 기존 Chrome workspace 탭 활성화 후 해소.
  이미 생성된 일반화면30개를 확인하고 이어갔으며, 재설치·키 재발급·중복 생성 없음. 토큰 이름/Stroke/활성 페이지 API 오류도 보정 완료.
- 원본 Page 1 보존, 프레임 경계 이탈0, 텍스트 박스 넘침0, 식별된 터치 영역 최소44 위반0 확인.
  대표 PNG를 육안 확인했으며 실기기·전체 접근성·인터랙션 합격과 구분함.
- 문서: DESIGN_SYSTEM.md / PENPOT_MCP_WORKFLOW.md. docs/design/penpot-manifest.json은 페이지·컴포넌트·프레임 ID,
  tokens.draft.json은 조정 가능한63 토큰, penpot-verification.json은 실제 요소 검사 결과.
- 3-04: 기존 AppLayout/라우트 재사용, /profile 추가, Tailwind v4 변수 매핑, GameShell·SafeAreaFrame·최소44·폼 시각 상태 구현.
  GameHUD/버튼은 React, 장면/물고기는 Pixi. 실제 Auth·물리·포획·랭킹은 후속 책임 유지.
- 이번 단계의 새 앱 소스·서비스·패키지·배포·인증 변경 없음. 시작 시 기존 미커밋 변경과 Git 이력 보존, commit/push 없음.
- 사용자 수동 연결 작업은 필요 없음. 후속 구현 후 Android/iPhone Safe Area·주소창·키보드·한 손 도달·회전·취소를 실제 검증해야 함.

로컬 최종 검증: `.local/phase3-03/verify.cjs` exit 0. 문서7개 UTF-8·JSON·토큰/컴포넌트/기본 프레임 수 검사 통과.
시작 시53개 파일의 SHA-256과 비교해 기존 파일 변경은 HANDOFF/ROADMAP 2개뿐이며 앱·서비스·패키지 보존 확인.
`git diff --check` exit 0. 기존 .gitignore의 LF→CRLF 안내 경고만 있으며 공백 오류는 없음.
앱 동작 테스트는 소스 변경 없는 디자인·문서 작업이므로 이번 미실행입니다.

## 현재 운영 정책과 3단계 인수인계 — 2026-10-25

### 최종 확정 사항

2단계는 확정된 저장소 정책 기준으로 **완료**, 3단계는 **착수 준비 완료·구현 미착수**입니다.
아래 최신 확정 사항이 과거 기록의 R2 실패/활성화 대기/3단계 보류 설명보다 우선합니다.

- 정적 SVG·WebP·게임 배경·물고기 이미지는 기존 Pages의 정적 에셋으로 관리합니다.
- R2는 실패 항목이 아닌 **사용자 결정에 따른 의도적 보류(과금 방지)**입니다. 자동 활성화/결제 등록을 하지 않습니다.
- Cloudinary 무료 플랜은 향후 이미지 관리 요구가 생길 때 검토·도입합니다. 현재 도입/연결/SDK 설치는 하지 않았습니다.
  도입 시 실제 무료 조건·한도 초과 처리·자동 과금 여부를 먼저 확인하고, 유료/자동 과금 기능은 승인 전 활성화하지 않습니다.
- 사용자 업로드가 필요할 때 기존 Supabase Storage Free 활용을 검토합니다. 현재 실제 업로드/버킷/RLS 구현은 없습니다.
- 기존 GitHub·Supabase·Cloudflare·Penpot 연결과 운영/배포 설정을 유지합니다.

### 에셋 식별자 계약 — 설계 확정, 등록부 구현은 3단계

컴포넌트와 게임 로직은 논리 이미지 ID만 알고, 실제 저장소 URL은 공통 모듈 내부에서 결정하는 구조로 설계합니다.

    UI/PixiJS → 이미지 ID → 에셋 등록부 → 제공자별 경로 해석 → 최종 공개 URL

예시(실제 이미지/등록 항목은 아직 없음):

| 논리 ID | 현재 Pages용 상대 경로 | 향후 이전 시 유지할 항목 |
| --- | --- | --- |
| fish.carp.thumbnail | fish/carp.thumbnail.v1.webp | 논리 ID, UI/PixiJS의 참조 |
| background.lake.day | backgrounds/lake-day.v1.webp | 논리 ID, UI/PixiJS의 참조 |

- 현재 구현: src/services/assets.ts의 getAssetUrl(AssetPath)이 base URL과 상대 경로를 합성합니다.
  src/types/assets.ts는 폴더 기반 상대 경로 타입을 제공합니다. 기존 검증을 통과했으며 이번에 코드를 바꾸지 않습니다.
- 3단계 에셋 제작 시 추가할 설계: src/services에 등록부를 두고 논리 ID를 실제 상대 경로/제공자별 식별자에 매핑합니다.
  src/types에서 등록된 키 기반 AssetId를 정의하고, getImageUrl(id)가 등록부를 찾아 현재 getAssetUrl에 위임하도록 확장합니다.
  위 등록부/AssetId/getImageUrl은 아직 구현되지 않았으며 빈 가짜 이미지를 등록하지 않습니다.
- Pages 기본 제공자를 사용합니다. 향후 Cloudinary는 해당 제공자의 이미지 식별자, R2는 object path를 등록부에서 해석하고
  논리 ID는 유지합니다. 제공자/경로가 달라지는 이전을 단순 base URL 변경만으로 완료했다고 간주하지 않습니다.
- 컴포넌트와 src/game에 공급자 URL·실제 파일 경로를 흩어 넣지 않습니다. 공통 서비스 모듈이 URL을 반환합니다.
- VITE_ASSET_BASE_URL은 공개 URL 전용이며 기본은 비워 둡니다. 비밀키·토큰·서명 URL은 넣지 않습니다.
- 실제 이전 전에는 무료 조건/과금 승인 경계·접근 권한·CORS·캐시·누락 이미지·배포 결과를 따로 검증합니다.

### 3단계 첫 작업과 검증 기준

1. 아래 기존 Penpot 프로젝트/파일/페이지 ID를 다시 읽어 현재 연결 대상을 확인합니다. 파일 생성/이름 변경부터 하지 않습니다.
2. 화면 범위·색상/타이포그래피/간격 토큰·컴포넌트 상태·반응형/키보드 규칙을 설계합니다.
3. 승인된 작업 범위에서 기존 Penpot 파일에 디자인 시스템과 게임 그래픽을 제작합니다. Figma는 사용하지 않습니다.
4. 최종 SVG/WebP를 기존 public/assets의 용도별 폴더에 저장하고 논리 ID 등록부를 구현합니다.
5. UI/PixiJS에 공통 ID 참조를 연결해 누락 ID/이미지·MIME·실제 디코딩·반응형/키보드·관련 테스트를 검증합니다.
6. 결과와 미구현 항목을 기록합니다. 운영 배포/유료 전환/자동 과금 가능 기능은 사용자 승인 전 실행하지 않습니다.

인수인계 완료 기준: 기존 연결과 Pages 검증 이력 확보, 저장소 정책 확정, 에셋 식별자 분리 설계 확정,
Penpot 대상 ID/빈 디자인 현황/첫 작업 순서 명시를 충족했습니다. 실제 에셋 원격 배포·동적 업로드·Cloudinary/R2 이전은
후속 범위이며 검증 완료로 표시하지 않습니다. 이번에는 문서만 갱신했고 이전 테스트를 새로 실행한 것처럼 보고하지 않습니다.

**무료 기반 Pages 대체 저장 구조 검증을 완료했습니다. R2는 과금 방지를 위해 의도적으로 보류하며 2단계 필수 조건에서 제외합니다.**
이 절이 아래 이전 연결 검증의 R2 대기/3단계 보류 판정보다 우선합니다.

### 과금 및 저장 정책

- 향후 게임 개발에서도 유료 플랜 전환·결제 수단 등록·자동 과금 가능 기능은 사용자 사전 승인 전 활성화하지 않음.
- 한도 접근 시 최적화/업로드·작업 제한/범위 조정부터 검토. 자동 업그레이드나 새 과금 서비스로 우회하지 않음.
- R2 구독/활성화/버킷·객체 작업은 수행하지 않으며 기존 과거 목록 오류 10042를 복구할 필수 작업으로 취급하지 않음.
- 정적 SVG/WebP·배경·아이콘·오디오는 public/assets 아래 파일을 GitHub에 보관 → Vite 빌드 → 기존 Pages에 함께 제공.
- 기존 images·fish·backgrounds·icons·audio 5개 폴더를 그대로 사용, 이번에 새 폴더/게임 그래픽을 추가하지 않음.
- 실제 게임 이미지는 아직 없음. Git에 이미지 파일을 일반 파일로 추가하고 승인된 push/배포에서 제공할 설계.
- 동적 파일이 필요해지면 기존 Supabase Storage Free를 검토. 현재 실제 조직 플랜/사용량/버킷/RLS/업로드 검증은 미실행.
  해당 기능을 이미 연결했다고 표현하지 않으며 유료 이미지 변환을 활성화하지 않음.

### 에셋 코드와 마이그레이션 경계

- src/types/assets.ts: AssetDirectory/AssetPath 공통 타입.
- src/services/assets.ts: getAssetUrl('fish/carp.v1.webp'). 예제 경로이며 실제 carp 파일은 없음.
- 기본 URL은 import.meta.env.BASE_URL + assets/. UI/PixiJS는 이 함수를 공유하고 제공자 URL을 하드코딩하지 않음.
- 기존 선택 변수 VITE_ASSET_BASE_URL은 기본 비움. 승인된 제공자 마이그레이션에서만 공개 URL을 설정하고 상대 경로는 보존.
  토큰/서명 URL/비밀키는 넣지 않음. 이 변수를 설정하는 것과 실제 R2 연결·권한 검증은 별개.
- public 파일명은 자동 해시되지 않으므로 이미지 변경 시 버전 파일명과 참조를 같이 변경.
- 공식 Pages Free 파일 수/크기/build 한도를 설계에 반영. 한도 초과 대응은 비용 자동 발생 대신 작업 제한·최적화·사용자 검토.

### 이번 실제 검증

- .local/verify-static-assets.mjs: Git 제외된 독립 publicDir/outDir에 기술 검증 SVG/WebP 생성,
  Vite 빌드 복사본/원본 일치 → 경로 함수 URL → 로컬 빌드 정적 서버 GET 200/MIME/응답 바이트 일치.
- 기본 /assets/, 하위 /fishingking/assets/, 향후 CDN 문자열 경로 조합 검증 성공. CDN 테스트 URL은 네트워크 요청하지 않음.
- 실제 public/assets는 .gitkeep 5개 그대로. 임시 파일은 Git 제외 .local에만 있고 실제 게임 자산/배포에 포함되지 않음.
- 기존 https://fishingking.pages.dev 의 /assets JS·CSS 요청 200과 MIME 확인. 확인용 탭은 닫았으며 기존 탭 보존.
- npm run check 전체 exit 0(typecheck/lint/unit 3개/build). 이번 E2E·새 에셋 원격 배포·commit/push는 미실행.
- GitHub·Pages·Supabase·Penpot·MCP 연결/인증/운영/배포 설정 보존. 신규 외부 서비스/유료 기능 활성화 없음.
- 기존 계정 결제/구독 전체를 감사하거나 모든 과금 가능성을 보증한 것이 아님. 새 과금 경로를 만들지 않고 승인 경계를 유지함.

### 3단계 시작 시 재사용할 대상

Penpot 프로젝트 FishingKing - MCP 연결 검증 (`5009c98b-0fb2-816e-8008-d7b0732aaceb`) /
파일 새 파일 1 (`685eebd9-2ce2-80a4-8008-d7b0b4e16646`) /
페이지 Page 1 (`685eebd9-2ce2-80a4-8008-d7b0b4e16647`). 이전 읽기에서 자식 레이어/컴포넌트/토큰 없음.
Supabase 기존 ref는 pjaducpbuqdlwkobwxbo, CLI link/읽기 검증 완료. 다른 프로젝트로 재연결하지 않음.
다음 작업: Penpot 파일/페이지 ID 재확인 → 토큰/컴포넌트·반응형 설계 → 승인된 범위의 디자인 구현 → SVG/WebP export를
위 폴더에 저장 → 공통 에셋 URL로 연결. 실제 디자인 구현과 동적 저장은 아직 시작하지 않았음.
2단계는 새 정책 범위에서 완료했으며 3단계 착수를 위한 기술적 인수인계가 준비됨.

## 이전 연결 검증 및 당시 3단계 인수인계 — 2026-10-25

**아래는 정책 변경 전 기록입니다. R2 필수 검증/3단계 보류는 상단 새 정책과 완료 판정으로 대체합니다.**

### Supabase 연결 대상과 재검증

- 프로젝트 FishingKing, ref `pjaducpbuqdlwkobwxbo`, 서울 `ap-northeast-2`, `ACTIVE_HEALTHY`.
- MCP와 CLI 목록의 ref·이름·리전·상태 일치 확인. CLI 목록에는 FishingKing 1개가 보임.
- CLI 2.122.0 기존 인증 정상. 기본 권한에서는 Access token not provided였지만 정상 권한의 같은 조회는 exit 0.
  재로그인/토큰 발급이 필요하지 않았으므로 이전 사용자 로그인 요청은 해제됨.
- 승인 ref를 명시한 `link --project-ref pjaducpbuqdlwkobwxbo --skip-pooler` exit 0.
  작업 전 link/config가 없었고 다른 ref가 연결돼 있으면 중단하도록 사전 검사함. DB 비밀번호 사용 안 함.
- `supabase/.temp/project-ref`는 위 ref와 정확히 일치. `.temp/` 전체는 Git 제외, 캐시 원문을 채팅/로그/커밋에 넣지 않음.
- ref를 명시한 함수 목록 조회 exit 0, 함수 0개. 원격 DB/스키마/Auth/설정 변경·SQL 실행 없음.
- 다음 작업 전 ref를 재대조하고, DB 구현은 4단계에서 별도로 설계. 다른 프로젝트로 임의 재연결하지 않음.

### Penpot 연결 파일과 디자인 시스템 착수 준비

| 대상 | 이름 | ID |
| --- | --- | --- |
| 프로젝트 | FishingKing - MCP 연결 검증 | 5009c98b-0fb2-816e-8008-d7b0732aaceb |
| 파일 | 새 파일 1 | 685eebd9-2ce2-80a4-8008-d7b0b4e16646 |
| 현재 페이지 | Page 1 | 685eebd9-2ce2-80a4-8008-d7b0b4e16647 |
| 루트 | Root Frame (board) | 00000000-0000-0000-0000-000000000000 |

브라우저 workspace file/page/project ID와 MCP 응답을 대조했습니다. 페이지는 1개이며 자식 레이어는 빈 배열입니다.
컴포넌트·색상·타이포그래피 각 0개, 토큰 목록 비어 있음. 디자인 시스템 구현 완료를 의미하지 않습니다.
이번 작업은 기존 파일의 읽기만 했으며 파일/페이지/레이어 생성·변경·삭제·이름 변경을 하지 않았습니다.
Remote 연결 workspace 탭을 유지하고, 다음 세션에서 파일/페이지 ID를 먼저 다시 읽어야 합니다.
기존 키 재발급·MCP 재설치·새 프로필은 불필요합니다.

3단계 준비 순서: 화면/자산 범위와 네이밍 합의 → 색상·타이포그래피·간격·반경 토큰 설계 →
기본 UI 컴포넌트/상태·반응형·키보드 규칙 설계 → 승인된 범위의 Penpot 구현/검증.
기존 React UI는 src/pages·src/components, PixiJS는 src/game, 외부 서비스는 src/services 경계를 유지합니다.
Figma는 사용하지 않습니다. 이번에는 위 설계/구현 자체를 시작하지 않았습니다.

### 전체 2단계에 남은 항목

기존 Wrangler의 R2 버킷 목록 요청은 exit 1, 오류 10042·Please enable R2입니다.
목록을 받지 못했으므로 기존 버킷 부재/연결 정상으로 단정하지 않습니다.
R2 활성화·계정별 요금 조건·버킷 목록·객체 저장/읽기·권한 검증이 남았으며 과금 활성화나 자원 생성은 하지 않았습니다.
필요한 대상/요금/설정을 확인하고 사용자 승인 후 R2 작업을 수행해야 합니다.
계정별 구독/사용량 및 MCP 최소권한 강제 적용도 이번에 검증하지 않았습니다.
GitHub·Cloudflare 기존 연결/배포 설정과 전역 MCP는 보존했고 commit/push/배포를 하지 않았습니다.
이번 변경은 문서와 Git 제외된 로컬 Supabase link 캐시/진단 도구뿐입니다. 앱/의존성/테스트 변경 없음.
이번 CLI/MCP 읽기 검증을 수행했으며 npm check/E2E는 재실행하지 않았습니다. 이전 전체 check 통과 기록은 그대로 유지합니다.

## 이전 연결 재검증 — 2026-10-25

아래는 이전 재검증 당시 기록이며 상단 최종 연결 검증이 우선합니다.

- 기존 Chrome --autoConnect·프로필과 모든 전역 MCP 설정을 보존. 인증정보 출력/로그 기록 없음.
- GitHub: 연결 플러그인·git ls-remote·gh auth status·API 조회 성공. 원격 main SHA는 기존 006ca9286bcdb9b993b271d6c76d778f23b467bc.
- Cloudflare: 기존 fishingking Pages와 Git 연동 확인. build npm run build / output dist / production main / 자동 배포 Enabled.
  기존 캐시 Wrangler 4.152.0 인증·목록 조회 성공. Preview 98921a3c-fdea-4a7d-b6dc-f51696e2cd55는 success,
  검증 브랜치·전체 SHA 일치. https://98921a3c.fishingking.pages.dev 실제 화면 읽기 성공. 이번 배포 실행 없음.
- Supabase: MCP 재조회 ACTIVE_HEALTHY. CLI 2.122.0 devDependency 설치, lockfile 갱신, 버전/도움말 성공.
  projects list는 Access token not provided. 자동 로그인 2회는 각 90초 진행 신호 없이 종료, 브라우저도 열리지 않음.
  사용자에게 PowerShell에서 npx.cmd supabase login 후 완료 여부만 알려달라고 요청. 인증 URL/코드는 채팅으로 받지 않음.
  link는 미실행. 현재 CLI 도움말에 비밀 API 키 읽기 권한이 포함돼 계정/프로젝트 목록 진단과 분리하며 DB 작업은 4단계.
- Penpot: 공식 Remote 도구 노출·안내/API 조회 성공. 읽기 전용 execute_code는 No Penpot instance connected 실패.
  열린 Personal Projects 초안 파일 0개. 빈 파일 FishingKing - MCP 연결 검증 생성·MCP 연결 승인을 요청, 아직 미생성.
  승인 또는 기존 파일 연결 후 페이지/레이어 읽기 재시도. 기존 키 재발급·Local 설치·요금제 변경 불필요.
- 기본 네트워크 제한과 Supabase 홈 디렉터리 EPERM은 승인된 정상 권한 재검증에서 해소. 보안/TLS 설정 변경 없음.
- npm run check 전체 exit 0, unit test 3개 통과, npm ls 직접 의존성 25개 정상. 이번 E2E/재현 npm ci는 미실행.
- 요청된 연결 문서 3개 갱신. R2/요금제는 이번 미검증. 2단계 전체 완료와 3단계 진입 보류.
- 새 원격 프로젝트·배포·유료 기능·DB 변경·Git 원격 쓰기 없음. commit/push 안 함.

## 세션 시작

AGENTS.md, ROADMAP_STATUS.md, 이 문서와 Git 상태를 먼저 확인합니다.
기존 사용자 변경·잠금 파일·.local/scaffold 원본을 보존하고 저장소를 초기화하지 않습니다.

## 환경·설치·Git

Node 24.22.0, npm 11.19.1, Git 2.56.0.windows.2는 구축 시 확인했습니다.
VS Code 1.143.1, Codex CLI 0.164.0은 이전 세션 확인값입니다.
main 브랜치, 초기 커밋 006ca9286bcdb9b993b271d6c76d778f23b467bc가 로컬과 GitHub에 존재합니다.
origin은 사용자 승인 FishingKing 저장소이며 이번 2단계 시작 시 작업 트리는 깨끗했습니다.

사용자가 설치한 node_modules와 package-lock.json v3를 확인했습니다.
npm ls --depth=0은 exit 0, 직접 의존성 24개에 missing/invalid 항목이 없습니다.
직접 의존성의 설치 버전·package.json 범위·lockfile·Node engines를 대조했습니다.
정확한 버전은 DEPENDENCIES.md에 있습니다. 잠금 파일은 수정하지 않았습니다.
이후 재현 설치는 npm.cmd ci를 사용합니다. 이번에 깨끗한 재설치를 수행하지는 않았습니다.

## 구성과 최종 수정

라우트는 /, /game, /collection, /ranking, /login 및 404입니다.
React UI는 src/pages와 components, PixiJS 타입 경계는 src/game,
향후 API는 services, 공통 타입은 types, 스타일은 styles에 둡니다.
public/assets의 images/fish/backgrounds/icons/audio는 빈 폴더입니다.
tests/unit은 Vitest, tests/e2e는 Playwright이며 scripts/check.mjs가 순차 검사를 실행합니다.
실제 게임·로그인·DB·외부 API는 구현하지 않았습니다.

이번 최종 검증에서 수정한 파일:
- tests/unit/App.test.tsx: RTL getByRole에 없는 exact 옵션 제거. 문자열 name의 정확 매칭 유지.
- index.html: 빈 data favicon을 명시하여 누락된 favicon의 콘솔 404 해결.
- playwright.config.ts: PLAYWRIGHT_CHANNEL과 PLAYWRIGHT_BASE_URL 지원 및 직접 Vite 실행.
- AGENTS.md, README.md, ARCHITECTURE.md, DEPENDENCIES.md와 단계 문서의 실제 상태 갱신.

debug.log와 원본 .local/scaffold는 보존했습니다.
기존 tsconfig 변경은 strict·테스트 참조·도구 설정 검사 범위뿐입니다.
이전 작업 전 해시는 .local/baseline.json에 있습니다. 비밀키를 추가하지 않았습니다.

## 실제 검증 결과

| 명령 | 최종 결과 |
| --- | --- |
| npm.cmd ls --depth=0 | exit 0, 직접 의존성 24개 정상 |
| npm.cmd run lint | 통과, 경고 0 |
| npm.cmd run typecheck | 앱·도구·테스트 전체 검사 통과 |
| npm.cmd run test | 1개 파일, 3개 테스트 통과 |
| npm.cmd run build | 통과, Vite 8.3.4, 100개 모듈 |
| npm.cmd run check | 위 4개 순차 실행, exit 0 |
| npm.cmd run test:e2e | 아래 환경변수 조건에서 4 passed, exit 0 |
| npm.cmd run dev | http://127.0.0.1:5173/에서 실행 |
| HTTP GET / | 200 |
| git diff --check | 통과 (미추적 파일 검토를 대신하지 않음) |

Chrome 155.0.8059.86에서 PC 1440×900 및 모바일 390×844로 메뉴 이동·새로고침·404 복귀·스타일·가로 넘침·콘솔/페이지 오류·키보드를 검증했습니다.
두 home.png를 직접 열어 잘림 없는 화면을 확인했습니다. 모바일은 에뮬레이션입니다.
스크린샷은 test-results의 desktop/mobile 하위 home.png,
리포트는 playwright-report/index.html입니다. 산출물은 ignore 대상이며 다음 실행 시 갱신됩니다.

개발 서버는 검증 종료 시 실행 중이며 도구 세션은 33556입니다. 이 값은 OS PID가 아닙니다.
새 세션에서 서버가 살아 있다고 가정하지 말고 접속을 확인하세요.

## 재현 명령

첫 PowerShell에서:

~~~powershell
Set-Location -LiteralPath D:\FishingKing
npm.cmd run dev
~~~

두 번째 PowerShell에서 실제 서버 주소를 지정합니다:

~~~powershell
Set-Location -LiteralPath D:\FishingKing
npm.cmd run check
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:5173'
npm.cmd run test:e2e
~~~

BASE_URL을 생략하면 4173 포트에 자체 서버를 실행하며 점유된 포트의 다른 프로세스를 종료하지 않습니다.
CHANNEL을 생략하면 기본 Playwright Chromium을 사용합니다.

## 알려진 환경 제한

1단계 완료를 위한 추가 수동 작업은 없습니다.
전용 Chromium 다운로드는 CDN TCP 443 EACCES로 실패했습니다.
필요하면 네트워크가 허용된 외부 PowerShell에서 실행할 수 있습니다:

~~~powershell
Set-Location -LiteralPath D:\FishingKing
npx.cmd playwright install chromium
~~~

샌드박스에서는 자체 서버를 사용한 테스트 실행이 본문 통과 후 종료 정리에서 지연되었습니다.
해당 실행은 중단했고 성공으로 기록하지 않았습니다.
기존 개발 서버를 명시해 다시 실행한 결과만 정상 종료 코드 0으로 기록했습니다.
NO_COLOR/FORCE_COLOR 경고는 검사에 영향을 주지 않았습니다.
보안·TLS·ACL·관리자 권한·전역 Codex/MCP 설정은 변경하지 않았습니다.

## 2단계 준비

GitHub: 승인된 FishingKing origin 확인 완료. 테스트 브랜치 쓰기 검증 성공.
Supabase: 개발 프로젝트·Auth·DB·MCP 최소 권한 확인. 스키마/인증 구현은 4단계.
Cloudflare: 무료 범위·Pages/R2 용도·개발/운영 분리 확인. 자원·배포 미생성.
Penpot: 작업 공간·접근 범위 확인. 디자인 토큰/그래픽 작업은 3단계.
기존 MCP와 전역 설정은 먼저 조사하고 보존합니다. Figma는 사용하지 않습니다.
VITE_는 공개 값만 허용하며 서버 비밀키를 브라우저·로그·채팅·커밋에 넣지 않습니다.

## 2단계 현재 인수인계 — 2026-10-25

**현재 상태: 부분 완료. 3단계 디자인 구현 진입 보류.**
상세 감사는 PHASE2_AUDIT.md, 서비스 식별자는 EXTERNAL_SERVICES.md,
MCP 복구는 MCP_CONNECTIONS.md, Preview 절차는 DEPLOYMENT.md를 참조합니다.
위 1단계 검증 기록은 당시 실행 결과이며 아래 내용이 최신 연결 상태입니다.

### 실제 연결

- origin: https://github.com/jwlee8303-sys/FishingKing.git 유지.
- 로컬/원격 main: 006ca9286bcdb9b993b271d6c76d778f23b467bc 일치.
- GitHub 기존 연결 도구로 읽기 성공. codex/phase2-connectivity-20261025-0440 브랜치 생성 및 존재 확인 성공.
- main 변경·추가 커밋·운영 push는 없음. 검증 브랜치는 삭제하지 않음.
- Supabase: FishingKing, ref pjaducpbuqdlwkobwxbo, 서울 ap-northeast-2, ACTIVE_HEALTHY. 목록/상세만 조회.
- chrome-devtools: localhost FishingKing 제목·URL·가로 넘침 없음·콘솔 오류/경고 없음 확인.
- Penpot: 전역 enabled/Streamable HTTP 등록 존재. 직접 initialize는 EACCES, 현재 세션에 Penpot 도구 미노출.
- Cloudflare/Penpot 브라우저는 로그인 화면이며 사용자 직접 인증 대기.

### 차단 요인과 재개

로컬 셸은 registry/GitHub/Penpot TCP 연결에서 EACCES 또는 연결 실패입니다.
GitHub/Supabase 연결 도구는 별도 경로에서 정상 동작하므로 gh 인증 만료라고 단정하지 않습니다.
Supabase/Wrangler devDependency 설치는 실패했고 package.json/lockfile은 변경되지 않았습니다.
기존 캐시 Wrangler 4.152.0은 버전 확인만 성공, 계정 인증은 미검증입니다.

사용자는 열린 Cloudflare와 Penpot 탭에 직접 로그인하고, Penpot 기존 파일에서
File → MCP Server → Connect를 수행한 뒤 알려주면 됩니다. 토큰/URL/비밀번호를 채팅에 보내지 않습니다.
현재 기존 Penpot 키를 재발급할 필요가 확인되지 않았습니다.
네트워크가 허용된 외부 PowerShell의 CLI 설치/인증/조회 명령은 DEPLOYMENT.md에 있습니다.
Codex MCP 목록의 홈 해석 오류는 기존 CODEX_HOME을 해당 프로세스에만 지정해 읽기 검증했습니다.
기존 전역 설정은 변경하지 않았고 비밀정보가 포함된 백업도 만들지 않았습니다.
향후 설정을 바꾸기 전에만 안전한 Git 제외 경로에 원본을 백업합니다.

### 승인 대기와 3단계 조건

현재 Pages/R2 자원 목록을 알 수 없어 신규 자원 생성 승인을 아직 요청하지 않았습니다.
로그인 후 기존 자원부터 조사하고, 필요할 때만 Pages 후보 fishingking,
R2 후보 fishingking-dev-assets / Standard / 비공개 계획을 구체화해 승인을 요청합니다.
Supabase 프로젝트는 이미 있으므로 신규 생성하지 않습니다. DB/사용자/RLS/함수는 변경하지 않습니다.
Preview는 기존 Git 연동/운영 브랜치를 확인한 후 테스트 브랜치에만 최소 변경으로 검증합니다.
3단계 전에는 Penpot 계정의 MCP 제공 여부·활성 파일/페이지·레이어 읽기가 성공해야 합니다.
Cloudflare Preview/SHA 확인과 R2 검증까지 완료 전에는 2단계를 완료로 표시하지 않습니다.

### 이번 프로젝트 변경 범위

새 문서 4개와 ROADMAP_STATUS/HANDOFF, AGENTS의 현재 단계 지침, .gitignore의
Wrangler/Supabase 로컬 캐시·.dev.vars 제외만 갱신합니다. 앱 소스와 의존성은 보존합니다.
변경은 미커밋 상태입니다. 이 단계 문서의 commit/push는 별도 실행하지 않았습니다.
