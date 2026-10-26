# FishingKing 3-02 — 모바일 게임 UX 및 입력 설계

## 최신 구현·검증 상태 — 3-10 / 2026-10-26

아래 3-02 설계·3-04 기록은 작성 당시 상태입니다. 현재는 3-08의 GameCanvas·InputController·공유 TexturePool과
3-09의 호환성 보완까지 구현했습니다. 최신 종합 판정은 [PHASE3_FINAL_REPORT.md](PHASE3_FINAL_REPORT.md)를 따릅니다.

- React HUD·최소44px 조작·Safe Area 네 방향·100dvh, 모바일 세로/가로·태블릿·PC 배치를 유지합니다.
- Asset ID로 실제 호수·배스 및 세로 배경을 로딩하고, 컨테이너 resize·회전 중 최신 배경 요청만 적용합니다.
- cast/reel/move/react/reset 명령, 역할별 pointer owner·키보드 C/R/E·WASD/방향키,
  길게 누름·멀티터치·이탈 release·cancel/lostcapture·메뉴/blur/hidden/회전/언마운트 입력 해제를 구현했습니다.
- 방향은 화살표 버튼입니다. 아래 설계의 아날로그 패드 drag·dead zone은 구현 완료 항목이 아닙니다.
  복귀 시 입력은 중립이며 백그라운드와 메뉴 동안 모의 ticker를 멈춥니다. 서버 시간 정지 보장은 아닙니다.
- Chromium의 CDP 터치·다중 포인터 검사와 WebKit native tap/Pointer Events 검사를 구분합니다.
  WebKit 네이티브 다중 손가락·touchCancel, 실제 Android/iPhone·노치/주소창/가상 키보드·발열/배터리는 미검증입니다.
- 3-10 전체 자동검사는239 PASS/1 FAIL이며 태블릿 Chromium 재진입 timeout은 선택3회 통과·원인 미확정입니다.
  WebKit 자동120 PASS와 별도로 **회전 후 장면이 사라지는 추가 시각FAIL**을 확인했습니다.
  준비 메타데이터/프레임 진행·불투명 픽셀만으로 합격 판정하지 않습니다. 제품/Windows WebKit 표시 환경 원인은 미확정이며 실기기 대조가 필요합니다.
- 3-09의 실제 소스 스냅샷이 현재 src/public/tests/fixtures와 일치함을 확인했습니다. 장시간 Chromium601.282초,
  회전30·입력100·재진입30 후 앱/텍스처 참조/canvas0 복귀 기록을 재사용합니다.
  **실측(3-09 재사용):** DPR2 평균30.99FPS·하위5% 근사20FPS, GC 후 heap+2,552,580bytes(원인 미확인),
  DPR1 단기58.00FPS·WebKit 단기50.18FPS입니다. 이번3-10 신규 성능 측정이나 실제 휴대폰 실측은 아닙니다.
  **성능 목표:**60FPS 지향·저성능 환경30FPS 수준에서도 조작 가능. 현재 달성 판정하지 않습니다.
  **검사 설정/미측정:** WebKit600초 검사는 미실행, GPU 메모리는 미측정입니다. ticker.maxFPS60 설정은 실측FPS가 아닙니다.

입력·시각화는 **모의 상태**입니다. 실제 입질 시간·파이팅·포획/보상·서버 결과 검증은 5단계에서 확정합니다.
GameCanvas와 InputController를 재사용하고 엔진에서 장치별 DOM 이벤트를 다시 구현하지 않습니다.
수동 절차는 [MOBILE_DEVICE_TEST_CHECKLIST.md](MOBILE_DEVICE_TEST_CHECKLIST.md)를 따르며 미실행 결과를 PASS로 옮기지 않습니다.
실기기 미검증은 자동 검사와 분리한 **별도 잔여 위험**입니다. 추가 필수 완료 조건이나 자동 FAIL로 집계하지 않습니다.
실제 휴대폰 발열·배터리 사용량은 실기기 검증 전까지 미확인·미측정으로 유지합니다.

## 과거 설계 기록 — 3-02 / 3-04

작성일: 2026-10-25 (Asia/Seoul). 기준: 공통 개발 지침 v3.1.
상태: **설계 문서 / 코드·PixiJS·Penpot 미구현**.
위 상태는 3-02 작성 당시 기록입니다. 3-04에서 React HUD·세로/가로 조작 배치·DOM 누름/취소 표시를 구현했습니다.
입력 명령 reducer·멀티터치 역할 소유권·Pixi 통합·실제 낚시는 미구현입니다. 전체 입력 계약 완료와 구분합니다.
최신 검증은 [PHASE3_04_UI_IMPLEMENTATION.md](PHASE3_04_UI_IMPLEMENTATION.md)를 참조합니다.
6개 화면/내비게이션/Penpot 전체 목록은 [SCREEN_DESIGN.md](SCREEN_DESIGN.md)를 따릅니다.

