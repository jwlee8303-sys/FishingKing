# FishingKing 로드맵 진행 상황

확인일: 2026-10-26 (Asia/Seoul)

| 단계 | 상태 |
| --- | --- |
| 1. 개발 환경 구축 | 완료 |
| 2. 외부 서비스 및 MCP 연결 | 완료 — 확정된 Pages 정적 에셋 정책 기준, R2 의도적 보류·Cloudinary 향후 검토 |
| 3. Penpot 디자인 및 그래픽 제작 | 3-10-R1 조사·회귀 종료, 전체 완료 보류 — WebKit 회전 표시 실패 및Desktop timeout 미해결, 실기기 미검증은 별도 잔여 위험 |
| 4. Supabase DB 및 인증 | 미착수 |
| 5. 낚시 게임 엔진 | 미착수 |
| 6. 물고기 도감·랭킹·커뮤니티 | 미착수 |
| 7. 통합 테스트 및 자동 배포 | 미착수 |
| 8. 정식 운영 및 확장 | 미착수 |

## 최신 실행 결과 — 3-10-R1 / 2026-10-26

기존128파일·추적수정18/미추적60과3-09/3-10 증거를 보존했습니다.
WebKit 회전 후 표시 실패는 Pixi 없는 최소WebGL에서도 재현됐습니다. 내부buffer색상/GL오류/DOM·renderer치수와
페이지/element/fullPage 캡처를 분리했고, backing buffer resize가 있는 대조에서만 표시가 사라졌습니다.
세 가지 가설 대조 후 안전한 제품 수정 근거가 없어 GameCanvas/scene/TexturePool/CSS를 변경하지 않았습니다.
실제iPhone Safari 결과는 아니며 **핵심 시각FAIL이 남아3단계 전체 완료 보류**입니다.

태블릿은 문서 변경 신호→Vite full-reload→모달소실→click timeout을 격리 재현했습니다.
검사 전용 scripts/testing/dev-server.mjs만 watch:null/hmr:false로 고쳐 외부 변경 간섭을 차단했습니다.
Modal/실제 클릭/timeout/assert·일반npm run dev는 유지했습니다. 재진입12회(문서 신호 주입2회)·원본Tablet 반복10회·관련선택10개PASS.
과거 단일timeout의 원인이 모두 같다고 확정하지 않으며 원래239/1 기록을 보존합니다.
TypeScript/ESLint/build·전체단위208·에셋10·HTTP21응답PASS.
R1 전체Playwright는 **239 PASS/1 FAIL**(Desktop Chromium19/1,Mobile Chromium100/0,WebKit120/0),914.390초,skip/자동retry0입니다.
원래Tablet은전체20/20 PASS지만 다른Desktop 입력검사의30000ms/컨텍스트 종료timeout이 발생했습니다.
새실패 선택3회는통과했으나 원인미확정이며 전체FAIL은 유지합니다. WebKit의별도시각FAIL도 유지합니다.
최종 집계/한계는 [PHASE3_10_R1_FIX_REPORT.md](PHASE3_10_R1_FIX_REPORT.md)를 따릅니다.
성능/heap 위험은 후속으로 유지하고 실기기·발열/배터리는 미확인입니다.4단계/commit/push/원격변경 없음.

## 이전 실행 결과 — 3-10 / 2026-10-26

3-09의 잠정 완료를 실제 보고서·Playwright 원시 JSON·장시간 소스 스냅샷으로 재확인했습니다.
과거240 PASS(Chromium120/WebKit120)와601.282초 장시간 기록이 존재하며 현재 src/public/fixtures와 스냅샷 불일치0입니다.
이번 check의 TypeScript/ESLint/Vitest208/Vite build, 에셋10·실제7파일 오류0/경고0·HTTP21응답·토큰63 검사 PASS.
전체 Playwright **239 PASS/1 FAIL**: Desktop Chromium20/0, Mobile Chromium99/1, WebKit120/0, skip/자동retry0.
태블릿 Chromium 반복 재진입의 홈 링크 click timeout은 별도 같은 조건3회 통과했으나 원인은 미확정입니다.
추가 상태4개·production18경로 PASS. **WebKit 회전 후 장면 표시의 추가 시각 검증은 FAIL**이며
DOM/메타데이터·alpha만 확인하는 기존 자동 검사로 검출되지 않았습니다. 제품/검사 환경 원인은 미확정입니다.
상세 집계·실패 trace·PNG는 [PHASE3_FINAL_REPORT.md](PHASE3_FINAL_REPORT.md)의10절을 따릅니다.

