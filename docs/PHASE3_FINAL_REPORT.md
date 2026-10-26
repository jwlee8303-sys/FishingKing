# FishingKing 3-10 — 3단계 최종 검증 및 4·5단계 인수인계

확인일: 2026-10-26 (Asia/Seoul). 공통 개발 지침 v3.1 적용.
최신 후속: [3-10-R1 조사·수정 보고서](PHASE3_10_R1_FIX_REPORT.md). 검사 서버의 문서 변경 간섭을 수정했으나
WebKit 회전 표시 실패는 최소WebGL에서도 재현돼 미해결입니다. 아래3-10 수치는 해당 실행 기록이며 R1 최종수와 합산하지 않습니다.
R1 전체자동검사는239 PASS/1 FAIL입니다. 원래Tablet은전체20/20 PASS지만 다른Desktop 입력timeout이 남았습니다.
새Desktop 선택3회통과를전체PASS로취급하지않으며, 핵심시각FAIL과함께3단계전체완료보류를유지합니다.
범위: 현재 파일·과거 원시 결과 감사, 전체 자동 검사, 문서 인수인계. 기존 구현을 다시 만들지 않습니다.
**판정: 3-09 자동 검사 완료 근거 확인. 3단계 전체 완료는 보류하며 후속 위험을 포함해 인수인계합니다.**
전체 재검사에서 발견한 실패는 미해결로 유지합니다. 실기기 미검증은 별도 잔여 위험이며 자동 검사 FAIL로 집계하지 않습니다.
실기기 성능·발열·배터리는 확인한 결과가 없으므로 PASS로 승격하지 않습니다. 4단계는 자동 착수하지 않습니다.

## 1. 전체 실행 단위 상태

| 단위 | 확인한 완료 범위 | 제한 |
| --- | --- | --- |
| 3-01 | 기존 코드·서비스·모바일 요구 감사 | 당시 준비 UI의 검사이며 현재 결과와 구분 |
| 3-02 | PC·모바일 화면/입력 UX 문서 설계 | 설계와 구현 차이를 최신 절에서 명시 |
| 3-03 | 토큰63·기본19+상태19·기본36프레임·게임상태7 | 로컬 MCP 재조회 JSON 보존, 이번 라이브 조회 실패 |
| 3-04 | 6개 React 화면·404·Tailwind·반응형·접근성 기반 | Auth/DB·랭킹/발견 자료는 목업 |
| 3-05 | SVG4·WebP3, PNG 원본3, Sharp 검사/변환 기반 | 최종 아트 확정·실기기 품질 검수는 별도 |
| 3-06 | AssetManifest·Resolver·Provider 계약·variant·보안 검사 | 실제 private 인증 Provider 없음 |
| 3-07 | 기본 PagesStaticProvider·BASE_URL·HTTP 검사 | 원격 운영 CDN·신규 저장소 연결은 제외 |
| 3-08 | 실제 Pixi 호수/배스·AssetImage·모의 입력·수명 관리 | 실제 낚시 엔진·포획 판정 없음 |
| 3-09 | 원시240 PASS 및 장시간 결과 확인, 자동 검사 범위 완료 | 실기기·성능 목표·heap 원인 미완료 |
| 3-10 | 최종 재검증·문서 인수인계 | 최종 실행 결과는 10절, 전체 완료 보류 |

### A~L 완료 기준별 최종 판정

| 기준 | 판정 | 근거·제한 |
| --- | --- | --- |
| A. Penpot 디자인 초안 완료 | 충족:기존 검증 기록 기준 | 토큰63·기본19/상태19·기본36프레임/게임상태7, 이번 라이브 재조회는 연결 실패 |
| B. React6개 화면 구현 | 충족 | 메인/낚시/도감/랭킹/프로필/로그인 및404, 인증·DB는 목업 |
| C. PC·모바일 반응형 UI 정상 | 부분 충족 | 지정6 viewport의 배치·최소44px·가로 넘침 검사 통과, 회전 후 장면 표시 문제는E에 남음 |
| D. 모바일 터치 모의 입력 정상 | 충족:자동 검사 범위 | cast/reel/move/react·owner/취소·회전/백그라운드 해제, 실제 포획 판정 아님 |
| E. PixiJS 배경 및 물고기 정상 출력 | 부분 충족 | Chromium·WebKit 최초 세로 출력 확인, WebKit 회전 후 시각FAIL 미해결 |
| F. Asset ID 기반 공통 접근 | 충족 | 공통Manifest/Resolver/Provider·6ID/7파일·모바일variant |
| G. PagesStaticProvider 정상 동작 | 충족:로컬 검증 범위 | 비동기URL/공개 전용·3base/HTTP21응답, 운영CDN 이번 미조회 |
| H. Provider 교체 테스트 통과 | 충족:테스트 대역 기준 | Provider 주입·비동기 해석·URL별 캐시 분리, 외부 저장소 실제 이전 아님 |
| I. 이미지 fallback 및 보안 검증 | 충족:구현·자동 검사 범위 | 로딩 실패/terminal·순환/경로/접근 검사, 운영RLS/실제 인증Provider는 후속 범위 |
| J. 에셋 자동 검사 정상 | 충족 | 실제7파일 오류0/경고0·assets:test10 PASS |
| K. 전체 빌드·자동 테스트 통과 | 미충족 | R1 타입/lint/build·단위208·에셋10 PASS, 전체Playwright239 PASS/1 FAIL(Desktop 입력timeout),원래Tablet20/20 PASS |
| L. 문서 및 인수인계 완료 | 충족 | 요청5문서 갱신·종합보고서 신규·4/5단계 인수인계 기록 |

