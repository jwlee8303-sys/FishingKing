# FishingKing 3-05 — SVG·WebP 제작 및 검사 파이프라인

확인일: 2026-10-25 (Asia/Seoul). **기본 그래픽7개와 변환·검사 기반 제작 완료.**
이 단위에서는 앱 화면·라우터·Penpot 원본·외부 서비스를 변경하지 않았습니다. 타입에는 placeholders 디렉터리만 추가했습니다.
AssetManifest/Resolver/Provider·실제 Pixi 이미지 로딩은 미구현이며 3-06~3-08 범위를 유지합니다.

## 1. 시작 조사와 재사용

AGENTS/ROADMAP_STATUS/HANDOFF/PHASE3_AUDIT/SCREEN_DESIGN/MOBILE_GAME_UX/DESIGN_SYSTEM/PHASE3_04_UI_IMPLEMENTATION을 확인했습니다.
main의 기준 커밋은 `9a0dc865af692b6cc3304ad936221047918d206d`, 시작 Git 상태는 깨끗했습니다. 기존68개 파일의 해시를 기록했습니다.
public/assets는 images/fish/backgrounds/icons/audio의 .gitkeep만 있었고 실제 SVG/이미지·변환 도구는 없었습니다.
기존 AssetVisual은 path를 getAssetUrl(AssetPath)에 위임하며, 현재 UI는 CSS 예약 표시를 사용합니다. 이 구조를 유지했습니다.

Penpot Remote 읽기가 성공했습니다. 파일 `685eebd9-2ce2-80a4-8008-d7b0b4e16646`의 Cast/Reel/Hook/IconButton은 사각형·텍스트 기반이며 재사용할 SVG 아이콘은 없었습니다.
실제 색상 primary #2DD4BF / gold #F5C451 / surface #12344D / muted #ADC4D4를 대조하고 새 아이콘에 적용했습니다. Penpot 쓰기 호출은 없습니다.

## 2. 실제 배포 파일

경로 기준: public/assets/. 용량은 실제 바이트이며 KiB는 1024바이트입니다.

| 파일 | 실제 크기 | 실제 용량 | 용도/알파 |
| --- | --- | ---: | --- |
| fish/bass-main.webp | 1024×512 | 138,258 B (135.02 KiB) | 측면 배스, 투명/불투명/부분 알파 포함 |
| backgrounds/lake-day.webp | 1600×900 | 150,364 B (146.84 KiB) | 가로/PC 호수 주간, 불투명 |
| backgrounds/lake-day-mobile.webp | 720×1080 | 79,746 B (77.88 KiB) | 세로 전용 구도, 불투명 |
| icons/fishing-rod.svg | viewBox 0 0 24 24 | 283 B | 낚싯대, Teal 선 |
| icons/reel.svg | viewBox 0 0 24 24 | 287 B | 릴, Teal 선 |
| icons/hook.svg | viewBox 0 0 24 24 | 309 B | 입질 반응, Teal+Gold |
| placeholders/image-missing.svg | viewBox 0 0 64 64 | 427 B | 이미지 누락 대체 표시 |

배스는 머리부터 꼬리·등/가슴/배 지느러미까지 보이며 글자·주변 배경이 없습니다. 이미지 자체와 터치 영역은 별개로 관리합니다.
원화는 생성 AI 기반 v1 후보이며, 최종 게임 아트 확정과 기술 디코딩 합격을 구분합니다.

## 3. 원본·파일명·저작권

원본은 `graphics/source/`에 보관합니다. PNG는 public/dist에 넣지 않습니다.

| 원본 PNG | 실제 크기 | 용량 |
| --- | --- | ---: |
| bass-main.png | 1774×887 | 1,943,295 B |
| lake-day.png | 1672×941 | 2,126,243 B |
| lake-day-mobile.png | 1024×1536 | 2,044,432 B |