실기기 Android/iPhone·WebKit10분·GPU 메모리/발열/배터리는 미검증입니다.
실기기 미검증은 별도 잔여 위험이며 자동 검사 FAIL이나 추가 필수 완료 조건으로 집계하지 않습니다.
실제 휴대폰 발열·배터리 사용량은 실기기 검증 전까지 미확인·미측정으로 유지합니다.
성능 목표는60FPS 지향·저성능 환경30FPS 수준의 조작입니다.
3-09 실측 재사용값은DPR2 평균30.99FPS/하위5% 근사20FPS이며 목표 달성은 인정하지 않습니다.
GC 후heap+2,552,580bytes는 관찰된 증가량으로 원인 미확인입니다. 이번3-10 신규 성능 실측은 없습니다.
Penpot 이번 라이브 읽기는 연결 인스턴스가 없어 실패, 기존63토큰/38컴포넌트/화면 JSON을 검토했습니다.
따라서 필수 검증 전부 PASS 및 **3단계 전체 완료로 표시하지 않습니다.**

4단계 설계 인수인계는 준비됐습니다. 기존 Supabase 스키마 읽기 확인부터 진행하고 fish_species/profiles/catches/
user_collection/comments/game_sessions·회원/비회원 승계·RLS/서버 검증을 별도 확정합니다.
어종 ID와 Asset ID를 분리하며 DB에 실제 이미지 URL을 직접 저장하지 않습니다.
5단계는 기존 GameCanvas/InputController를 재사용해 정식 상태 전이·낚시 시스템·서버 포획 결과 검증을 구현합니다.
현재 조작은 모의 상태이며 정식 포획/보상은 없습니다.
이번 문서5개 갱신·종합 보고서1개 신규, 기존 코드/패키지/테스트/그래픽·미커밋 변경 보존.
commit/push·운영 배포·DB·외부 서비스·과금·Penpot 원본 변경 없음. **3-10에서 종료하며4단계 자동 착수 없음.**

## 이전 실행 결과 — 3-09 / 2026-10-25

**3-09 호환성·안정화 자동 검사 완료. 실기기 및 성능 목표는 아래 한계를 유지합니다.**
Chromium120·WebKit120 = Playwright240 PASS(고유20개 ×12프로젝트), 최종 실패/skip/자동 retry0,966.151초.
기존198 단위/7 에셋/54 Chromium 실행을 보존하고 최종 단위208·에셋10 PASS입니다.
TypeScript/ESLint/Vite build·assets:check(ERROR0/WARNING0)·UTF-8/설정 형식·git diff --check PASS.
root/subpath/절대 HTTP base의 실제 production build에서21개 에셋 응답의 MIME/bytes/SHA 및 각6개 SPA 화면을 검증했습니다.
확인된 WebKit 포커스·입력 blur·문서 종료 후 요청과 하위 base 라우팅을 최소 수정했습니다.
Chromium601.282초 유지·30회 회전·100회 입력·30회 재진입 PASS. 별도 강화된 종료 대기로30회 재진입 PASS.
최종 app/초기화/텍스처/참조/정리/canvas0, DOM158·전역 listener17/1/0 복귀.
GC 후 JS heap은2,552,580bytes 증가해 retained heap 원인은 미확인입니다. 누수 전면 부재를 선언하지 않습니다.
DPR2 실제 렌더 평균30.99FPS/하위5% 근사20FPS로60FPS 목표 미달. DPR1 단기58.00FPS, WebKit 단기50.18FPS.
WebKit은 에뮬레이션이며10분 실행/실제 Android·iPhone/GPU 메모리/발열·배터리는 미검증입니다.
실행 OS Windows10은 현재 Playwright 공식 Windows11+ 지원 범위 밖입니다. 최초 실패와 수정·재실행도 보고서에 보존했습니다.
기존 그래픽·lockfile·서비스·운영 설정과 미커밋 변경을 보존했습니다. 배포·commit/push·다음 단계 실행 없음.
상세: [PHASE3_09_TEST_REPORT.md](PHASE3_09_TEST_REPORT.md), [실기기 체크리스트](MOBILE_DEVICE_TEST_CHECKLIST.md).
**3-10 인수인계 가능. 실기기·성능·heap 한계는 미완료로 넘기며 자동 진행하지 않습니다.**