## 1. 책임과 범위

모바일 세로를 기본 플레이 환경으로 하며 모바일 가로·태블릿·PC를 각각 배치합니다.
PC 장면을 단순 축소하거나 가로 모드를 강제로 요구하지 않습니다. 휴대폰 터치만으로 핵심 모의 조작과 메뉴 접근이 가능해야 합니다.

| 주체 | 책임 |
| --- | --- |
| React/Tailwind | HUD·접근 가능한 버튼·메뉴·폼·Safe Area·반응형 영역 배치 |
| 입력 adapter | Pointer/키보드/접근성 동작 → 저장소·렌더러와 독립된 명령, 소유 포인터·취소 관리 |
| 모의 세션 모델 | 현재 입력/방향/차지 시각화·일시정지·resume. 3-08 검증용 |
| PixiJS | 배경/물고기/이펙트 렌더링, 카메라·화면 좌표 변환. 직접 DOM 버튼 의미를 소유하지 않음 |
| 5단계 엔진/서버 | 캐스팅 거리·릴/입질 규칙·성공/실패·보상·시간/결과 검증 |

3단계의 누르기/방향/모의 반응을 실제 어획·공식 기록·서버 판정으로 취급하지 않습니다.
새 SDK/외부 서비스/과금 기능을 요구하지 않습니다. 게임 이미지는 Asset ID로 요청하고 실제 URL은 Manifest/Resolver/Provider가 해석할 예정입니다.
공개 Pages 파일과 비공개 사용자 자산은 분리하며 비공개 URL/토큰을 HUD나 로그에 노출하지 않습니다.

## 2. 모바일 세로 화면

```text
┌────────────────────────────┐
│ top Safe Area               │
├────────────────────────────┤
│ 모드 · 상태             메뉴 │  React HUD
├────────────────────────────┤
│                            │
│      PixiJS 장면            │  가변 높이, 종횡비 왜곡 금지
│   장면 안 필수 UI 없음       │
│                            │
├────────────────────────────┤
│       짧은 상태 안내         │
│    ↑       캐스팅  릴 감기   │
│  ←   →     입질반응  메뉴    │  React 조작 영역
│    ↓                       │
├────────────────────────────┤
│ bottom Safe Area            │
└────────────────────────────┘
```

좌측 DirectionPad, 우측 ActionPad를 두 엄지로 조작합니다. 캐스팅·릴 감기·입질 반응은 항상 위치가 같고
현재 모의 상태에 따라 disabled/pressed/ready를 표시합니다. 상태 변화 때문에 버튼이 이동하거나 갑자기 다른 동작으로 바뀌지 않습니다.
메뉴는 HUD에서 항상 접근 가능하며 하단 메뉴는 편의 중복 진입입니다. 두 버튼은 같은 메뉴 동작을 실행합니다.

기준 치수(후속 Penpot/실기기 검증으로 조정할 설계값):

| 영역 | 세로 기준 |
| --- | --- |
| 좌우 기본 여백 | 16px, Safe Area와 큰 값을 사용 |
| HUD | 기본 56px, compact에서도 메뉴 hit target 44px 확보 |
| 하단 조작 영역 | 상태 줄·여백 포함 약 176px, bottom inset 별도 |
| DirectionPad | 132×132px, 3×3 44px 셀 중 상하좌우 버튼, 중앙은 neutral 영역 |
| ActionPad | 2×2, 각 60×60px + 간격 8px → 128×128px |
| 좌우 조작 간격 | 최소 12px, 132+12+128=272px |
| 중앙 장면 | 남은 높이 사용, 일반 목표 최소 160px, 극단 높이 compact 120px까지 검토 |

320px 폭의 기본 가용 폭 288px 안에 272px 조작 그룹이 들어갑니다. inset/텍스트 확대가 더 크면 조작 영역을 재배치하고
44px 아래로 축소하지 않습니다. 각 동작 label은 1~2줄까지 허용하고 접근성 이름은 전체 동작명으로 유지합니다.
390/430px에서는 버튼을 화면 모서리까지 벌리지 않고 같은 엄지 도달 범위에서 여백/장면을 늘립니다.
768×1024에서는 조작 그룹 폭을 무한 확장하지 않고 장면 폭과 주변 여백을 늘립니다.

## 3. 모바일 가로 화면

```text
┌─────────────────────────────────────────────┐
│ inset   모드 · 핵심 상태              메뉴 inset│  HUD 44px
├─────────┬───────────────────────┬───────────┤
│    ↑    │                       │ 캐스팅    │
│  ←   →  │     넓은 Pixi 장면      │ 릴 감기   │
│    ↓    │                       │ 입질반응  │
│         │                       │ 메뉴/도움 │
└─────────┴───────────────────────┴───────────┘
          bottom inset 안에는 버튼을 넣지 않음
```

