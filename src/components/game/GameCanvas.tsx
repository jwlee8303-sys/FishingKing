import { useEffect, useRef, useState } from 'react'
import type { InputController } from '../../game/InputController'
type SceneModule = Pick<typeof import('../../game/scene'),'mountGameScene'>
const loadDefaultScene = () => import('../../game/scene')

export function GameCanvas({ input, loadScene = loadDefaultScene }: { input: InputController; loadScene?: () => Promise<SceneModule> }) {
  const host = useRef<HTMLDivElement>(null)
  const [status,setStatus] = useState<'loading'|'ready'|'fallback'|'error'>('loading')
  useEffect(() => {
    let cancelled = false
    let scene: { destroy(): void } | undefined
    // Lazy renderer import keeps normal pages and DOM-only tests independent of GPU APIs.
    if (typeof ResizeObserver !== 'undefined') {
      void loadScene().then(({ mountGameScene }) => {
        if (cancelled || !host.current) return
        scene = mountGameScene(host.current,input,{ onStatus: next => { if (!cancelled) setStatus(next) } })
      }).catch(() => { if (!cancelled) setStatus('error') })
    } else void Promise.resolve().then(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true; scene?.destroy() }
  },[input,loadScene])
  return <div ref={host} className="game-canvas" data-testid="game-canvas" data-state={status}>
    {status !== 'ready' && <span className="canvas-status" role="status">{status === 'loading' ? '낚시터 이미지 불러오는 중…' : status === 'fallback' ? '일부 이미지를 대체 표시하고 있어요' : '장면을 표시할 수 없어요 · 메뉴에서 나갈 수 있어요'}</span>}
  </div>
}