## 이전 실행 결과 — 3-08 / 2026-10-25

**3-08 React AssetImage·PixiJS 실제 에셋 로딩 및 모바일/PC 모의 입력 통합 완료.**
기존 AssetResolver/PagesStaticProvider/6개 ID·7파일·모바일 variant·HUD/버튼/라우팅을 재사용했습니다.
낚시 화면에 실제 호수·배스 Sprite, 도감의 별도 에셋 미리보기에 AssetImage를 연결했습니다. 발견 기본 목록은 빈 상태를 유지합니다.
StrictMode/lazy import/init 도중 언마운트 정리, ResizeObserver·DPR 상한2/저품질1 옵션, 종횡비·cover·회전 배경 경합 방지를 구현했습니다.
공통 InputController는 기존 점 표기 명령·고유 activation·sequence/epoch를 사용하고 cast/reel·방향·입질을 모의 표시합니다.
포인터 소유권/멀티터치/버튼 이탈·cancel/lostcapture/키 repeat/blur/visibility/회전/메뉴/언마운트 취소를 검증했습니다.
TexturePool은 canonical URL별 공유 Promise·참조 수·unload 경합을 관리하고 다른 장면의 텍스처를 파괴하지 않습니다.
ID/메타데이터/접근 오류와 HTTP·HTML200·decode 실패를 구분하고 terminal placeholder 실패를 처리합니다.

최종 Vitest198개(기존146+신규52), 자산 테스트7개, Playwright54개(기존30+신규24) PASS.
TypeScript/ESLint/Vite build 및 assets:check/14응답 assets:http PASS.
지정6 viewport 설치 Chrome 에뮬레이션에서 실제 이미지·입력·회전 상태 보존·기존 메뉴·가로 overflow·정상 경로 콘솔/페이지 오류를 검사했습니다.
별도 짧은 FPS 표본59.5~60.6, 모바일 DPR2·데스크톱1 및 초기 배경1/배스1 요청을 관찰했습니다. 실기기 성능 달성 주장은 아닙니다.
WebKit/전용 Chromium 바이너리는 미설치, 실제 Android Chrome/iPhone Safari·발열·배터리·장시간 성능은 미검증입니다.
실제 포획/AI/물리/서버 판정/보상/기록 저장은5단계 후속입니다. 패키지·그래픽·외부 서비스·운영 배포·commit/push 변경 없음.
상세: [PHASE3_08_GAME_INTEGRATION.md](PHASE3_08_GAME_INTEGRATION.md).
**3-09 진행 준비 가능. 자동 진행하지 않습니다.**

## 이전 실행 결과 — 3-07 / 2026-10-25

**3-07 PagesStaticProvider 및 기본 공개 Provider 등록 완료.**
기존 Manifest/Resolver/variant/경로 validator를 재사용하고 Pages 공개 전용 async URL 해석을 추가했습니다.
직접 호출도 등록된 ID·파일·variant·버전과 대조하고 private/위험 경로/메타데이터 불일치를 거부합니다.
services/assetRuntime.ts에서 기본 Pages Provider를 등록하며 Mock 교체 및 명시 선택 계약을 검증했습니다.
기존 getAssetUrl API를 유지하고 공통 URL 유틸리티로 BASE_URL 루트·하위 경로·HTTP(S) 전체 base를 지원합니다.
상대 base는 현재 미사용이므로 명시 거부합니다. 운영 Vite 설정·외부 서비스·UI·그래픽·기존 변경은 보존했습니다.