가로 화면은 일반 sm 이상 PC 헤더로 바꾸지 않고 별도 짧은 높이용 GameShell을 씁니다.
왼쪽 132px 방향 영역과 오른쪽 128px 행동 영역을 확보하고, 가운데 장면은 나머지 폭을 사용합니다.
조작 패드는 화면 안전 영역 안에서 수직 중앙/하단에 정렬하며 HUD와 겹치지 않습니다.
우측 행동은 기본 2×2 그리드로 유지합니다. 긴 세로 버튼 열로 만들어 390px 높이 아래로 잘리게 하지 않습니다.
위 도식의 세로 label은 역할 설명이며 실제 기준 배치는 2×2 버튼입니다.

HUD는 44px 행으로 압축해 모드·입력/일시정지 상태·메뉴만 남깁니다. 보조 설명·도감 요약·키 안내는 메뉴로 옮깁니다.
장면은 조작 열을 침범하지 않도록 독립 grid 셀에 둡니다. 불가피한 장식 overlay는 pointer-events:none이며
상호작용 대상/물고기를 가리는 고정 HUD를 Pixi 화면 위에 쌓지 않습니다.
홈 인디케이터/좌우 노치·주소창 때문에 높이가 줄어도 필수 동작을 숨기거나 스크롤 아래로 보내지 않습니다.

사용 가능한 안전 높이가 280px보다 작아지면 compact HUD/여백·설명을 먼저 축소합니다.
44px 버튼을 유지할 수 없는 극단 확대/키보드 상황에서는 모의 세션을 정지하고 접근 가능한 스크롤 메뉴와
계속하기/나가기 안내를 보여줍니다. 가로 강제·페이지 전체 줌 금지·작은 버튼으로 우회하지 않습니다.

## 4. PC와 공통 명령

PC는 넓은 장면·상단 HUD·옆의 도움말/선택 정보를 배치합니다. 화면 버튼은 클릭/키보드 모두 접근 가능해야 합니다.
마우스 좌표는 장면 내 조준 미리보기에만 사용하고 단순 장면 클릭으로 즉시 캐스팅하지 않습니다.
마우스 오른쪽 버튼/브라우저 컨텍스트 메뉴를 사이트 전체에서 가로채지 않습니다.

| 동작 | 모바일/화면 버튼 | PC 기본 키(설계) | 명령 의미 |
| --- | --- | --- | --- |
| 캐스팅 | 캐스팅 누름·놓음 | C 누름·놓음 | 준비/차지 시작, 놓을 때 commit 요청 |
| 릴 감기 | 누르고 유지 | R 누름·놓음 | reel.start / reel.end |
| 방향 | D-pad 버튼 또는 패드 drag | WASD / 방향키 | 정규화 방향 벡터, 중립은 (0,0) |
| 입질 반응 | 버튼 누름 시 1회 | E 첫 keydown | react 요청 1회, 성공 판정 아님 |
| 메뉴/일시정지 | 메뉴 탭 | Escape | 입력 해제 후 모의 일시정지/메뉴 |

키보드 명령은 게임 입력 scope가 활성이고 메뉴/폼이 없을 때만 처리합니다.
input/textarea/select/contenteditable·로그인·일반 화면에서는 가로채지 않습니다.
key repeat로 cast.start/react를 반복하지 않습니다. 반대 방향 키는 축별 상쇄, 대각선 벡터 길이는 최대 1로 정규화합니다.
단축키 외에도 Tab/Enter/Space 및 보조 기술의 버튼 활성화가 같은 명령으로 이어져야 합니다.
native click과 Pointer/단축키가 한 동작을 두 번 전송하지 않도록 하나의 adapter가 활성화를 통합합니다.
Space/Enter의 버튼 기본 동작까지 별도 전역 핸들러에서 중복 실행하지 않습니다.

## 5. HUD와 피드백

| HUD 요소 | 세로 | 가로 compact | 의미 |
| --- | --- | --- | --- |
| 모드 배지 | 훈련/비회원 표시 | 항상 표시 | 모의 상태를 운영 게임으로 오인하지 않게 함 |
| 현재 상태 | 준비/누름/취소/일시정지 | 한 줄 요약 | 색만 사용하지 않고 문구·아이콘 제공 |
| 입력 강도 | 캐스팅 차지의 시각적 예시 | 필요 시 짧은 bar | 낚시 거리/성공률/실제 장력으로 해석하지 않음 |
| 메뉴 | 항상 보이는 44px 이상 버튼 | 항상 표시 | 도감·랭킹·내 정보·로그인·홈 동선 |
| 네트워크 상태 | 실제 서비스가 연결될 때만 | 실제 상태가 있을 때만 | 미연결 상태에 서버 동기화 중/완료를 위조하지 않음 |

