# 에셋 저장소와 PagesStaticProvider

## 최종 정책 확인 — 3-10 / 2026-10-26

기본 공개 저장소는 **public/assets → GitHub → 기존 Cloudflare Pages**입니다.
R2는 사용자 결정으로 의도적 보류, Cloudinary는 향후 필요 시 검토·현재 미연결,
Supabase Storage는 사용자 업로드가 필요할 때 기존 Free 플랜을 우선 검토합니다. 현재 업로드 연결은 없습니다.
비공개 파일/메타데이터는 공개 Pages 경로·Manifest·브라우저 번들에 저장하지 않습니다.

3-08 AssetImage/Pixi 실제 로딩과 3-09 보완까지 구현됐으며 아래 3-07 기록의 미연결 문구는 과거 상태입니다.
3-10에서 기본 Provider 중앙 등록·6개 ID/7파일·모바일 variant·비동기 URL·루트/하위 base·공유 텍스처 정리를 검토했습니다.
HTTP 검사는 로컬 production preview 대상입니다. 운영 CDN의 응답·캐시·현재 계정 과금 상태를 새로 검증한 것은 아닙니다.
실제 검사 수와 제한은 [PHASE3_FINAL_REPORT.md](PHASE3_FINAL_REPORT.md)를 따릅니다.
3-10 HTTP21응답은PASS지만 WebKit 회전 후 장면 표시의 추가 시각검증은FAIL입니다.
이를 저장소/MIME/SHA 실패로 단정하지 않으며 로더 성공과 실제 화면 표시를 구분해 후속 조사합니다.

React/게임 소비자에는 저장소 HTTP URL 하드코딩이 없으며 신규 키·Provider·외부 서비스·유료 기능을 추가하지 않았습니다.
현재 파일명은 불변 해시 이름이 아니므로 version/SHA 변경만으로 캐시 무효화를 보장하지 않습니다.
배포·캐시 purge·저장소 이전·유료 서비스 활성화는 사용자 승인 범위입니다. 이번 원격 변경은 없습니다.

4단계 DB는 실제 이미지 URL 대신 **논리 Asset ID**를 참조하도록 설계합니다. 어종 ID와 별개로 관리하고
서버 RLS/인가·공개/비공개 메타데이터 경계를 확정합니다. 향후 서명 URL은 인증 Provider가 필요할 때 발급하며 DB에 영구 저장하지 않습니다.
현재 로컬 supabase 폴더에는 추적 가능한 스키마/migration이 없고 원격 스키마는 이번 미조회입니다.
이를 빈 운영 DB라는 뜻으로 해석하지 않으며, 4단계 첫 작업은 기존 프로젝트의 읽기 전용 스키마 확인입니다.

실행 단위: 3-07 / 2026-10-25. 실제 React/Pixi 이미지 로딩은 3-08 범위입니다.
3-08 통합은 이후 완료했습니다. 아래3-07 당시 검증 기록은 유지하며 최신 실제 로딩/입력 결과는
[PHASE3_08_GAME_INTEGRATION.md](PHASE3_08_GAME_INTEGRATION.md)를 따릅니다.

## 1. 기본 저장소 정책

공개 게임 그래픽은 `public/assets → GitHub → 기존 Cloudflare Pages`로 제공합니다.
R2는 과금 방지를 위해 보류하고 Cloudinary·Supabase Storage는 연결하지 않습니다.
이번 작업은 로컬 구현·검사만 수행했습니다. 운영 배포, 외부 설정, DB, 인증, Penpot, 그래픽 변경 및 commit/push는 없습니다.
시작 시 존재하던 3-05·3-06 미커밋 변경도 유지합니다.

## 2. 구조와 URL

Manifest의 path는 `public/assets/` 아래 상대 저장 키입니다. public 이름은 URL에 넣지 않습니다.

| Asset ID | 기본 path | 루트 배포 공개 URL |
| --- | --- | --- |
| fish.bass.main | fish/bass-main.webp | /assets/fish/bass-main.webp |
| background.lake.day | backgrounds/lake-day.webp | /assets/backgrounds/lake-day.webp |
| icon.fishing.rod | icons/fishing-rod.svg | /assets/icons/fishing-rod.svg |
| icon.fishing.reel | icons/reel.svg | /assets/icons/reel.svg |
| icon.fishing.hook | icons/hook.svg | /assets/icons/hook.svg |
| placeholder.image | placeholders/image-missing.svg | /assets/placeholders/image-missing.svg |

