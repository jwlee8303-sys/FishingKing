# FishingKing 3-08 — 실제 에셋·PixiJS·모의 입력 통합

작성일: 2026-10-25 (Asia/Seoul). 3-08 구현 완료, 3-09 자동 진행 없음.
기존 3-05~3-07 미커밋 변경·라우터·UI·그래픽·외부 연결을 보존했습니다.
패키지/lockfile·운영 배포·DB·인증·Penpot·과금 설정 및 commit/push를 변경하지 않았습니다.

## 1. 조사와 범위

AGENTS, ROADMAP_STATUS, HANDOFF, SCREEN_DESIGN, MOBILE_GAME_UX, DESIGN_SYSTEM,
GRAPHICS_PIPELINE, ASSET_ARCHITECTURE, ASSET_STORAGE, PHASE3_04_UI_IMPLEMENTATION 및 실제 소스를 확인했습니다.
시작 main/HEAD는 9a0dc865af692b6cc3304ad936221047918d206d, 파일104개의 SHA-256을 로컬에 기록했습니다.
Vite8.3.4·React19.3.1·TypeScript6.0.3·Tailwind4.3.3·PixiJS8.22.0·Playwright1.64.1 및 기존 npm 테스트 환경을 사용합니다.
3-07의6개 논리 ID/7파일, 기본 PagesStaticProvider·Resolver·순수 variant 선택을 재사용했습니다.

이번 모의 장면에는 실제 배경/배스 이미지, 버튼/단축키에 따른 표시 변화가 있습니다.
실제 물고기 AI·낚시 물리·포획 판정·경험치·재화·랭킹 저장·서버 판정은 구현하지 않았습니다.

## 2. 생성·수정 파일

| 구분 | 파일 |
| --- | --- |
| React 신규 | src/components/AssetImage.tsx, src/components/game/GameCanvas.tsx |
| 게임 신규 | src/game/InputController.ts, src/game/TexturePool.ts, src/game/scene.ts |
| 서비스 신규 | src/services/imageFailures.ts |
| 단위 테스트 신규 | tests/unit/AssetImage.test.tsx, GameCanvas.test.tsx, TexturePool.test.ts, gameInput.test.tsx, scene.test.ts |
| E2E 신규 | tests/e2e/gameIntegration.spec.ts |
| UI 수정 | src/pages/GamePage.tsx, CollectionPage.tsx, src/components/game/GameControls.tsx, src/styles/global.css |
| 문서 | 이 문서 신규, ROADMAP_STATUS/HANDOFF/ASSET_ARCHITECTURE/ASSET_STORAGE 및 src/game/README.md 갱신 |

게임 HUD/버튼/D-pad/메뉴·Modal·일반6개 화면·404 및 Safe Area/dvh·최소44px 정책을 유지했습니다.
기존 AssetVisual과 경로 함수는 다른 화면을 위해 보존했습니다. 도감은 여전히 발견0건이 기본이며
별도 접힌 에셋 미리보기만 배스 이미지를 보여줍니다. 사용자 발견 기록으로 등록하지 않습니다.

## 3. React AssetImage

```tsx
<AssetImage assetId="fish.bass.main" alt="배스 그래픽 샘플" />
<AssetImage assetId="background.lake.day" alt="호수" context={{ layout: 'mobile-portrait' }} />
```

ID를 Resolver에 전달하고 반환 URL을 img.src에 사용합니다. 기본 loading=lazy/decoding=async이며 브라우저 속성을 전달할 수 있습니다.
로딩·완료·terminal 오류를 표시하며 alt 텍스트를 지원합니다. resolver와 fallback 정책을 테스트/승인된 교체 시 주입할 수 있습니다.
외부 문자열은 resolveExternalAsset으로 검증하고 기본 URL 실패와 ID 오류를 구분합니다.
동등한 새 context 객체는 재로딩하지 않습니다. 요청 generation과 AbortController로 이전 ID·언마운트 결과를 무시합니다.
이미지 이벤트/실패 진단 완료에도 generation을 검사하며 같은 URL의 중복 error 처리를 막습니다.
상태 코드만 data-error-code/kind에 제공하고 URL·키·응답 본문을 로그로 출력하지 않습니다.

## 4. GameCanvas와 Pixi 생명주기

