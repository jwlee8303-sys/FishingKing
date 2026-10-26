# 게임 렌더러 경계

React는 페이지와 접근 가능한 UI, PixiJS는 게임 캔버스를 담당합니다.
3-08에서 scene.ts의 실제 배경/배스 Sprite, TexturePool의 URL별 공유 소유권,
InputController의 모의 명령과 GameCanvas 생명주기를 연결했습니다.

PixiJS8.22.0 공식 API를 확인했습니다. PixiJS8은 Application 생성 후
await app.init(options)로 비동기 초기화합니다. React StrictMode의 재마운트 및
초기화 중 언마운트를 고려하고, 자신의 canvas·ticker·이벤트·구독·GPU 자원을 정리합니다.
다른 씬이 사용하는 공유 텍스처는 무조건 파괴하지 않습니다.

실제 AI·낚시 물리·포획·보상·서버 판정은5단계 후속입니다.
사용법·입력·검사·실기기 미검증 범위는 docs/PHASE3_08_GAME_INTEGRATION.md를 따릅니다.
