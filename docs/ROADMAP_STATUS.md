# FishingKing 로드맵 진행 상황

확인일: 2026-10-25 (Asia/Seoul)

| 단계 | 상태 |
| --- | --- |
| 1. 개발 환경 구축 | 완료 |
| 2. 외부 서비스 및 MCP 연결 | 완료 — 확정된 Pages 정적 에셋 정책 기준, R2 의도적 보류·Cloudinary 향후 검토 |
| 3. Penpot 디자인 및 그래픽 제작 | 진행 중 — 3-01~3-04 완료, 최종 에셋·게임 입력/Pixi 후속 |
| 4. Supabase DB 및 인증 | 미착수 |
| 5. 낚시 게임 엔진 | 미착수 |
| 6. 물고기 도감·랭킹·커뮤니티 | 미착수 |
| 7. 통합 테스트 및 자동 배포 | 미착수 |
| 8. 정식 운영 및 확장 | 미착수 |

## 최신 실행 결과 — 3-04 / 2026-10-25

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