눌림·disabled·대기·입력 취소를 명확히 표시하고 빠른 연타를 필요로 하지 않는 모의 피드백을 제공합니다.
기술 이벤트 로그/sequence 번호는 개발 검증 자료에만 두며 일반 플레이 HUD에 내부 구현 정보를 넣지 않습니다.
aria-live는 주요 상태 전환에만 사용하고 방향 좌표/매 프레임 값을 읽지 않습니다.
진동/오디오에만 의존하지 않으며 필수 feedback은 시각/텍스트로도 제공합니다. 유료 음원/서비스는 도입하지 않습니다.

## 6. 입력 인터페이스 계약(설계용, 소스 구현 아님)

이름과 payload는 3-08에서 타입으로 확정하되 다음 의미를 유지합니다.

| 명령 | payload 개념 | 종료/중복 규칙 |
| --- | --- | --- |
| cast.start | activationId, 현재 조준 방향 | 활성화당 1회 |
| cast.aim | -1~1 방향/0~1 모의 charge | 변화 시 갱신, 포인터 pressure는 필수로 사용하지 않음 |
| cast.commit | 같은 activationId, 최종 방향/모의 charge | 정상 종료 시만 1회 |
| cast.cancel | activationId, reason | commit과 배타적, 취소 후 놓아도 commit 금지 |
| reel.start / reel.end | activationId, end reason | start 1회/end 최대 1회. 매 프레임 start 재전송 금지 |
| move | x,y 정규화 벡터 | 누름/drag 중 최신 값, 종료/취소 시 (0,0) |
| react | activationId | down/첫 키 활성화 시 1회. 승패/보상 아님 |
| input.reset | reason, 새 입력 epoch | 모든 누름·소유권·대기 commit 제거 |
| session.pause / session.resume | reason | 모의 세션용. 실제 서버 세션 정책은 5단계 |

공통 envelope: inputEpoch, 단조 증가 sequence, monotonic timestamp, source(pointer/keyboard/accessibility).
pointerId/DOM 좌표는 adapter 내부에서 관리하고 게임 엔진은 DOM 이벤트 객체에 의존하지 않습니다.
새 epoch 이후 이전 epoch의 지연 이벤트·commit·keyup은 무시합니다. 같은 activation/sequence의 중복 요청도 재실행하지 않습니다.
실제 서버에 이 클라이언트 timestamp/charge를 신뢰 가능한 결과로 제출하지 않습니다.

DOM 입력 → adapter → 명령 reducer/모의 모델 → React HUD 및 Pixi 표시의 한 방향 흐름을 사용합니다.
adapter는 렌더링 프레임마다 새로 만들지 않고 cleanup 가능한 인스턴스로 유지합니다.

## 7. Pointer Events 상태 전이

각 동작은 idle → active → committed/ended 또는 cancelled → idle의 수명을 갖습니다.
active 중에는 owner(pointerId 또는 키 활성화 ID)를 하나만 가집니다. global pause 상태에서는 새 active로 진입하지 않습니다.

### 캐스팅

| 현재 상태/사건 | 다음 상태·행동 |
| --- | --- |
| idle + 허용된 pointerdown | owner 기록, pointer capture 요청, cast.start, pressed/armed 표시 |
| active + 300ms 유지 | charging 시각 상태. 300ms는 초안 feedback 지연이며 낚시 규칙/최소 캐스팅 시간 아님 |
| active + 작은 drag | 세로 이동을 0~1 모의 강도에 반영, 방향은 D-pad의 현재 값 사용 |
| active + 버튼 이탈 | capture는 유지하되 disarmed 표시. 정상 release 허용 영역 밖에서는 commit 불가 |
| disarmed + 원래 영역 재진입 | 같은 owner일 때 armed 복귀, start를 다시 보내지 않음 |
| armed + pointerup | cast.commit 1회, capture/owner 해제, idle |
| disarmed + pointerup / pointercancel / lostpointercapture | cast.cancel 1회, timer/capture/owner 해제, idle |

정상 release 영역은 버튼 rect + 최대 8px 여유이며 다른 버튼 rect와 겹치면 확대하지 않습니다.
drag는 조작 버튼 주변의 제한된 모의 강도 입력입니다. 장면 끝까지 손가락을 끌어도 자동으로 캐스팅하지 않습니다.
짧은 탭도 start→commit 한 번을 만들며 실제 캐스팅 수행 가능 여부/거리는 5단계가 결정합니다.

### 릴 감기

idle + down → reeling, reel.start 1회. owner가 누른 동안 모의 모델은 held=true를 읽습니다.
정상 up → reel.end(normal), idle. 버튼 영역 이탈 시 즉시 reel.end(leave)하고 그 제스처를 종료합니다.
손가락을 다시 올려도 새 down 없이 자동 재개하지 않습니다. cancel/lost capture도 reel.end(cancel) 후 neutral입니다.
연속 처리는 모의 모델의 ticker/state에서 하고 pointermove 빈도로 속도가 달라지지 않게 합니다.

