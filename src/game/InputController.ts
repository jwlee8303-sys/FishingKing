export type InputAction = 'cast' | 'reel' | 'hook' | 'up' | 'down' | 'left' | 'right'
export type InputSource = 'pointer' | 'keyboard' | 'accessibility'
export interface GameCommand {
  readonly type: 'cast.start' | 'cast.aim' | 'cast.commit' | 'cast.cancel' | 'reel.start' | 'reel.end' | 'move' | 'react' | 'input.reset'
  readonly sequence: number
  readonly inputEpoch: number
  readonly timestamp: number
  readonly source: InputSource
  readonly activationId?: string
  readonly x?: number
  readonly y?: number
  readonly charge?: number
  readonly reason?: string
}
export interface DemoState { casting: boolean; reeling: boolean; aimX: number; aimY: number; charge: number; casts: number; hooks: number; paused: boolean }
const vectors = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] } as const

/** DOM-free mock command boundary. No capture, rewards, persistence, or physics. */
export class InputController {
  readonly state: DemoState = { casting: false, reeling: false, aimX: 0, aimY: 0, charge: 0, casts: 0, hooks: 0, paused: false }
  private owners = new Map<string, { action: InputAction; source: InputSource; activationId: string }>()
  private listeners = new Set<(command: GameCommand) => void>()
  private sequence = 0
  private epoch = 0
  subscribe(listener: (command: GameCommand) => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private emit(type: GameCommand['type'], source: InputSource, extra: Partial<GameCommand> = {}): void {
    const command = Object.freeze({ type, source, sequence: ++this.sequence, inputEpoch: this.epoch, timestamp: performance.now(), ...extra })
    for (const listener of this.listeners) listener(command)
  }
  press(action: InputAction, owner: string, source: InputSource): boolean {
    if (this.state.paused || this.owners.has(owner)) return false
    const direction = action in vectors
    const active = [...this.owners.values()]
    if (direction && active.some(value => value.action in vectors && (source !== 'keyboard' || value.source !== 'keyboard'))) return false
    if (!direction && active.some(value => !(value.action in vectors))) {
      if (action !== 'hook') return false
      for (const [key,value] of this.owners) if (!(value.action in vectors)) this.release(key, true, 'react-preempt')
    }
    const activationId = `${this.epoch}:${this.sequence+1}:${owner}`
    this.owners.set(owner, { action, source, activationId })
    if (direction) this.move(source)
    else if (action === 'cast') { this.state.casting = true; this.state.charge = 0; this.emit('cast.start',source,{ activationId }) }
    else if (action === 'reel') { this.state.reeling = true; this.emit('reel.start',source,{ activationId }) }
    else { this.state.hooks++; this.emit('react',source,{ activationId }) }
    return true
  }
  release(owner: string, cancelled = false, reason = 'release'): void {
    const owned = this.owners.get(owner)
    if (!owned) return
    this.owners.delete(owner)
    const { action,source,activationId } = owned
    if (action in vectors) this.move(source)
    else if (action === 'cast') { this.state.casting = false; if (!cancelled) this.state.casts++; this.emit(cancelled ? 'cast.cancel' : 'cast.commit',source,{ activationId, charge: this.state.charge, reason }) }
    else if (action === 'reel') { this.state.reeling = false; this.emit('reel.end',source,{ activationId, reason }) }
  }
  aim(owner: string, charge: number): void {
    if (this.owners.get(owner)?.action !== 'cast' || !Number.isFinite(charge)) return
    this.state.charge = Math.max(0,Math.min(1,charge))
    this.emit('cast.aim',this.owners.get(owner)!.source,{ activationId: this.owners.get(owner)!.activationId, charge: this.state.charge })
  }
  private move(source: InputSource): void {
    let x = 0, y = 0
    for (const { action } of this.owners.values()) if (action in vectors) { const vector = vectors[action as keyof typeof vectors]; x += vector[0]; y += vector[1] }
    const length = Math.max(1,Math.hypot(x,y))
    this.state.aimX = x / length; this.state.aimY = y / length
    this.emit('move',source,{ x: this.state.aimX, y: this.state.aimY })
  }
  cancel(reason: string): void {
    for (const owner of [...this.owners.keys()]) this.release(owner,true,reason)
    this.epoch++
    this.emit('input.reset','accessibility',{ reason })
  }
  pause(paused: boolean): void { this.state.paused = paused; if (paused) this.cancel('pause'); else this.emit('input.reset','accessibility',{ reason: 'resume' }) }
}

const keys: Record<string,InputAction> = { KeyC: 'cast', KeyR: 'reel', KeyE: 'hook', KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' }
export function bindGameKeyboard(controller: InputController, target: Window = window): () => void {
  const editable = (element: EventTarget | null) => element instanceof HTMLElement && (!!element.closest('input,textarea,select,[contenteditable=true],[role=dialog]'))
  const down = (event: KeyboardEvent) => {
    const action = keys[event.code]
    if (!action || event.repeat || event.altKey || event.ctrlKey || event.metaKey || editable(event.target)) return
    event.preventDefault(); controller.press(action,`key:${event.code}`,'keyboard')
  }
  const up = (event: KeyboardEvent) => { if (keys[event.code]) controller.release(`key:${event.code}`) }
  const blur = () => { controller.cancel('blur'); target.dispatchEvent(new Event('fishingking:reset-visuals')) }
  const hidden = () => { if (document.hidden) blur() }
  const resize = () => { controller.cancel('resize'); target.dispatchEvent(new Event('fishingking:reset-visuals')) }
  target.addEventListener('keydown',down); target.addEventListener('keyup',up); target.addEventListener('blur',blur); target.addEventListener('resize',resize)
  document.addEventListener('visibilitychange',hidden)
  return () => { target.removeEventListener('keydown',down); target.removeEventListener('keyup',up); target.removeEventListener('blur',blur); target.removeEventListener('resize',resize); document.removeEventListener('visibilitychange',hidden); controller.cancel('unmount') }
}
