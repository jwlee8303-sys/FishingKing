# FishingKing 3-06 — AssetManifest·AssetResolver

## 최신 검증·인수인계 — 3-10 / 2026-10-26

Manifest → variant/접근 검사 → 비동기 Resolver → PagesStaticProvider → AssetImage/Pixi TexturePool의 실제 연결을 확인했습니다.
6개 ID·7파일(호수의 mobile-portrait 추가1개)을 유지하며 React·게임 소비자에 HTTP 저장소 URL 리터럴은 없습니다.
아래 3-06/07의 미연결·후속 구현 문장은 당시 이력입니다. 실제 로딩·입력 통합과 현재 검사 판정은
[PHASE3_FINAL_REPORT.md](PHASE3_FINAL_REPORT.md)를 우선합니다.

- 정상/잘못된 ID·누락·fallback/순환·접근 거부·경로 탐색·private/public·Provider 교체/비동기 결과는 기존 단위 검사로 확인합니다.
- HTTP404/HTML200 SPA fallback/디코딩 실패·placeholder terminal 실패, 회전 경합·StrictMode·공유 텍스처 최종 release는 로딩 계층에서 검사합니다.
- 3-10에서 WebKit의 회전 후 화면 표시 시각FAIL을 별도 확인했습니다. URL/메타데이터/로딩·프레임 진행 성공이
  실제 페이지 합성 화면 성공을 뜻하지 않습니다. 최초 표시와 회전 후 시각 결과를 분리해 후속 검증합니다.
- 루트·/fishingking/·절대 HTTP base의 실제 production build에서7개씩21응답의 MIME/bytes/SHA를 검사합니다.
  로컬 preview 검증은 운영 Pages CDN 재검증이 아닙니다. 상대 base는 현재 미지원입니다.
- 공개 정적 파일은 width/height/sizeBytes/sha256이 빠지면 검사 오류입니다. 런타임 Metadata의 선택 필드 계약과 구분합니다.
- private Provider·서명 URL 발급·실제 Auth·DB 연동은 미구현입니다. private 경로 접두사나 클라이언트 authorizePrivate를 서버 RLS로 간주하지 않습니다.

4단계에서는 **어종 ID와 Asset ID를 분리**합니다. fish_species의 안정된 종 식별자에서 image_asset_id 같은 논리 참조로
fish.bass.main을 연결하고 URL은 저장하지 않습니다. 실제 스키마/컬럼/제약은 기존 원격 스키마를 읽은 뒤 별도 설계합니다.
DB/API 값은 unknown 경계에서 resolveExternalAsset/isValidAssetId로 검증합니다. URL·만료 URL을 영구 기록으로 저장하지 않습니다.
에셋 메타데이터를 DB로 확장해도 Manifest와 이중 원본이 생기지 않도록 소유권·버전·동기화 정책을 먼저 확정해야 합니다.
현재 클라이언트에 노출되는 공개 메타데이터에는 비공개 파일·키를 넣지 않습니다. 이번 DB 변경은 없습니다.

확인일: 2026-10-25 (Asia/Seoul). **3-06 및 3-07 PagesStaticProvider 구현 완료**.
3-08 실제 이미지·모의 입력 통합도 완료했습니다. 최신 구현/검사 범위는
[PHASE3_08_GAME_INTEGRATION.md](PHASE3_08_GAME_INTEGRATION.md)를 따릅니다. 아래3-06/07 실행 기록은 유지합니다.
기존 3-05 미커밋 변경·그래픽·서비스·UI를 보존했습니다. 패키지 추가/업데이트·운영 배포·DB/Penpot 변경·commit/push는 없습니다.

## 3-07 추가 구현

기본 공개 Provider는 services/pagesStaticProvider.ts의 PagesStaticProvider입니다.
services/assetRuntime.ts에서 assetResolver / createPublicAssetResolver로 중앙 등록하며 기존 Mock은 테스트 전용으로 유지합니다.
Provider는 Resolver가 선택한 파일을 Manifest 스냅샷과 재대조하고 private 요청을 직접 거부합니다.
services/assetUrls.ts를 기존 getAssetUrl과 공유해 Vite BASE_URL 루트·하위 경로·전체HTTP(S) URL을 해석합니다.
상대 base는 미지원으로 명시 거부하며 운영 vite.config.ts를 변경하지 않았습니다.
Provider INVALID_ASSET_METADATA는 Resolver에서 정제·보존하고 fallback을 적용하지 않습니다.
assets:http가 격리된 root/subpath 실제 production build와 compiled BASE_URL, 총14개 파일응답을 검사합니다.
Vitest146(기존93+신규53), Node 자산7, 기존 Playwright30 및 TypeScript/lint/build PASS.
캐시·파일 버전·Provider 교체 및 3-08 계약의 최신 지침은 [ASSET_STORAGE.md](ASSET_STORAGE.md)를 따릅니다.
아래 3-06 본문과 당시 검사/인계 기록은 과거 실행 기록으로 유지합니다. 배포·commit/push·외부 서비스 변경은 없습니다.