### 방향 조작

각 화살표 버튼은 down 시 방향을 만들고 up/cancel 시 해당 owner를 제거합니다.
패드 drag 모드는 132px 패드 영역에서 시작한 1개 owner의 이동을 받습니다. 중앙 dead zone은 반경 12px 초안,
벡터 크기는 1로 제한합니다. capture 중 패드를 벗어나면 clamp된 방향을 유지하되 화면 자체를 스크롤하지 않습니다.
up/cancel/lost capture 시 (0,0). 버튼 입력과 drag는 동일 포인터에서 동시에 두 번 집계하지 않습니다.
최초 방향 owner를 유지하고 같은 역할의 추가 손가락은 무시합니다. 좌우/상하가 함께 눌린 키보드는 축별 상쇄합니다.

### 입질 반응

idle + down → pressed, react 1회. 빠른 반응을 위해 release까지 기다리지 않습니다.
up/cancel/leave는 눌림 표시만 해제합니다. 이미 발생한 react 요청을 취소 이벤트가 되돌리지는 않습니다.
유지/drag/키 repeat/후속 native click으로 react를 추가 전송하지 않습니다. 실제 입질 유효 시간/반응 성공은 5단계 책임입니다.

### 소유권·멀티터치

- 방향 역할 1개 + 행동 역할 1개의 동시 소유를 허용합니다. 터치 전용 조작에서 isPrimary만 검사해 두 번째 손가락을 무조건 버리지 않습니다.
- 캐스팅과 릴 감기는 배타적입니다. 먼저 시작한 행동을 유지하고 다른 행동 버튼 down은 시각적 비활성/안내로 무시합니다.
- 입질 반응은 모의 reactEnabled 상태에서 행동 역할을 선점할 수 있습니다. 기존 캐스팅은 cancel, 릴은 end 후 react 1회.
  이는 입력 충돌 처리 정책이며 실제 게임 상태의 reactEnabled 판정은 5단계가 결정합니다.
- 남는 추가 손가락/같은 버튼의 두 번째 포인터는 명령 없이 무시합니다. 위 react 선점과 메뉴만 명시적 예외입니다.
  react 선점 시 이전 행동 owner는 폐기하고 그 손가락이 떨어질 때까지 다시 소유권을 주지 않습니다. 활성 owner는 최대 방향+행동 2개입니다.
  다른 포인터의 up으로 현재 owner를 해제하지 않습니다.
- 메뉴는 항상 우선하며 열기 전에 전체 입력을 취소합니다. Canvas의 그림/tooltip이 버튼 포인터를 가로채지 않게 합니다.
- 마우스는 기본 왼쪽 버튼만 행동 입력으로 받습니다. 동시에 다른 입력 장치를 사용하면 역할별 기존 owner가 우선합니다.

