# 의존성 설치 및 호환성 확인

확인일: 2026-10-25 (Asia/Seoul)

node_modules와 package-lock.json v3를 직접 확인했습니다.
npm.cmd ls --depth=0은 exit 0이며 직접 의존성 24개가 정상입니다.
모든 직접 의존성의 설치 버전이 package.json 범위·잠금 파일과 일치하며 Node engines를 충족합니다.
TypeScript·ESLint·단위 테스트·빌드·Chrome E2E도 통과했습니다.
의존성 설치는 사용자 환경에서 수행된 결과를 확인했으며 이번에 재설치하지 않았습니다.
재현 설치 명령은 npm.cmd ci입니다.

## 실제 설치 버전

| 패키지 | 버전 |
| --- | --- |
| @eslint/js | 10.0.1 |
| @playwright/test | 1.64.1 |
| @tailwindcss/vite | 4.3.3 |
| @testing-library/dom | 10.4.2 |
| @testing-library/jest-dom | 6.9.1 |
| @testing-library/react | 16.3.3 |
| @testing-library/user-event | 14.6.8 |
| @types/node | 24.19.2 |
| @types/react | 19.3.0 |
| @types/react-dom | 19.3.0 |
| @vitejs/plugin-react | 6.1.2 |
| eslint | 10.13.0 |
| eslint-plugin-react-hooks | 7.1.1 |
| eslint-plugin-react-refresh | 0.5.7 |
| jsdom | 30.1.3 |
| pixi.js | 8.22.0 |
| react | 19.3.1 |
| react-dom | 19.3.1 |
| react-router | 8.5.0 |
| tailwindcss | 4.3.3 |
| typescript | 6.0.3 |
| typescript-eslint | 8.71.2 |
| vite | 8.3.4 |
| vitest | 5.0.5 |

## 선택 근거와 범위

원본 create-vite 9.2.1 react-ts 템플릿을 보존했습니다.
React 19·Vite 8·TypeScript 6 계열을 사용하고 요청된 ESLint를 구성했습니다.
typescript-eslint 8의 TypeScript peer 범위에 맞춰 TypeScript 6.0.3을 유지했습니다.
Vitest 5는 현재 Vite 8과 Node 24를 지원합니다.
jsdom의 Node 요구 조건을 고려해 프로젝트 engines는 ^24.15.0입니다.
Tailwind 4는 공식 @tailwindcss/vite 플러그인과 CSS import 방식을 사용합니다.
Router 8은 선언형 SPA 모드이며 단일 BrowserRouter를 사용합니다.
PixiJS 8은 타입 경계 검사만 완료했고 실제 GPU 렌더링은 5단계 범위입니다.
Playwright는 설치된 Chrome 155.0.8059.86으로 검증했습니다. 전용 Chromium 다운로드는 차단되었습니다.
실제 모바일 기기·운영 배포·외부 서비스 호환성은 이번 검증 범위가 아닙니다.

## 공식 문서

- https://vite.dev/guide/
- https://tailwindcss.com/docs/installation/using-vite
- https://reactrouter.com/start/declarative/installation
- https://vitest.dev/guide/
- https://playwright.dev/docs/browsers
- https://pixijs.com/8.x/guides/components/application
