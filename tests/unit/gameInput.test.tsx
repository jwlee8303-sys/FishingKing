import { afterEach, describe, expect, it } from 'vitest'
import { InputController, bindGameKeyboard, type GameCommand } from '../../src/game/InputController'
import { fireEvent, render, screen } from '@testing-library/react'
import { CastButton, ReelButton } from '../../src/components/game/GameControls'

afterEach(() => { document.body.innerHTML = '' })
function setup() { const input = new InputController(); const commands: GameCommand[] = []; input.subscribe(command => commands.push(command)); return { input,commands } }
describe('shared mock commands', () => {
  it('commits a cast once and ignores duplicate down/up', () => {
    const { input,commands } = setup()
    input.press('cast','p1','pointer'); input.press('cast','p1','pointer'); input.release('p1'); input.release('p1')
    expect(commands.map(c => c.type)).toEqual(['cast.start','cast.commit']); expect(input.state.casts).toBe(1)
  })
  it('cancels cast without committing a stale release', () => {
    const { input,commands } = setup()
    input.press('cast','p1','pointer'); input.cancel('rotation'); input.release('p1')
    expect(input.state.casts).toBe(0); expect(commands.map(c => c.type)).toEqual(['cast.start','cast.cancel','input.reset'])
    expect(commands.at(-1)?.inputEpoch).toBe(1)
  })
  it('holds reel until the owning input stops', () => {
    const { input,commands } = setup()
    input.press('reel','p1','pointer'); input.release('p2'); expect(input.state.reeling).toBe(true)
    input.release('p1',true,'cancel'); expect(input.state.reeling).toBe(false)
    expect(commands.map(c => c.type)).toEqual(['reel.start','reel.end'])
  })
  it('permits direction+action but excludes a second action/direction pointer', () => {
    const { input } = setup()
    expect(input.press('left','p1','pointer')).toBe(true)
    expect(input.press('reel','p2','pointer')).toBe(true)
    expect(input.press('cast','p3','pointer')).toBe(false)
    expect(input.press('right','p4','pointer')).toBe(false)
  })
  it('react preempts cast, never commits the old owner', () => {
    const { input,commands } = setup()
    input.press('cast','p1','pointer'); input.press('hook','p2','pointer'); input.release('p1')
    expect(commands.map(c => c.type)).toEqual(['cast.start','cast.cancel','react']); expect(input.state.hooks).toBe(1)
  })
  it('normalizes diagonals and cancels opposite keyboard axes', () => {
    const { input } = setup()
    input.press('left','a','keyboard'); input.press('up','w','keyboard')
    expect(Math.hypot(input.state.aimX,input.state.aimY)).toBeCloseTo(1)
    input.press('right','d','keyboard'); expect(input.state.aimX).toBe(0)
    input.cancel('blur'); expect(input.state.aimY).toBe(0)
  })
  it('clamps cast drag charge and ignores invalid/non-owner changes', () => {
    const { input } = setup()
    input.press('cast','p1','pointer'); input.aim('p1',10); expect(input.state.charge).toBe(1)
    input.aim('p1',-10); expect(input.state.charge).toBe(0)
    input.aim('p1',NaN); input.aim('other',0.8); expect(input.state.charge).toBe(0)
  })
  it('pauses, cancels and requires new input after resume', () => {
    const { input } = setup()
    input.press('reel','p1','pointer'); input.pause(true); expect(input.state.reeling).toBe(false)
    expect(input.press('cast','p2','keyboard')).toBe(false)
    input.pause(false); expect(input.state.casts).toBe(0); expect(input.press('cast','p2','keyboard')).toBe(true)
  })
  it.each(['pointer','keyboard','accessibility'] as const)('same command semantics for %s', source => {
    const { input,commands } = setup(); input.press('cast','owner',source); input.release('owner')
    expect(commands.map(c => c.type)).toEqual(['cast.start','cast.commit'])
    expect(commands.every(c => c.source === source)).toBe(true)
    expect(commands[1].sequence).toBeGreaterThan(commands[0].sequence)
  })
  it('binds shortcuts with repeat suppression and release', () => {
    const { input,commands } = setup(); const dispose = bindGameKeyboard(input)
    fireEvent.keyDown(window,{ code: 'KeyR' }); fireEvent.keyDown(window,{ code: 'KeyR',repeat: true }); expect(input.state.reeling).toBe(true)
    fireEvent.keyUp(window,{ code: 'KeyR' }); expect(input.state.reeling).toBe(false)
    expect(commands.map(c => c.type)).toEqual(['reel.start','reel.end']); dispose()
  })
  it.each(['blur','resize','visibilitychange','unmount'])('cancels on %s', reason => {
    const { input } = setup(); const dispose = bindGameKeyboard(input)
    fireEvent.keyDown(window,{ code: 'KeyR' })
    if (reason === 'unmount') dispose()
    else if (reason === 'visibilitychange') { Object.defineProperty(document,'hidden',{ configurable: true,value: true }); fireEvent(document,new Event('visibilitychange')); delete (document as unknown as { hidden?: boolean }).hidden }
    else fireEvent(window,new Event(reason))
    expect(input.state.reeling).toBe(false); dispose()
  })
  it('does not run shortcuts in forms, dialogs or with modifiers', () => {
    const { input,commands } = setup(); const dispose = bindGameKeyboard(input)
    const form = document.createElement('input'); document.body.append(form)
    fireEvent.keyDown(form,{ code: 'KeyC' }); fireEvent.keyDown(window,{ code: 'KeyC',ctrlKey: true })
    expect(commands).toHaveLength(0); dispose()
  })
  it('button keyboard cancellation never leaves reel held', () => {
    const { input } = setup()
    render(<ReelButton onVisual={(_,phase) => { if (phase === 'pressed') return input.press('reel','button','keyboard'); input.release('button',phase === 'cancelled') }} />)
    const button = screen.getByRole('button')
    fireEvent.keyDown(button,{ key: ' ' }); expect(input.state.reeling).toBe(true)
    fireEvent.blur(button); expect(input.state.reeling).toBe(false)
    fireEvent.keyUp(button,{ key: ' ' }); expect(input.state.reeling).toBe(false)
  })
  it('accessibility click produces a complete cast without native click duplication', () => {
    const { input } = setup()
    render(<CastButton onVisual={(_,phase) => { if (phase === 'pressed') return input.press('cast','button','accessibility'); input.release('button',phase === 'cancelled') }} />)
    const button = screen.getByRole('button')
    fireEvent.click(button,{ detail: 0 }); expect(input.state.casts).toBe(1)
    fireEvent.keyDown(button,{ key: 'Enter' }); fireEvent.keyUp(button,{ key: 'Enter' }); fireEvent.click(button,{ detail: 0 })
    expect(input.state.casts).toBe(2)
  })
  it('assigns a new activation ID to each reuse of a button owner', () => {
    const { input,commands } = setup()
    input.press('cast','same','pointer'); input.release('same'); input.press('cast','same','pointer'); input.release('same')
    expect(commands[0].activationId).toBe(commands[1].activationId)
    expect(commands[0].activationId).not.toBe(commands[2].activationId)
  })
  function pointer(button: HTMLElement,type: string,id: number,x = 10,y = 10) {
    const event = new Event(type,{ bubbles: true }); Object.assign(event,{ pointerId: id,button: 0,clientX: x,clientY: y }); fireEvent(button,event)
  }
  function pointerButton(kind: 'cast'|'reel') {
    const { input } = setup()
    const props = { onVisual: (_: string,phase: 'pressed'|'released'|'cancelled') => { if (phase === 'pressed') return input.press(kind,'button','pointer'); input.release('button',phase === 'cancelled') } }
    render(kind === 'cast' ? <CastButton {...props} /> : <ReelButton {...props} />)
    const button = screen.getByRole('button')
    Object.assign(button,{ setPointerCapture: () => {},hasPointerCapture: () => true,releasePointerCapture: () => {} })
    button.getBoundingClientRect = () => ({ left: 0,top: 0,right: 44,bottom: 44,width: 44,height: 44 } as DOMRect)
    return { input,button }
  }
  it('ignores another pointer up or capture loss while keeping the owner', () => {
    const { input,button } = pointerButton('reel')
    pointer(button,'pointerdown',1); pointer(button,'pointerdown',2); pointer(button,'pointerup',2); pointer(button,'lostpointercapture',2)
    expect(input.state.reeling).toBe(true)
    pointer(button,'lostpointercapture',1); expect(input.state.reeling).toBe(false)
  })
  it('cancels cast release outside and allows rearming before release', () => {
    const { input,button } = pointerButton('cast')
    pointer(button,'pointerdown',1); pointer(button,'pointermove',1,100,100); pointer(button,'pointerup',1,100,100)
    expect(input.state.casts).toBe(0)
    pointer(button,'pointerdown',2); pointer(button,'pointermove',2,100,100); pointer(button,'pointermove',2); pointer(button,'pointerup',2)
    expect(input.state.casts).toBe(1)
  })
  it('stops reel on button leave and never resumes on pointer reentry', () => {
    const { input,button } = pointerButton('reel')
    pointer(button,'pointerdown',1); pointer(button,'pointermove',1,100,100); pointer(button,'pointermove',1)
    expect(input.state.reeling).toBe(false)
  })
  it('cancels a release outside even when the browser did not deliver pointermove', () => {
    const { input,button } = pointerButton('cast')
    pointer(button,'pointerdown',1); pointer(button,'pointerup',1,100,100)
    expect(input.state.casts).toBe(0); expect(input.state.casting).toBe(false)
  })
  it('owns the native pointer default so WebKit mouse focus cannot cancel rapid clicks', () => {
    const { input,button } = pointerButton('cast')
    for(let i=0;i<10;i++) {
      const down=new Event('pointerdown',{ bubbles: true,cancelable: true }); Object.assign(down,{ pointerId: 1,button: 0,clientX: 10,clientY: 10 })
      fireEvent(button,down); expect(down.defaultPrevented).toBe(true)
      pointer(button,'pointerup',1)
    }
    expect(input.state.casts).toBe(10)
  })
})
