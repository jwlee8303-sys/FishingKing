# FishingKing 3-10-R1 — WebKit 회전 및 태블릿 timeout 조사

확인일: 2026-10-26 (Asia/Seoul). **R1 조사·검사 서버 간섭 수정·전체 회귀 실행 완료. 전체Playwright239 PASS/1 FAIL, WebKit 시각FAIL 미해결.**
범위는 두 오류의 격리 재현·근거 있는 최소 수정·회귀 검사입니다. 성능/heap 분석·4단계·원격 변경은 실행하지 않습니다.

## 1. 시작 상태·보존

AGENTS/ROADMAP_STATUS/HANDOFF/PHASE3_FINAL_REPORT/PHASE3_09_TEST_REPORT/PHASE3_08_GAME_INTEGRATION과 관련 소스를 검토했습니다.
main/HEAD `9a0dc865af692b6cc3304ad936221047918d206d`, 추적 수정18·미추적60파일과 일치했습니다.
프로젝트128파일 SHA-256/전체 Git 상태는 `.local/phase3-10-r1/baseline.json`에 보존합니다.
기존 `.local/phase3-09`, `.local/phase3-10`은 읽기만 했고 삭제/덮어쓰기하지 않았습니다.
R1 진단·새 테스트 출력은 `.local/phase3-10-r1`로 분리합니다.

## 2. 문제 A — WebKit 회전 후 장면 표시

제품 변경 전 현재 환경에서 세로390×844 →가로844×390 →세로390×844를 재현했습니다.
페이지 스크린샷의 장면 내부 색상 픽셀 비율은 최초0.8862, 회전 후0, 세로 복귀 후0입니다.
이 비율은 진단용 색상 구분값이며 FPS/화질 성능 목표가 아닙니다.
회전 후 canvas/renderer/screen은528×306으로 일치, 배경Sprite/배스Sprite가 visible/renderable이고 텍스처 치수가 정상입니다.
동일 태스크에서 app.render 후 읽은 배경 픽셀은 가로[91,162,204,255], 세로[40,138,175,255]로 실제 색상이 있습니다.
GL context lost=false/error0, ticker는 진행합니다. alpha255만으로 그림 표시를 입증할 수 없음을 다시 확인했습니다.
진단 접근은 Playwright 응답 대체로 app 참조를 임시 노출했으며 제품 소스에는 디버그 전역을 넣지 않았습니다.

### 세 가지 독립 가설·대조

| 가설 | 대조 방법 | 실제 결과·해석 |
| --- | --- | --- |
| A1. 앱 장면/텍스처·초기화 경합 대 브라우저 표시 경로 | Pixi/React/에셋 없는 최소WebGL의 매 프레임 빨강clear 및 최소2D 대조 | WebGL도 회전 후 색상비율1→0→0,2D는1→1→1. Pixi/텍스처 요청 경합 없이 재현됨 |
| A2. CSS/캡처 방식 대 실제 drawing buffer 크기 변경 | 같은CSS/viewport 회전에서 내부buffer resize와 고정buffer 비교, normal/fullPage/element screenshot 비교 | resize-buffer는세 캡처 모두1→0→0, fixed-buffer는모두1→1→1. 크기 변경 관련WebGL 표시 경로로 범위를 좁힘. 고정buffer는 화면 품질/DPR 계약을 바꾸므로 제품에 적용하지 않음 |
| A3. WebGL버전·GPU 완료/리소스 상태 | 최소WebGL1 및WebGL2+gl.finish 대조 | 둘 다1→0→0. 버전 변경/완료 대기로 해결 확인 실패, 컨텍스트 손실 근거 없음 |

