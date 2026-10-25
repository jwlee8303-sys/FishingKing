# 외부 서비스 연결 현황

확인일: 2026-10-25. 설정됨·인증됨·테스트됨을 구분합니다.

| 서비스 | 용도 / 비밀이 아닌 식별자 | 연결·인증·검증 상태 |
| --- | --- | --- |
| GitHub | jwlee8303-sys/FishingKing | 기존 연결 도구·Git·gh 읽기 성공. gh 인증 정상, origin/main SHA 일치. 재인증 안 함 |
| Supabase | FishingKing / pjaducpbuqdlwkobwxbo / ap-northeast-2 | MCP·CLI 인증 정상. 승인된 ref로 link 완료, 로컬 ref 일치·프로젝트별 함수 목록 읽기 성공(0개) |
| Cloudflare Pages | fishingking / fishingking.pages.dev | 기존 프로젝트·Git 연동·빌드 설정·성공한 Preview 확인. 기존 캐시 Wrangler 4.152.0 인증·목록 조회 성공 |
| Cloudflare R2 | 장기 마이그레이션 후보 | 과금 방지를 위해 의도적으로 보류. 현재 2단계 필수 항목에서 제외, 활성화·결제 등록·버킷/객체 작업 안 함 |
| Cloudinary 무료 플랜 | 향후 필요 시 이미지 관리 후보 | 사용자 확정 정책에 따른 후속 검토 대상. 현재 미도입·미연결, SDK/계정/프로젝트 생성 안 함 |
| 정적 게임 에셋 | public/assets → GitHub → 기존 Pages | 기존 5개 폴더 재사용, 경로 함수 분리. SVG/WebP 빌드 복사·로컬 HTTP 제공 및 기존 Pages /assets 응답 검증 완료 |
| Supabase Storage Free | 향후 동적 파일 후보 | 검토만 수행. 실제 조직 플랜/사용량 확인·버킷/RLS/업로드 구현은 필요 시 별도 검증, 현재 미연결 |
| Penpot | 3단계 디자인 시스템 | 기존 Remote MCP로 새 파일 1 / Page 1 및 전체 빈 레이어 구조 읽기 성공. 디자인 변경 없음 |
| chrome-devtools | 개발/Preview 브라우저 검사 | 기존 --autoConnect 유지, 기존 Chrome 탭 재사용·Preview 화면 읽기 성공. 재설치·새 프로필 생성 안 함 |

## 무료 기반 저장 정책과 2단계 완료 판정 — 2026-10-25

**사용자 변경 기준으로 2단계 완료.** R2 연결을 성공했다고 판정한 것이 아니라 필수 범위에서 의도적으로 제외하고
기존 Pages 기반 대체 구조를 검증했습니다. 3단계 디자인 구현은 아직 미착수입니다.

최종 확정: R2는 사용자 결정에 따른 의도적 보류이며 실패 항목이 아닙니다. Cloudinary 무료 플랜은 향후 필요할 때만 도입을 검토합니다.
논리 이미지 ID → 등록부 → 제공자별 경로/URL 해석 설계는 HANDOFF에 정리했으며 실제 에셋 등록부 구현은 3단계입니다.
현재 getAssetUrl의 상대 경로/base URL 분리를 유지하고 기존 모든 서비스 연결/배포 설정을 변경하지 않습니다.

- R2는 **과금 방지를 위해 의도적으로 보류**합니다. 유료 구독·결제 수단 등록·서비스 활성화는 하지 않습니다.
- 앞으로도 유료 플랜 전환·사용량 초과 자동 과금 가능 기능은 사용자 사전 승인 전 활성화하지 않습니다.
  한도에 접근하면 최적화/작업 중단/범위 재검토를 먼저 하고 자동 업그레이드·과금 기능으로 대체하지 않습니다.
- 정적 SVG/WebP/배경/아이콘/오디오는 기존 Pages의 정적 파일로 제공합니다. Workers/Pages Functions,
  동적 이미지 변환, 새 스토리지 서비스 등은 이번 구조에 추가하지 않습니다.
- GitHub에는 최종 이미지 파일을 public/assets 아래 일반 파일로 보관합니다. 기존 폴더는 아래와 같으며 추가 폴더는 없었습니다.

| 폴더 | 용도 |
| --- | --- |
| public/assets/images | 일반 UI/소개 이미지 |
| public/assets/fish | 물고기 SVG/WebP |
| public/assets/backgrounds | 배경 |
| public/assets/icons | 아이콘 |
| public/assets/audio | 오디오 |