## 1. 구조와 책임

| 위치 | 책임 |
| --- | --- |
| src/types/assets.ts | 기존 AssetPath 유지, AssetId/Metadata/Variant/Provider 결과/오류·context 공통 타입 |
| src/assets/manifest.ts | 실제 6개 ID·7개 파일의 동결된 TypeScript 데이터, 모든 ID 타입의 단일 출처 |
| src/assets/registry.ts | listAssetIds/getAssetMetadata/isValidAssetId |
| src/assets/validation.ts | 런타임 스키마·안전 경로·중복/참조/순환·외부 ID 검사 |
| src/assets/variants.ts | 순수 레이아웃·DPR/렌더 폭 기반 변형본 선택 |
| src/services/assetProvider.ts | 저장소 접근 인터페이스, 실제 구현 없음 |
| src/services/assetResolver.ts | 접근 검사·Provider 선택/호출·결과 검증·fallback |
| src/services/assetErrors.ts | 진단 가능한 AssetError 및 로딩 실패 계약 |
| scripts/graphics/manifest-check.mjs | 기존 3-05 검사 결과와 실제 파일 메타데이터 대조 |
| tests/fixtures/MockAssetProvider.ts | 네트워크 없는 테스트 전용 Provider |

UI/Pixi → 논리 ID → Manifest → 변형본 → 접근 정책 → 주입된 Provider → ResolvedAsset URL 순서입니다.
Resolver는 URL을 직접 조합하거나 fetch/이미지 디코딩/Pixi 로딩을 수행하지 않습니다.
기존 getAssetUrl/AssetVisual/React 라우트·디자인 토큰은 변경하지 않았습니다.

## 2. Asset ID와 조회 API

ID는 최대128자, 소문자 영문·숫자를 점으로 구분하는 이름입니다. 경로·URL·공백·하이픈을 ID에 넣지 않습니다.
파일명·저장소가 바뀌어도 ID는 유지합니다. 수백 종을 추가할 때 별도의 ID union을 중복 편집하지 않습니다.
`AssetId`는 Manifest 키에서 추론되며 등록된 정적 호출의 오타는 TypeScript에서 검출됩니다.

```ts
import { getAssetMetadata, isValidAssetId, listAssetIds } from '../assets/registry'

const fish = getAssetMetadata('fish.bass.main')
const ids = listAssetIds()
// databaseValue: unknown
if (isValidAssetId(databaseValue)) getAssetMetadata(databaseValue)
```

`isAssetIdSyntax`는 문법, `isValidAssetId`는 문법+등록 여부를 검사합니다.
잘못된 외부 문자열을 조용히 소문자로 바꾸거나 trim해서 다른 ID로 해석하지 않습니다.
기본 등록 ID:

- fish.bass.main
- background.lake.day
- icon.fishing.rod
- icon.fishing.reel
- icon.fishing.hook
- placeholder.image

## 3. Manifest·Metadata

필수 필드는 id/type/path/contentType/access, 선택 필드는 width/height/sizeBytes/sha256/fallbackId/variants/version/attribution입니다.
type은 fish/background/icon/placeholder, MIME은 image/webp 또는 image/svg+xml, access는 public/private입니다.
파일명과 MIME·type별 디렉터리를 함께 검사합니다. 크기를 제공할 때 width/height는 함께 양의 정수로 제공합니다.
원본 출처는 graphics/PROVENANCE.md, 현재 버전은1이며 저장소 URL은 포함하지 않습니다.

