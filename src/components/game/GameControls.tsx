import { useEffect,useRef,useState } from 'react'
import type { CSSProperties,PointerEvent } from 'react'
import { PrimaryButton,SecondaryButton } from '../ui'
import type { InputSource } from '../../game/InputController'

interface VisualButtonProps { label: string; disabled?: boolean; onVisual: (label: string,phase: 'pressed'|'released'|'cancelled',source?: InputSource) => boolean | void; onAim?: (label: string,charge: number) => void; style?: CSSProperties; direction?: boolean }
function VisualButton({ label,onVisual,onAim,disabled,style,direction=false }: VisualButtonProps) {
  const [pressed,setPressed]=useState(false)
  const owner=useRef<number|'keyboard'|null>(null)
  const armed=useRef(true)
  const suppressClick=useRef(false)
  const stop=(cancelled: boolean) => {
    if(owner.current===null) return
    owner.current=null
    setPressed(false)
    onVisual(label,cancelled? 'cancelled':'released')
  }
  useEffect(() => {
    const reset=() => { if(owner.current!==null) { owner.current=null; setPressed(false); onVisual(label,'cancelled') } }
    const hidden=() => { if(document.hidden) reset() }
    window.addEventListener('blur',reset)
    window.addEventListener('resize',reset)
    window.visualViewport?.addEventListener('resize',reset)
    window.visualViewport?.addEventListener('scroll',reset)
    window.addEventListener('fishingking:reset-visuals',reset)
    const preempt=() => { if(label==='캐스팅'||label==='릴 감기') reset() }
    window.addEventListener('fishingking:reset-actions',preempt)
    document.addEventListener('visibilitychange',hidden)
    return () => { window.removeEventListener('blur',reset); window.removeEventListener('resize',reset); window.visualViewport?.removeEventListener('resize',reset); window.visualViewport?.removeEventListener('scroll',reset); window.removeEventListener('fishingking:reset-visuals',reset); window.removeEventListener('fishingking:reset-actions',preempt); document.removeEventListener('visibilitychange',hidden) }
  },[label,onVisual])
  const finish=(event: PointerEvent<HTMLButtonElement>,cancelled: boolean) => {
    if(owner.current!==event.pointerId) return
    const rect=event.currentTarget.getBoundingClientRect()
    const outside=event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom
    stop(cancelled||!armed.current||(label==='캐스팅'&&outside))
    if(event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  return (
    <PrimaryButton className={direction? 'button-secondary':'game-button'} style={style} disabled={disabled} aria-label={label} aria-pressed={pressed} data-pressed={pressed}
      onPointerDown={event => {
        if(event.button!==0) return
        // WebKit's native mouse-down can blur an already focused button after
        // pointerdown. Direct controls own the gesture; keep that default from
        // cancelling a newly accepted activation during rapid clicks.
        event.preventDefault()
        if(owner.current!==null) return
        if(onVisual(label,'pressed')===false) return
        owner.current=event.pointerId
        armed.current=true
        event.currentTarget.setPointerCapture?.(event.pointerId)
        setPressed(true)
      }}
      onPointerMove={event => {
        if(owner.current!==event.pointerId) return
        const rect=event.currentTarget.getBoundingClientRect()
        const inside=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom
        if(label==='캐스팅') { armed.current=inside; setPressed(inside); onAim?.(label,Math.max(0,Math.min(1,(rect.bottom-event.clientY)/rect.height))) }
        else if(!inside) finish(event,true)
      }}
      onPointerUp={event => finish(event,false)} onPointerCancel={event => finish(event,true)} onLostPointerCapture={event => { if(owner.current===event.pointerId) stop(true) }}
      onKeyDown={event => { if(event.key===' '||event.key==='Enter') { event.preventDefault(); if(event.repeat||owner.current!==null) return; suppressClick.current=true; if(onVisual(label,'pressed','keyboard')===false) return; owner.current='keyboard'; armed.current=true; setPressed(true) } }}
      onKeyUp={event => { if(event.key===' '||event.key==='Enter') { event.preventDefault(); stop(false); queueMicrotask(() => { suppressClick.current=false }) } }}
      onBlur={() => { suppressClick.current=false; stop(true) }}
      onClick={event => { if(suppressClick.current) { suppressClick.current=false; return } if(event.detail===0&&owner.current===null) { if(onVisual(label,'pressed','accessibility')!==false) onVisual(label,'released') } }}
    >{direction? { 위: '↑',아래: '↓',왼쪽: '←',오른쪽: '→' }[label]:label}</PrimaryButton>
  )
}
export function CastButton(props: Omit<VisualButtonProps,'label'>) {
  return (
    <VisualButton {...props} label="캐스팅" />
  )
}
export function ReelButton(props: Omit<VisualButtonProps,'label'>) {
  return (
    <VisualButton {...props} label="릴 감기" />
  )
}
export function HookButton(props: Omit<VisualButtonProps,'label'>) {
  return (
    <VisualButton {...props} label="입질반응" />
  )
}
export function DirectionControl(props: Omit<VisualButtonProps,'label'>) {
  return (
    <div className="direction-control" role="group" aria-label="방향 조작">{[{ label: '위',column: 2,row: 1 },{ label: '왼쪽',column: 1,row: 2 },{ label: '오른쪽',column: 3,row: 2 },{ label: '아래',column: 2,row: 3 }].map(d => <VisualButton key={d.label} {...props} direction label={d.label} style={{ gridColumn: d.column,gridRow: d.row }} />)}</div>
  )
}
export function GameHUD({ onMenu,status }: { onMenu: () => void; status: string }) {
  return (
    <header className="game-hud">
      <div>
        <strong className="text-fk-primary">UI 시연 · 낚시</strong>
        <p className="hud-subtitle">비회원 · 포획 판정 없음</p>
        <p className="hud-compact-status" aria-hidden="true">{status}</p>
      </div>
      <SecondaryButton onClick={onMenu}>메뉴</SecondaryButton>
    </header>
  )
}