Vite의 public 파일 복사 → dist/assets의 원본 파일 → 기존 Git 연동 Pages 배포 구조를 사용합니다.
현재 실제 게임 이미지는 없으며, 이미지가 추가된 뒤 승인된 Git push/Pages 배포에서 함께 제공됩니다.
이번 작업은 커밋/push/원격 배포를 하지 않았습니다.

### 경로 관리와 향후 마이그레이션

- `src/types/assets.ts`: 기존 5개 폴더 기반 AssetPath 타입.
- `src/services/assets.ts`: `getAssetUrl('fish/carp.v1.webp')` 형태의 공통 URL 생성 함수.
  예제 파일은 아직 없습니다. 기본값은 앱 BASE_URL + assets/이며 UI/PixiJS에서 제공자 주소를 직접 쓰지 않습니다.
- 기존 선택 변수 VITE_ASSET_BASE_URL은 기본으로 비워 둡니다. 향후 사용자 승인 후 R2 등으로 옮길 때만 공개 base URL을
  변경하고 폴더/상대 경로는 보존합니다. 토큰·서명 URL·비밀키는 이 공개 변수에 넣지 않습니다.
- public 파일에는 자동 해시가 붙지 않으므로 실제 이미지 변경 시 carp.v2.webp처럼 버전 파일명을 쓰고 참조를 함께 변경합니다.

### 검증 결과와 범위

1. 기존 5개 폴더 및 Git 추적 .gitkeep 확인. 필요한 추가 폴더 없음.
2. Git 제외 .local의 독립 publicDir/outDir에서 검증 SVG·WebP를 빌드, 원본 바이트와 복사본 일치.
3. 공통 경로 함수가 만든 URL을 빌드 정적 서버에서 GET: 둘 다 HTTP 200,
   image/svg+xml·image/webp MIME 및 응답 바이트 일치. 실제 public/assets는 변경하지 않음.
4. 기본 /assets/, 하위 /fishingking/assets/, 향후 CDN 문자열 조합 확인. CDN 주소는 외부 요청하지 않음.
5. 기존 https://fishingking.pages.dev 의 /assets JS·CSS GET 200 및 올바른 MIME 확인. 확인용 탭은 닫음.
6. npm run check 전체 exit 0: typecheck/lint/단위 테스트 3개/build 통과. 새 게임 에셋의 원격 배포·E2E는 이번 미실행.

### 무료 범위와 동적 저장 대안

Pages Free의 공식 한도는 사이트 파일 20,000개, 개별 파일 25 MiB, 월 500 builds입니다.
자산을 압축하고 변경 배포를 묶어 관리하며 한도 초과 시 자동 유료 전환을 하지 않습니다.
실제 계정의 기존 결제/구독 전체를 감사한 것은 아니며 이번에 새 과금 경로를 활성화하지 않았습니다.

사용자 업로드 등 동적 저장이 필요하면 기존 Supabase Storage Free를 우선 검토합니다.
공식 저장 용량은 Free 1 GB이나 전송량·파일 한도·현재 조직 플랜/사용량·RLS를 사용 전에 함께 확인해야 합니다.
자동 업로드/버킷 생성/유료 이미지 변환은 미구현·미연결 상태입니다. 한도 도달 시 업로드를 제한하는 설계가 필요합니다.

