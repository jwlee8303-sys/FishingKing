# FishingKing 그래픽 출처 — 3-05

제작일: 2026-10-25. 이번 프로젝트용으로 새로 제작했으며 외부 이미지 파일을 복제하지 않았습니다.

| 파일 | 제작 방식 | 상태 |
| --- | --- | --- |
| source/bass-main.png | 내장 image_gen, 투명 배경 배스 측면 원화 | AI 생성 기본 그래픽 v1 후보 |
| source/lake-day.png | 내장 image_gen, 가로 호수 주간 배경 | AI 생성 기본 그래픽 v1 후보 |
| source/lake-day-mobile.png | 내장 image_gen, 세로 전용 별도 구도 | AI 생성 기본 그래픽 v1 후보 |
| ../public/assets/icons/*.svg | Codex가 기초 도형/path로 직접 작성 | 프로젝트 자체 제작 아이콘 |
| ../public/assets/placeholders/image-missing.svg | Codex가 직접 작성 | 의도된 이미지 누락 대체 표시 |

원본 프롬프트 3개는 [prompts.json](prompts.json)에 있습니다. 외부 참조 이미지·특정 작가 스타일·상표·폰트는 사용하지 않았습니다.
생성 도구는 내장 image_gen이며 CLI/API fallback·별도 API 키·새 유료 서비스는 사용하지 않았습니다. 모델 세부 버전은 도구에서 제공되지 않았습니다.
원본 PNG는 public 밖에 보관하며 변환 스크립트는 원본을 수정하지 않습니다. 배포용 WebP는 원본으로부터 Sharp로 리사이즈·인코딩했습니다.

사용 권한의 근거는 실제 이용 계정에 적용되는 OpenAI 계약입니다.
개인용 [이용약관의 Content 절](https://openai.com/policies/row-terms-of-use/)은 적용 법률이 허용하는 범위에서 사용자와 OpenAI 사이의 출력 소유를 규정하며,
기업 계정은 해당 [Business Terms](https://openai.com/policies/business-terms/)를 따릅니다. 출력의 독점성이나 별도 저작권 등록을 보장한다고 해석하지 않습니다.
프로젝트 SVG는 외부 아이콘 라이브러리를 복사한 것이 아니며 저장소의 다른 코드·에셋과 함께 관리합니다.

이 원화는 기능 없는 CSS 임시 도형과 구분되는 실제 PNG/WebP 그래픽입니다. 기술 검증은 완료했으며 최종 아트 스타일·배스 형태의 생물학적 정확성 확정은 후속 검수 대상입니다.
기존 3-04 화면의 CSS 플레이스홀더는 보존했고, 이 단계에서 후보 원화를 실제 게임 장면에 연결하지 않았습니다.