**핵심 기능 오류가 남아 있다면 3단계 완료로 처리하지 않습니다.** 현재E의 회전 후 표시 실패와K의 전체 검사 실패가
미해결이므로 전체 완료 보류입니다. 선택 재검사3회 통과를 최초 전체 실행 통과로 바꾸지 않습니다.
실기기 미검증은 별도 잔여 위험으로 기록하며 자동FAIL/추가 필수 완료 조건으로 집계하지 않습니다.
WebKit 에뮬레이션은 실제 iPhone Safari 결과가 아닙니다. 실제 휴대폰 성능·발열·배터리는 미확인·미측정입니다.
성능 목표60FPS/저성능30FPS 수준 조작과3-09 실측 재사용값은11절의 별도 열로 구분합니다.
문서·인수인계 완료를 구현/검증 실패 해소로 해석하지 않으며4단계는 자동 시작하지 않습니다.

## 2. 3-09 결과 재확인 근거

PHASE3_09_TEST_REPORT.md와 MOBILE_DEVICE_TEST_CHECKLIST.md가 실제 존재합니다.
`.local/phase3-09/e2e-final.json`을 파싱해240 expected/0 unexpected/0 skipped/0 flaky,
총966.151초·Chromium120/WebKit120·retry0을 확인했습니다. 이전 실패/수정/수동 재실행 이력은 원 보고서에 보존합니다.
단위208·에셋10은 과거 문서 기록을 확인했고 이번에도 실제 재실행해 통과했습니다.

장시간 원시 `chromium-soak-f2pFyC/report.json`은 PASS,601.282초·회전30·입력100·재진입30,
최종 앱/초기화/텍스처/참조/정리/canvas0입니다. 강화된 종료 대기의30회 재진입 및 WebKit/DPR1 단기 보고서도 존재합니다.
해당4개 보고서의 snapshot/src·public·tests/fixtures를 현재 파일과 바이트 비교해 불일치/누락0을 확인했습니다.
따라서 성능·장시간 결과는 재사용하고 동일한10분 검사를 반복하지 않았습니다. 이번 새 측정으로 표현하지 않습니다.
재검증 증거는 `.local/phase3-10/prior-evidence.json`입니다. 과거 E2E에는 전용 소스 스냅샷이 없어 현재 재검사와 구분합니다.

## 3. 구현 기능·실제 파일 현황

시작 경로 D:\FishingKing, 브랜치 main, HEAD `9a0dc865af692b6cc3304ad936221047918d206d`.
시작127파일의 SHA-256을 기록했습니다. Git에는 기존 추적 수정17·미추적59파일(전체 경로 기준)이 있었습니다.
3-10 제품 코드/패키지/테스트/운영 설정 변경은 없습니다. 문서5개 갱신·종합 보고서1개 신규이며 기존 변경은 보존합니다.