공식 근거(2026-10-25 확인): [Vite public 복사](https://vite.dev/guide/assets.html#the-public-directory),
[Pages 한도](https://developers.cloudflare.com/pages/platform/limits/),
[Supabase Storage 요금/Free 용량](https://supabase.com/docs/guides/storage/pricing).

GitHub·Cloudflare Pages·Supabase·Penpot 연결, 인증, 배포 설정은 보존했습니다. 새 외부 서비스/유료 기능은 활성화하지 않았습니다.
Supabase Storage 실제 업로드와 새 게임 이미지 원격 제공은 후속 필요 시 검증하며 이번 완료 범위와 구분합니다.

## 이전 연결 재검증 및 당시 2단계 판정 — 2026-10-25

아래는 저장 정책 변경 전 기록입니다. R2 필수 검증과 3단계 보류 판정은 상단 새 정책으로 대체합니다.

- Supabase CLI 2.122.0: 기본 권한 조회는 Access token not provided였으나 정상 권한의 동일 조회는 exit 0.
  기존 인증을 재사용했으며 재로그인/토큰 재발급을 하지 않았습니다. 권한에 따라 결과가 달랐으므로 인증 만료로 단정하지 않습니다.
  CLI 목록에는 FishingKing 1개가 있었고 ref·이름·리전·상태가 MCP 결과와 일치했습니다.
- 승인된 `pjaducpbuqdlwkobwxbo`를 명시해 `link --project-ref pjaducpbuqdlwkobwxbo --skip-pooler` 실행 성공.
  사전 검사에서 다른 ref가 기존에 연결돼 있으면 중단하도록 보호했습니다. 작업 전에는 로컬 link/config가 없었습니다.
  DB 비밀번호 없이 실행했으며 원격 설정·스키마·데이터·Auth를 변경하지 않았습니다.
  `supabase/.temp/project-ref`의 20자리 값이 승인 ref와 일치. 생성된 .temp 캐시 전체가 Git 제외됨을 확인했습니다.
  해당 ref를 명시한 `functions list`도 exit 0, 함수 0개. DB SQL/데이터 검증은 하지 않았습니다.
- Penpot 프로젝트: `FishingKing - MCP 연결 검증`, project ID `5009c98b-0fb2-816e-8008-d7b0732aaceb`.
  파일: `새 파일 1`, file ID `685eebd9-2ce2-80a4-8008-d7b0b4e16646`.
  페이지: `Page 1`, page ID `685eebd9-2ce2-80a4-8008-d7b0b4e16647`.
  브라우저 파일/페이지/project ID와 MCP 파일/페이지 ID를 대조했습니다. Remote MCP의 페이지·레이어 읽기 성공.
  페이지 1개, Root Frame 아래 자식 레이어 0개, 컴포넌트·색상·타이포그래피 각 0개, 토큰 목록 비어 있음.
  프로젝트명과 파일명을 구분하며 이번 작업에서 파일 생성·이름 변경·디자인 수정/삭제를 하지 않았습니다.
- R2: 기존 Wrangler 인증의 `r2 bucket list`는 exit 1, 오류 10042·Please enable R2.
  목록을 받지 못했으므로 버킷 부재로 단정하지 않습니다. 활성화/결제/요금제·버킷 생성·객체 테스트는 미실행.
  사용자 승인 및 실제 요금/계정 조건 확인 전에는 활성화하지 않습니다.

GitHub·Cloudflare Pages의 기존 연결/운영/배포 설정과 전역 MCP는 변경하지 않았습니다.
인증 URL·쿠키·토큰·비밀번호·API 키는 출력하거나 로그에 기록하지 않았습니다.
3단계 파일 연결 전제는 충족됐으나 R2를 포함한 정식 2단계 완료/3단계 착수 판정은 아직 보류합니다.

## 이전 Chrome 재연결 후 재검증 — 2026-10-25

아래는 이전 재검증 당시 기록입니다. 상단 표와 최종 판정이 우선합니다.

- GitHub: 원격 public 저장소, 기본 브랜치 main. 연결 플러그인의 저장소/브랜치/원격 ref 조회 성공.
  로컬 `git ls-remote origin refs/heads/main`, `gh auth status`, 저장소 API 조회 모두 정상 네트워크 권한에서 exit 0.
  SHA는 `006ca9286bcdb9b993b271d6c76d778f23b467bc`. 기존 인증·원격·브랜치를 변경하지 않음.
- Cloudflare: 기존 Wrangler 인증으로 계정 조회 및 Pages 프로젝트/배포 목록 조회 exit 0.
  fishingking 외 기존 프로젝트도 보이지만 변경하지 않음. Git 저장소는 `jwlee8303-sys/FishingKing`,
  build `npm run build`, output `dist`, root 기본값, production `main`, 자동 배포 Enabled.
  기존 Preview `98921a3c-fdea-4a7d-b6dc-f51696e2cd55`는 success, 검증 브랜치와 위 전체 SHA 일치.
  URL: https://98921a3c.fishingking.pages.dev — 실제 FishingKing 제목·메뉴 5개·가로 넘침 없음 확인.
  기존 Production 목록도 확인했으나 이번에 생성하거나 재배포하지 않음. R2는 이번 재검증 대상 밖이며 미검증 유지.
- Supabase: 기존 MCP 인증을 재사용함. 공식 npm 메타데이터와 공식 CLI 문서의 Node 20 이상 조건 확인 후
  `supabase@2.122.0`을 정확한 버전의 devDependency로 설치. package-lock.json 동시 갱신.
  CLI 버전/도움말 성공. `projects list`는 `Access token not provided`로 실패하여 별도 CLI 인증 부재 확인.
  MCP/브라우저 성공을 CLI 로그인 성공으로 간주하지 않음. DB·Auth·키·스키마는 조회/변경하지 않음.
  자동 로그인 2회는 각 90초 진행 신호 없이 종료됐고 브라우저도 열리지 않음. 사용자 터미널의
  `npx.cmd supabase login` 후 `projects list` 재검증 필요. URL·코드·토큰은 채팅으로 받지 않음.
  `link`는 미실행: 현 버전 도움말에 비밀 API 키 읽기 권한이 포함되어 이번 계정 연결 진단과 분리함.
- Penpot: 공식 Remote 도구 high_level_overview/API 안내 조회 성공. 페이지 읽기 도구는
  `No Penpot instance connected for user token`으로 실패. 이는 현재 파일 플러그인 미연결 결과이며 키 만료로 단정하지 않음.
  열린 Personal Projects 초안은 파일 0개. 빈 파일 `FishingKing - MCP 연결 검증` 1개 생성·MCP 연결을 승인 요청했으며,
  승인 없이 파일/프로젝트를 만들거나 기존 키·요금제를 변경하지 않음.

정상 연결된 서비스는 재로그인·재설치·중복 등록하지 않았습니다.
Wrangler의 디스크 로그는 `WRANGLER_WRITE_LOGS=false`로 끄고 인증 응답은 허용된 상태 필드만 출력했습니다.
Supabase 로그인 진단도 원문을 메모리에서만 처리하며 인증 URL·코드·토큰을 출력/파일 기록하지 않습니다.

## 권한과 인증

GitHub 연결 도구에는 push/admin 권한이 보이지만 이번 작업은 저장소 조회와 독립 브랜치 생성에만 사용했습니다.
Supabase MCP에는 쓰기 도구도 노출되어 있습니다. 이번에는 목록/프로젝트 상세 조회만 사용했습니다.
기존 Supabase 서버는 특정 프로젝트/read-only로 제한된 설정이라고 확인되지 않았습니다.
권한 축소가 필요하면 다른 프로젝트 연결에 미치는 영향을 먼저 확인합니다.

Cloudflare는 공식 Wrangler 브라우저 로그인, Supabase는 공식 CLI 로그인 절차를 사용합니다.
브라우저 대시보드 로그인과 CLI OAuth는 별도 인증입니다. 한쪽 성공을 다른 쪽 성공으로 간주하지 않습니다.
Penpot 기존 키를 재발급하지 않았습니다. 키 재발급은 기존 연결을 끊을 수 있으므로 자동 실행하지 않습니다.
비밀번호·PAT·MCP Key·userToken·service_role을 채팅/소스/커밋에 넣지 않습니다.

## 무료 사용량 확인 지점

아래 수치는 2026-10-25 공식 문서 기준이며 실제 계정 플랜은 별도 확인해야 합니다.

- Pages Free: 월 500 builds, 동시 build 1개. Dashboard → Workers & Pages → 프로젝트 → Deployments/Settings 및 계정 Billing에서 확인.
- R2 Standard: 월 10 GB-month, Class A 100만 회, Class B 1,000만 회 무료. 무료 구간은 Infrequent Access에 적용되지 않음.
  Dashboard → R2 Object Storage → Overview/사용량 및 Billing에서 확인. 초과 사용량은 과금될 수 있음.
- Supabase Free: 활성 무료 프로젝트 2개 제한, 프로젝트 DB 500 MB, Egress 5 GB, Storage 1 GB 등.
  조직 Billing/Usage에서 실제 구독·한도 확인. 기존 FishingKing의 요금제는 조회하지 않았음.
- Penpot: 기존 Remote MCP의 실제 파일/페이지 읽기는 성공. 계정 요금제/키 만료 전체 감사와는 구분하며 유료 기능을 새로 활성화하지 않음.
- GitHub는 현재 저장소 public을 확인했지만 계정 요금제·Actions 결제·사용량은 미조회.

무료 구간은 비용 상한 설정과 다릅니다. 결제수단 등록·유료 기능·요금제 변경은 승인 없이 하지 않습니다.

## 신규 자원이 필요한 경우의 계획 (아직 생성 승인 요청 단계 아님)

로그인 후 기존 프로젝트/버킷이 없는 것을 먼저 확인해야 합니다.
Pages 후보명은 fishingking, R2 개발 버킷 후보명은 fishingking-dev-assets입니다.
R2는 Standard, 비공개 유지, 고유한 connectivity/날짜/UUID.txt 객체 1개로 최소 검증할 계획입니다.
기존 객체 덮어쓰기·공개 설정·CORS·삭제는 하지 않습니다. 기존 버킷이 있으면 먼저 사용 목적/권한을 확인합니다.
이름 충돌·요금/계정 확인 후 구체적인 대상과 설정을 제시하고 생성 승인을 받습니다.
Supabase는 기존 프로젝트가 있으므로 신규 생성할 필요가 없습니다.

## 공식 근거

- https://developers.cloudflare.com/pages/platform/limits/
- https://developers.cloudflare.com/r2/pricing/
- https://supabase.com/docs/guides/platform/billing-on-supabase
- https://penpot.app/pricing
- https://help.penpot.app/mcp/