Pointer capture는 owner의 뒤늦은 up/cancel 수신에 사용하며 영역 이탈의 유효성 판정을 대신하지 않습니다.
방향 drag·릴 감기의 허용된 down에서도 capture를 요청하고 종료/취소 시 해제합니다. 방향키의 여러 키는 하나의 키보드 방향 역할 안에서 합성합니다.
touch-action은 제스처 시작 전에 결정하며 시작 후 CSS 변경만으로 현재 브라우저 제스처를 바꾸려 하지 않습니다.
관련 표준 근거: [W3C Pointer Events](https://www.w3.org/TR/pointerevents3/).

## 8. 취소·회전·백그라운드·포커스 전환

cancelAll(reason)은 모든 활성 cast를 취소하고 reel을 종료하며 방향을 중립으로 만든 뒤,
capture/owner/timer/대기 명령을 제거하고 inputEpoch를 갱신해 input.reset을 전달하는 멱등 연산입니다.
이미 끝난 입력을 다시 종료하거나 취소 후 commit하지 않습니다. 엔진이 정지하기 전에 neutral 상태를 반영합니다.

| 사건 | 입력 | 모의 세션/화면 |
| --- | --- | --- |
| pointercancel | 해당 owner 종료, 실제 취소 이유로 기록 | 조작 상태 해제, 오류 팝업 남발 금지 |
| lostpointercapture | 같은 owner의 종료가 아직 없으면 취소 | 새 down 전 자동 재개 없음 |
| 회전·게임 영역 재배치 | cancelAll(layout-change), resize 동안 새 입력 gate 닫음 | 모델/장면 유지, 좌표 재측정 후 gate 개방, 누름 자동 복원 없음 |
| 주소창 변화로 제어 rect 이동 | 좌표 안정화 전 active 입력 취소 | 브라우저 UI 변화를 게임 결과 변화로 해석하지 않음 |
| document hidden / pagehide / window blur | cancelAll(background), 키 상태 해제 | 모의 ticker 정지·자원 부하 감소 |
| 다시 visible/focus | neutral 유지 | 계속하기 버튼으로 재개. 지난 시간을 한꺼번에 진행하지 않음 |
| 메뉴·폼 포커스·게임 scope 이탈 | cancelAll(scope-change) | 메뉴/입력 UI의 키·스크롤을 정상 사용 |
| route 이동/컴포넌트 해제 | cancelAll(unmount), listener 정리 | 상위 세션 모델의 보존/종료 계약에 따름 |

회전은 모의 상태(장면 객체/진행 값/시드/선택 상태)를 보존하되 손가락/키를 누르는 상태까지 보존하지 않습니다.
일반 resize는 게임 모델을 초기화하지 않습니다. 재배치 중에는 좌표 기반 명령만 잠시 차단하고 완료 후 새로운 입력을 받습니다.
실제 서버 게임은 background/재접속 시 서버 시간이 계속 흐를 수 있으므로 5단계에서 별도 재동기화 규칙을 설계합니다.
현재 모의 pause를 실제 게임의 시간 정지 보장으로 사용하지 않습니다.

## 9. Safe Area·주소창·키보드·스크롤

### Safe Area

3-04에서 viewport-fit=cover를 도입하는 경우 반드시 네 방향 env(safe-area-inset-*)를 함께 적용합니다.
배경은 화면 끝까지 그릴 수 있지만 HUD·버튼·내비게이션·닫기·폼은 안전 영역 안에 둡니다.
기본 padding과 inset 중 큰 값을 적용하는 한 계층의 SafeAreaFrame을 소유자로 정해 중복 padding을 방지합니다.
세로는 top/bottom, 가로는 left/right inset도 재평가합니다. 노치 크기를 기종별 상수로 하드코딩하지 않습니다.
근거: [WebKit Safe Area 안내](https://webkit.org/blog/7929/designing-websites-for-iphone-x/).

### 주소창과 가상 키보드

일반 페이지는 min-height:100dvh와 정상 문서 스크롤, 게임은 100dvh 기준의 측정된 컨테이너를 출발점으로 설계합니다.
100vh 고정만으로 실제 가용 높이를 단정하지 않습니다. 주소창/VisualViewport 변화는 한 프레임에 묶어 처리합니다.
로그인은 게임 고정 높이/overflow 규칙에서 분리합니다. 키보드가 뜨면 입력·오류·제출 버튼을 스크롤로 접근 가능하게 하고
하단 고정 내비게이션은 폼을 가리지 않도록 접으며 상단 뒤로/메뉴는 남깁니다.
입력 font-size 16px 이상을 기준으로 하되 줌·텍스트 확대는 막지 않습니다. blur 후 포커스/스크롤 복원을 검사합니다.
VisualViewport가 지원되면 resize/scroll/offset 정보를 반영하고 없으면 문서 스크롤로 기능을 유지합니다.
키보드 등장으로 viewport 폭/높이가 달라져도 이를 기기 회전으로 오판하지 않습니다.
브라우저별 layout/visual viewport 차이 근거: [Chrome 공식 설명](https://developer.chrome.com/blog/viewport-resize-behavior).

### 제스처 정책

- body/html 전체 touch-action:none·전역 preventDefault·전역 확대 차단 금지.
- DirectionPad/행동 버튼 등 직접 조작 영역에만 touch-action:none과 필요한 선택 방지 적용.
- 일반 메뉴·도감·랭킹·프로필·로그인 본문은 auto/정상 스크롤을 유지.
- 기본 모바일 장면은 표시 영역이며 조준은 DirectionPad로 가능하게 해 장면 drag를 필수 조작으로 만들지 않음.
  향후 장면 drag 조준을 추가하면 명시적 상호작용 surface에만 정책을 적용하고 3-08 범위에서 검증.
- GameShell의 의도하지 않은 문서 스크롤/overscroll은 게임 영역에 한해 제한하고, pause 메뉴의 긴 내용은 별도 스크롤 허용.
- 브라우저 시스템 가장자리 제스처를 가로채지 않고 필수 버튼을 홈 인디케이터/화면 가장자리 위에 배치하지 않음.

## 10. 캔버스 크기·DPR·장면 보존 계약

3-08에서 React GameShell 안의 실제 게임 host 영역을 측정합니다. window 크기를 그대로 캔버스 크기로 쓰지 않습니다.
HUD/조작 영역/Safe Area/그리드 크기를 뺀 CSS box가 기준이며 canvas는 그 box를 넘지 않습니다.

1. 세션 모델과 입력 reducer는 화면 방향 및 캔버스 크기와 독립적으로 소유합니다.
2. ResizeObserver와 viewport 신호를 한 layout controller로 합치고 requestAnimationFrame 단위로 최신 측정만 반영합니다.
3. 크기가 0이거나 초기화 중이면 resize를 보류하고 유효한 측정이 생겼을 때 적용합니다.
4. 필요 시 cancelAll(layout-change), 카메라/host rect 갱신, Pixi renderer 크기/DPR 갱신, 이후 새 입력 허용.
5. 회전마다 Application·scene·texture·게임 모델을 다시 만들지 않습니다. orientation을 React key로 사용하지 않습니다.
6. renderer 물리 버퍼는 CSS 크기 × 유효 DPR에 맞춥니다. UI 좌표/포인터 좌표를 물리 버퍼 픽셀과 혼동하지 않습니다.
7. DPR 초안은 min(devicePixelRatio, 2), 저전력은 1~1.5 후보입니다. 실제 기기 품질/발열 측정 후 확정하며 무조건 3~4배 버퍼를 만들지 않습니다.
8. 창 이동/줌/DPR 변경도 측정 신호로 취급합니다. pixel ratio 변경 후 CSS 크기·버퍼·좌표 역변환을 함께 검증합니다.
9. 카메라는 세로/가로에 맞게 시야를 재배치하고 물고기/배경을 비균일 stretch하지 않습니다. 핵심 장면은 contain/안전 영역,
   장식 배경은 확장/crop 가능. 세로 전용 HUD를 PC 화면의 축소판으로 대체하지 않습니다.
10. 포인터의 client 좌표는 최신 host rect와 카메라 역변환으로 논리 좌표로 바꿉니다. 안전한 정규화 범위 밖 입력은 clamp/거부합니다.

PixiJS에는 resizeTo/ResizePlugin도 있지만 크기를 갱신하는 소유자를 둘 이상 두지 않습니다.
기본 설계는 host ResizeObserver 기반 단일 controller이며, ResizePlugin을 선택할 경우 중복 자동 resize를 제거하고
그리드/VisualViewport 변화까지 다루는지 확인해야 합니다. 구체 메서드/해상도 변경 API는 설치된 8.22.0에서 3-08 구현 전에 확인합니다.
참고: [PixiJS 8 Resize Plugin](https://pixijs.com/8.x/guides/components/application/resize-plugin).

React StrictMode의 비동기 init/해제를 고려해 이전 init 완료가 새 mount에 붙지 않도록 수명을 구분합니다.
정상 unmount에서만 자신이 소유한 listener/observer/capture/ticker/canvas/GPU 자원을 해제하고 공유 텍스처를 무조건 파괴하지 않습니다.
resize는 수명 종료가 아니므로 destroy로 처리하지 않습니다.

## 11. 모바일 성능·에셋·접근성

- 60fps는 목표이며 저전력/발열 시 30fps 품질 단계를 검토합니다. 실제 측정 전 성능 PASS로 보고하지 않습니다.
- document hidden에서는 모의 ticker/불필요한 animation을 중지하고 resume 시 delta를 제한합니다.
- HUD는 주요 상태 변화/제한된 주기로 갱신하고 pointermove마다 React 전체 트리를 다시 그리지 않습니다.
- 고해상도 배경/물고기 WebP는 용도별 크기와 픽셀 예산을 정해 preload를 필수 장면으로 제한합니다.
- UI 아이콘은 SVG, Pixi sprite는 WebP를 기본으로 하며 원본을 기기 화면보다 과도하게 크게 로드하지 않습니다.
- Asset ID로 resolve/load, 취소 가능한 로딩, 동일 자산 요청 재사용, fallback 이미지/텍스트·재시도 UI를 설계합니다.
- 핵심 장면 실패는 입력 gate를 닫고 재시도/나가기를 제공, 장식 하나 실패는 전체 게임을 막지 않습니다.
- 비공개 에셋은 공개 Pages manifest에 URL/파일을 넣지 않으며 향후 인증 Provider와 접근 정책을 별도로 정의합니다.
- hover 전용 기능 금지, focus-visible 유지, disabled/pressed/ready를 문구·아이콘으로 구분, reduced-motion 지원.
- 외부 이미지 변환/스토리지/과금 기능을 성능 개선 명목으로 승인 없이 활성화하지 않습니다.

## 12. 기본 viewport별 수용 기준(구현 후 검사)

| viewport | 기본 배치 | 반드시 확인할 항목 |
| --- | --- | --- |
| 320×568 | 세로 compact | 272px 조작 폭, 최소44, HUD/동작 노출, 장면 최소 공간 |
| 390×844 | 세로 기본 | 한 손/양손 도달·아래 inset·입력 취소·카드 내비게이션 |
| 430×932 | 세로 여유 | 가용 장면 확장, 버튼이 지나치게 벌어지지 않음 |
| 844×390 | 가로 좌우 조작 | 좌우 Safe Area, 우측2×2, 짧은 높이의 버튼 완전 노출 |
| 768×1024 | 세로 태블릿 | 터치 유지·장면 확장·방향/동작 동시 소유 |
| 1440×900 | PC | 마우스·C/R/E·방향키·Tab/Space/Enter·게임 외 키 입력 보존 |

각 viewport에서 레이아웃·세로/가로 전환·DPR·주소창·input cancel·동시 포인터·asset 실패를 구분해 검증합니다.
노치/가상 키보드/브라우저 제스처·배터리/발열은 Playwright만으로 합격 처리하지 않고 실제 Android Chrome/iPhone Safari에서 확인합니다.
3-01 결과는 기존 준비 화면에 대한 PASS이며 이 설계의 구현 결과가 아닙니다.

3-01 개선 대상: 기존 홈 메뉴 38×40px, 나머지 메뉴 높이 40px → 3-04에서 모두 최소44×44px.
이외 닫기·계정·필터·게임 메뉴까지 같은 기준을 적용합니다. 시각 아이콘이 20px이어도 클릭 영역은 44px 이상이어야 합니다.

## 13. Penpot 변형·3-08/5단계 인수인계

3-03의 GameHUD/DirectionPad/ActionPad 변형: portrait/landscape/desktop, idle/pressed/disarmed/disabled,
charging/reeling/reacted, paused/loading/error, Safe Area guide on/off, keyboard/help 표시를 준비합니다.
캐스팅/릴/입질의 버튼 색만 다르게 하지 않고 label/icon/상태를 함께 설계합니다.
실제 프레임/토큰/컴포넌트는 이번에 생성하지 않았습니다. Penpot 현 세션 단절과 읽기 이력의 차이는 SCREEN_DESIGN에 기록했습니다.

| 인수 대상 | 해야 할 일 | 성공 기준 / 제외 범위 |
| --- | --- | --- |
| 3-04 | SafeAreaFrame·min44·GameShell/일반 shell·키보드 폼 시각 상태 | 지정 viewport에서 버튼 노출. 실제 Auth는 제외 |
| 3-05 | 공개 SVG/WebP와 fallback, export 크기/ID 후보 | 디코딩·예약 영역·실패 대체. 제공자 신규 도입 제외 |
| 3-06~3-07 | AssetManifest/Resolver/Provider·공개/비공개 경계 | 저장소 URL 하드코딩 없는 ID 해석, 현재 getAssetUrl 재사용 |
| 3-08 | 입력 adapter/reducer·모의 세션·Pixi host·상태 보존 resize·cleanup | 아래 모의 검증 목록. 실제 낚시 규칙/서버 판정 제외 |
| 3-09 | 자동 테스트·회귀·실기기 수동 체크 분리 | 실행 증거/미실행 구분. 에뮬레이션을 실제 iPhone PASS로 표시 금지 |
| 5단계 | 규칙 상태 머신·시간/거리/입질·포획/보상·서버 검증 | 클라이언트 입력/시각 효과를 권위 있는 결과로 신뢰하지 않음 |

3-08 모의 검증 목록:

1. down/up의 cast start/commit이 각각 1회, 장시간 유지/키 repeat/native click에도 중복 없음.
2. cancel/이탈 release/lost capture 이후 commit 없음, reel이 유지되지 않고 direction은 neutral.
3. 방향+행동 두 owner 허용, 같은 역할 추가 포인터는 react/menu 선점 예외 외에 무시, 폐기된 owner의 up이 현재 owner를 끊지 않음.
4. 회전/가상 키보드/메뉴/blur/hidden 후 stuck input 없음, 기존 모의 모델 값 유지, 새로운 입력으로만 재개.
5. resize 전후 Application/모델이 불필요하게 재생성되지 않음, DPR/host 좌표 일치, 0 크기 안전 처리.
6. touch-action 정책이 일반 메뉴/로그인/도감 스크롤을 막지 않음, 모든 핵심 조작을 터치만으로 수행.
7. 실제 서버 호출/공식 기록/보상 없이 모의 피드백과 일시정지/종료를 검증.

미확정 항목은 최종 HUD 문구·게임 그래픽/토큰 값·기기별 성능 예산·낚시 밸런스·서버 재접속 정책입니다.
300ms/12px/버퍼 DPR 등은 실행 가능한 초안값이며 Penpot·3-08·실기기 검증에서 근거를 기록해 조정합니다.
문서 설계 완료와 구현/모바일 테스트 PASS를 구분합니다. 이번에는 자동/실제 기기 게임 조작 테스트를 실행하지 않았습니다.
3-03은 설계 인수인계 가능, 실제 Penpot 변경 전 기존 파일 연결 확인·쓰기 선행 검증 필요. 다음 단위는 별도 지시 후 진행합니다.
