# FishingKing 3-03 — Penpot MCP 작업 및 복구 기록

확인일: 2026-10-25 (Asia/Seoul). 기존 Remote MCP와 기존 파일을 재사용했습니다.
비밀 인증 URL·키·쿠키·사용자 인증정보는 이 문서와 증거 JSON에 포함하지 않습니다.

## 1. 연결 조사 결과

| 순서 | 확인 결과 |
| --- | --- |
| 1. 서버 등록 | 로컬 전역 TOML에서 `mcp_servers.penpot` enabled=true 확인. 원문 대신 이름·enabled·전송 종류·호스트만 출력 |
| 2. 방식 | 기존 Remote HTTP / 호스트 design.penpot.app / 로컬 실행 command 없음. 기존 Streamable HTTP 연결 이력과 일치 |
| 3. 도구 | high_level_overview, penpot_api_info, execute_code, export_shape 노출·호출 성공 |
| 4. 활성 세션 | execute_code가 실제 플러그인 객체를 반환. 별도의 인스턴스 목록 API는 노출되지 않아 currentFile/currentPage로 식별 |
| 5. 대상 | 파일 새 파일 1 / 685eebd9-2ce2-80a4-8008-d7b0b4e16646, 최초 페이지 Page 1 / 685eebd9-2ce2-80a4-8008-d7b0b4e16647 |
| 6. 읽기 | getPages/currentFile/currentPage/shapeStructure/library/tokens 조회 성공. 기존 페이지1, 자식0, 라이브러리0, 토큰0 |
| 7. 판정 | 이전 No Penpot instance connected 오류는 최초 재조회에서 재현되지 않음. 인증 만료를 원인으로 확정하지 않음 |

작업 중 Chrome 목록으로 workspace 탭의 파일·페이지·project ID도 기존 인수인계와 대조했습니다.
다른 파일을 대상으로 작업하지 않았고 인증·전역 MCP·서버·요금제를 수정하지 않았습니다.

## 2. 격리된 쓰기 검증

1. 파일 ID를 명시적으로 비교한 뒤 `FishingKing / MCP Write Test / 3-03` 페이지 추가.
2. 88×88 사각형 생성: `FK-3-03-WRITE-TEST-created`, 채움 #12344D.
3. 다음 호출에서 이름을 `FK-3-03-WRITE-TEST-verified`, 채움을 #2DD4BF로 변경.
4. 별도 읽기 호출에서 ID/이름/88×88/색상 재조회 성공.
5. 원본 Page 1의 자식0·구조 동일 확인. 기존 요소 삭제 없음. 테스트 페이지/요소는 증거로 유지.

테스트 페이지 ID: `a2dba513-1242-80ae-8008-d7c65bf4c976`.
테스트 도형 ID: `a2dba513-1242-80ae-8008-d7c65c0196e2`.
이 검증 이후에만 디자인 시스템·화면 생성으로 진행했습니다.

## 3. 실제 오류와 비파괴 복구

| 오류/원문 | 분류 | 처리·결과 |
| --- | --- | --- |
| 이전 `No Penpot instance connected for user token` | 파일 플러그인 연결/세션 문제 가능 | 이번 최초 읽기 성공. 이전 시점의 탭 닫힘·파일 미열림·플러그인 해제 중 어느 원인이었는지는 확인 불가 |
| `Value not valid: Field 0.name is invalid` | 토큰 세트 이름 유효성 | `FishingKing / Draft v0.1` 생성 거절, 세트 없음 재조회. `FishingKingDraft`로 생성 성공 |
| `Value not valid ... Code: :strokes` | API 속성 값 오류 | Stroke 공식 도구 안내에서 alignment 값 확인, outside 대신 outer로 수정. 영향을 받은 자체 생성 상태 요소만 보완 |
| `Task ... timed out after 120 seconds` | 대량 작업 응답 시간 초과 | 즉시 재생성하지 않고 상태 확인으로 전환 |
| `The Penpot plugin tab appears to be suspended by the browser (no heartbeat for 129s)` | 브라우저 탭 heartbeat 단절 | 기존 Chrome workspace 탭 식별 후 select_page(bringToFront=true). 후속 읽기 성공, 이미 생성된 일반 화면30개 확인. 중복 생성 없음 |
| `Cannot modify a page that is not currently active. Code: :resize` | 페이지 수정 컨텍스트 | Screens 페이지를 openPage한 다음 자체 생성 요소 수정·재조회 성공 |