원본 PNG는 public 밖 graphics/source에 유지합니다. 논리 ID는 파일/제공자 URL과 별개입니다.
등록된 파일7개의 MIME·치수·용량·SHA-256은 기존 Manifest와 assets:check를 그대로 사용합니다.

## 3. 사용법과 책임

```ts
import { assetResolver } from '../services/assetRuntime'

const result = await assetResolver.resolveAsset('background.lake.day', {
  viewport: { width: 390, height: 844 },
})
// result.url: /assets/backgrounds/lake-day-mobile.webp
// 3-08에서 React 이미지 로더 또는 PixiJS Assets.load에 전달
```

Resolver가 ID·메타데이터·접근·variant·fallback·Provider 결과를 검사합니다.
PagesStaticProvider는 async resolve 계약을 구현하며 네트워크 다운로드 없이 URL·MIME·assetId·providerName을 반환합니다.
정적 URL에는 expiresAt이 없습니다. 최종 ResolvedAsset 구성은 기존 Resolver가 담당합니다.
Provider는 직접 호출도 신뢰하지 않으며 자체 Manifest 스냅샷의 ID/type/access/version/variant 및 파일6필드와 대조합니다.
등록되지 않은 경로, 변형본 또는 오래된 메타데이터 요청은 거부합니다.
기존 services/assets.ts의 getAssetUrl API는 보존하고 공통 assetUrls.ts URL 함수를 재사용합니다.

## 4. Vite BASE_URL