| ID 또는 변형본 | 안전한 상대 경로 | 크기 | 실측 바이트 |
| --- | --- | --- | ---: |
| fish.bass.main | fish/bass-main.webp | 1024×512 | 138258 |
| background.lake.day / default | backgrounds/lake-day.webp | 1600×900 | 150364 |
| 같은 ID / mobile-portrait | backgrounds/lake-day-mobile.webp | 720×1080 | 79746 |
| icon.fishing.rod | icons/fishing-rod.svg | 24×24 | 283 |
| icon.fishing.reel | icons/reel.svg | 24×24 | 287 |
| icon.fishing.hook | icons/hook.svg | 24×24 | 309 |
| placeholder.image | placeholders/image-missing.svg | 64×64 | 427 |

각 파일의 실제 SHA-256도 등록했습니다. 같은 용량으로 파일 내용만 바뀌어도 검사에서 검출할 수 있습니다.
Manifest·각 메타데이터·변형본 배열/파일 객체는 동결합니다. Resolver는 생성 시 검증된 별도 스냅샷을 사용합니다.
`createAssetManifest(entries)`는 동적/외부 등록 데이터의 중복 ID를 검사하고, `validateAssetManifest(table)`는 객체 키와 id의 일치까지 검사합니다.
기본 파일은 Metadata의 path/contentType 필드 자체입니다. variants만 있고 기본 path가 없는 등록은 거부합니다.
fallback 존재 여부·공개→비공개 참조·순환, 변형본 키 중복, 알 수 없는 필드/URL 필드도 검사합니다.

## 4. 모바일·DPR 변형본

기본 파일을 default로 사용합니다. 모든 에셋에4개 파일을 강제하지 않습니다.
현재 배경은 mobile-portrait만 별도 파일이며 mobile-landscape/desktop은 같은 default 파일로 돌아갑니다.
이는 파일 선택 fallback이며, Asset ID fallback을 나타내는 `usedFallback`과 구분합니다.

`selectAssetLayout(context)` / `selectAssetVariant(metadata, context)`는 window/UA/네트워크 없는 순수 함수입니다.

1. 명시한 layout(default/mobile-portrait/mobile-landscape/desktop)을 우선합니다.
2. viewport가 없으면 default. 폭>=1100 및 높이>=600이면 기존 GameShell과 같은 desktop 기준을 적용합니다.
3. 그 외에는 높이>폭이면 mobile-portrait, 아니면 mobile-landscape입니다. 태블릿도 실제 viewport를 기준으로 처리합니다.
4. 해당 레이아웃 파일이 없으면 default 후보를 사용합니다.
5. 향후 variants의 pixelRatio 또는 width와 context의 dpr/renderWidth로 후보를 선택할 수 있습니다.
   필요한 폭을 만족하는 가장 작은 파일을 선택하고, 부족하면 가장 큰 후보까지만 사용합니다. 현재 없는 파일을 만들어내지 않습니다.

회전은 같은 `background.lake.day`를 다른 context로 다시 해석합니다. 게임 상태 초기화·캔버스 resize 로직은 이 계층에 없습니다.

## 5. Provider 계약

Provider는 name/supportedAccess와 비동기 `resolve(request, context): Promise<AssetProviderResult>`를 구현합니다.
request에는 assetId/type/access/file/variantKey/version, context에는 AbortSignal과 now(epoch ms)가 전달됩니다.
결과는 assetId/url/contentType/providerName, 선택 expiresAt(epoch ms)입니다.
구현체는 파일 URL이나 인증된 단기 URL을 반환할 수 있으나 이번에는 실제 서비스가 연결되지 않았습니다.

Resolver는 기본 Provider, access별 Provider 또는 명시적 providerName을 선택합니다.
Provider 이름은 고유한 소문자 영문·숫자·하이픈 이름을 사용합니다(예: 향후 pages-static).
Provider 이름·지원 access를 등록 시 검사하고 복사하며, 결과의 ID/MIME/Provider 이름/URL 스킴·만료를 재검증합니다.
허용 URL은 http(s) 절대 URL 또는 /로 시작하는 같은 origin 경로입니다. 프로토콜 상대 URL·사용자정보·fragment·공백/제어 문자·역슬래시는 거부합니다.
원격 origin의 허용 목록·서명 URL 발급은 실제 Provider가 담당합니다. Resolver의 URL 형태 검증을 서버 권한 검사로 간주하지 않습니다.
예외 원문은 토큰·서명 URL이 들어 있을 수 있어 복사하지 않으며 안전한 오류 코드로 변환합니다.
만료 URL은 성공으로 반환하지 않습니다. 자동 캐시·재발급은 구현하지 않았으며 후속 Provider/호출 계층에서 재해석합니다.
취소된 요청은 호출 전과 비동기 응답 후 검사합니다. Provider가 실제 요청 중단을 지원하는 것은 해당 구현체의 책임입니다.