Vitest146개(기존93+신규53), 자산 검사 테스트7개, 기존 Playwright30개 PASS.
TypeScript/ESLint/Vite build PASS, assets:check 실제7파일 및 Manifest 오류0, assets:build 기존3개 skipped.
신규 assets:http는 격리된 root 및 /fishingking/ 실제 프로덕션 빌드와 컴파일된 BASE_URL을 확인하고
7개씩 총14응답의 HTTP200/MIME/바이트/용량/SHA 일치를 검증했습니다. 누락 이미지는 두 preview의 HTML200 SPA fallback으로 식별했습니다.
Pages 기본 캐시·ETag 및 버전/SHA 정합성 정책을 문서화했으며 _headers·운영 캐시 설정은 변경하지 않았습니다.
실제 운영 CDN·실기기·React/Pixi 로딩은 미검증입니다. 상세: [ASSET_STORAGE.md](ASSET_STORAGE.md).
**3-08 인수인계 가능. 자동 진행·배포·commit/push 없음.**

## 이전 실행 결과 — 3-06 / 2026-10-25

**3-06 AssetManifest·AssetResolver 및 AssetProvider 인터페이스 구현 완료.**
6개 논리 ID에 실제 파일7개를 등록했고 background.lake.day의 mobile-portrait를 같은 ID의 variant로 관리합니다.
TypeScript ID 추론·런타임 ID/Metadata/경로/MIME/중복·fallback 참조·순환 검사, 순수 viewport/layout/DPR 선택을 구현했습니다.
Resolver는 Provider 주입·public/private 접근 검사·비동기 URL 결과/만료 검증·명시적 fallback·로딩 실패/취소 오류를 제공합니다.
private 기본 거부, fallback으로 접근 거부를 숨기지 않으며 실제 Pages/Supabase/R2/Cloudinary Provider는 연결하지 않았습니다.

기존 assets:build/check/test 보존·확장: 실제7개 파일 경로/MIME/치수/용량/SHA 대조 및 public/private 폴더 혼합 검출.
최종 Vitest93개(기존5+신규88), 자산 Node7개(기존5+신규2), 기존 Playwright30개 통과.
TypeScript/ESLint/Vite build 및 assets:check 오류0. 새 의존성 없이 Node24·기존 도구를 사용했습니다.
기존 3-05 미커밋 변경·React UI/라우터·토큰·그래픽·서비스·외부 연결을 보존했습니다.
상세 설계·API·3-07 인계는 [ASSET_ARCHITECTURE.md](ASSET_ARCHITECTURE.md)를 따릅니다.
실제 PagesStaticProvider는3-07, React/Pixi 이미지 로딩은3-08입니다. 이번 배포·commit/push·다음 단위 자동 진행은 없습니다.

## 이전 실행 결과 — 3-05 / 2026-10-25

**3-05 SVG·WebP 기본 그래픽 및 변환·검사 기반 완료.** 배스1·호수 가로/세로2 WebP와 아이콘3·이미지 누락1 SVG를 제작했습니다.
원본 PNG3개는 graphics/source, 배포 파일7개는 public/assets에 분리했습니다. 기본 아트 후보이며 최종 게임 아트 확정·실기기 검수는 후속입니다.
Sharp0.35.5와 기존 xmldom0.8.15 직접 개발 의존성, assets:build/check/test 명령을 추가했습니다.
동일 변환 건너뛰기·덮어쓰기/경로 이탈 방지·디코딩/알파·SVG XML/위험 요소·크기/용량·SHA 중복 검사를 구현했습니다.

최종 typecheck/lint/기존 단위5/build 통과. 자산 Node 테스트5, 기존 UI24+그래픽6=Playwright30 통과(exit0).
격리된 npm ci 및 Sharp WebP 재현 검증 성공. 배포 파일7개가 dist에 동일하게 복사되고 원본 graphics/source는 제외됨을 확인했습니다.
React 화면·라우터·디자인 토큰·서비스·Penpot 보존. 타입에는 placeholders 디렉터리만 추가했습니다.
상세 크기/용량·출처·검사·3-06 ID 인계는 [GRAPHICS_PIPELINE.md](GRAPHICS_PIPELINE.md)를 참조합니다.
Manifest/Resolver/Provider·실제 Pixi 로딩·휴대폰/Safari 검증은 미완료입니다. 운영 배포·commit/push 및 3-06 자동 진행은 없습니다.

