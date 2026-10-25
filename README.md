# FishingKing

데스크톱·모바일 웹을 위한 2D 낚시 게임 프로젝트입니다.
현재 1단계는 **완료** 상태입니다. 설치 확인·타입 검사·ESLint·단위 테스트·빌드·PC/모바일 브라우저 검증을 통과했습니다.
검증 당시 개발 서버는 http://127.0.0.1:5173/에서 실행 중이었습니다.

## 기술과 범위

Vite, React, TypeScript, Tailwind CSS, React Router, PixiJS를 사용하도록 구성했습니다.
Vitest·React Testing Library·jsdom·Playwright 테스트 코드를 제공합니다.
현재 /, /game, /collection, /ranking, /login 및 404 자리표시자 코드만 있습니다.
실제 게임·로그인·DB·그래픽·배포는 구현하지 않았습니다.

## 요구 환경

- Windows + PowerShell + VS Code, Node.js 24.15 이상 24.x, npm, Git
- 실제 확인: Node 24.22.0, npm 11.19.1, Git 2.56.0.windows.2
- 이전 세션 확인: VS Code 1.143.1, Codex CLI 0.164.0 (이번 세션 재검증 안 함)
- 정확한 설치 버전은 package-lock.json 및 docs/DEPENDENCIES.md 참조

package-lock.json v3 및 직접 의존성 24개를 검증했습니다. 이후 재현 설치는 npm.cmd ci를 사용합니다.

## 설치와 실행

허용된 네트워크 환경에서 다음을 실행합니다. 정책을 해제하거나 TLS 검증을 끄지 마세요.

```powershell
Set-Location -LiteralPath D:\FishingKing
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd run check
npm.cmd run test:e2e
npm.cmd run dev
```

잠금 파일을 보존하고 npm.cmd ci를 사용합니다.
개발 서버 주소는 Vite가 실제 출력한 값을 확인합니다. 기본 포트 점유 시 자동 변경될 수 있습니다.
Playwright는 127.0.0.1:4173에 자체 서버를 실행하며 점유된 포트의 다른 프로세스를 종료하지 않습니다.

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run test:watch
npm.cmd run build
npm.cmd run preview
```

## 구조

```text
src/pages/             페이지·라우트
src/components/layout/ 공통 레이아웃·내비게이션
src/game/              향후 PixiJS 렌더러와 게임 로직
src/services/          향후 API·Auth·스토리지 연결
src/types/             공통 타입
src/styles/            Tailwind 진입점과 향후 디자인 토큰
public/assets/         images, fish, backgrounds, icons, audio
tests/unit/            React 컴포넌트 테스트
tests/e2e/             Chromium 데스크톱·모바일 뷰포트 테스트
scripts/               개발 검사 실행 도구
docs/                  설계·진행 상태·인수인계
.local/scaffold/       보존한 원본 템플릿 (Git 제외)
```

## 환경변수와 보안

.env.example은 미래 연결용 빈 공개 설정입니다. 현재 앱은 환경변수를 요구하지 않습니다.
VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_ASSET_BASE_URL은 향후 공개 클라이언트 설정입니다.
VITE_는 브라우저에 포함되므로 비밀키를 넣지 않습니다. Supabase secret/service_role,
DB 비밀번호, Cloudflare API 및 R2 키는 향후 서버의 비밀 관리 기능에 둡니다.
실제 .env 파일은 커밋하지 않습니다.

## Windows 문제 해결

- npm.ps1/codex.ps1 실행 정책 오류: npm.cmd/npx.cmd/codex.cmd를 사용합니다.
- npm EACCES: registry 접근과 세션의 네트워크 정책을 확인합니다. 이전 설치와 Chromium 다운로드가 연결 단계에서 차단되었습니다. 현재 프로젝트 의존성은 설치되어 있습니다.
- setup refresh had errors: 명령 시작 단계의 환경 오류입니다. 현재 세션에서는 재발하지 않았습니다.
- 파일 편집 도구가 기존 설정 교체에 실패한 경우 차이를 검토한 뒤 일반 파일 쓰기로 최소 수정했습니다.
- 포트 점유: 개발 서버 출력 주소를 확인하고 다른 앱을 일괄 종료하지 않습니다.
- Playwright 브라우저 없음: 패키지 설치 후 Chromium을 설치합니다. 실제 기기 검증과 에뮬레이션은 구분합니다.
- 의존성 충돌: engines/peerDependencies를 확인합니다. --force, --legacy-peer-deps로 숨기지 않습니다.

## 다음 단계

8단계 로드맵은 docs/ROADMAP_STATUS.md, 재개 방법과 실제 결과는 docs/HANDOFF.md를 읽으세요.
2단계 서비스·MCP 연결, 3단계 Penpot 디자인, 4단계 DB·인증부터 순서대로 진행합니다.
외부 계정·운영 DB·유료 서비스·원격 배포는 이번 작업에서 변경하지 않았습니다.

## 기존 Chrome과 개발 서버로 E2E 실행

별도 터미널에서 npm.cmd run dev를 실행한 다음:

~~~powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:5173'
npm.cmd run test:e2e
~~~

실제 서버 주소를 지정하세요. BASE_URL을 생략하면 자체 서버를 사용합니다.
이번 샌드박스에서는 자체 서버 종료가 지연되어 기존 서버를 대상으로 검증했습니다.
자세한 검증 조건과 Chromium 설치 방법은 docs/HANDOFF.md를 읽으세요.
