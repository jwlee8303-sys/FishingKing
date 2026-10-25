# FishingKing 로드맵 진행 상황

확인일: 2026-10-25 (Asia/Seoul)

| 단계 | 상태 |
| --- | --- |
| 1. 개발 환경 구축 | 완료 |
| 2. 외부 서비스 및 MCP 연결 | 미착수 |
| 3. Penpot 디자인 및 그래픽 제작 | 미착수 |
| 4. Supabase DB 및 인증 | 미착수 |
| 5. 낚시 게임 엔진 | 미착수 |
| 6. 물고기 도감·랭킹·커뮤니티 | 미착수 |
| 7. 통합 테스트 및 자동 배포 | 미착수 |
| 8. 정식 운영 및 확장 | 미착수 |

## 1단계 완료 기준

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