## 이전 실행 결과 — 3-04 / 2026-10-25

**3-04 React·Tailwind 모바일 UI 구현 완료.** 기존 Remote Penpot를 읽기만 하고 기존 토큰63개·컴포넌트38개를 대조했습니다.
6개 화면(/, /game, /collection, /ranking, /profile, /login)과 기존404를 구현·유지했습니다.
AppLayout/NavLink/Outlet/본문 바로가기/기존 페이지·에셋 함수를 재사용하고 공통19종 컴포넌트·버튼 상태를 연결했습니다.
토큰63개 CSS 변수 등록, 테마/스타일에서51개 직접 참조,12개 기준/후속 토큰 보존. 동기화는 스크립트를 통한 수동 스냅샷 방식입니다.
모바일 게임 세로/가로 HUD·방향/행동 패드·취소 표시, Safe Area/100dvh, 로그인 폼 스크롤을 적용했습니다.

최종 npm run check(typecheck/lint/unit5/build) exit0. Chrome Playwright 6 viewport×4 시나리오 **24 passed**, exit0.
실기기 노치·주소창·가상 키보드·한 손 도달/성능, 실제 Auth·DB·낚시/Pixi 입력은 미검증/미구현입니다.
자세한 파일·검증·3-05 에셋 인계는 [PHASE3_04_UI_IMPLEMENTATION.md](PHASE3_04_UI_IMPLEMENTATION.md)를 따릅니다.
패키지/서비스/인증/운영 설정/Penpot 원본 보존. 운영 배포·commit/push 없음. 3-05는 별도 지시 전 시작하지 않습니다.

## 이전 실행 결과 — 3-03 / 2026-10-25

**3-03 Penpot 디자인 시스템 및 PC·모바일 초안 제작 완료.** 아래 과거의 3단계 미착수/연결 보류 기록보다 이 결과가 우선합니다.
기존 Remote MCP 읽기·격리 쓰기·재조회 성공. 기존 파일/원본 Page 1 보존, 새 작업 페이지4개·쓰기 테스트 페이지1개 추가.
토큰63·색상12·타이포그래피6·네이티브 컴포넌트38(기본19+상태19) 생성·재조회 완료.
6개 화면×6 viewport의 기본36 프레임, 게임 상태7 프레임, 일반 상태 보드5 및 입력·반응형 규칙 보드를 제작했습니다.
작업 중 시간 초과/heartbeat 단절은 기존 Chrome 탭 활성화 후 해소했고, 생성된30개를 재조회한 다음 중복 없이 이어갔습니다.

상세: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [PENPOT_MCP_WORKFLOW.md](PENPOT_MCP_WORKFLOW.md), docs/design의 실제 ID·토큰·검증 JSON.
3-04 시각 UI 구현 인수인계 가능. 실제 게임·Auth·DB·최종 SVG/WebP·실기기 검증은 미완료이며 전체 3단계 완료가 아닙니다.
앱/서비스/패키지/인증/운영 배포 변경 없음. 3-04 자동 착수·commit/push 없음. 이 실행 단위에서 중단합니다.

## 저장 정책 변경 후 최종 판정 — 2026-10-25 (과거 정책 확정 기록)

### 확정 결정과 3단계 인수인계

사용자가 확정한 아래 정책으로 재평가해 **2단계 완료를 유지하며 3단계 착수 준비 완료**로 판정합니다.
3단계 디자인/그래픽 구현 자체는 아직 시작하지 않았습니다. 이전 R2 활성화 대기/실패에 따른 착수 보류는 해제합니다.

| 대상 | 확정 정책 / 상태 |
| --- | --- |
| 정적 SVG/WebP·게임 배경·물고기 이미지 | 기존 public/assets → GitHub → 기존 Cloudflare Pages |
| Cloudflare R2 | 사용자 결정에 따라 과금 방지를 위해 의도적으로 보류. 실패/복구 대기 항목 아님 |
| Cloudinary 무료 플랜 | 향후 필요할 때 검토·도입, 현재 계정/프로젝트/SDK/연결 없음 |
| 사용자 업로드 | 필요 시 기존 Supabase Storage Free 활용 검토, 현재 업로드/버킷 연결 미구현 |
| 유료 전환·한도 초과 자동 과금 기능 | 사용자 승인 없이 활성화하지 않음. 한도 접근 시 최적화/작업 제한 우선 |

