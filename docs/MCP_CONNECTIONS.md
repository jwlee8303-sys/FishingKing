# MCP 연결과 인증 갱신

확인일: 2026-10-25. 기존 전역 설정은 변경하지 않았습니다.

저장 정책 변경: R2는 과금 방지를 위해 의도적으로 보류하며 재연결/활성화할 필수 대상에서 제외합니다.
기존 Pages의 정적 에셋 구조를 로컬 빌드·HTTP 및 기존 Pages /assets 응답으로 검증해 2단계를 완료 판정했습니다.
아래 R2 오류는 과거 읽기 진단 결과이며 복구 대기/3단계 착수 차단 조건이 아닙니다. 모든 기존 MCP 연결은 유지합니다.

| 연결 | 등록 / 전송 방식 | 실제 검증 |
| --- | --- | --- |
| chrome-devtools | enabled / stdio, 기존 --autoConnect 유지 | 기존 Chrome 탭·로그인 상태 및 실제 Pages Preview 읽기 성공. 재설치/새 프로필 없음 |
| Supabase | enabled / Streamable HTTP | 기존 프로젝트 목록·상세 조회 성공 |
| Penpot | enabled / 기존 Remote Streamable HTTP | 기존 연결 파일 새 파일 1 / Page 1의 페이지·레이어·라이브러리 개수 읽기 성공 |
| GitHub | 기존 연결 플러그인 | 저장소/main ref 읽기 재검증 성공. Git/gh도 정상 권한 실행에서 인증·조회 성공. 중복 등록 없음 |

## 최종 연결 재검증 — 2026-10-25

- 기존 Chrome --autoConnect·기존 프로필·전역 MCP 설정 유지. 중복 등록/재설치/키 재발급 없음.
- Supabase MCP: FishingKing / pjaducpbuqdlwkobwxbo / ap-northeast-2 / ACTIVE_HEALTHY.
  CLI 2.122.0도 정상 권한에서 기존 인증 조회 성공. 재로그인 불필요.
  명시한 승인 ref로 link 성공, .temp/project-ref 일치 및 프로젝트별 functions list(0개) exit 0.
  기본 권한의 Access token not provided와 정상 권한의 성공을 구분합니다. 다른 프로젝트로 연결하지 않았습니다.
- Penpot: 공식 Remote MCP가 연결된 기존 파일을 발견했습니다. 브라우저 workspace의 file/page/project ID와 MCP 응답을 대조.
  프로젝트 FishingKing - MCP 연결 검증 / 파일 새 파일 1 (`685eebd9-2ce2-80a4-8008-d7b0b4e16646`) /
  페이지 Page 1 (`685eebd9-2ce2-80a4-8008-d7b0b4e16647`). 프로젝트 ID는 `5009c98b-0fb2-816e-8008-d7b0732aaceb`.
  execute_code로 페이지 목록·현재 페이지·Root Frame의 레이어 구조·라이브러리 개수·토큰 목록 읽기 성공.
  페이지 1개, 자식 레이어/컴포넌트/색상/타이포그래피 0개, 토큰 없음. 모든 호출은 getter/읽기 유틸리티만 사용.
  기존 파일을 새로 만들거나 이름/레이어/토큰을 변경하지 않았습니다. 연결된 workspace 탭을 열어 유지합니다.
- 과거 No Penpot instance connected 오류는 이번 재조회에서 해소됐습니다. 과거 파일 생성/로그인 대기 안내는 해제합니다.
- R2는 MCP 재설정 문제가 아닙니다. 기존 Wrangler 버킷 목록 요청에 10042·Please enable R2 응답, 활성화/과금 작업은 하지 않음.

3단계에서는 위 파일/페이지를 먼저 재조회해 연결 대상을 확인하고 디자인 작업을 시작해야 합니다.
기존 GitHub·Pages 연결/배포 설정은 변경하지 않았으며 인증정보 원문/토큰 URL을 로그에 남기지 않았습니다.

## 이전 재검증 — 2026-10-25

아래는 이전 진단 당시 상황이며 상단 최종 연결 재검증이 우선합니다.

- 전역 MCP 설정을 수정하지 않았고, Chrome DevTools·Supabase·Penpot 서버를 재설치/중복 추가하지 않음.
- GitHub 기존 연결 플러그인·Supabase 프로젝트 MCP 조회 정상. 별도 MCP 인증 갱신 불필요.
- Penpot Remote의 서버 도구 응답과 파일 플러그인 연결은 별개. `high_level_overview`,
  `penpot_api_info(Penpot.currentPage)`는 성공했으나 읽기 전용 `execute_code`는 연결된 인스턴스 없음으로 실패.
- 열린 Personal Projects 초안에 파일이 0개임을 브라우저로 확인. 빈 검증 파일 생성 승인을 요청했고 생성은 하지 않음.
  승인 후 파일을 열어 File → MCP Server → Connect, Penpot 탭을 활성 상태로 유지하고
  페이지 이름/ID·최상위 레이어 읽기를 재시도해야 함. 키 재발급/Local 대체 설치는 불필요.
