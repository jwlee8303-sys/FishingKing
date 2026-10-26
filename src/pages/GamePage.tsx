import { PagePlaceholder } from '../components/PagePlaceholder'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { GameCanvas } from '../components/game/GameCanvas'
import { InputController, bindGameKeyboard, type InputAction, type InputSource } from '../game/InputController'
import { CastButton,DirectionControl,GameHUD,HookButton,ReelButton } from '../components/game/GameControls'
import { Modal,PrimaryButton,SecondaryButton } from '../components/ui'
import { navigation } from '../components/layout/navigation'

export function GamePage() {
  const [input]=useState(() => new InputController())
  const [menu,setMenu]=useState(false)
  const [scene,setScene]=useState<'normal'|'bite'|'loading'|'error'>('normal')
  const [status,setStatus]=useState('방향과 행동 버튼을 눌러 화면을 체험하세요.')
  useEffect(() => {
    const unsubscribe=input.subscribe(command => {
      if(command.source==='keyboard'||command.type==='input.reset') setStatus(command.type==='reel.start'? '감는 중 · 손을 떼면 종료 · UI 시연':command.type==='input.reset'? '입력 표시 취소됨 · 다시 눌러 시작':`${command.type==='cast.commit'? '캐스팅 표시 해제':command.type==='react'? '입질 반응':command.type==='move'? '방향 변경':'키보드 모의 조작'} · 실제 판정 없음`)
    })
    const dispose=bindGameKeyboard(input)
    return () => { unsubscribe(); dispose() }
  },[input])
  const visual=useCallback((label: string,phase: 'pressed'|'released'|'cancelled',source: InputSource = 'pointer') => {
    const actions: Record<string,InputAction>={ '캐스팅': 'cast','릴 감기': 'reel','입질반응': 'hook','위': 'up','아래': 'down','왼쪽': 'left','오른쪽': 'right' }
    if(phase==='pressed') {
      if(label==='입질반응') window.dispatchEvent(new Event('fishingking:reset-actions'))
      if(!input.press(actions[label],`button:${label}`,source)) return false
    } else input.release(`button:${label}`,phase==='cancelled')
    setStatus(phase==='cancelled'? '입력 표시 취소됨 · 다시 눌러 시작':phase==='pressed'? `${label==='릴 감기'? '감는 중 · 손을 떼면 종료':`${label} 누르는 중`} · UI 시연`:`${label} 표시 해제 · 실제 판정 없음`)
    return true
  },[input])
  const openMenu=() => { input.pause(true); window.dispatchEvent(new Event('fishingking:reset-visuals')); setStatus('입력 표시 해제됨 · 메뉴 열림'); setMenu(true) }
  const disabled=menu||scene==='loading'||scene==='error'
  const resume=() => { input.pause(false); setMenu(false); setStatus('준비 · 새로운 입력으로 시작하세요.') }
  return (
    <div className="game-shell">
      <h1 className="sr-only">낚시</h1>
      <GameHUD onMenu={openMenu} status={status} />
      <div className="game-scene" data-testid="game-scene">
        <GameCanvas input={input} />{scene==='bite'&&<div className="scene-alert" role="status">！ 입질 신호 · 입질반응을 눌러보세요</div>}{(scene==='loading'||scene==='error')&&<div className="scene-overlay">
          <div className="text-sm text-fk-primary">UI 상태 시연</div>
          <h2 className="text-lg font-bold">{scene==='loading'? '낚시터 준비 중…':'장면을 불러오지 못했어요'}</h2>
          <SecondaryButton onClick={() => { setScene('normal'); input.pause(false) }}>{scene==='loading'? '시연 종료':'재시도'}</SecondaryButton>
          <Link to="/" className="button button-secondary">나가기</Link>
        </div>}</div>
      <p className="game-status" role="status" aria-live="polite">{status}</p>
      <div className="game-controls">
        <DirectionControl disabled={disabled} onVisual={visual} />
        <div className="action-control" role="group" aria-label="행동 조작">
          <CastButton disabled={disabled} onVisual={visual} onAim={(_,charge) => input.aim('button:캐스팅',charge)} />
          <ReelButton disabled={disabled} onVisual={visual} />
          <HookButton disabled={disabled} onVisual={visual} />
          <SecondaryButton className="game-button" onClick={openMenu}>메뉴</SecondaryButton>
        </div>
      </div>
      <aside className="game-side-help">
        <h2 className="font-bold text-fk-text">잠시, 물가에서</h2>
        <p className="mt-3">버튼을 누르고 놓으며 표시를 체험하세요. 릴 감기는 누르는 동안 표시됩니다.</p>
        <p className="mt-3">C 캐스팅 · R 릴 · E 입질 · WASD/방향키. Tab · Enter · Space로도 버튼을 사용할 수 있어요.</p>
        <p className="mt-3">이미지와 모의 입력을 연결했어요. 실제 포획 판정은 아직 없어요.</p>
      </aside>
      <Modal open={menu} title="잠시 쉬어가기" onClose={resume}>
        <p className="text-fk-muted mb-5">입력 표시는 해제됐어요. 화면을 이동하면 이 시연 상태는 초기화됩니다.</p>
        <PrimaryButton className="w-full mb-5" onClick={resume}>계속하기</PrimaryButton>
        <nav aria-label="게임 메뉴" className="game-menu-links">{navigation.filter(n => n.to!=='/game').map(n => <Link className="button button-secondary" key={n.to} to={n.to}>{n.label}</Link>)}<Link className="button button-secondary" to="/login">로그인</Link>
        </nav>
        <details className="preview-tools">
          <summary>화면 상태 미리보기</summary>
          <div className="mt-3 flex flex-wrap gap-2">{(['normal','bite','loading','error'] as const).map((s,i) => <SecondaryButton key={s} onClick={() => { setScene(s); setMenu(false); input.pause(s==='loading'||s==='error'); setStatus('UI 상태 시연 · 실제 판정 없음') }}>{['준비','입질 신호','로딩','오류'][i]}</SecondaryButton>)}</div>
        </details>
        <details className="preview-tools">
          <summary>준비 상태 안내</summary>
          <PagePlaceholder headingLevel="h3" title="게임 준비 안내" description="실제 낚시 게임은 후속 단계에서 연결합니다. 현재는 화면 시연입니다." />
        </details>
      </Modal>
    </div>
  )
}
