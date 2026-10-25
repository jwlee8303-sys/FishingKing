# 외부 서비스 경계

앱 런타임의 API·인증·DB·동적 업로드는 아직 구현하지 않았습니다. MCP/CLI 연결 검증과 구분합니다.

정적 에셋 경로는 assets.ts의 getAssetUrl에서 관리합니다.
예: getAssetUrl('fish/carp.v1.webp') → 기본 /assets/fish/carp.v1.webp.
이는 사용 예이며 해당 물고기 파일이 현재 존재한다는 뜻은 아닙니다.

파일은 public/assets의 기존 images·fish·backgrounds·icons·audio에 저장하고 GitHub → Vite 빌드 → 기존 Pages로 제공합니다.
기본값은 현재 앱의 BASE_URL + assets/입니다. 기존 선택 변수 VITE_ASSET_BASE_URL은 기본으로 비워 둡니다.
향후 사용자 승인 후 제공자를 옮길 때 공개 에셋 base URL만 바꾸고 상대 경로는 보존합니다.
변수에는 공개 URL만 허용하며 토큰/서명 URL/비밀키는 넣지 않습니다.

R2는 과금 방지를 위해 의도적으로 보류합니다. Supabase Storage Free는 동적 파일이 필요할 때만 검토하며
현재 버킷·업로드·RLS·유료 이미지 변환은 연결하지 않았습니다.
유료 전환·결제 등록·자동 과금 가능 기능은 사용자 승인 전에 활성화하지 않습니다.