## 6. Resolver API와 오류

```ts
import { assetManifest } from '../assets/manifest'
import { AssetResolver } from '../services/assetResolver'

// provider는 3-07의 실제 구현 또는 테스트 Mock을 주입합니다.
const resolver = new AssetResolver({
  manifest: assetManifest,
  providers: [provider],
  defaultProvider: provider.name,
})
const resolved = await resolver.resolveAsset('background.lake.day', {
  viewport: { width: 390, height: 844 },
  fallback: 'none',
})
// 외부 DB/API 값은 unknown 경계로 전달합니다.
const external = await resolver.resolveExternalAsset(databaseValue, { fallback: 'placeholder' })
```

Provider를 주입하지 않으면 PROVIDER_NOT_FOUND이며 getAssetUrl로 몰래 우회하지 않습니다.
결과에는 실제 assetId/요청 requestedId/선택 파일·layout·variantKey/만료/usedFallback/fallbackErrors가 있습니다.
문법이 잘못된 외부 ID는 requestedId=null로 처리해 원문 URL/인증정보가 결과에 섞이지 않게 합니다.

| 코드 | 의미 |
| --- | --- |
| INVALID_ASSET_ID | 잘못된 논리 ID 문법/타입 |
| ASSET_NOT_FOUND | 문법은 맞지만 등록되지 않음 |
| INVALID_ASSET_METADATA | 스키마/경로/MIME/참조/context 오류 |
| PROVIDER_NOT_FOUND | 요청에 맞는 Provider 미등록 |
| ACCESS_DENIED | private 미인증 또는 Provider 접근 정책 거부 |
| ASSET_RESOLVE_FAILED | Provider 예외·응답 불일치·잘못된 URL·만료 |
| FALLBACK_CYCLE | 등록 또는 해석 단계의 순환 참조 |
| ASSET_LOAD_FAILED | URL 반환 후 HTTP/디코딩 로딩 실패 |
| ASSET_RESOLVE_ABORTED | 취소된 해석 또는 취소 후 도착한 응답 |

AssetError.inputSource는 internal/external을 구분합니다. resolveExternalAsset는 항상 external로 기록합니다.
Resolver가 반환한 URL이 실제 HTTP200/디코딩 성공을 보장하지 않습니다. Resolver는 다운로드하지 않습니다.

## 7. fallback·로딩 실패

기본은 fallback:none으로 오류를 던집니다. 명시적으로 placeholder를 선택한 요청만 복구합니다.
등록된 placeholder.image를 기본 terminal placeholder로 사용하며 다른 placeholderId도 명시할 수 있습니다.
원본의 fallbackId → 해당 에셋의 fallbackId → global placeholder 순서로 시도합니다.
전역 placeholder는 public/placeholder 유형·fallbackId 없음 조건을 만족해야 합니다.
순환은 등록 시 검출하고 해석 중에도 방문 ID로 방어합니다. placeholder 자체 실패는 다시 재귀하지 않습니다.
복구 성공에도 원래 오류 코드·internal/external 분류를 fallbackErrors에 남기며 잘못된 ID를 정상 원본처럼 보고하지 않습니다.
메타데이터 오류·접근 거부·취소·순환은 복구하지 않습니다. private 요청의 실패는 공개 placeholder로 위장하지 않습니다.

React/Pixi 로더가 HTTP404·네트워크·decode 실패를 발견하면 `createAssetLoadError()`로 구분하고,
명시적 표시 정책에 따라 `resolver.resolveFallback(resolved.assetId, context)`를 한 번 요청할 수 있습니다.
placeholder 로딩까지 실패하면 텍스트/CSS 오류 표시로 종료해야 합니다. 이 로딩 콜백·재시도 예산은3-08에서 구현합니다.

## 8. 경로·public/private

상대 경로는 canonical ASCII 소문자·숫자·점/하이픈 세그먼트와 /만 허용합니다.
빈 경로·빈 세그먼트·./../·절대 경로·Windows drive·역슬래시·외부 URL·스킴·query/fragment·공백·모든 % 인코딩을 거부합니다.
인코딩을 여러 번 decode해서 허용하지 않으므로 %2e%2e/%252e%252e/%2f 우회를 차단합니다.