| 실제 구현 위치 | 내용 |
| --- | --- |
| src/pages, src/components/layout, ui.tsx/content.tsx | 메인·낚시·도감·랭킹·프로필·로그인·404·공통 UI |
| src/styles/tokens.css, global.css, docs/design/*.json | 디자인63토큰·반응형·Safe Area·버튼44px 이상 |
| src/components/AssetImage.tsx, game/GameCanvas.tsx | 논리 ID 이미지 표시·lazy Pixi 장면·로딩/오류 |
| src/game/InputController.ts, scene.ts, TexturePool.ts | 모의 명령·Sprite/resize·공유 Promise/참조 수·마지막 unload |
| src/assets/manifest.ts, registry.ts, validation.ts, variants.ts | ID/메타데이터·경로·접근/fallback·순수 변형본 선택 |
| src/services/asset*.ts, pagesStaticProvider.ts, imageFailures.ts | URL/Provider 중앙화·비동기 해석·안전 오류 분류 |
| public/assets, graphics/source, graphics/recipes.json | 배포7파일·원본3·변환 설정·출처 |
| scripts/graphics, scripts/testing, tests/unit, tests/e2e, tests/graphics | 에셋/HTTP·라우트/장시간·단위/브라우저 회귀 |

이번 변경: ROADMAP_STATUS/HANDOFF/ASSET_STORAGE/ASSET_ARCHITECTURE/MOBILE_GAME_UX의 최신 절 및 이 보고서.
전체 현재 Git 경로 목록과 시작 대비 보존 결과는 마지막 절에 기록합니다. `.local/phase3-10`은 Git 제외 증거입니다.

## 4. Penpot 디자인 결과

DESIGN_SYSTEM/PENPOT_MCP_WORKFLOW, design/penpot-manifest.json·penpot-verification.json·tokens.draft.json을 확인했습니다.
기존 파일 ID는 `685eebd9-2ce2-80a4-8008-d7b0b4e16646`. 토큰63·색12·타이포6,
컴포넌트38(기본19+상태19), PC6화면 및 모바일 세로/가로·태블릿을 포함한 기본36프레임·게임상태7 기록입니다.
CSS63변수는 `node scripts/sync-design-tokens.mjs --check`로 일치 확인. 실시간 양방향 동기화는 없습니다.

이번 MCP 안내 조회는 성공했으나 읽기 execute_code는 **No Penpot instance connected for user token**으로 실패했습니다.
따라서 원본 최신 상태의 실제 재조회 PASS는 아닙니다. 기존 재조회 JSON/검증 문서를 사용했고 원본 변경·재연결 설정은 하지 않았습니다.
필요한 라이브 재검토는 기존 파일 탭의 File → MCP Server → Connect 후 읽기 전용으로 진행합니다.

## 5. React UI 결과

6개 화면과 기존404는 App.tsx/AppLayout/NavLink/Outlet 경계를 유지합니다.
현재 실제 로그인·DB 데이터 조회는 없습니다. 도감 기본 발견0건/별도 샘플, 랭킹 fixture,
프로필 계정 예시는 UI 시연이며 계정/세션/공식 기록을 만들지 않습니다.
모든 페이지에 의미 없는 로딩/오류를 새로 넣지 않고 실제 시연 상태가 있는 도감·랭킹·게임·로그인 중심으로 확인합니다.
전체 E2E는 메뉴·이동·reload·404·본문 바로가기·dialog 포커스·터치44px·overflow·Safe Area 기본 padding을 검사합니다.
노치의 실제 nonzero inset·OS 키보드·주소창·문자 확대 접근성 인증은 이 검사로 확정하지 않습니다.
추가 상태4개는 PASS이며 도감·랭킹의 로딩/오류/빈 상태/재시도, 도감 검색0건/초기화,
프로필 비회원/로그인 시연·계정 관리 disabled를 Chromium/WebKit의PC/모바일에서 확인했습니다(정상 콘솔 오류0).
PC Chromium·모바일 Chromium 및 WebKit 최초 세로 이미지의 대표 스크린샷을 육안 확인했습니다.
**WebKit 회전 후 시각 표시는 실패**했으며 자동 DOM/메타데이터 PASS와 구분합니다. smoke 스크린샷은 로딩 중일 수 있습니다.

## 6. PixiJS·모바일 입력 결과

실제 호수 가로/세로 WebP와 배스 Sprite는 Asset ID로 로딩합니다. GameCanvas는 StrictMode의 lazy import/init 후
언마운트 경합을 보호하고, scene은 실제 컨테이너 resize·DPR상한2·maxDpr1 옵션·background revision을 관리합니다.
회전 시 모의 횟수/상태는 보존하고 누름은 해제합니다. 새 배경보다 늦은 이전 응답은 적용하지 않습니다.

PC 마우스·C/R/E·WASD/방향키·Enter/Space, 모바일 cast/reel/move/react,
길게 누름·pointer owner·멀티터치·이탈/취소·repeat/폼 제외·blur/hidden/메뉴/회전/언마운트 해제를 검사합니다.
네이티브 Chromium CDP touch와 WebKit native tap/Pointer Events의 범위를 구분합니다.
WebKit 네이티브 다중 손가락/touchCancel·실제 Android/iPhone은 미검증입니다. 화살표 기반 방향 조작이며 아날로그 joystick은 없습니다.
TexturePool은 canonical URL별 Promise/참조를 공유하고 마지막 release만 unload합니다.
Application.destroy에서 다른 소비자의 texture/textureSource를 일괄 파괴하지 않습니다.

## 7. 에셋 아키텍처 검사

등록 ID: fish.bass.main / background.lake.day / icon.fishing.rod / icon.fishing.reel / icon.fishing.hook / placeholder.image.
6개 ID가7파일을 관리합니다. mobile-portrait만 추가 파일이며 가로/desktop은 default를 사용합니다.

| 요구 항목 | 확인 계층 |
| --- | --- |
| 정상/잘못된 ID·누락·fallback·순환 | validation/Resolver 단위·AssetImage/Pixi 회귀 |
| 접근 거부·private/public·경로 탐색 | PagesStaticProvider/Resolver 단위·공개 폴더 검사 |
| 모바일 variant·Provider 교체·비동기 URL/만료·취소 | 순수 variant·Mock 계약·실제 로더 경합/공유 장면 검사 |
| MIME·SHA-256·치수·용량·파일 누락 | assets:check/test 및 HTTP 실제 응답21개 |
| BASE_URL·루트·/fishingking/·절대 HTTP | 격리 production build·compiled BASE_URL·test:paths |
| HTTP404/500/네트워크·HTML200·decode·terminal placeholder | 브라우저 응답 대체와 이미지 실패 분류 단위 검사 |
| 텍스처 캐시/참조·마운트/언마운트 | TexturePool/scene 단위·반복 재진입·기존 장시간 관찰 |

AssetResolver는 다운로드하지 않고 Provider 결과를 검증합니다. URL 반환 성공과 이미지 로딩 성공을 구분합니다.
메타데이터/접근 거부/취소/순환을 fallback으로 숨기지 않습니다. 실제 private 인증 Provider·Storage 연결은 미구현입니다.

## 8. 저장소 정책

공개 정적 파일은 public/assets → GitHub → 기존 Pages. R2 의도적 보류, Cloudinary 미연결/향후 검토,
Supabase Storage는 사용자 업로드가 필요할 때 기존 Free 플랜 우선 검토입니다. 비공개 자산은 공개 경로/번들에 넣지 않습니다.
소비자 HTTP URL 리터럴0, 새 키/서비스/유료 기능 추가0. 원격 서비스 설정·배포·캐시 purge는 하지 않았습니다.
로컬 HTTP 검증은 운영 CDN 최신 응답/캐시·계정 요금 전체 감사와 다릅니다.

## 9. 보안·보존 검증

추적/미추적 프로젝트 텍스트의 UTF-8 및 JSON/JSONC 문법을 검사합니다. VITE_ 실제 값·로컬 비밀 파일·전역 MCP 원문은 출력하지 않습니다.
소스/문서의 PEM 개인키·AWS access ID·Supabase secret·JWT 형식 탐색에서 일치0을 확인했습니다.
이는 제한된 패턴 검사이며 전체 비밀 유출 부재의 보증은 아닙니다. src/pages/components/game의 HTTP URL 리터럴은0입니다.
src의 실제 fetch는 이미지 실패 진단 경로이며 Supabase Auth/DB 클라이언트/기록 전송은 없습니다.
TypeScript strict 유지. 패키지/lockfile·그래픽·기존 테스트·서비스 설정은 시작 해시와 비교합니다.
git reset/clean/브랜치 변경/commit/push/운영 배포·DB 변경/R2·Cloudinary·과금/Penpot 쓰기는 하지 않았습니다.
프로세스 진단용 CIM 읽기는 접근 거부(HRESULT0x80041003)였으며 권한/보안 설정을 바꾸지 않았습니다. 기능 테스트 실패와 별개입니다.

## 10. 이번 전체 자동 검사

현재 package.json의 check/typecheck/lint/test/build/assets:check/assets:test/test:e2e/assets:http/test:paths를 확인했습니다.
test:soak의 기존 결과를 재사용합니다. assets:build는 이번 재실행하지 않았으며 그래픽 재생성은 필요하지 않습니다.

| 검사 | 3-10 결과 / 증거 |
| --- | --- |
| npm.cmd run check | exit0, TypeScript → ESLint → Vitest208 → Vite build PASS; check.log |
| 전체 단위 직렬 재확인 | 9파일208 PASS/0 FAIL/0 skip; unit-serial.log; 수 합산하지 않음 |
| assets:check | 실제7파일·Manifest ERROR0/WARNING0; assets-check.log |
| assets:test | 10 PASS/0 FAIL/0 skip; assets-test.log |
| assets:http | 3base×7파일=21응답 PASS; assets-http-report.json |
| 토큰 CSS | 63 verified, exit0 |
| 전체 Playwright | **239 PASS/1 FAIL**, 970.220초, skip/flaky/자동retry0; e2e.json/e2e-summary.json |
| 실패 사례 선택 반복 | 같은 tablet 재진입3회 **3 PASS/0 FAIL**,25.0초, 코드/timeout/assert 변경 없음; reentry-repeat.json |
| 경로별 production SPA | 3base×6화면=18 경로·메뉴/reload/404복귀 PASS, HTTP21응답 재확인; paths-report.json |
| 추가 도감/랭킹/프로필 상태 | Chromium/WebKit×PC/모바일=4 PASS, 콘솔오류0; ui-states.json |
| WebKit 추가 회전 시각 검사 | **FAIL**: 프레임 진행·준비 메타데이터에도 회전 후 페이지 캔버스가 비어 보임; webkit-rotation-visual.json 및 settled PNG |
| 최종 UTF-8/설정·보존·git diff --check | 최종 QA 결과는16절 |

전체 브라우저 재검사는 고유20개×12프로젝트=240건, retries0/worker1입니다.
Desktop Chromium1·Mobile Chromium5·WebKit6프로젝트를 분리 집계합니다.
실패 trace/스크린샷과 최초 실행 JSON을 보존하고 선택 재검사를 합쳐 전체 최초 PASS로 표현하지 않습니다.

| 전체 matrix 구분 | PASS | FAIL |
| --- | ---: | ---: |
| Desktop Chromium1440×900 | 20 | 0 |
| Mobile Chromium390/320/430·가로844·태블릿768 | 99 | 1 |
| WebKit 동일6 viewport | 120 | 0 |
| 합계 | 239 | 1 |

실패는 tests/e2e/stability.spec.ts:56의 tablet 반복 재진입 도중 모달 홈 링크 click입니다.
trace에서 visible/enabled/stable 판정 뒤 scrolling into view 단계가 끝나지 않고30000ms 제한을 초과했습니다.
오류는 timedOut, 기록된 테스트 duration37.911초입니다. 별도 선택3회는 통과했으므로 간헐 원인은 미확정입니다.
증거를 `.local/phase3-10/matrix-tablet-failure`에 복사했습니다. 시간 제한/기존assert를 완화하거나 skip하지 않았습니다.
첫 전체 실행의 실패를 선택 실행 성공으로 덮지 않습니다. 전체 최초가 PASS가 아니므로240 PASS로 보고하지 않습니다.

추가 시각 검사에서 WebKit 세로→가로→세로 회전 후 프레임은210/300까지 진행하고
배경 경로·입력 중립·canvas 크기는 정상이어도 페이지 스크린샷의 장면이 사라졌습니다.
기존 E2E의 단일 픽셀 alpha255 검사는 그림 내용·실제 합성 출력을 보장하지 못합니다.
코드를 쓰지 않은 응답 대체 진단으로 preserveDrawingBuffer=true를 대조했을 때 내부 색상 픽셀은 생겼지만
페이지 스크린샷은 여전히 비어 보였습니다. 임시 canvas translateZ(0) 대조도 개선을 확인하지 못했습니다.
정확한 제품/Windows WebKit 합성·스크린샷 환경 원인은 미확정이며 실제 iPhone도 미검증입니다.
원인 검증 없이 비용이 드는 buffer 보존/렌더러 교체를 제품에 적용하지 않았습니다.
참고한 공식 [Pixi Application 옵션](https://pixijs.com/8.x/guides/components/application)의 buffer 보존 설명은
합성 원인을 입증하는 자료가 아닙니다. 진단3종 소스/JSON/PNG는 `.local/phase3-10/webkit-*`에 있습니다.
이 진단 도구 exit0은 실행 완료를 뜻하며 시각 검증 PASS가 아닙니다.

## 11. 성능·장시간 안정성 — 3-09 원시 값 재사용

아래 실측은 **2026-10-25의 3-09 Windows headless 검사 결과를 재사용**한 것입니다.
3-10에서 새로 측정한 성능값이나 실제 휴대폰 측정값이 아닙니다. 목표·실행 설정·실측·추정치를 구분합니다.

| 항목·측정 조건 | 목표 또는 검사 설정 | 실제 측정값 | 판정·한계 |
| --- | --- | --- | --- |
| Chromium DPR2 장시간 렌더 FPS | 성능 목표:60FPS 지향, 저성능 환경에서도30FPS 수준의 조작 가능성 | 평균30.99FPS, 하위5% 근사20FPS | 60FPS 미달. 평균만으로 안정적30FPS 조작 달성을 인정하지 않음 |
| Chromium DPR1 단기 렌더 FPS | 같은 성능 목표 | 평균58.00FPS,15.052초 관찰 | 단기 표본, 지속60FPS/실기기 달성 근거 아님 |
| WebKit DPR2 단기 렌더 FPS | 같은 성능 목표 | 평균50.18FPS,15.026초 관찰 | 단기 표본, 장시간·실기기 조작 달성 근거 아님 |
| Chromium DPR2 프레임 시간 | 별도 수치 합격 기준 미확정 | 중앙값33ms, p95/p99 50/50ms | 실측 분포이며 목표값이 아님 |
| Chromium 연속 유지 | 검사 설정:600초 | 601.282초 | 해당 연속 유지 검사 완료 |
| 회전/입력 시작·종료 쌍/재진입 | 검사 설정:30회/100쌍/30회 | 30회/100쌍/30회 | 해당 기능·반환 검사 PASS |
| 홈 복귀 후 앱/초기화/텍스처/참조/정리/canvas | 검사 기대값:각0 | 각0 | 관찰 범위의 리소스 반환 확인 |
| 홈 복귀 후 DOM·전역 listener | 검사 기대:워밍업 기준으로 복귀 | DOM158, global listener17/1/0 | 이 수치는 해당 실행의 기준/복귀 실측이며 일반 성능 목표가 아님 |
| GC 후 JS heap | 허용 증가량 수치 기준 미확정 | 16,333,556 →18,886,136bytes, 증가2,552,580bytes | 원인 미확인, 누수 부재 PASS 판정 불가 |
| 이미지 전송 | 요청 수/전송량 합격 예산 미확정 | 전체3건369,335bytes, 최초2건218,648bytes | 해당 실행의 네트워크 관찰값, 목표/상한이 아님 |
| WebKit 장시간 | 검사 계획:600초 | 미실행 | 목표 시간을 실제 실행 시간으로 표시하지 않음 |
| GPU 메모리·실기기 발열/배터리 | 수치 기준 미확정 | 미측정 | 픽셀 수 계산·JS heap·에뮬레이터 값으로 대체하지 않음 |

`app.ticker.maxFPS=60`은 **렌더링 상한 설정**이며 실제60FPS 측정값이 아닙니다.
`maxDpr=1/2`는 품질 설정입니다. width×height×4는 버퍼 용량 추정식이며 GPU 메모리 실측값이 아닙니다.
하위5% FPS는 프레임 시간 분포에서 계산한 근사값으로, 물리 기기의 최저FPS 실측과 구분합니다.

60FPS 지향 목표는 DPR2에서 미달, 안정적30FPS도 달성 판정하지 않습니다.
JS heap 증가를 확정 누수로 판단하지 않지만 누수 부재도 선언하지 않습니다. 메모리 스냅샷으로 retained object 경로를 추적해야 합니다.
기존 maxDpr1 옵션이 있으나 자동 품질 정책/사용자 설정은 미구현입니다. 실기기 측정 후 5단계 품질/부하 예산을 정합니다.
3-09 보고서의 Windows10/Playwright 공식 지원 범위 제한을 계승하며 이번 공식 지원 현황을 새로 웹 조회한 것은 아닙니다.

## 12. 미완료·잔여 위험과 후속 조치

| 항목 | 판정·후속 조치 |
| --- | --- |
| 태블릿 Chromium 재진입 timeout | 전체239/1에서 실제 실패. 동일 조건 선택3회 통과했으나 원인 미확정. trace 보존, 재현 시 DOM/브라우저 응답 추적 필요 |
| WebKit 회전 후 장면 표시 | 추가 시각FAIL. DOM/경로/불투명 픽셀 PASS만으로 합격 불가. 지원 환경 WebKit/실제 Safari 대조 및 합성/resize 경로 추적 필요 |
| DPR2 성능 | 목표 미달. 실기기 frame/입력 지연 관찰, DPR1 비교 및 품질 정책 설계 |
| retained heap | 증가 원인 미확인. 동일 조건 반복 GC/heap snapshot으로 보유 경로 확인 |
| 실제 Android/iPhone | 미검증. 체크리스트의 회전/멀티터치/잠금·복귀/노치/키보드/10분 수행 |
| WebKit 장시간·GPU bytes·발열/배터리 | 미완료/미측정. 에뮬레이터 FPS나 픽셀 수로 대체하지 않음 |
| Penpot 최신 라이브 조회 | 연결 인스턴스 없음, 필요 시 기존 탭 연결 후 읽기 전용 확인 |
| 운영 CDN/배포 | 이번 미검증·미배포. 사용자 승인 시 원격 응답/ETag/캐시 확인 |
| DB/Auth/정식 게임 | 후속 단계 범위, 현재 모의 입력/목업을 공식 기록으로 사용 금지 |

필수 검증 전부 통과로 간주할 수 없어 **3단계 전체 완료 표시는 보류**합니다.
현재 보류 판정에는 전체 자동 검사의 Chromium timeout과 추가 시각 검사의 WebKit 회전 표시 실패가 남아 있습니다.
실기기 미검증 자체를 자동 테스트 실패나 별도의 필수 완료 조건으로 추가하지 않습니다.
4단계 설계 인수인계 자료는 준비됐으나 실제 구현 착수는 별도 지시를 기다립니다.

### 별도 잔여 위험 — 실제 휴대폰 미검증

Android Chrome·iPhone Safari의 실제 터치/멀티터치·회전·잠금/복귀·노치·주소창·가상 키보드·지속 성능은 미검증입니다.
실제 휴대폰 발열·배터리 사용량은 실기기 검증 전까지 **미확인·미측정**으로 유지합니다.
WebKit 에뮬레이션은 실제 iPhone Safari 결과가 아니며, 이 미검증 상태를 자동 FAIL 또는 실기기 PASS로 바꾸지 않습니다.
후속 실기기 검증은 MOBILE_DEVICE_TEST_CHECKLIST에 기기·OS·브라우저·소스·조건·실측 결과를 기록합니다.

## 13. 4단계 DB·인증·에셋 메타데이터 인수인계

현재 로컬 supabase에는 Git 제외 .temp만 있고 추적 스키마/migration은 없습니다. 원격 스키마는 이번 조회하지 않았습니다.
기존 프로젝트 `pjaducpbuqdlwkobwxbo`를 재사용하며 **4단계 첫 작업은 기존 스키마/테이블/제약/RLS/Auth 설정의 읽기 전용 확인**입니다.
원격 테이블이 없다고 추정하지 않고 새 프로젝트/중복 테이블을 만들지 않습니다. 운영 DB 변경 전 사용자 승인이 필요합니다.

| 준비 대상 | 설계 책임·확정할 내용 |
| --- | --- |
| fish_species | 안정된 어종 ID·공개 범위·논리 image_asset_id 연결; URL 저장 금지 |
| profiles | Auth 사용자 연결·닉네임/공개 정보·본인 수정 허용 필드 |
| catches | 사용자/어종/세션·서버 검증 결과, 클라이언트 보상/크기/포획 성공 신뢰 금지 |
| user_collection | 검증된 포획/발견에서 파생·중복/유일성·본인 접근 |
| comments | 작성자 소유권·공개/수정/삭제 정책·입력 검증 |
| game_sessions | 세션 소유권·시작/종료/중복/재연결·서버 결과 연결 |

위는 설계 준비 목록이며 이번 SQL/컬럼/migration/RLS를 생성·실행하지 않았습니다.
Asset ID와 어종 ID를 분리하고 실제 이미지 URL·서명 URL을 DB에 직접 저장하지 않습니다.
DB/API에서 받은 논리 ID는 unknown 경계에서 검증 후 기존 Resolver로 전달합니다.
DB 메타데이터와 정적 Manifest의 권위·버전·동기화/공개 범위는 구현 전에 확정합니다.

회원/비회원 플레이·익명 세션·로컬 기록 보존·로그인 승계/중복 병합 정책은4단계에서 확정합니다.
현재 임시 모의 입력 횟수·프로필 시연을 승계 가능한 공식 기록으로 취급하지 않습니다.
RLS는 anon/authenticated의 select/insert/update/delete와 소유자·필드별 허용 범위를 설계·검증하고,
service_role/secret은 서버에만 둡니다. 모든 포획·보상·공식 기록 변경은 서버 검증·중복 방지를 거칩니다.
클라이언트 ID/sequence/timestamp는 서버 인가·무결성 증명이 아닙니다.

## 14. 5단계 게임 엔진 인수인계

기존 GameCanvas·InputController·명령 envelope·공유 TexturePool·Resolver를 재사용합니다.
React HUD/조작은 src/components/pages, Pixi 렌더링은 src/game, 서버/외부 접근은 src/services 경계를 유지합니다.

구현 대상: **FishingEngine, FishSpawner, CastingSystem, BiteSystem, CatchSystem, AnimationSystem**.
실제 낚시 상태 전이·물고기 행동/이동·캐스팅→입질→파이팅→포획·PC/모바일 공통 조작·서버 포획 결과 검증을 설계합니다.
현재 cast/reel/move/react/reset은 모의 시각 반응이며 정식 낚시 규칙·시간/거리·AI·물리·포획/보상은 없습니다.
정식 규칙/상태 전이/서버 시간·재연결 정책은5단계에서 확정합니다.
입력 owner/epoch 취소를 보존하고 서버 결과는 인가·세션·중복 제출·상태/시간 유효성을 검증해야 합니다.
성능 미달·heap·실기기 위험을 엔진 부하 추가 전에 측정/대응하며 디바이스 DOM 처리를 엔진 안에 복제하지 않습니다.

## 15. 사용자 수동 작업과 중단 지점

실기기 합격을 위해 Android Chrome/iPhone Safari에서 MOBILE_DEVICE_TEST_CHECKLIST를 수행하고 기기/OS/소스·실측 결과를 기록합니다.
Penpot 최신 원본 확인이 필요하면 기존 파일 탭을 활성화해 MCP Connect를 유지합니다. 키/토큰을 채팅에 전달할 필요는 없습니다.
운영 배포·DB 변경·commit/push는 하지 않습니다. 4단계 준비 상태를 보고한 뒤3-10에서 종료합니다.

## 16. 최종 파일·Git 보존 결과

시작127파일 중 이번 요청 문서5개만 수정하고 나머지122개를 바이트 보존했습니다. 보고서1개 신규, 삭제0입니다.
제품 코드/테스트/패키지/lockfile/그래픽/서비스 설정의 새 변경은 없습니다.
최종 main/HEAD는 시작과 같으며 Git 전체 상태는 추적 수정18·미추적60파일입니다.
아래에는 3-10 이전부터 존재하던 변경도 포함됩니다. 이번 새 코드 변경 목록으로 해석하지 않습니다.

최종 QA: 프로젝트 텍스트116개 UTF-8·JSON/JSONC 설정11개 문법·git diff --check PASS.
제한된 비밀 패턴 탐색 일치0·소비자 HTTP URL 리터럴0·예상 밖 파일 변경0·삭제0.
검증 증거: .local/phase3-10/baseline.json, preservation.json, final-verification.json, 각 검사 log/JSON.

```text
 M docs/HANDOFF.md
 M docs/MOBILE_GAME_UX.md
 M docs/ROADMAP_STATUS.md
 M package-lock.json
 M package.json
 M playwright.config.ts
 M src/components/game/GameControls.tsx
 M src/components/layout/AppLayout.tsx
 M src/components/ui.tsx
 M src/game/README.md
 M src/main.tsx
 M src/pages/CollectionPage.tsx
 M src/pages/GamePage.tsx
 M src/services/assets.ts
 M src/styles/global.css
 M src/types/assets.ts
 M tests/e2e/smoke.spec.ts
 M tsconfig.tests.json
?? docs/ASSET_ARCHITECTURE.md
?? docs/ASSET_STORAGE.md
?? docs/GRAPHICS_PIPELINE.md
?? docs/MOBILE_DEVICE_TEST_CHECKLIST.md
?? docs/PHASE3_08_GAME_INTEGRATION.md
?? docs/PHASE3_09_TEST_REPORT.md
?? docs/PHASE3_FINAL_REPORT.md
?? graphics/PROVENANCE.md
?? graphics/prompts.json
?? graphics/recipes.json
?? graphics/source/bass-main.png
?? graphics/source/lake-day-mobile.png
?? graphics/source/lake-day.png
?? public/assets/backgrounds/lake-day-mobile.webp
?? public/assets/backgrounds/lake-day.webp
?? public/assets/fish/bass-main.webp
?? public/assets/icons/fishing-rod.svg
?? public/assets/icons/hook.svg
?? public/assets/icons/reel.svg
?? public/assets/placeholders/image-missing.svg
?? scripts/graphics/build.mjs
?? scripts/graphics/check-static.mjs
?? scripts/graphics/check.mjs
?? scripts/graphics/lib.mjs
?? scripts/graphics/manifest-check.mjs
?? scripts/testing/dev-server.mjs
?? scripts/testing/e2e.mjs
?? scripts/testing/paths.mjs
?? scripts/testing/stability.mjs
?? src/assets/manifest.ts
?? src/assets/registry.ts
?? src/assets/validation.ts
?? src/assets/variants.ts
?? src/components/AssetImage.tsx
?? src/components/game/GameCanvas.tsx
?? src/game/InputController.ts
?? src/game/TexturePool.ts
?? src/game/scene.ts
?? src/services/assetErrors.ts
?? src/services/assetProvider.ts
?? src/services/assetResolver.ts
?? src/services/assetRuntime.ts
?? src/services/assetUrls.ts
?? src/services/imageFailures.ts
?? src/services/pagesStaticProvider.ts
?? tests/e2e/gameIntegration.spec.ts
?? tests/e2e/graphics.spec.ts
?? tests/e2e/loadingEdges.spec.ts
?? tests/e2e/stability.spec.ts
?? tests/fixtures/MockAssetProvider.ts
?? tests/fixtures/browserScenes.ts
?? tests/graphics/pipeline.test.mjs
?? tests/unit/AssetImage.test.tsx
?? tests/unit/GameCanvas.test.tsx
?? tests/unit/TexturePool.test.ts
?? tests/unit/assets.test.ts
?? tests/unit/gameInput.test.tsx
?? tests/unit/pagesStaticProvider.test.ts
?? tests/unit/scene.test.ts
?? tests/unit/stability.test.tsx
```
