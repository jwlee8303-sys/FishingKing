# FishingKing 3-09 — 호환성·안정성 검사 보고

작성일: 2026-10-25 (Asia/Seoul). **3-09 자동 검사 완료. 실기기·GPU 메모리·성능 목표 미달은 별도 미완료입니다.**
새 낚시 기능·서버·인증·포획 판정은 추가하지 않았습니다. 기존 UI/라우터/에셋/입력 계약과 미커밋 변경을 보존합니다.
운영 배포·commit/push·DB·Penpot·R2/Cloudinary/Supabase Storage·과금 설정 변경은 없습니다.

## 1. 조사 환경

AGENTS, ROADMAP_STATUS, HANDOFF, PHASE3_AUDIT, SCREEN_DESIGN, MOBILE_GAME_UX, DESIGN_SYSTEM,
GRAPHICS_PIPELINE, ASSET_ARCHITECTURE, ASSET_STORAGE, PHASE3_08_GAME_INTEGRATION과 실제 코드를 확인했습니다.
시작 main/HEAD9a0dc865af692b6cc3304ad936221047918d206d, 기존117개 파일의 SHA를 Git 제외 로컬에 기록했습니다.
Node24.22.0·Playwright1.64.1·PixiJS8.22.0·Vite8.3.4 및 기존 패키지를 유지했습니다. 의존성/lockfile 변경은 없습니다.

