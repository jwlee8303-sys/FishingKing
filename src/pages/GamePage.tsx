import { PagePlaceholder } from '../components/PagePlaceholder'
import { useState } from 'react'
import { Link } from 'react-router'
import { AssetVisual } from '../components/AssetVisual'
import { CastButton,DirectionControl,GameHUD,HookButton,ReelButton } from '../components/game/GameControls'
import { Modal,PrimaryButton,SecondaryButton } from '../components/ui'
import { navigation } from '../components/layout/navigation'

export function GamePage() {
  const [menu,setMenu]=useState(false)
  const [scene,setScene]=useState<'normal'|'bite'|'loading'|'error'>('normal')
  const [status,setStatus]=useState('방향과 행동 버튼을 눌러 화면을 체험하세요.')
  const visual=(label: string,phase: 'pressed'|'released'|'cancelled') => {
    setStatus(phase==='cancelled'? '입력 표시 취소됨 · 다시 눌러 시작':phase==='pressed'? `${label==='릴 감기'? '감는 중 · 손을 떼면 종료':`${label} 누르는 중`} · UI 시연`:`${label} 표시 해제 · 실제 판정 없음`)
  }
  const openMenu=() => { window.dispatchEvent(new Event('fishingking:reset-visuals')); setStatus('입력 표시 해제됨 · 메뉴 열림'); setMenu(true) }
  const disabled=menu||scene==='loading'||scene==='error'
  return (
    <div className="game-shell">
      <h1 className="sr-only">낚시</h1>
      <GameHUD onMenu={openMenu} status={status} />
      <div className="game-scene" data-testid="game-scene">
        <AssetVisual scene alt="낚시 게임 표시 영역 · 그래픽 준비 중" />{scene==='bite'&&<div className="scene-alert" role="status">！ 입질 신호 · 입질반응을 눌러보세요</div>}{(scene==='loading'||scene==='error')&&<div className="scene-overlay">
          <div className="text-sm text-fk-primary">UI 상태 시연</div>
          <h2 className="text-lg font-bold">{scene==='loading'? '낚시터 준비 중…':'장면을 불러오지 못했어요'}</h2>
          <SecondaryButton onClick={() => setScene('normal')}>{scene==='loading'? '시연 종료':'재시도'}</SecondaryButton>
          <Link to="/" className="button button-secondary">나가기</Link>
        </div>}</div>
      <p className="game-status" role="status" aria-live="polite">{status}</p>
      <div className="game-controls">
        <DirectionControl disabled={disabled} onVisual={visual} />
        <div className="action-control" role="group" aria-label="행동 조작">
          <CastButton disabled={disabled} onVisual={visual} />
          <ReelButton disabled={disabled} onVisual={visual} />
          <HookButton disabled={disabled} onVisual={visual} />
          <SecondaryButton className="game-button" onClick={openMenu}>메뉴</SecondaryButton>
        </div>
      </div>
      <aside className="game-side-help">
        <h2 className="font-bold text-fk-text">잠시, 물가에서</h2>
        <p className="mt-3">버튼을 누르고 놓으며 표시를 체험하세요. 릴 감기는 누르는 동안 표시됩니다.</p>
        <p className="mt-3">Tab · Enter · Space로도 버튼을 사용할 수 있어요.</p>
        <p className="mt-3">물고기 판정과 게임 입력은 아직 연결되지 않았어요.</p>
      </aside>
      <Modal open={menu} title="잠시 쉬어가기" onClose={() => { setMenu(false); setStatus('준비 · 새로운 입력으로 시작하세요.') }}>
        <p className="text-fk-muted mb-5">입력 표시는 해제됐어요. 화면을 이동하면 이 시연 상태는 초기화됩니다.</p>
        <PrimaryButton className="w-full mb-5" onClick={() => { setMenu(false); setStatus('준비 · 새로운 입력으로 시작하세요.') }}>계속하기</PrimaryButton>
        <nav aria-label="게임 메뉴" className="game-menu-links">{navigation.filter(n => n.to!=='/game').map(n => <Link className="button button-secondary" key={n.to} to={n.to}>{n.label}</Link>)}<Link className="button button-secondary" to="/login">로그인</Link>
        </nav>
        <details className="preview-tools">
          <summary>화면 상태 미리보기</summary>
          <div className="mt-3 flex flex-wrap gap-2">{(['normal','bite','loading','error'] as const).map((s,i) => <SecondaryButton key={s} onClick={() => { setScene(s); setMenu(false); setStatus('UI 상태 시연 · 실제 판정 없음') }}>{['준비','입질 신호','로딩','오류'][i]}</SecondaryButton>)}</div>
        </details>
        <details className="preview-tools">
          <summary>준비 상태 안내</summary>
          <PagePlaceholder headingLevel="h3" title="게임 준비 안내" description="실제 낚시 게임은 후속 단계에서 연결합니다. 현재는 화면 시연입니다." />
        </details>
      </Modal>
    </div>
  )
}