public은 fish/backgrounds/icons/placeholders 아래, private은 별도 private/<유형 폴더>/ 경로를 사용합니다.
variant는 부모의 access를 상속하며 자체 access/URL override를 허용하지 않습니다.
실제 public/assets/private 디렉터리는 파일 검사에서 거부합니다. 접두사 자체가 인증 기능인 것은 아닙니다.

현재6개 ID는 모두 public입니다. private은 기본 거부하며 명시적 authorizePrivate 승인과 private-capable Provider가 모두 필요합니다.
테스트 Mock으로 계약만 검증했으며 인증 Provider·Supabase Storage를 구현한 것이 아닙니다.
실제 비공개 메타데이터/파일을 공개 Manifest·Pages 번들에 넣지 않습니다. 나중에 인증 서버 경계를 통해 공급해야 합니다.

## 9. 파일 검사와 명령

기존 assets:build/check/test 이름을 유지했습니다. assets:check는 기존 Sharp/XML 검사 결과를 재사용하고
동일한 TypeScript 런타임 Manifest 검증과7개 파일의 경로·MIME·치수·용량·SHA를 대조합니다.
파일 누락·동일 용량의 내용 변경·등록되지 않은 새 배포 이미지도 오류로 보고하며 원본을 수정하지 않습니다.
Node24의 native TypeScript strip으로 데이터를 읽습니다. 앱 설정에 이미 있던 allowImportingTsExtensions를 테스트 프로젝트에도 맞췄으며 strict는 유지했습니다.
검증 import 한 곳에 .ts 확장자를 명시해 Node/Vite가 같은 validator를 사용하도록 했고 새 패키지는 설치하지 않았습니다.

```powershell
npm.cmd run assets:build
npm.cmd run assets:check
npm.cmd run assets:test
npm.cmd run check
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:5173'
npm.cmd run test:e2e -- --workers=2
git diff --check
```

assets:build는 기존3개 파일 모두 skipped, assets:check의 실제7개 파일·Manifest 오류0.
Vitest93개(기존5+신규88) 및 Node 자산검사7개(기존5+신규2) 통과.
기존 Playwright30개를 같은6개 viewport의 Windows Chrome 에뮬레이션으로 재실행해 모두 통과했습니다.
TypeScript/ESLint/Vite build 통과. 초기 no-control-regex lint 오류는 문자 코드 검사로 고쳤고 규칙을 완화하지 않았습니다.
최종 UTF-8·시작87개 파일의 보존 검사·git diff --check 통과. 이번 단위는 기존7개 수정·새11개 추가이며
기존 패키지/lockfile·React UI·그래픽 원본/배포 파일·서비스·토큰은 변경하지 않았습니다. 증거는 .local/phase3-06/verification.json입니다.
실기기/Safari·실제 Pages Provider·원격 private 인증/만료 재발급·실제 이미지 로딩 통합은 미검증/미구현입니다.

## 10. 신규 물고기와 다음 단계

1. 3-05 파이프라인으로 새 파일을 제작·검사하고 출처를 기록합니다.
2. Manifest에 fish.<이름>.main 키와 동일 id/type/access/path/MIME를 추가합니다.
3. 실제 width/height/sizeBytes/sha256/version을 기록하고 필요하면 variants/fallbackId를 추가합니다.
4. 별도 AssetId 목록을 편집하지 않습니다. assets:check와 단위 테스트를 실행합니다.
5. 파일/저장소를 이전해도 기존 논리 ID를 유지합니다.

3-07: PagesStaticProvider가 public만 선언하고 기존 services/assets.ts/getAssetUrl을 재사용해야 합니다.
base URL·Vite 하위 경로·same-origin URL 해석을 검증하고 private 요청을 거부해야 합니다. 실제 배포는 별도 승인 범위입니다.
3-08: AssetImage·Pixi Assets.load가 Resolver URL을 사용하도록 연결하며 저장소 URL을 직접 조합하지 않습니다.
회전 시 같은 ID로 context만 갱신하고 게임 모델은 보존합니다. image onerror/404/decode/fallback terminal 처리를 로딩 계층에서 검증합니다.
이번 단위에서는 실제 Provider·React/Pixi 텍스처 연결·외부 서비스·원화 재제작·운영 배포·commit/push를 수행하지 않았습니다.
**3-07 인수인계 가능, 별도 지시 없이 자동 진행하지 않습니다.**