OS는 Windows NT10.0.19045입니다. CIM OS 조회는 접근 거부로 실패했고 Environment.OSVersion으로 확인했습니다.
현재 [Playwright 공식 요구사항](https://playwright.dev/docs/intro#system-requirements)은 Windows11+이므로,
아래 결과는 이 Windows10에서 실제 수행한 관찰이며 공식 OS 지원을 입증하는 결과가 아닙니다.

공식 CLI로 현재 패키지에 맞는 Chromium156.0.8078.4와 WebKit27.2를 `.local/phase3-09/browsers`에 설치했습니다.
최초 CDN 다운로드 EACCES 후 승인된 네트워크 재실행으로 완료했으며 TLS 검증·전역 정책·연결 설정을 바꾸지 않았습니다.
공식 근거: [브라우저 설치·전용 캐시 경로](https://playwright.dev/docs/browsers#managing-browser-binaries).
전용 Chromium과 설치 Chrome을 혼동하지 않으며 WebKit 에뮬레이션은 실제 iPhone Safari 검증이 아닙니다.

## 2. 검사 구조와 변경 범위

- 기존198개 단위·7개 에셋·9개 고유 E2E/54개 Chromium 실행 사례를 유지했습니다.
- 같은6 viewport에 WebKit 프로젝트를 추가하고 기존 CDP 전용 분기는 Chromium에서만 사용합니다.
- 신규 E2E는 입력 경계·반복 회전·재진입·다중 장면 공유·Provider URL 변경·오류 행렬·지연 응답 역전·DPR3 상한을 다룹니다.
- Windows 기본 worker는1, 자동 retry는0입니다. timeout/기존 assert/테스트를 삭제·skip·완화하지 않았습니다.
- 검사 전용 dev-server는127.0.0.1에만 열고 `.local`/검사 보고서의 파일 변경을 watch에서 제외합니다.
  npm test:e2e 실행 도구가 임시 포트를 직접 소유하고 종료합니다. 직접 Playwright CLI의 기본 포트는4173입니다.
  기존127.0.0.1:5173 개발 서버를 종료하거나 운영 Vite base를 변경하지 않습니다.
- test:soak는 매번 새 소스 스냅샷·별도 localhost 서버·독립 브라우저를 사용합니다. 라이브 수정/HMR이 장시간 결과를 바꾸지 않습니다.
- 리소스 관찰용 읽기 전용 getSceneDiagnostics/TexturePool.snapshot을 추가했습니다. URL/토큰을 노출하지 않습니다.
  DEV 프레임 표본은600개로 제한하고 생산 장면 기능은 늘리지 않았습니다.

## 3. 확인한 문제와 최소 수정

| 문제 | 확인/수정 |
| --- | --- |
| 이동 이벤트 없이 버튼 밖 pointerup | cast가 commit될 수 있어 up 좌표도 검사. 해당 회귀 단위 테스트 추가 |
| WebKit 워커/bitmap 경로 접근 오류 | 실제 오류·단독 재현 확인. parser 등록 후 preferWorkers/preferCreateImageBitmap=false로 공식 HTML Image 경로 사용 |
| WebKit 모달 종료 후 포커스 | 클릭이 native focus를 주지 않는 차이. 공통 버튼은 handler 전에 명시 focus, 모달 복귀 assert 유지 |
| 최초 Tab 검사 시점 | WebKit에서 React commit 전 키 입력 가능. 본문 이동 링크 부착을 기다린 뒤 기존 Tab/focus 검사 수행 |
| WebKit 연타 중 새 입력 취소 | 실제 이벤트 로그에서 다음 pointerdown 뒤 native blur 재현. 직접 조작 버튼에만 pointer 기본 동작 방지, 실제 blur 취소는 유지 |
| 페이지 교체 후 실패 진단 fetch | pagehide 수명 종료·AbortSignal과 disposed 검사로 떠난 문서의 진단/fallback 재요청 차단 |
| 검사 도구의 진단 모듈 중복 | HMR URL과 native import URL 차이로 별도 카운터를 읽음. Vite 정적 import fixture로 같은 모듈을 조회 |
| 하위 base SPA 404 | production build에서 /fishingking/가404로 재현. BrowserRouter.basename을 공식 BASE_URL pathname과 연결 |
| 알려진 폴더 밖 파일 누락 | 기존 walk/decode 함수를 전체 public/assets에 적용해 root/unknown 디렉터리 파일도 검출 |
| 정적 무결성 필드 누락 | 공개 파일 검사에서는 width/height/sizeBytes/sha256 누락을 ERROR 처리. runtime Metadata의 선택 필드 계약은 유지 |

워커 설정은 공식 Pixi API와 설치 소스의 parser 등록 순서를 확인했습니다.
[Assets API](https://pixijs.com/8.x/guides/components/assets)·설치된 Assets.setPreferences/loadTextures 구현을 기준으로 합니다.
이미지 파일·서비스 제공자·Manifest ID 및 실제 게임 입력 명령 의미는 변경하지 않았습니다.

## 4. 브라우저·입력 검사

최종 전체 실행은240 PASS/0 FAIL/0 skip/0 flaky/자동 retry0,966.151초입니다.
Chromium120 PASS, WebKit120 PASS이며 고유20개 시나리오를 각 엔진의6개 viewport에서 반복한 수입니다.
기존9개 고유 시나리오/Chromium54개 실행을 보존하고 고유11개를 추가했습니다.
원시 결과는 `.local/phase3-09/e2e-final.json`입니다. 최초 실행부터 전부 통과한 것은 아니며 실패 이력은9절에 보존합니다.
대상 viewport:320×568,390×844,430×932,844×390,768×1024,1440×900.

Chromium은 CDP 실제 touchStart/touchCancel·멀티터치와 native tap, 마우스·키보드를 사용합니다.
WebKit은 native tap, mouse Pointer Events·키보드로 검사합니다. Playwright WebKit의 네이티브 다중 손가락/길게 누른 touchCancel까지 검증했다고 표현하지 않습니다.
pointercancel/lostcapture/다른 owner 종료/이탈·밖 release/중복·빠른 탭/입질·키 repeat·폼 제외/blur/visibility/회전·메뉴/언마운트 계약은 단위 검사와 브라우저 검사를 함께 사용합니다.
방향은 기존 화살표와 영역 이탈 취소입니다. 이번에 아날로그 joystick을 추가하지 않았습니다.
sequence/epoch는 명령 envelope와 reset 후 이전 owner 해제 무시를 검사합니다. 미래 서버 명령 replay 필터를 구현했다는 뜻이 아닙니다.

회전 burst·응답 지연/순서 역전에서 최종 배경과 모의 상태 보존을 확인하며, DOM 버튼44px·overflow·캔버스1개를 검사합니다.
DPR3 브라우저 컨텍스트에서 렌더러 DPR2 cap과 CSS/버퍼 비율을 검증합니다. 실제 OS 디스플레이 이동·휴대폰 Safe Area 측정은 별도입니다.

## 5. 에셋·네트워크

assets:check는 실제7개 파일의 디코딩/MIME·치수·용량·SHA, Manifest/variant/fallback/public-private를 기존 validator와 대조합니다.
파일명·잘못된 확장자·위험 SVG·손상 WebP·중복 해시·미등록 경로를 검사합니다. 고의 실패 파일은 `.local` 테스트 영역에만 만듭니다.
ERROR는 비정상 종료 코드, WARNING은 용량 예산80% 이상 같은 주의 사항으로 별도 보고합니다.
현재 실제 에셋은 ERROR0/WARNING0. Node 에셋 테스트10개 PASS(기존7+신규3).
기존 단위 검사의 ID 중복·위험/인코딩 경로·fallback 참조/순환·접근 거부 검사를 그대로 유지했습니다.
최종 에셋 테스트는10 PASS/0 FAIL/0 skip,21.86초였습니다. assets:build는 기존3개 모두 skipped·오류0으로 원본/배포 그래픽을 바꾸지 않았습니다.

404/500/요청 abort/HTML200/잘못된 바이트·decode 오류/placeholder 실패를 브라우저 응답 대체로 검증합니다.
접근 거부·메타데이터 보안 오류는 기존 단위 검사를 통해 일반 누락 fallback과 구분합니다.
고의 실패의 예상 네트워크/디코딩 오류와 정상 경로 콘솔 오류0 검사를 분리합니다.

## 6. 저장소 경로와 SPA

assets:http를 확장해 root/subpath/절대 HTTP base의 격리 production build에서7개씩21응답을 검사합니다.
MIME/상태/실제 바이트/용량/SHA 및 compiled BASE_URL을 대조하고 누락 파일의 HTML200을 식별합니다.
test:paths는 같은 검사를 재사용하며 각 base에서6개 화면·메뉴 링크·새로고침·404→홈을 실제 Chromium으로 확인했습니다.
절대 HTTP base는 별도 loopback origin입니다. HTTPS URL 생성은 기존 단위 테스트로 검증하며 로컬 TLS 서버를 만들거나 TLS 검증을 끄지 않았습니다.
상대 base 비지원 정책은 유지하고 운영 vite.config.ts·Pages 설정·_headers를 변경하지 않습니다.

## 7. 자원·장시간 검사

독립 Chromium 재검사 PASS:601.282초 연속 유지·30회 회전·100회 입력 시작/종료(캐스팅50/릴50)·1초 릴 유지1회·30회 장면 재진입.
원시 보고서는 `.local/phase3-09/chromium-soak-f2pFyC/report.json`입니다. 정상 콘솔/페이지 오류0, ReadPixels GPU 성능 경고4회입니다.
별도 단기 Chromium30회 재진입도 최종 동기 대기 predicate로 재검사해 PASS했습니다(`chromium-quick-4wuuKq`).
WebKit은15.026초·6회 회전·12회 입력·3회 재진입만 실행해 PASS했고10분 WebKit 실행은 하지 않았습니다(`webkit-quick-MU8YRF`).
test:soak 기본 목표는600초 연속 유지+30회 회전+100회 입력 시작/종료+30회 장면 재진입입니다.
snapshot Application/초기화 대기·URL별 참조·정리 중 항목·캔버스 및 Chromium CDP의 JS heap/DOM/global listener를 기록합니다.
워밍업 후 baseline과 최종 home에서 GC를 요청해 비교합니다. 일시적인 heap 증가만으로 누수라고 판정하지 않습니다.
GPU 메모리 bytes는 제공받지 못하므로 null/미측정이며 픽셀 수·JS heap을 GPU 메모리 실측값으로 대체하지 않습니다.

| Chromium 장시간 관찰 | 워밍업 home | 최종 home |
| --- | --- | --- |
| Application / 초기화 대기 | 0 / 0 | 0 / 0 |
| 텍스처 항목 / 참조 / 정리 중 | 0 / 0 / 0 | 0 / 0 / 0 |
| canvas | 0 | 0 |
| DOM document / node | 1 / 158 | 1 / 158 |
| CDP 전체 JS listener | 200 | 196 |
| Window / Document / VisualViewport listener | 17 / 1 / 0 | 17 / 1 / 0 |
| GC 후 JS heap bytes | 16,333,556 | 18,886,136 |

JS heap은2,552,580bytes 증가했습니다. 5/10/15/20/25/30회 재진입 표본은 각각
18,025,624 / 18,440,216 / 18,549,660 / 18,647,660 / 18,783,544 / 18,886,108bytes였습니다.
관찰한 DOM·listener·Application·참조 수 누적은 없었지만 retained heap 원인은 미확인이고 누수가 전혀 없다고 확정하지 않습니다.
장시간 실행 뒤 검사 도구의 async wait predicate를 동기식으로 강화했습니다. 장시간 보고서의 실제 최종 카운터는0이며,
강화한 predicate로 별도30회 재진입을 다시 수행해 매회 DOM canvas와 앱·참조 정리 완료를 확인했습니다.
WebKit 단기 검사도 최종 앱/초기화/텍스처/참조/정리/canvas가 모두0입니다. WebKit heap/CDP 값은 미측정입니다.

TexturePool은 다중 소비자 중1명 종료 시 나머지를 유지하고 마지막 종료에서만 unload합니다.
Provider/variant URL 변경·상대/절대 alias·unload 중 재획득·실패 retry·멱등 release·참조 음수 방지를 검증합니다.
실제 종료는 Pixi 공식 Application.destroy/Assets.unload를 사용하며 공용 textureSource를 다른 소비자 중 강제 파괴하지 않습니다.

## 8. 성능 지표와 한계

| 측정 | Chromium DPR2 장시간 | Chromium DPR1 단기 | Chromium DPR2 단기 대조 | WebKit DPR2 단기 |
| --- | --- | --- | --- | --- |
| 연속 관찰 시간 | 601.282초 | 15.052초 | 15.591초 | 15.026초 |
| 실제 렌더 평균 FPS | 30.99 | 58.00 | 30.53 | 50.18 |
| rAF 평균 FPS | 30.99 | 59.34 | 30.32 | 53.82 |
| frame 중앙값 | 33ms | 17ms | 33ms | 16ms |
| frame p95/p99 | 50/50ms | 17/17ms | 50/50ms | 30/71ms |
| 하위5% FPS 근사 | 20 | 58.82 | 20 | 33.33 |

단기 대조는 각각 `chromium-quick-N70SOW`, `chromium-quick-4wuuKq`, `webkit-quick-MU8YRF` 보고서입니다.
동일 CSS358×556에서 DPR2 buffer716×1112, DPR1 buffer358×556이었습니다.
장시간 첫 배스 적용1438.4ms, 첫 배경1564.8ms, ready1566.7ms(Dev snapshot navigation 기준).
전체 장시간/재진입 동안 CDP 이미지 네트워크 전송3건·encodedDataLength369,335bytes를 기록했습니다.
최초 진입은 fish+portrait background2건/218,648bytes이며 가로 배경1건은 회전 때 추가됐습니다.
브라우저 memory-cache의 이미지 재사용은 추가 network event를 만들지 않을 수 있습니다. src 설정 횟수와 전송 건수를 혼동하지 않습니다.

60FPS 목표는 DPR2에서 미달했고, 하위 구간은30FPS에도 미달합니다. 안정적인60 또는30FPS 달성을 선언하지 않습니다.
DPR1 단기 대조가 더 빨랐으므로 픽셀 비용과 Windows headless WebGL 경로가 후보입니다. 인과관계·실기기 개선을 확정하지 않습니다.
기존 SceneOptions.maxDpr=1 저품질 경로를 활용할 수 있지만 이번에 자동 품질 변경/사용자 설정 기능을 추가하지 않았습니다.
3-08의 순간 ticker.FPS 표본을 실제 지속 렌더 FPS로 대체해 사용하지 않습니다. 이번에는 실제 callback 수와 wall interval을 별도로 측정했습니다.
첫 배경/배스는 data-metrics의 실제 texture 적용 시점, ready는 장면 상태 변경 시점을 navigation performance clock으로 기록합니다.
브라우저 rAF wall interval의 평균 FPS·1ms bucket 중앙값/p95/p99와 하위5% FPS 근사값, Pixi rendered frame 증가량을 분리합니다.
비활성 구간은 표본에서 제외하며1000ms 이상 interval은 마지막 bucket에 합칩니다.
CSS 크기/DPR/렌더 버퍼와 CDP 이미지 request 수·encodedDataLength(헤더/캐시 효과 포함 전송량)를 기록합니다.
JS heap은 Chromium만 측정합니다. WebKit·실제 휴대폰 GPU 메모리·발열·배터리는 해당 값이 없으면 미측정입니다.
60FPS 지향·저성능30FPS 목표는 실제 결과를 보고 평가하며 자동으로 달성 판정하지 않습니다.

## 9. 실패·재실행 기록

- 첫 브라우저 다운로드: EACCES, 승인된 동일 공식 명령 재실행 성공. 패키지 업그레이드 없음.
- 초기 WebKit9건:5 PASS/4 FAIL. 단독 실패3건도 재현. 수정 도중18건은13 PASS/5 FAIL, 진단 fixture 오류와 DOM 준비 시점도 수정.
- 문제5건 선택 재검사:5 PASS/0 FAIL,34.6초. 기존 assert와 timeout을 유지했습니다.
- 첫 snapshot 도구 시작:tsconfig.node.json 누락으로 startup FAIL, 소스 snapshot에 전체 참조 config를 복사하도록 수정.
- 첫 장시간 실행:600.549초·회전30·입력100, 재진입20회까지 완료 후21번째 메뉴 click timeout. 전체 상태는 FAIL로 유지.
  당시 오류0, app/ref/canvas는 복귀 시0, global listener17/1/0 유지. GPU ReadPixels 성능 경고4회.
  병행 회귀 실행 중 rAF26.8FPS·p50 33ms/p95 67ms/p99 83ms로 목표보다 낮았습니다. 이것을 성공 수치로 숨기지 않습니다.
- 동시에 실행한216건 matrix는 여러 초기화/teardown timeout 후 수동 중단했습니다. 완료 JSON이 없어 전체 PASS 수로 합산하지 않습니다.
- 재검사는 검사 전용 서버/직렬 worker와 독립 장시간 순서로 분리합니다. 동시 실행 부하와 watcher/HMR 영향을 줄이지만,
  첫 timeout의 단일 근본 원인이 입증됐다고 단정하지 않습니다.
- 새 dialog 단위 fixture는 jsdom에 showModal이 없어1 FAIL. 해당 테스트에만 native API 대역을 정의·복구한 뒤205개 전체 PASS.
- 이후 수명 종료·입력 회귀3개를 추가해 최종 단위208개 PASS입니다.
- 첫 완결240건 실행은236 PASS/4 FAIL,1,488.822초: WebKit 연타1건과 페이지 교체 후 접근 오류3건을 확인했습니다.
  Windows shell 서버 종료 대기도 포함된 시간입니다. 작업 소유 서버만 확인 후 종료하고 Vite API 소유 실행 도구로 정리 방식을 수정했습니다.
- 연타 수정 뒤 선택 반복12건은11 PASS/1 FAIL(107.692초). 남은 수명 종료 오류를 수정한 선택 반복16건은16 PASS(122.570초).
- 최종 전체240건은240 PASS(966.151초), skip/자동 retry0. 실행 도구도 exit0으로 서버 정리까지 완료했습니다.
- WebKit 단기 도구2회는 async wait의 DOM 관찰 경합으로 canvas1 assertion FAIL.
  동기 predicate와 DOM 확인으로 수정한 뒤 WebKit 단기 및 Chromium30회 재진입을 다시 실행해 PASS했습니다.

자동 retry=0을 유지합니다. 최초 실패/수동 재실행·도구 시작 실패와 실제 앱 assertion 실패를 분리합니다.

## 10. 실행 명령

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.local/phase3-09/browsers'
npx.cmd --no-install playwright install chromium webkit
npm.cmd run check
npm.cmd run assets:build
npm.cmd run assets:check
npm.cmd run assets:test
npm.cmd run assets:http
npm.cmd run test:paths
# 검사 전용 localhost 서버를 자동 시작/종료
Remove-Item Env:PLAYWRIGHT_BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:PLAYWRIGHT_CHANNEL -ErrorAction SilentlyContinue
$env:PLAYWRIGHT_JSON_OUTPUT_NAME = Join-Path (Get-Location) '.local/phase3-09/e2e-serial.json'
npm.cmd run test:e2e -- --workers=1 --reporter=list,json
# 브라우저 회귀와 장시간 검사를 동시에 실행하지 않음
npm.cmd run test:soak
npm.cmd run test:soak -- --quick --webkit
npm.cmd run test:soak -- --quick --dpr1
npm.cmd run test:soak -- --reentry
git diff --check
```

## 11. 실기기와 다음 단계

실제 Android/iPhone은 접근하지 않았으며 모두 미실행입니다. GPU 메모리·발열·배터리·실제 노치/주소창·잠금 복귀를 PASS로 표시하지 않습니다.
사용자 절차와 결과 기록란은 [MOBILE_DEVICE_TEST_CHECKLIST.md](MOBILE_DEVICE_TEST_CHECKLIST.md)에 있습니다.
LAN 주소 바인딩·방화벽·기기 설정은 이번 자동 실행에서 변경하지 않았습니다.
3-10 인수인계는 가능합니다. 실기기·WebKit10분·GPU 메모리·retained heap 원인 및 DPR2 성능 목표는 미완료로 넘깁니다.
이번3-09에서 중단하며 별도 지시 없이 다음 단계를 실행하지 않습니다.

## 12. 최종 검사 및 파일 보존

| 검사 | 결과 |
| --- | --- |
| TypeScript / ESLint / Vite build | PASS |
| Vitest | 208 PASS, 기존198 보존, 신규10 |
| assets:test | 10 PASS, 기존7 보존, 신규3 |
| assets:check | 실제7파일, ERROR0 / WARNING0 |
| assets:build | 기존3개 skipped, 오류0 |
| Playwright | 고유20개 ×12프로젝트 =240 PASS |
| HTTP 에셋 | 3 base ×7파일 =21 PASS, MIME/bytes/SHA 대조 |
| production SPA 경로 | 각 base6화면·메뉴·reload·404 복귀 PASS |
| UTF-8 / JSON·JSONC / git diff --check | PASS |

이번 단위 수정21개·신규10개이며 시작117파일 중 삭제0입니다. 기존 graphics·lockfile·토큰·운영 설정은 보존했습니다.
수정: docs/ROADMAP_STATUS.md·HANDOFF.md, package.json, playwright.config.ts,
scripts/graphics/{check,check-static,lib,manifest-check}.mjs,
src/components/{AssetImage,ui}.tsx·layout/AppLayout.tsx·game/GameControls.tsx,
src/game/{TexturePool,scene}.ts·main.tsx·services/imageFailures.ts,
tests/e2e/smoke.spec.ts·graphics/pipeline.test.mjs·unit/{AssetImage,gameInput,scene}.test.tsx/ts(기존 확장자 유지).
신규: 이 보고서·MOBILE_DEVICE_TEST_CHECKLIST.md, scripts/testing/{dev-server,e2e,paths,stability}.mjs,
tests/e2e/{loadingEdges,stability}.spec.ts·fixtures/browserScenes.ts·unit/stability.test.tsx.
로컬 원시 JSON/스냅샷/브라우저는 Git 제외 `.local/phase3-09`에 보관합니다.
