# 게임 렌더러 경계

React는 페이지와 접근 가능한 UI, PixiJS는 향후 게임 캔버스를 담당합니다.
현재 타입 경계의 TypeScript 검사는 통과했으며 실제 렌더링은 이번 범위에 포함하지 않습니다.

5단계에서 설치한 버전의 공식 API를 재확인합니다. PixiJS 8은 Application 생성 후
await app.init(options)로 비동기 초기화합니다. React StrictMode의 재마운트 및
초기화 중 언마운트를 고려하고, 자신의 canvas·ticker·이벤트·구독·GPU 자원을 정리합니다.
다른 씬이 사용하는 공유 텍스처는 무조건 파괴하지 않습니다.
