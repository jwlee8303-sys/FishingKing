# FishingKing 구조와 향후 연결 계획

현재는 1단계 자리표시자 UI 코드입니다. 아래 미래 항목은 설계이며 구현 완료가 아닙니다.

## UI와 게임 렌더러

main.tsx가 StrictMode와 단일 BrowserRouter를 제공합니다. App.tsx는 중첩 Route로
AppLayout 안에 Home/Game/Collection/Ranking/Login/404를 표시합니다.
공통 레이아웃은 제목·내비게이션·본문 이동 링크·footer를 담당합니다.
PagePlaceholder는 현재의 간단한 개발 예정 안내를 공유합니다.

React는 페이지와 접근 가능한 UI를 담당합니다. 게임 캔버스·씬·ticker는 src/game으로 분리합니다.
현재 PixiJS Application의 타입을 참조하는 경계만 있고 인스턴스는 생성하지 않습니다.
향후 PixiJS 8 비동기 init, 초기화 중 언마운트, StrictMode 재마운트와 정리를 구현해야 합니다.
씬이 소유한 구독·canvas·GPU 자원만 해제하고 공유 자원의 수명을 구분합니다.

## 서비스와 공식 게임 기록

src/services는 향후 Supabase 공개 클라이언트와 API, 자산 URL 연결 지점입니다.
Auth·DB·Edge Functions는 4단계부터 구현합니다. DB 타입은 확정한 스키마에서 생성합니다.
공식 게임 결과·보상·랭킹은 서버에서 검증해야 합니다. 클라이언트가 보낸 점수를 신뢰하지 않습니다.
RLS 및 인증·권한 확인을 적용하고 운영 데이터 변경은 사전 승인을 받습니다.

## 자산과 Cloudflare

public/assets는 아직 빈 리소스 폴더입니다. SVG는 UI/벡터, WebP는 래스터 자산에 사용합니다.
향후 공개 R2 자산은 asset base URL로 조회하고 업로드 서명은 서버에서 발급합니다.
R2 비밀키는 브라우저에 넣지 않습니다. Pages 배포·SPA 새로고침 fallback·캐시·R2 CORS는
연결/배포 단계에서 실제 환경을 대상으로 검증합니다. 현재 배포 설정은 없습니다.

## Penpot와 반응형

Figma는 사용하지 않습니다. 3단계 Penpot에서 합의한 색·간격·타입 토큰을
src/styles/global.css의 Tailwind @theme로 연결할 계획입니다.
현재는 시스템 글꼴과 단순 색상, 좁은 화면의 세로 배치·메뉴 줄바꿈을 사용합니다.
키보드 초점 표시와 본문 이동 링크를 제공합니다. 320px 이상 화면을 기준으로 작성했으나
1440×900 및 390×844 Chrome에서 표시와 키보드 접근을 확인했습니다.

## 검사 경계

TypeScript는 앱·Vite/Vitest/Playwright 설정·테스트를 프로젝트 참조로 검사합니다.
Vitest는 tests/unit만 실행하고 Playwright는 tests/e2e만 실행합니다.
E2E는 1440×900 및 390×844 Chromium에서 라우팅·새로고침·404·스타일·가로 넘침·콘솔·키보드를 검사하도록 작성했습니다.
모바일은 뷰포트 에뮬레이션이며 실제 모바일 기기 검증은 아닙니다. Chrome 155.0.8059.86에서 4개 E2E 테스트를 실행해 통과했습니다.