GameCanvas는 게임 경로에서 scene 모듈을 lazy import합니다. 일반 화면은 Pixi 런타임을 초기화하지 않습니다.
React는 HUD/조작/접근성을, src/game/scene.ts는 캔버스와 Sprite를 소유합니다.
Pixi8 공식 두 단계 초기화 `new Application(); await app.init(...)`와 `Assets.load`/Sprite를 사용했습니다.
근거: [Application](https://pixijs.com/8.x/guides/components/application), [Assets](https://pixijs.com/8.x/guides/components/assets).

Effect 인스턴스별 취소 표시로 StrictMode의 이전 lazy import가 새 장면을 중복 생성하지 못하게 합니다.
초기화 중 언마운트됐다면 init 완료 후 자신의 app을 파괴하며 DOM에 canvas를 붙이지 않습니다.
일반 HUD/모의 상태 업데이트는 app을 재생성하지 않습니다. 테스트용 loadScene 주입 지점으로 실제 GPU 없이 이 경합도 검증했습니다.
ResizeObserver 미지원 또는 renderer 초기화 실패는 명확한 장면 오류 상태로 종료하며 페이지 전체를 종료하지 않습니다.

## 5. 실제 이미지와 모바일 전환

fish.bass.main 및 background.lake.day를 먼저 Resolver로 해결한 후 반환 URL을 Pixi Assets API에 전달합니다.
저장소 URL을 장면에서 직접 조립하지 않습니다. 기본 Provider는 기존 PagesStaticProvider입니다.
리소스 키는 반환 URL을 document.baseURI 기준 절대 URL로 정규화해 사용합니다. 논리 ID alias를 Pixi 전역에 등록하지 않습니다.

게임 viewport를 기존 selectAssetLayout에 전달합니다. 세로는 mobile-portrait 파일, 가로·desktop은 default 파일입니다.
컨테이너 크기는 실제 ResizeObserver 측정값으로 렌더러에 전달합니다. viewport는 반응형 layout 판정에만 사용합니다.
같은 layout에서는 배경을 다시 요청하지 않고, layout 변경 시 revision을 증가시킵니다.
이전 요청이 늦게 완료되면 그 lease를 해제하고 적용하지 않습니다. 새 배경이 준비될 때까지 기존 배경을 유지합니다.
캐스팅/입질 횟수와 모의 모델은 회전 후 유지하며 누르고 있는 입력은 취소합니다.

## 6. 좌표계와 품질

장면 좌표는 컨테이너 CSS px입니다. 렌더 버퍼만 DPR을 곱하며 기본 상한은2입니다.
SceneOptions.maxDpr=1로 픽셀 비용을 낮출 수 있습니다. 자동 기기 등급 판정이나 사용자 설정 UI는 추가하지 않았습니다.
배경은 종횡비를 유지한 중앙 cover, 배스는 화면 폭46%·높이30% 이내 contain 비율로 배치합니다.
기본 배스 위치는 장면50%/62%, 정규화 방향 입력에 따라 화면 안에서 이동합니다.
장면은 HUD/버튼과 분리되고 canvas는 포인터를 가로채지 않습니다. Safe Area는 기존 GameShell이 담당합니다.

## 7. 공통 명령과 모의 상태

InputController는 DOM·입력 장치에 독립적인 명령을 발행합니다. MOBILE_GAME_UX의 점 표기 계약을 우선했습니다.

| 명령 | 의미 |
| --- | --- |
| cast.start / cast.aim / cast.commit / cast.cancel | 캐스팅 누름·drag 강도·정상 해제·취소 |
| reel.start / reel.end | 길게 누르는 동안 감기, 정상/취소 종료 |
| move | 정규화 방향 벡터, 해제 시0 |
| react | 입질 버튼 down당1회 |
| input.reset | 전체 해제·epoch 갱신 |

envelope는 sequence/inputEpoch/monotonic timestamp/source/활성화별 고유 activationId를 제공합니다.
정상 cast 종료만 모의 casts를 증가시키고 취소 후 늦은 up은 commit하지 않습니다. 실게임 포획 수가 아닙니다.
캐스팅은 배스 색·기울기, 릴은 누르는 동안 작은 이동, 방향은 위치, 입질은 자세와 HUD 안내로 표현합니다.
모의 모델을 Pixi ticker가 읽으며 React를 매 프레임 렌더링하지 않습니다.

## 8. Pointer Events·PC 입력

기존 CastButton/ReelButton/HookButton/DirectionControl을 확장했습니다. Pointer capture와 button owner를 사용합니다.
capture가 다른 pointer의 up/lostcapture를 현재 owner의 종료로 오인하지 않도록 ID를 검사합니다.
근거: [Pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture).

- down/up/cancel/lostcapture, 릴 버튼 이탈 즉시 정지, 같은 버튼의 추가 pointer 무시를 처리합니다.
- cast는 이탈 시 disarm하고 재진입하면 rearm합니다. 바깥 release는 취소, drag 강도는0~1로 제한합니다.
- 방향 포인터1개+행동1개는 동시 허용합니다. cast/reel은 배타적이며 react는 기존 행동을 취소하고 선점합니다.
- 방향키/WASD를 합성하고 반대 축을 상쇄합니다. 벡터 길이는1 이하입니다.
- C 캐스팅 / R 릴 / E 입질, Enter·Space의 기존 버튼 접근성과 보조기술 click을 지원합니다.
- key repeat/native click 중복, 폼/contenteditable/대화상자 및 Ctrl/Alt/Meta 조합 입력을 차단합니다.
- 메뉴·blur·visibilitychange·회전/resize·VisualViewport 변화·언마운트 시 누름을 취소합니다.
  메뉴 닫기/foreground 복귀가 이전 누름을 자동 재개하지 않습니다.

touch-action:none은 기존 직접 조작 버튼에만 유지합니다. body 확대나 일반 페이지 스크롤을 차단하지 않았습니다.
방향은 기존 화살표 버튼으로 조작하고 mouse/touch drag는 캐스팅 영역에서 검증했습니다. 별도 joystick을 중복 추가하지 않았습니다.

## 9. 실패·fallback

ID 문법/미등록, INVALID_ASSET_METADATA, Provider 오류, ACCESS_DENIED와 실제 로딩 오류를 구분합니다.
브라우저/Pixi 로딩 실패 후에만 진단 fetch를 수행해 HTTP_NOT_FOUND/HTTP_ERROR/NOT_IMAGE/DECODE_FAILED/NETWORK를 기록합니다.
HTML200 SPA fallback은 이미지 성공으로 처리하지 않습니다. 정상 이미지는 추가 진단 다운로드를 하지 않습니다.
명시적 fallback 정책에서만 개별 fallbackId/placeholder.image를 해결하며 private·메타데이터 보안 오류를 숨기지 않습니다.
placeholder 자체가 실패하면 terminal 오류로 종료합니다. 네트워크 실패가 앱 전체를 종료하거나 무한 재귀하지 않습니다.
실제 정상 파일은 브라우저 이미지/Pixi 디코딩으로 검증하고, 고의 실패는 단위 테스트와 Playwright 응답 대체로 검증했습니다.

## 10. 리소스·캐시 정리

TexturePool은 canonical URL당 in-flight Promise·참조 수를 공유합니다. 같은 URL의 상대/절대 표현도 같은 소유권입니다.
Provider가 바뀌어 URL이 바뀌면 다른 키를 사용하고, 논리 ID alias로 과거 텍스처를 재사용하지 않습니다.
마지막 lease가 끝난 뒤에만 Assets.unload를 호출합니다. unload 중 재획득은 종료를 기다린 후 새로 로딩합니다.
실패한 Promise는 영구 캐시하지 않습니다. 반복 release는 무시합니다.
종료 시 Observer/이벤트/구독/ticker/app/canvas를 정리합니다. Sprite/app 파괴에는 texture/textureSource=false를 사용합니다.
다른 장면의 공용 텍스처와 전역 Assets 캐시를 일괄 파괴하지 않습니다. 이후 Pixi 장면도 반드시 같은 Pool 경계를 이용해야 합니다.
공유 로딩은 다른 소비자를 위해 강제 abort하지 않고, 폐기된 소비자는 완료 후 즉시 lease를 해제합니다.
비활성 탭·메뉴 pause 동안 ticker를 중지합니다. 기존 Pages 캐시 정책은 유지합니다.

## 11. 성능 표본

Windows 설치 Chrome headless·Vite dev,6개 독립 컨텍스트에서 준비 후650ms 간격3회 ticker.FPS를 관찰했습니다.
짧은 순간 추정치이며 장시간 FPS/프레임타임·메모리·실기기 성능 목표 달성을 증명하지 않습니다.
60FPS 지향·저성능30FPS 목표는 여전히 실기기 검증 대상입니다. 발열·배터리는 미측정입니다.

| viewport | CSS canvas | DPR | 실제 buffer | 관찰 FPS 표본 범위 |
| --- | --- | --- | --- | --- |
| 320×568 | 288×280 | 2 | 576×560 | 59.9~60.6 |
| 390×844 | 358×556 | 2 | 716×1112 | 59.5~60.2 |
| 430×932 | 398×644 | 2 | 796×1288 | 59.9~60.2 |
| 844×390 | 528×306 | 2 | 1056×612 | 59.9 |
| 768×1024 | 736×736 | 2 | 1472×1472 | 59.5~59.9 |
| 1440×900 | 1044×720 | 1 | 1044×720 | 59.5~60.2 |

각 초기 장면에서 fish1·해당 방향 background1 요청만 관찰했습니다. 양 방향 배경을 동시에 미리 받지 않았습니다.
원시 결과는 Git 제외 `.local/phase3-08/performance.json`입니다. 메모리 사용량/다운로드 전송 바이트는 별도로 측정하지 않았습니다.

## 12. 검증 명령과 결과

```powershell
npm.cmd run check
npm.cmd run assets:check
npm.cmd run assets:test
npm.cmd run assets:http
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:5173'
npm.cmd run test:e2e -- --workers=2
git diff --check
```

최종 TypeScript/ESLint/Vite build PASS. 기존146개를 보존하고 신규52개를 추가해 Vitest198개 PASS.
기존 에셋 테스트7개 PASS, 실제7파일과 Manifest 검사 오류0, assets:http root/subpath14응답 PASS.
Playwright 기존30+신규24=54개 PASS. 지정6개 viewport에서 실제 이미지/디코딩·캔버스·단축키·터치·길게 누름·취소·회전 보존·메뉴·가로 overflow·일반 콘솔/페이지 오류를 검사했습니다.
고의 HTTP/HTML 실패 시 브라우저의 예상 네트워크/디코딩 오류와 정상 경로의 오류0 검사를 구분합니다.
스크린샷에서 호수와 투명 배스 스프라이트 및 모바일 컨트롤 배치를 확인했습니다.
최종 UTF-8 텍스트105개·JSON/TypeScript 설정 형식·git diff --check PASS.
시작104파일 중 예정된9개만 수정하고 나머지95개를 바이트 보존했습니다. 신규13개, 삭제0·예상 밖 변경0입니다.
기존 테스트·패키지/lockfile·그래픽·설정 보존 증거는 `.local/phase3-08/verification.json`입니다.

실행 브라우저는 설치 Chrome의 Chromium 엔진입니다. 전용 Chromium/WebKit 바이너리는 미설치로 확인했으며
WebKit 테스트를 실행하지 않았습니다. 실제 Android Chrome/iPhone Safari PASS가 아닙니다.
초기 TypeScript parameter-property 제한·lint 경고를 코드로 수정했고, 초기 StrictMode 테스트의 동적 모듈 대역 문제는
명시적 lazy-loader 주입으로 해결했습니다. 테스트/기존 검사 규칙을 삭제하거나 끄지 않았습니다.

## 13. 다음 단계와 수동 작업

필수 사용자 수동 작업은 없습니다. 실제 iPhone Safari/Android Chrome, WebKit 및 장시간 성능은 후속 검증이 필요합니다.
3-09에서 통합 실패·캐시·누수·빠른 화면 전환 및 실기기 검증을 확장할 수 있습니다. 자동 진행하지 않습니다.
5단계 엔진은 공통 명령만 수신하고 장치별 DOM 이벤트 처리를 엔진에 확산하지 않아야 합니다.
모의 casts/hooks/charge를 포획·보상 기록으로 전송하지 않습니다. 서버 판정·AI·물리·상태 복원 규칙은 별도 구현 대상입니다.
운영 배포·유료·외부 연결·DB 변경에는 사용자 최종 승인이 필요하며 이번 commit/push는 없습니다.
