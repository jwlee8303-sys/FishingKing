# 배포 연결 및 Preview 검증 계획

확인일: 2026-10-25. **기존 Pages Preview의 성공 상태를 읽기 검증했습니다. 이번 배포 실행은 없습니다.**

저장 정책 변경: 정적 에셋은 public/assets → GitHub → Vite dist → 기존 Pages로 제공합니다.
R2는 과금 방지를 위해 의도적으로 보류하며 R2 활성화/과금/버킷 생성을 배포 선행 조건으로 두지 않습니다.
새 정책의 로컬 SVG/WebP 복사·HTTP 검증과 기존 Production /assets JS·CSS 200 확인 완료.
새 게임 에셋의 원격 배포·push는 이번에 수행하지 않았습니다. 유료 플랜/자동 과금 가능 기능은 사용자 승인 전 활성화하지 않습니다.

## 최신 읽기 재검증

기존 fishingking Pages는 jwlee8303-sys/FishingKing과 연결되어 있습니다. build `npm run build`, output `dist`,
root 기본값, production `main`, 자동 배포 Enabled를 대시보드에서 확인했습니다.
Wrangler 기존 캐시 4.152.0의 기존 인증·Pages 프로젝트/배포 목록 조회도 정상입니다.
Preview 배포 `98921a3c-fdea-4a7d-b6dc-f51696e2cd55`는 success, 검증 브랜치
`codex/phase2-connectivity-20261025-0440` 및 SHA `006ca9286bcdb9b993b271d6c76d778f23b467bc`와 일치합니다.
https://98921a3c.fishingking.pages.dev 실제 화면에서 FishingKing 제목·메뉴 5개·가로 넘침 없음을 확인했습니다.
기존 Production 목록도 보이나 이번에 배포/빌드/설정을 변경하지 않았습니다.

이하 계획과 실패 기록은 최초 진단 당시 내용이며 위 최신 결과보다 우선하지 않습니다.

## 현재 확인된 상태

- 저장소: jwlee8303-sys/FishingKing, main SHA 006ca9286bcdb9b993b271d6c76d778f23b467bc.
- 검증용 브랜치: codex/phase2-connectivity-20261025-0440. 기존 SHA를 가리키며 추가 소스 커밋 없음.
- Cloudflare 계정/Pages 프로젝트/연동 방식/운영 브랜치/Build 설정/Preview URL은 미확인.
- 브라우저는 Cloudflare 로그인 화면. 프로젝트 의존성 Wrangler 설치는 npm EACCES로 실패.
- 캐시 Wrangler 4.152.0 실행은 가능하지만 인증 조회는 실패. 정상 인증으로 간주하지 않음.

## 승인 전 조회할 내용

사용자 로그인 후 Dashboard → Workers & Pages에서 FishingKing 관련 기존 프로젝트를 찾습니다.
프로젝트가 있다면 Settings → Builds & deployments에서 저장소, 루트, Build command,
output, production branch, Preview branch 조건을 읽기만 합니다.
기존 Git 연동인지 Direct Upload인지 구분하며 타입을 임의 전환하지 않습니다.
다른 프로젝트나 운영 설정과 충돌하면 수정하지 않고 차이를 제시합니다.

## 현재 코드에 맞는 비교 기준

| 항목 | 기준 |
| --- | --- |
| Framework | Vite / React |
| Root directory | 저장소 루트 |
| Build command | npm run build |
| Output directory | dist |
| Node | package.json engines에 맞는 24.x (현재 로컬 24.22.0) |
| 설치 | package-lock.json을 보존한 npm ci |
| 환경변수 | 현재 UI는 실제 서비스 변수 없이 동작 |

이 표는 권장 비교 기준이며 Cloudflare에 적용된 설정이 아닙니다.
Pages SPA fallback은 /game·/collection·/ranking·/login 직접 진입/새로고침으로 실제 확인해야 합니다.
현재 _redirects나 Wrangler 배포 설정을 추측해서 추가하지 않았습니다.

## 자동 배포 검증 순서

1. 기존 Git Integration과 Preview branch 조건을 확인.
2. 신규 프로젝트 또는 기존 운영 설정 변경이 필요하면 구체적 diff/요금/대상을 제시하고 승인 대기.
3. 검증용 브랜치에만 최소 변경 커밋을 준비하고 비밀정보 검사.
4. Preview를 유발하는 테스트 브랜치 push/커밋을 수행. main은 변경하지 않음.
5. Cloudflare 배포에 기록된 SHA와 GitHub SHA 일치 확인.
6. Preview URL의 HTTP, SPA 메뉴/직접 URL, 모바일, 콘솔을 chrome-devtools로 검증.
7. 테스트 브랜치·리소스를 임의 삭제하지 않음.

현재는 GitHub 브랜치 생성만 성공했고 위 Preview 자동 배포 테스트는 미실행입니다.
Preview를 일반 프로덕션 배포로 대체하지 않습니다.

## 네트워크 복구 후 외부 PowerShell 명령

아래 명령은 아직 성공 검증되지 않은 재개 절차입니다. 기존 설치 여부부터 확인합니다.

~~~powershell
Set-Location -LiteralPath D:\FishingKing
npm.cmd install -D wrangler supabase
npx.cmd wrangler --version
npx.cmd wrangler login
npx.cmd wrangler whoami
npx.cmd wrangler pages project list
npx.cmd wrangler r2 bucket list
npx.cmd supabase --version
npx.cmd supabase login
npx.cmd supabase projects list
~~~

CLI OAuth는 브라우저에서 사용자가 직접 완료합니다. 토큰 인자를 넣지 마세요.
Supabase 프로젝트는 이미 있으므로 projects create를 실행하지 않습니다.
향후 link 대상은 pjaducpbuqdlwkobwxbo이며 CLI/로컬 config 확인 뒤 link합니다.
DB 비밀번호 검증은 필수가 아니며 선택 입력은 건너뛸 수 있습니다.
db push/reset, 함수 배포, 사용자/스키마/RLS 변경은 이번 범위 밖입니다.

## R2 검증 계획

로그인 후 기존 버킷을 먼저 확인합니다. 없다면 fishingking-dev-assets / Standard / 비공개 계획으로 승인을 요청합니다.
승인 후 UUID가 포함된 고유 테스트 객체 1개를 업로드·읽기하고 결과를 기록합니다.
기존 객체·공개 설정·CORS는 바꾸지 않고 테스트 객체도 임의 삭제하지 않습니다.
실제 게임 업로드는 서버 측 최소권한 서명 URL을 사용하고 R2 비밀키를 VITE_에 두지 않습니다.

## 공식 문서

- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
- https://developers.cloudflare.com/workers/wrangler/commands/
- https://supabase.com/docs/reference/cli/introduction