내장 image_gen으로 3개를 신규 제작했고 프롬프트는 graphics/prompts.json, 출처·권한 근거는 [PROVENANCE.md](../graphics/PROVENANCE.md)에 기록했습니다.
CLI/API 대체 호출·외부 이미지 복제·새 유료 서비스 연결은 없습니다. SVG는 자체 path/기초 도형으로 직접 작성했습니다.
기존 파일을 덮어쓰지 않았고 image-missing.svg는 의도된 대체 아이콘입니다. 기존 CSS 임시 그래픽은 그대로 유지합니다.

배포 이름은 소문자·숫자·하이픈, 확장자는 .svg/.webp만 허용합니다. 원본은 같은 이름의 PNG/JPEG/WebP 또는 제한된 SVG를 사용할 수 있습니다.
새 원본의 제작자·출처·사용 조건을 먼저 기록하고, 외부 원본은 명시적 사용 권한이 확인된 경우에만 도입합니다.

## 4. 변환 도구·설치

- Sharp **0.35.5**, Apache-2.0, 번들 libvips **8.18.7**. 이미지 메타데이터/디코딩/리사이즈/WebP/알파를 한 도구로 처리합니다.
- Node **24.22.0**에서 실행 확인. 공식 Node>=20.9·Windows 사전 빌드 지원을 [설치 문서](https://sharp.pixelplumbing.com/install/)에서 확인했습니다.
- XML 파서는 Pixi에 이미 설치된 `@xmldom/xmldom` **0.8.15**, MIT, Node>=10, peerDependencies 없음.
  검사 스크립트가 직접 사용하는 의존성을 명시하기 위해 동일 버전을 devDependency로 선언했습니다.
- 두 패키지는 개발 의존성입니다. Sharp를 React 번들에 import하지 않았고 클라이언트/운영 서비스에 변환 서버를 추가하지 않았습니다.
- npm install 성공, package.json/lockfile 함께 갱신. 최초 레지스트리 조회·설치는 EACCES로 실패했고 정상 권한 승인 후 성공했습니다.
  최초 격리 npm ci도 EACCES 및 정리 EPERM 경고가 발생했습니다. TLS/전역 보안 설정을 바꾸지 않았습니다.
- Windows 재현 설치 결과는 HANDOFF 최신 3-05 기록을 따릅니다. lockfile에 Linux/Windows 선택 의존성 항목을 확인했으나 Cloudflare/Linux 설치를 실제 실행한 것은 아닙니다.
- Git 제외 `.local/phase3-05/repro`에서 package.json/lockfile만 복사해 npm ci 재현 설치가 성공했습니다(exit0).
  그 설치의 Sharp0.35.5로 투명8×8 WebP 인코딩·재디코딩까지 성공했습니다. 기존 개발 서버의 node_modules는 재설치하지 않았습니다.

## 5. 자동 변환

```powershell
npm.cmd ci
npm.cmd run assets:build
npm.cmd run assets:check
npm.cmd run assets:test
```

`graphics/recipes.json`은 원본·목표 크기·fit·품질을 담은 **빌드 전용 변환 설정**이며 런타임 AssetManifest가 아닙니다.
구현: scripts/graphics/build.mjs, 공통 검사: scripts/graphics/lib.mjs.

1. 원본은 graphics/source 아래, 출력은 public/assets 아래인지 확인하고 심볼릭 링크·경로 이탈·동일 입출력을 거부합니다.
2. 실제 형식과 확장자·픽셀 수·단일 프레임을 확인하고 전체 픽셀 디코딩을 수행합니다.
3. 방향 메타데이터 적용 후 비율 유지 리사이즈, withoutEnlargement로 확대 방지, sRGB·WebP로 인코딩합니다.
4. fish는 inside 1024×1024, quality86/alphaQuality100. 원본 비율을 유지한 최종1024×512입니다.
5. 가로 배경은 cover1600×900/quality80, 세로는 cover720×1080/quality80입니다. 메타데이터는 Sharp 기본 동작으로 제외합니다.
6. 원본+설정+도구 버전의 해시와 출력 SHA-256을 캐시해 동일 작업을 건너뜁니다. 캐시는 Git 제외 .local/graphics-cache.json입니다.
7. 캐시가 없어도 출력 내용이 같으면 identical로 유지합니다. 내용이 다른 기존 출력은 기본적으로 거부하며 원본은 수정하지 않습니다.
8. 명시적으로 갱신할 때만 `npm.cmd run assets:build -- --update`를 사용합니다. 원본/출력 경계를 확인하고 소유한 파일인지 검토한 후 실행합니다.
9. 실패 파일은 errors 목록과 비정상 종료 코드로 보고합니다. 성공한 파일과 실패 파일을 섞어 전체 성공으로 표현하지 않습니다.

가로1920×1080을 초기 후보로 검토했지만, 원본1672×941를 억지로 확대하지 않고1600×900으로 최적화했습니다.
모바일 배경은 가로 이미지를 단순 확대/늘림하지 않고 별도 생성한 세로 구도를 사용합니다.

## 6. 자동 검사

`npm.cmd run assets:check`는 fish/backgrounds/icons/placeholders/images를 검사하며 audio는 범위 밖입니다.
새 파일이 사라졌는지 확인하는 런타임 Manifest 기반 검사는 3-06 이후 추가합니다. 현재7개 필수 파일 존재는 회귀 테스트에서 확인합니다.

- 파일명·배포 확장자·실제 형식/RIFF-WEBP 서명, 전체 이미지 디코딩.
- fish1024×1024, 배경1920×1080 이내, mobile720×1080 이내, SVG256×256 이내.
- 파일 예산: fish200KiB, 가로 배경350KiB, 모바일180KiB, SVG16KiB.
- 배스에 실제 투명·불투명 픽셀이 모두 있는지 검사. 알파를 평탄화하지 않습니다.
- SVG XML 파싱·namespace/viewBox, 허용 도형/속성 목록. script/foreignObject/image/use/style/이벤트/외부 URL/DOCTYPE/entity/처리 지시문을 거부합니다.
- SVG paint는 리터럴 색상/none/currentColor만 허용하고 백슬래시 이스케이프·다른 namespace를 거부해 상대 URL/난독화 참조를 제한합니다.
- SHA-256 중복을 오류로 보고하며 파일을 임의 삭제하지 않습니다. 일반 SVG 전체를 자동 정화하는 도구라고 주장하지 않습니다.
- 경로·확장자 위조·깨진 WebP·중복·불투명 스프라이트·덮어쓰기·캐시·원본 보존을 Node 테스트5개로 검증합니다.

상세 파일별 크기·SHA·알파 통계는 `.local/graphics-report.json`에 생성합니다. 이 보고서는 런타임 등록부가 아닙니다.
현재7개 전부 검사 오류0. 배스의 출력 픽셀은 투명271,018 / 완전 불투명1,037 / 부분 알파252,233개입니다.
브라우저 canvas에서도 모서리 alpha0 및 몸 중앙 alpha>200을 확인했고, 체크무늬 배경 위 렌더링을 육안 확인했습니다.

## 7. 모바일·로딩·성능

배경 권장 focal point 초안은 가로 (0.5,0.4), 세로 (0.5,0.35)입니다. object-fit:cover/contain을 용도에 맞게 쓰고 비균일 stretch하지 않습니다.
SVG는24px, 누락 아이콘64px 원본이지만 조작 버튼의 클릭 영역은 기존 최소44px/행동60px를 유지합니다.

브라우저 격리 fixture에서 `<picture>`로 세로/가로 파일을 선택했으며 6 viewport 각각 배경 요청1개만 발생했습니다.
기존 실제 앱의 로딩 전략은 아직 연결하지 않았습니다. 3-08에서 필요한 장면만 preload하고 도감 썸네일은 지연 로딩·요청 재사용·fallback을 적용할 예정입니다.
배스는1024px 원본을 CSS 축소로 확인했고 SVG는24px로 선명도를 확인했습니다. 휴대폰 고밀도/최종 장면 확대 품질은 실기기 검수가 필요합니다.

RGBA8 단순 버퍼 추정: 배스2,097,152 B (2MiB), 가로5,760,000 B (5.49MiB), 세로3,110,400 B (2.97MiB).
이는 width×height×4 계산이며 실제 디코더 작업 메모리·GPU·캐시 총량·프레임/발열을 측정한 결과가 아닙니다.
Android Chrome/iPhone Safari의 실기기·Safari 엔진 검증은 미실행이며 Windows Chrome 에뮬레이션과 구분합니다.

## 8. 앱 보존·테스트

실제 React 화면·라우터·AssetVisual·getAssetUrl·디자인 토큰·서비스 연결은 보존했습니다.
src/types/assets.ts의 AssetDirectory에 placeholders만 추가했습니다. 테스트용 HTML은 Playwright의 격리 문서이며 새 공개 라우트가 아닙니다.

```powershell
npm.cmd run check
$env:PLAYWRIGHT_CHANNEL = 'chrome'
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:5173'
npm.cmd run test:e2e -- --workers=2
git diff --check
```

TypeScript/ESLint/기존 Vitest5/Vite build 통과. 자산 Node 테스트5 통과.
Playwright는 기존 UI24개 + 그래픽6개 = **30개 통과**, exit0.
320×568/390×844/430×932/844×390/768×1024/1440×900에서 WebP/SVG decode·HTTP200/MIME·알파·가로 넘침·선택 배경 요청을 검사했습니다.
검사 예산과 파일 디코딩 통과는 실기기 성능 합격과 다릅니다. 원본 graphics/source가 dist에 포함되지 않음도 확인했습니다.
최종 UTF-8/기존68개 파일 해시/범위 검사와 git diff --check 통과. 기존5개 수정·새19개 추가이며 기존 UI/서비스/토큰은 보존됐습니다.
로컬 증거: .local/phase3-05/verification.json, .local/graphics-report.json, test-results의 viewport별 graphics.png.

## 9. 신규 물고기·3-06 인수인계

1. 사용 권한과 출처를 기록하고 원본을 graphics/source에 새 이름으로 저장합니다. 기존 파일을 덮어쓰지 않습니다.
2. 최대1024×1024 목표, 측면 전체 몸체·텍스트 없음·투명 배경·적절한 여백을 확인합니다.
3. graphics/recipes.json에 source/output/width/height/fit/quality/requireAlpha를 추가합니다.
4. assets:build → assets:check → assets:test 후 격리된 브라우저에서 투명도/작은 크기·확대 품질을 확인합니다.
5. 새로운 크기/예산/필수 파일 기대값을 갱신하고 3-06의 Manifest에 등록합니다.

| 논리 ID 후보 | 상대 경로·변형 |
| --- | --- |
| fish.bass.main | fish/bass-main.webp |
| background.lake.day | backgrounds/lake-day.webp (가로), backgrounds/lake-day-mobile.webp (세로) |
| icon.fishing.rod | icons/fishing-rod.svg |
| icon.fishing.reel | icons/reel.svg |
| icon.fishing.hook | icons/hook.svg |
| placeholder.image | placeholders/image-missing.svg |

위 ID는 인계 명세이며 런타임 등록을 구현하지 않았습니다. URL 생성은 기존 services/assets.ts로 모으고 제공자별 URL을 컴포넌트에 분산하지 않습니다.
공개 정적 자산은 기존 public/assets→GitHub→Pages 정책을 유지합니다. 이번 Git push/배포/R2/Cloudinary/DB 변경은 없습니다.
**3-06 진행 준비는 가능하지만 별도 지시 없이 자동 진행하지 않습니다.**