공식 내장 값 `import.meta.env.BASE_URL`을 사용하며 Vite가 빌드 시 치환합니다.
Vite는 경로 base와 전체 URL base를 지원하고, 개발 모드에서는 전체 URL의 origin을 무시하고 pathname을 사용합니다.
근거: [Vite env](https://vite.dev/guide/env-and-mode.html), [Vite base](https://vite.dev/config/shared-options.html#base).

| 설정 | Provider 결과 예 |
| --- | --- |
| / | /assets/fish/bass-main.webp |
| /fishingking/ | /fishingking/assets/fish/bass-main.webp |
| https://cdn.example/Game/ | https://cdn.example/Game/assets/fish/bass-main.webp |

경로 내부 중복 슬래시와 끝 슬래시를 정규화하고 HTTP(S) origin 및 경로의 대소문자를 유지합니다.
유효 경로 세그먼트별 encodeURIComponent를 적용합니다. 저장 키는 기존 canonical 소문자 ASCII 규칙이므로
공백/비ASCII/이미 percent 인코딩된 입력을 decode해서 허용하지 않습니다. 경로를 변경하려면 Manifest 규격부터 갱신해야 합니다.
query/fragment/credentials/역슬래시/상대·dot 경로/percent·잘못된 인코딩/protocol-relative/비HTTP(S) base는 거부합니다.
Vite 자체는 empty/./ base도 지원하지만 현재 프로젝트는 사용하지 않으므로 이 Provider는 명시적으로 거부합니다.

기존 VITE_ASSET_BASE_URL 공개 prefix override는 유지합니다. 값은 assets 디렉터리를 포함하는 전체 prefix이며
설정 시 BASE_URL 대신 그 prefix에 파일 path를 결합합니다. 임의 사용자 입력에 노출하지 않습니다.
저장소 변경은 승인 대상이고 현재 환경 값이나 운영 base를 변경하지 않았습니다.

## 5. 하위 경로 배포 검사

vite.config.ts는 기본 base=/를 유지합니다. public/_headers 및 public/_redirects는 없습니다.
기존 배포 기록의 Pages Git Integration/main·npm run build·dist 정책을 유지하며 이번 원격 설정을 재조회하거나 변경하지 않았습니다.

`npm.cmd run assets:http`는 기존 Vite 설정에 테스트 base만 덮어써 실제 앱과 검사 entry를 production build 합니다.
출력은 매번 새 `.local/static-http-*`이며 기존 dist·원본을 삭제하지 않습니다. root 및 /fishingking/ preview를 각각 시작·종료합니다.
컴파일된 검사 entry가 실제 import.meta.env.BASE_URL과 기본 Resolver로 URL을 생성합니다.
격리 검사에서만 VITE_ASSET_BASE_URL을 undefined로 고정해 로컬 응답을 검사합니다.
빌드 API는 [Vite JavaScript API](https://vite.dev/guide/api-javascript.html),
검사 entry는 [Vite build options](https://vite.dev/config/build-options.html#build-rolldownoptions)를 따릅니다.
Provider의 에셋 하위 경로 지원을 검증한 것이며 React 라우터의 전체 하위 경로 배포 전환은 수행하지 않았습니다.

## 6. 모바일 변형본

동일 background.lake.day에서 mobile-portrait만 backgrounds/lake-day-mobile.webp를 사용합니다.
default/mobile-landscape/desktop은 backgrounds/lake-day.webp입니다.
기존 순수 selectAssetVariant를 유지하고 Provider에서 방향을 다시 판정하지 않습니다.
3-08에서는 viewport/context를 갱신해 같은 ID를 다시 resolve하고 게임 상태는 유지해야 합니다.

## 7. public/private와 경로 보안

PagesStaticProvider.supportedAccess는 public만 제공합니다. private 요청 및 private 등록을 public으로 위조한 요청도 거부합니다.
Resolver 역시 private 기본 거부를 유지합니다. 실제 인증 Provider·만료 URL·재발급은 미구현입니다.
private 파일/메타데이터를 공개 public/assets·프런트엔드 번들에 넣지 않습니다.

기존 assertAssetMetadata/isSafeAssetPath 및 Manifest 검증을 재사용해 ../, 절대 경로, 외부 URL, //,
역슬래시, query/fragment, 빈 세그먼트, 모든 percent 인코딩과 private/public 혼합을 거부합니다.
Provider는 파일 필드 whitelist와 Manifest 일치까지 확인하며 URL 생성 전 검증합니다.
INVALID_ASSET_METADATA 및 ACCESS_DENIED는 Resolver에서 보존·정제하고 placeholder로 숨기지 않습니다.
서버의 실제 파일 존재/디코딩은 URL Resolver 책임이 아니며 검사 스크립트와 후속 로더가 확인합니다.

## 8. Provider 등록과 교체

services/assetRuntime.ts의 createPublicAssetResolver가 PagesStaticProvider를 기본 및 public route에 등록합니다.
assetResolver 싱글턴은 다운로드 없이 생성되며 기존 React 화면에 아직 연결하지 않았습니다.

```ts
const resolver = createPublicAssetResolver({ publicProvider: approvedProvider })
// 테스트에서는 MockAssetProvider를 주입. 앱 번들에 Mock을 import하지 않음.
```

기존 AssetResolver 생성자에 providers/defaultProvider/providerForAccess를 직접 지정할 수도 있습니다.
여러 Provider가 등록돼 있으면 context.providerName으로 선택하며 미등록은 PROVIDER_NOT_FOUND입니다.
미래 인증 Provider는 supportedAccess/인가·expiresAt·재발급/오류 계약을 충족해야 합니다.
Supabase·Cloudinary·R2 실제 구현과 연결은 이번 범위가 아닙니다.

## 9. 캐시·버전 정책

Cloudflare 공식 문서에 따르면 Pages 정적 파일은 Tiered Cache로 제공되고 브라우저 재검증에는 ETag를 사용합니다.
최상위404.html이 없으면 SPA 동작을 기본 적용합니다. 근거: [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/).
커스텀 헤더는 [Pages headers](https://developers.cloudflare.com/pages/configuration/headers/)로 제어할 수 있지만
현재 파일명은 불변 해시가 아니므로 장기 immutable 헤더를 새로 추가하지 않습니다. 운영 정책은 변경하지 않았습니다.

현재 version=1·sha256은 Manifest/파일 정합성 검사용이며 URL query에 자동 반영하지 않습니다.
SHA나 version만 바꿔서는 브라우저 캐시가 자동 무효화되지 않습니다. 쿼리만으로 CDN 무효화를 보장하지 않습니다.
파일 교체 시 동일 논리 ID를 유지하고 실측 메타데이터·버전을 갱신해 assets:check/http를 실행합니다.
승인된 실제 배포 후 ETag/Content-Type/응답 바이트 해시와 브라우저 재검증을 확인해야 합니다.
오래된 응답이 있으면 배포 대상·URL·캐시 규칙을 확인하고 필요 시 승인 후 캐시 purge를 검토합니다.
이번 운영 CDN 캐시 측정·purge는 하지 않았습니다.

장기 immutable을 도입할 때는 `bass-main.<content-hash>.webp`처럼 파일명을 버전별로 바꾸고 Manifest path만 갱신하는 전략을 권장합니다.
새 배포와 기존 클라이언트가 공존할 기간에는 구파일도 유지해야 합니다. 이번 파일명 일괄 변경은 없습니다.
CDN 이전 시 provider prefix/namespace를 분리하고 같은 path에 다른 내용을 영구 캐시하지 않도록 버전 정책을 함께 옮깁니다.

## 10. 신규 이미지 등록과 이전

1. 기존 그래픽 파이프라인으로 public 밖 원본을 관리하고 공개 배포 파일을 생성합니다.
2. Manifest에 고유 논리 ID·type/public/path/MIME/실측 치수/용량/SHA·version·출처를 등록합니다.
3. 필요한 layout variant만 추가하고 fallback 참조를 검증합니다.
4. assets:check/test/http 및 앱 회귀 검사를 실행합니다. 새 ID 목록은 Manifest에서 추론됩니다.
5. 저장소 이전은 사용자 승인 후 Provider 구현/중앙 등록만 교체하고 URL·접근·만료·캐시 테스트를 재실행합니다.
   각 React/Pixi 컴포넌트에는 저장소 URL을 넣지 않습니다.

## 11. 문제 확인과 3-08 계약

- INVALID_ASSET_ID/ASSET_NOT_FOUND: ID 문법·등록 및 외부 입력 경계를 확인합니다.
- INVALID_ASSET_METADATA: Manifest/Provider 스냅샷·버전·variant·파일 정보·base/경로를 확인합니다.
- PROVIDER_NOT_FOUND/ACCESS_DENIED: 중앙 등록/명시 providerName/public 정책을 확인합니다. 보안 실패에 fallback을 적용하지 않습니다.
- URL 성공 후 404/HTML200/decode 실패: ASSET_LOAD_FAILED로 구분합니다. 필요 시 resolveFallback(id)를 명시 호출하고
  placeholder 자체 실패·취소·중복 재시도를 종료합니다. Provider에서 파일 다운로드를 강제하지 않습니다.

React AssetImage와 Pixi Assets.load는 3-08에서 result.url을 사용합니다. 로딩·취소·decode·회전 시 오래된 응답 처리,
동일 Asset ID 기반 재선택·텍스처 교체·terminal fallback을 검증해야 합니다. 실제 iPhone/Android 검증은 아직 하지 않았습니다.

## 12. 이번 검사 결과

| 검사 | 결과 |
| --- | --- |
| Vitest | 146 PASS = 기존93 + 신규53 |
| TypeScript / ESLint / Vite build | PASS |
| assets:build | 기존3개 skipped, 오류0·그래픽 변경 없음 |
| assets:check | 실제7개 및 Manifest 일치, 오류0 |
| assets:test | 기존7 PASS |
| assets:http | root/subpath 실제 build·compiled BASE_URL·7파일씩 총14응답 PASS |
| 누락 이미지 | 두 preview 모두 HTML200 확인, ASSET_LOAD_FAILED로 식별 |
| Playwright | 기존30 PASS, 6 viewport Windows Chrome 에뮬레이션 |

HTTP 증거는 `.local/static-http-report.json`에 기록됩니다. 초기 검사 entry export가 빌드에서 제거돼 검사 도구가 실패했고,
테스트 빌드에 preserveEntrySignatures=strict를 적용한 후 재실행해 통과했습니다. 앱 빌드 설정·검사 규칙을 완화하지 않았습니다.
새 검사 스크립트의 초기 ESLint 전역 참조 오류는 node:url의 URL import와 globalThis.fetch 사용으로 수정한 후 전체 check를 통과했습니다.
최종 UTF-8 텍스트92개·JSON/TypeScript 설정 형식·git diff --check PASS.
시작98개 파일 중 예정된6개만 수정하고 나머지92개를 바이트 보존했습니다. 삭제0·예상 밖 변경0, 신규6개입니다.
package-lock.json·그래픽·기존 테스트·UI/라우터·Vite 설정 보존 증거는 `.local/phase3-07/verification.json`입니다.
배포·원격 캐시·실기기·React/Pixi 로딩 통합은 검증 결과에 포함하지 않습니다.

```powershell
npm.cmd run check
npm.cmd run assets:build
npm.cmd run assets:check
npm.cmd run assets:test
npm.cmd run assets:http
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:5173'
npm.cmd run test:e2e -- --workers=2
git diff --check
```

사용자 필수 수동 작업은 없습니다. 운영 배포/연결/과금/DB 변경에는 별도 최종 승인이 필요합니다.
3-08 진행 준비는 됐으며 별도 지시 없이 진행하지 않습니다.