- Wrangler는 기존 캐시 4.152.0과 기존 인증을 재사용하여 whoami 및 Pages 목록/배포 조회 성공.
  Supabase CLI는 신규 설치 2.122.0, 별도 로그인/link는 미완료. 브라우저·MCP 인증과 구분.
  공식 자동 로그인 2회는 각각 90초 진행 신호 없이 종료, Chrome 인증 탭도 열리지 않음.
  사용자 PowerShell의 `npx.cmd supabase login` 완료 후 프로젝트 목록을 재검증해야 함.
  인증 URL/코드는 채팅에 보내지 않으며 `link`는 이번에 실행하지 않음.
- 기본 실행의 Git/gh/Wrangler 네트워크 제한은 정상 권한 재실행에서 해소됨.
  Supabase CLI 최초 시작의 사용자 홈 디렉터리 EPERM도 승인된 재실행에서 해소됨.
  TLS/전역 실행 정책/전역 인증 설정을 변경하지 않음.

CLI auth_status unknown/unsupported는 서버 도구 호출 성공/실패와 구분합니다.
현재 프로젝트별 MCP 설정은 없으므로 전역과 프로젝트 설정 충돌은 발견되지 않았습니다.
전역 config의 다른 서버·다른 프로젝트 설정을 삭제하거나 덮어쓰지 않습니다.

## Codex 점검

공식 Codex는 stdio 및 Streamable HTTP를 지원합니다. 기존 Penpot은 HTTP 방식입니다.
CLI 목록은 민감한 URL이 포함될 수 있으므로 결과를 그대로 채팅에 붙이지 마세요.
이번에는 프로그램 안에서 원문을 받아 이름·상태·전송 방식만 추출했습니다.
CODEX_HOME 해석 오류는 기존 홈 경로를 해당 프로세스에서만 명시해 목록 조회를 검증했습니다.
전역 설정 변경은 하지 않았습니다.

설정을 수정할 때는 먼저 기존 파일을 로컬 보안 위치에 백업하고 diff를 검토합니다.
예시 백업 위치는 .local/private-backups/날짜이며 Git 추적 대상에 절대 넣지 않습니다.
인증정보를 포함한 백업은 사용자 전용 접근으로 관리해야 합니다.

## Penpot Remote 재개 절차

1. 브라우저에서 design.penpot.app에 사용자 직접 로그인.
2. Your account → Integrations → MCP Server에서 활성 상태·기존 키 만료 여부 확인.
3. 기존 등록이 있으므로 새 키를 무조건 생성하거나 재발급하지 않음.
4. 공식 설정 URL은 인증 query를 포함하므로 복사한 URL을 채팅·명령 인자·스크린샷·로그에 노출하지 않음.
5. 실제 설정 변경이 필요할 때만 로컬 보안 편집으로 기존 Codex 서버 항목을 갱신.
6. 기존 디자인 파일을 열어 File → MCP Server → Connect. 활성 탭 하나와 현재 페이지를 유지.
7. Codex MCP 연결을 새로 시작한 뒤 현재 페이지/레이어를 읽는 도구만 실행.
8. 읽기 성공 여부와 파일/페이지 식별자만 기록. 디자인 쓰기는 3단계로 이관.

현재 세션에는 Penpot 도구가 노출되지 않았으므로 파일 연결만으로 해결된다고 단정하지 않습니다.
먼저 셸 네트워크 권한, 서버 인증, Codex의 MCP 시작 오류를 함께 확인해야 합니다.
Bearer 환경변수 지원은 Codex 기능이지만 Penpot query 인증을 임의로 Bearer로 바꾸지 않습니다.

## Local 대안

Remote 연결을 먼저 복구합니다. 필요할 때만 별도 이름으로 Local 연결을 검토하며 기존 Remote를 지우지 않습니다.
공식 Local 시작 명령은 npx.cmd -y @penpot/mcp@stable입니다.
기본 MCP 주소는 http://localhost:4401/mcp, 플러그인 manifest는 http://localhost:4400/manifest.json입니다.
Penpot → Plugins → Load from URL에서 manifest를 불러와 Connect합니다.
현재 네트워크 제한과 Node/패키지 호환성을 확인하기 전에는 Local 설치 성공으로 기록하지 않습니다.

## 갱신/오류 진단 순서

- 네트워크: 허용된 경로인지 확인. EACCES를 TLS 검증 해제로 우회하지 않음.
- 인증: 브라우저 로그인과 MCP/CLI 인증을 구분. 만료 여부는 공식 UI에서 확인.
- Penpot: 계정 Integrations 활성 상태 → 인증 URL 일치(비밀값 미출력) → 키 만료 → 활성 탭 → File 연결.
- 도구 미노출: Codex MCP 시작 오류 확인 및 연결/세션 재시작. 중복 서버를 먼저 추가하지 않음.
- Supabase: 기존 OAuth 갱신이 필요하면 Codex의 해당 서버 로그인 절차 사용. DB 비밀번호는 요구하지 않음.
- GitHub: 연결 플러그인 인증과 gh 인증을 구분. 네트워크 확인 후에만 gh auth login --web 검토.
- 키 유출이 의심되면 공식 Integrations에서 재발급하고 모든 기존 클라이언트를 갱신. 값은 기록하지 않음.

## 공식 문서

- https://developers.openai.com/codex/mcp
- https://help.penpot.app/mcp/