원시: h1-compositor.json, h2-capture-buffer.json, h3-backend-presentation.json 및 대응PNG/진단mjs.
프로젝트 없이 수동 대조할 수 있는 `.local/phase3-10-r1/minimal-webgl-resize.html`도 작성했습니다.
기존 Vite 공개 주소나 LAN/방화벽을 새로 열지 않았으며, 이 HTML을 실제Safari에서 실행한 결과는 아직 없습니다.
첫 진단 도구의 변환 소스 marker와 viewport meta 누락으로 시작/PNG crop 오류가 있었고 진단 도구만 보정했습니다.
이 오류를 제품 assertion 실패나 가설의 실험 결과로 집계하지 않습니다.

**결론:** 이 Windows WebKit 실행 환경의WebGL backing buffer resize 후 페이지 표시 경로까지 원인을 좁혔습니다.
앱의 DOM/renderer 치수 오류·Sprite 누락·텍스처 로딩 실패만으로 설명되지 않습니다.
브라우저 엔진 내부의 정확한 결함 및 실제 화면 합성과 캡처 구현 사이의 구분은 확정하지 못했습니다.
실제 iPhone Safari는 미검증이며 이 결과를 동일시하지 않습니다.
세 가설 이후 추가 제품 변경을 중단했습니다. preserveDrawingBuffer/전용CSS/renderer 재생성/버퍼 고정/Canvas 전환을 제품에 넣지 않았습니다.
**A는 미해결/시각FAIL 유지**입니다. 지원 OS의WebKit 또는 실제Safari에서 같은 최소 재현을 대조하는 것이 후속 작업입니다.

## 3. 문제 B — 태블릿 홈 링크 click timeout

과거 trace는 visible/enabled/stable 후 scrollIntoView 정체와 테스트 중 Vite/React 부트스트랩 반복을 보여줍니다.
과거 WebSocket full-reload 메시지는 보존된 trace에서 직접 확인되지 않아 과거 한 건의 단일 원인을100% 확정하지 않습니다.

현재 태블릿768×1024의 실제 UI를 조사했습니다. 모달clientHeight/scrollHeight는574/574(추가 스크롤 불필요),
대상 중심 hit test=true, transform=none, body overflow=hidden이며 포커스는dialog 안입니다.
메뉴 직후 document.getAnimations()는7개로 관찰됐습니다. 이를 애니메이션 부재로 보고하지 않으며,
수정 후에도 같은7개와 동일transform/스크롤 조건에서 클릭이 통과하므로 단독 원인 근거는 없습니다.
입력은 casting/reeling=false,aim0,paused=true. 닫힌 포인터/키 상태가 남았다는 증거는 없습니다.
인위적 부하·force click·timeout 확장 없이 같은 실제 클릭을 사용했습니다.

문서 변경 이벤트를 Vite watcher에 주입하자 **full-reload 수신→/game 문서 초기화→열린 모달 소실→홈 링크timeout**을 재현했습니다.
이벤트 주입은 실제 문서 파일을 고치지 않고 현재 서버 watcher에 동일 change 신호를 전달했습니다.
수정 전4회 재진입 통과 뒤 첫 신호에서 실패했습니다. 근거: tablet-before-fix.json의HMR/문서navigation 기록.
정상 UI의 스크롤/포커스/좌표 문제보다 **검사 중 파일 변경에 따른 문서 수명 교체**가 재현 가능한 원인입니다.

### 실제 최소 수정