이미지 식별자와 실제 URL 분리 설계는 HANDOFF의 에셋 식별자 계약을 따릅니다.
현재 구현된 getAssetUrl(상대 경로 → URL)은 유지하고, 실제 에셋 제작 시 논리 ID → 경로/제공자 매핑을 추가합니다.
컴포넌트와 게임 로직에는 Cloudinary/R2/Pages의 개별 이미지 URL을 하드코딩하지 않습니다.
이 등록부는 설계 확정 상태이며 실제 이미지가 없는 현재 구현 완료로 표시하지 않습니다.

GitHub·Supabase·Cloudflare·Penpot 기존 연결/배포 설정은 유지합니다. 이번 확정 반영은 문서 작업이며
기존 빌드·정적 에셋 HTTP 검증 결과를 근거로 판정했습니다. 연결 재설정·외부 서비스 도입·유료 기능 활성화는 하지 않았습니다.
자세한 연결 파일/페이지 ID와 3단계 첫 작업·완료 기준은 HANDOFF의 최신 인수인계를 사용합니다.

**2단계 완료, 3단계 미착수.** 사용자 변경에 따라 R2 활성화/객체 테스트를 필수 기준에서 제외했습니다.
기존 Pages를 사용하는 정적 에셋 구조로 대체했으며 R2 연결 성공으로 기록하지 않습니다.

- 기존 public/assets의 images·fish·backgrounds·icons·audio를 재사용, 추가 폴더 없음.
- 이미지 파일을 GitHub에 저장하고 Vite public → dist → 기존 Pages로 제공하는 구조.
- src/services/assets.ts의 getAssetUrl 및 공통 AssetPath 타입으로 경로 분리. 기본 same-origin, 향후 승인된 base URL 교체 가능.
- 독립 임시 디렉터리의 SVG/WebP 빌드 복사·정적 HTTP 200/MIME/바이트 검증 성공.
- 기존 Pages /assets JS·CSS 200 확인. npm run check 전체 통과(단위 테스트 3개 포함).
- R2는 과금 방지를 위해 의도적으로 보류. 유료 플랜/결제 수단/자동 과금 가능 기능은 향후에도 사용자 사전 승인 전 활성화 금지.
- Supabase Storage Free는 동적 파일이 필요할 때만 검토하며 실제 버킷/업로드는 미연결, 후속 범위.
- 기존 서비스/MCP/배포 설정 보존. 새 서비스·유료 기능·원격 배포·commit/push 없음.
- 새 게임 이미지의 원격 배포와 E2E는 이번 미실행이며 2단계 대체 구조의 로컬 검증과 구분.

3단계는 기존 Penpot 연결 파일/페이지 재확인 후 토큰·컴포넌트·반응형 규칙 설계부터 시작할 수 있습니다.

## 1단계 완료 기준

> 최종 재검증(2026-10-25): GitHub 연결 플러그인/Git/gh 및 기존 Cloudflare Pages/Wrangler 정상.
> 기존 fishingking Preview success·전체 SHA·실제 화면 확인. Supabase MCP 및 CLI 2.122.0 기존 인증 정상,
> 승인 ref pjaducpbuqdlwkobwxbo link·로컬 ref 일치·프로젝트별 함수 목록 읽기 성공(0개).
> Penpot Remote로 기존 새 파일 1 / Page 1 읽기 성공. 페이지 1개, 자식 레이어·라이브러리·토큰 없음.
> 과거 R2 목록은 코드 10042로 실패했으나, 사용자 정책 변경으로 과금 방지를 위한 의도적 보류로 전환하고 Pages로 대체 검증 완료.
> Chrome --autoConnect/기존 프로필/전역 MCP 유지. 신규 배포·원격 자원 생성·DB 변경 없음.
> CLI 설치 후 npm run check 전체 통과, 자세한 최신 결과는 EXTERNAL_SERVICES/MCP_CONNECTIONS/PHASE2_AUDIT 참조.