초기 폰트 검색이 부분 이름 매칭으로 다른 Noto Sans 계열을 반환해, 전체 폰트 목록에서 정확히 `Noto Sans KR`를 선택하고
이번 생성 텍스트·타이포그래피와 family 토큰을 보정했습니다. 기존 사용자 텍스트는 없었고 원본 페이지는 보존했습니다.
토큰 세트명/Stroke/활성 페이지 오류는 권한 부족이 아닙니다. 시간 초과만으로 생성 실패 또는 전체 성공을 단정하지 않았습니다.

브라우저 휴지 상태 복구에는 computer-use 스킬을 확인했습니다. CUA 인벤토리는 빈 결과였고,
실제 탭 복구는 기존 chrome-devtools 도구로 수행했습니다. 탭 재로드·강제 종료·로그아웃·재설치·키 재발급은 하지 않았습니다.
Heartbeat 단절이 대량 실행 때문인지 브라우저 휴지 정책 때문인지 원인을 단정하지 않습니다.

## 4. 다음 세션의 안전한 순서

1. AGENTS/최신 HANDOFF/ROADMAP과 Git 상태를 먼저 읽습니다.
2. high_level_overview는 해당 세션 최초 1회만 읽고 필요한 API 타입을 확인합니다.
3. currentFile ID가 위 파일과 같은지, 현재 페이지가 기대 페이지인지 먼저 조회합니다.
4. 페이지·컴포넌트·토큰 ID는 [manifest](design/penpot-manifest.json)를 조회 결과와 대조합니다. 이름만으로 일괄 덮어쓰지 않습니다.
5. 수정 전 해당 페이지를 openPage합니다. 소규모 단위로 수정하고 호출 사이에 결과를 다시 조회합니다.
6. 시간 초과 후 같은 생성 호출을 반복하지 않습니다. 탭·heartbeat·페이지 실제 요소를 먼저 확인합니다.
7. 재개할 때도 기존 Page 1 및 테스트 페이지를 무단 정리하지 않습니다. 삭제가 필요하면 영향 범위·승인을 따로 확인합니다.

연결 오류가 다시 발생하면 탭 닫힘 → 파일 열림 → File/MCP 플러그인 연결 → 탭 휴지 → 현재 파일 ID → 세션/인증 순서로 확인합니다.
도구가 현재 파일을 반환하지 못할 경우 서버 안내 응답만으로 파일 읽기 성공이라고 판단하지 않습니다.
직접 복구할 수 없을 때 사용자 최소 작업은 “기존 새 파일 1 탭 활성화 → File → MCP Server → Connect → 탭 유지”입니다.
토큰·인증 URL을 채팅에 붙여넣도록 요청하지 않습니다. 이번 작업 종료 시에는 추가 수동 연결 작업이 필요 없습니다.

## 5. 최종 검증과 인수인계

- 읽기/격리 쓰기/실제 생성·변경 재조회 성공.
- 활성 토큰63, 색상12, 타이포그래피6, 네이티브 컴포넌트38(기본19+상태19) 재조회 성공.
- 기본 화면36 + 게임 상태7 = 화면 프레임43, 일반 상태 보드5, 입력 계약 보드1, Foundations/반응형 보드2 존재.
- 게임 모바일 세로·가로와 PC 기본 프레임 존재. 게임 장면과 React 조작 영역 분리.
- 원본 Page 1 구조 동일. 기본/게임 상태 프레임 경계 이탈0, 전체 작업 페이지 텍스트 박스 넘침0, 식별 터치 영역 최소44 위반0.
- PNG 육안 확인은 대표 프레임에 한함. 모든 화면의 확대·실기기 접근성 검증을 대신하지 않음.
- UTF-8·JSON·로컬 보존·git diff --check 결과는 HANDOFF 최신 3-03 기록 참조.

모든 페이지·토큰·컴포넌트·프레임 식별자는 manifest에 있습니다. 3-04는 [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)의 매핑을 따라
React/Tailwind 시각 UI를 구현할 수 있습니다. 자동 토큰 동기화·모든 요소의 인스턴스화·실제 게임·Auth·DB·그래픽 export는 후속 범위입니다.
이번 실행에서 앱 소스·서비스·패키지·인증·운영 배포는 변경하지 않았습니다. commit/push도 하지 않았습니다.