`scripts/testing/dev-server.mjs`의 검사 전용Vite 서버만 watch:null/hmr:false로 설정했습니다.
근거는 공식 [Vite server options](https://v8.vite.dev/config/server-options)의 watcher 비활성화/개발 갱신 설정과 설치된Vite API입니다.
일반 npm run dev/제품 Modal/GameCanvas/scene/TexturePool/기존 테스트 동작은 바꾸지 않습니다.
파일 변경을 실행 중 자동 반영하지 않으며 검증 중 제품 소스를 편집하지 않습니다. 새 코드는 다음 서버 실행에서 검증합니다.
이 설정은 디스크 소스의 읽기 전용스냅샷을 만드는 기능은 아닙니다.
수정 후12회 실제 재진입 중2회에 같은 문서 변경 신호를 주입했고 모두PASS,full-reload0,hit test 모두true,입력 중립/모달 스크롤 상태 유지입니다.
이는 재현한 외부 변경 간섭의 차단 확인이며, 과거 모든timeout의 근본 원인이 같다고 보증하는 결과는 아닙니다.

## 4. 검사 결과 — 진단·선택·전체 분리

| 검사 | 결과 |
| --- | --- |
| WebKit 세로/가로/세로 시각 | 수정 전/후 모두FAIL, backing buffer resize 대조로 재현; webkit-before-fix/after-fix.json |
| 태블릿 문서 변경 간섭 재현 | 수정 전FAIL→검사 서버 수정 후재진입12회·문서 신호 주입2회PASS/HMR0 |
| 원본 Tablet 재진입10회 반복 | 10 PASS/0 FAIL,2.0분; tablet-repeat.json |
| 회전/모의 입력/장면/지연 배경/재진입 선택 자동 검사 | tablet+webkit-mobile 총10 PASS/0 FAIL,53.1초; related.json |
| React/Pixi 관련 단위를 포함한 전체 단위 | 9파일208 PASS/0 FAIL; check.log |
| TypeScript/ESLint/build | check exit0, 모두PASS |
| assets:check | 실제7파일,ERROR0/WARNING0 |
| assets:test | 10 PASS/0 FAIL/0 skip |
| HTTP | 3base×7파일21응답 상태/MIME/bytes/SHA PASS; assets-http.json |
| 전체Playwright | **239 PASS/1 FAIL**,914.390초,skip/flaky/자동retry0,runner exit1; e2e-full.json/e2e-summary.json |
| 추가Desktop 실패 선택 재검사 | 3 PASS/0 FAIL,86.927초,코드/timeout/assert 변경 없음; desktop-repeat.json |
| git diff --check/UTF-8/보존 | PASS, 상세6절 |

최초3-10의239 PASS/1 FAIL 및 기존240개 시나리오는 과거 기록으로 유지합니다.
자동 metadata/alpha 검사는 WebKit 페이지 시각 실패를 검출하지 못하므로 자동PASS와 시각FAIL을 분리합니다.

| 비교 항목 | 3-10 기존 결과 | R1 결과 |
| --- | --- | --- |
| WebKit 회전 후 페이지 장면 | 시각FAIL | 시각FAIL 유지, 최소WebGL/버퍼resize까지 범위 축소 |
| 문서 변경 중 모달 클릭 | 원래실패의 원인 미확정 | 동일간섭 격리재현FAIL→차단 후12회PASS |
| 원본Tablet 재진입 선택 반복 | 3 PASS | 별도10 PASS(전체실행과 합산하지 않음) |
| 전체 단위/에셋/HTTP | 208/10/21 PASS | 208/10/21 PASS |
| 전체Playwright | 239 PASS/1 FAIL(Tablet 재진입) | 239 PASS/1 FAIL(다른Desktop 입력timeout),Tablet20/20 PASS |

### 전체 회귀에서 추가 확인한 실패

R1 전체 집계는 Desktop Chromium19 PASS/1 FAIL,Mobile Chromium100 PASS/0 FAIL,WebKit120 PASS/0 FAIL입니다.
원래Tablet 재진입은 전체 회귀에서도 통과했습니다. 전체239/1이라는 합계만 보고 같은 실패라고 해석하지 않습니다.
새 실패는 desktop의 stability.spec.ts:8 `native taps, pointer ownership and cancellation leave no active input`입니다.
test timeout30000ms와context teardown timeout이 기록됐고 전체duration60.096초입니다.
trace에서 후반Bounding box 호출이 테스트30초 제한을 넘겨 진행됐고, 이후 일부 동작이teardown 중에도 이어졌습니다.
예상값과 다른 assertion 결과가 원인으로 기록된 것은 아니지만 실행 제한 내 정상 완료가 아니므로FAIL을 유지합니다.
HMR 간섭과 같은 원인이라고 단정하지 않으며 응답 지연/종료 지연의 제품·브라우저·호스트 원인은 미확정입니다.
근거 없이timeout을 늘리거나assert/검사 횟수를 줄이지 않았습니다. 같은 선택3회는3 PASS/0 FAIL(86.927초)였지만
원인 미확정이며 전체239/1은FAIL로 유지합니다. 선택 실행과전체 실행을 합쳐 통과로 만들지 않습니다.
trace/PNG/error-context는 .local/phase3-10-r1/e2e-full-results/stability-native-taps-poin-9bb8a-ation-leave-no-active-input-desktop에 보존합니다.

## 5. 잔여 위험·단계 판정

3단계 전체 완료는A의 핵심 표시 실패와전체 자동 회귀 실패 때문에 보류합니다. 실제 제품 문제와 실행 환경 결함을 더 구분할 근거가 필요합니다.
성능 참고값은3-09 재사용:Chromium DPR2 평균30.99FPS/DPR1 단기58.00FPS/WebKit DPR2 단기50.18FPS,
GC 후JS heap+2,552,580bytes입니다. R1에서 새 성능 측정·메모리 원인 분석·대규모 최적화를 하지 않습니다.
목표60FPS 지향/저성능30FPS 수준조작과 위 실측은 별개이며 달성을 선언하지 않습니다.
실기기 Android/iPhone·발열·배터리·GPU bytes는 별도 미검증/미확인 위험입니다.
4단계는DB/Auth 설계·읽기 확인 준비를 병행할 여지는 있지만 이번 시작하지 않았고 별도 지시가 필요합니다.
운영배포·DB/Penpot/연결/과금·R2/Cloudinary·commit/push는 하지 않습니다. R1 최종 보고 뒤 중단합니다.

## 6. 최종 변경·보존

실제 실행 코드 수정은 검사 전용 `scripts/testing/dev-server.mjs`뿐입니다.
기존 문서 `docs/PHASE3_FINAL_REPORT.md`, `docs/ROADMAP_STATUS.md`, `docs/HANDOFF.md`를 갱신하고 이 보고서를 신규 작성했습니다.
시작128파일 중 위4개만 수정, 나머지124개 바이트 보존·삭제0·예상 밖 기존 파일 변경0입니다.
제품src·기존 테스트·에셋·패키지/lockfile·배포/서비스 설정은 보존했습니다.
R1 산출물은 기존4파일 수정/보고서1개 추가입니다. 별도 외부 설정2개를 포함한 최종Git은 추적수정18/미추적63파일,
main/HEAD는 시작과 같습니다. commit/push·운영배포·DB/연결/과금/Penpot 변경·4단계 시작은 없습니다.
범위 내텍스트117개 UTF-8·JSON/JSONC11개 문법·git diff --check PASS입니다.
아래 외부 설정2개는 내용 검사에서 제외했으며 전체파일의 무조건적 무결성PASS로 확대하지 않습니다.
증거: .local/phase3-10-r1/preservation.json,git-status.txt,baseline.json. Git줄바꿈 안내는공백 검사 실패가 아닙니다.

보존 검사 중 Git 전역ignore 경로 읽기 경고(Permission denied)가 새로 발생했고,
시작 목록에 없던 .mcp.json/.claude/settings.local.json이 미추적으로 관찰됐습니다.
파일 생성/수정 메타데이터는 시작 해시 기록 이후이며 에이전트가 생성·수정한 파일이 아닙니다.
내용을 열거나 인증/MCP 설정을 바꾸지 않았고 외부 변경으로 분리해 보존합니다. 전역ignore·권한을 우회/수정하지 않습니다.
이 두 파일을 R1 산출물이나 원래128파일의 예상 밖 수정으로 혼동하지 않으며 전체Git 상태에는 별도 포함합니다.