- [x] 환경·파일·Git 조사, 기존 파일 및 템플릿 보존
- [x] Vite·React·TypeScript·Tailwind·Router·PixiJS 구성
- [x] 직접 의존성 24개 설치, 선언·잠금 파일·Node engines 일치 확인
- [x] 요구 폴더와 5개 페이지·404·반응형 내비게이션
- [x] AGENTS·README·환경변수 예시·ignore·설계·인계 문서
- [x] ESLint·타입 검사·Vitest 3개 테스트·프로덕션 빌드 통과
- [x] Playwright 4개 테스트 통과, exit 0
- [x] PC 1440×900·모바일 390×844 스크린샷 확인
- [x] 메뉴·새로고침·404·Tailwind·가로 넘침·콘솔·키보드 확인
- [x] 개발 서버 실제 주소 및 HTTP 200 확인
- [x] 2단계 인수인계 정리

npm.cmd run check는 exit 0을 반환했습니다.
E2E는 PLAYWRIGHT_CHANNEL=chrome 및 PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 조건에서
4 passed, exit 0입니다. Chrome 버전은 155.0.8059.86입니다.
개발 서버는 http://127.0.0.1:5173/에서 HTTP 200을 반환했습니다.

모바일은 에뮬레이션이며 실제 기기 검증이 아닙니다.
전용 Chromium 다운로드는 EACCES로 차단되어 설치된 Chrome으로 검증했습니다.
자체 테스트 서버 종료가 지연되어 별도 실행한 개발 서버를 대상으로 재검증했습니다.
재현 명령과 제한은 HANDOFF.md를 읽으세요.

2단계에서는 승인된 GitHub 저장소, Supabase 개발 프로젝트, Cloudflare Pages/R2 용도,
Penpot 작업 공간과 MCP 최소 권한을 확인합니다. 현재 외부 연결·배포·원격 push는 수행하지 않았습니다.

## 2단계 진행 현황 — 2026-10-25

**새 정책 기준 완료.** R2는 의도적 제외, 미구현 게임/동적 업로드는 후속 단계로 구분합니다.

| Phase | 상태 |
| --- | --- |
| A 환경 감사 | 완료: 로컬/전역 설정을 마스킹 조회, CLI 네트워크 제한 확인 |
| B GitHub | 기존 연결 도구 및 정상 권한 Git/gh 인증·원격 읽기 성공, 이번 원격 쓰기 없음 |
| C Pages | 기존 fishingking·Git 연동·빌드 설정·성공한 Preview 읽기 검증 완료, 신규 배포 없음 |
| D Supabase | 기존 FishingKing MCP·CLI 인증 정상. 승인 ref link·연결 후 함수 목록 읽기 성공(0개) |
| E 저장 구조 | 기존 Pages 정적 에셋 구조·공통 경로·빌드/HTTP 검증 완료. R2는 과금 방지를 위해 의도적으로 보류 |
| F Penpot | 기존 Remote 연결 파일·페이지·레이어 읽기 성공. 새 파일 1 / Page 1, 자식 레이어 0개, 디자인 수정 없음 |
| G 브라우저 | 기존 Chrome --autoConnect 유지, 로그인/실제 Pages Preview 화면 읽기 성공 |
| H 자동 배포 | 기존 Git Integration·자동 배포 Enabled·Preview SHA/URL/success 확인, 이번 트리거 실행 없음 |
| I 문서 | PHASE2_AUDIT/EXTERNAL_SERVICES/MCP_CONNECTIONS/DEPLOYMENT 및 인계 갱신 |

원격에서 추가한 것은 검증용 브랜치 codex/phase2-connectivity-20261025-0440뿐입니다.
main과 로컬 초기 커밋 006ca9286bcdb9b993b271d6c76d778f23b467bc는 보존했습니다.
새 저장 정책 기준으로 2단계 완료, 3단계 Penpot 디자인 설계 인수인계 준비가 됐습니다. 디자인 구현 자체는 미착수입니다.
원격 자원 신규 생성/배포 변경은 기존 자원 조회 후 구체적인 승인 절차를 거칩니다.
