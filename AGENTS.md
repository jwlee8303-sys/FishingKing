# FishingKing 개발 지침

- React + TypeScript 기반 2D 웹 낚시 게임이다. 작업 폴더는 D:\FishingKing이다.
- 새 세션은 이 파일, docs/ROADMAP_STATUS.md, docs/HANDOFF.md, Git 상태를 먼저 확인한다.
- 기존 코드·설정·사용자 변경·Git 이력을 보존한다. 최소 변경을 우선하고 대규모 리팩터링을 피한다.
- git reset --hard, git clean, 저장소 재초기화, 강제 push, 무단 원격 변경을 하지 않는다.
- 파괴적 변경·유료 결제·운영 데이터 변경·운영 배포는 사용자 최종 승인이 필요하다.
- 현재 1단계 범위는 개발 기반과 자리표시자 UI다. 실제 게임·Auth·DB·외부 연결은 구현하지 않는다.
- React UI는 src/pages 및 src/components, PixiJS 렌더러는 src/game에 분리한다.
- 외부 API·인증·스토리지는 src/services, 공통 타입은 src/types에서 관리한다.
- TypeScript strict를 유지하고 의미 있는 명시적 타입을 사용한다. 근거 없는 any와 @ts-ignore를 피한다.
- UI는 Tailwind CSS 기반으로 작성하고 반응형·키보드 접근성·의미 있는 HTML을 고려한다.
- Figma를 사용하지 않는다. Penpot 디자인 시스템은 3단계부터 연결한다.
- 신규 기능의 설계와 구현 범위를 구분한다. 아직 연결하지 않은 서비스를 동작한다고 표현하지 않는다.
- 패키지 변경 전 공식 문서·engines·peerDependencies를 확인한다. 강제 설치로 충돌을 숨기지 않는다.
- npm을 사용하고 설치 성공 시 package-lock.json을 함께 관리한다. 이후 npm ci로 재현한다.
- 비밀키·토큰·환경변수 실제 값을 채팅·코드·로그·커밋에 노출하지 않는다.
- VITE_ 값은 브라우저에 공개된다. service_role·secret 키·R2 키는 서버에서 최소 권한으로 관리한다.
- 인증 및 MCP 전역 설정을 덮어쓰지 않는다. 환경변수는 필요 변수명만 점검한다.
- 기능 변경 후 관련 테스트를 실행한다. 테스트 미실행·도구 시작 실패·실제 테스트 실패를 구분한다.
- 실행하지 않은 검증을 통과했다고 보고하지 않는다. 검사 규칙을 무력화해 통과시키지 않는다.
- 단계 종료 시 docs/ROADMAP_STATUS.md 및 docs/HANDOFF.md를 실제 상태로 갱신한다.

## 주요 명령

- npm.cmd install: 의존성 변경 시 사용. 기존 잠금 파일을 보존하고 차이를 검토한다.
- npm.cmd ci: lockfile 생성 이후 재현 설치.
- npm.cmd run dev: 127.0.0.1 개발 서버.
- npm.cmd run typecheck: 앱·도구 설정·테스트의 전체 TypeScript 프로젝트 검사.
- npm.cmd run lint / test / build / test:e2e: 개별 검사.
- npm.cmd run check: typecheck → lint → test → build 순차 실행.
- npx.cmd playwright install chromium: 패키지 설치 후 필요한 Chromium 설치.

네트워크·권한 오류는 원문과 실패 지점을 기록하고 가능한 독립 작업을 계속한다.
샌드박스 해제·TLS 검증 해제·전역 실행 정책 변경으로 우회하지 않는다.
