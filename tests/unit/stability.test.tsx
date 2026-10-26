import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { InputController, type GameCommand } from '../../src/game/InputController'
import { TexturePool } from '../../src/game/TexturePool'
import { PrimaryButton, Modal } from '../../src/components/ui'
import { useState } from 'react'

describe('stability contracts', () => {
  it('ignores old owners after reset without terminating a new activation', () => {
    const input = new InputController(), commands: GameCommand[] = []
    input.subscribe(command => commands.push(command))
    input.press('reel','old','pointer'); input.cancel('rotation')
    input.press('reel','new','pointer'); input.release('old')
    expect(input.state.reeling).toBe(true)
    input.release('new'); expect(input.state.reeling).toBe(false)
    expect(commands.map(command => command.sequence)).toEqual([1,2,3,4,5])
    expect(commands[3].inputEpoch).toBeGreaterThan(commands[0].inputEpoch)
    expect(commands[3].activationId).not.toBe(commands[0].activationId)
  })
  it('100 repeated activation pairs leave no active cast, reel or direction', () => {
    const input = new InputController()
    for(let i=0;i<100;i++) {
      input.press(i%2?'cast':'reel',`action-${i}`,'pointer')
      input.press('left',`direction-${i}`,'pointer')
      input.release(`action-${i}`); input.release(`direction-${i}`)
    }
    expect(input.state).toMatchObject({ casting: false,reeling: false,aimX: 0,aimY: 0,casts: 50 })
  })
  it('16 consumers and duplicate releases cannot make references negative', async () => {
    const unload = vi.fn(async () => {})
    const pool = new TexturePool(async () => ({}),unload)
    const leases = await Promise.all(Array.from({ length: 16 },() => pool.acquire('/shared.webp')))
    expect(pool.snapshot()).toMatchObject({ entries: 1,references: 16 })
    for(const lease of leases) { lease.release(); lease.release(); expect(pool.snapshot().references).toBeGreaterThanOrEqual(0) }
    await vi.waitFor(() => expect(pool.snapshot()).toEqual({ entries: 0,references: 0,disposing: 0 }))
    expect(unload).toHaveBeenCalledTimes(1)
  })
  it('unload errors settle ownership and permit a clean retry', async () => {
    const pool = new TexturePool(async () => ({}),async () => { throw new Error('fixture-unload') })
    const first = await pool.acquire('/retry.webp'); first.release()
    await vi.waitFor(() => expect(pool.snapshot().entries).toBe(0))
    const next = await pool.acquire('/retry.webp'); expect(pool.snapshot().references).toBe(1); next.release()
    await vi.waitFor(() => expect(pool.snapshot().entries).toBe(0))
  })
  it('button focuses its click trigger before opening a dialog', () => {
    const open = vi.fn()
    render(<PrimaryButton onClick={event => open(event.currentTarget===document.activeElement)}>open</PrimaryButton>)
    fireEvent.click(screen.getByRole('button'))
    expect(open).toHaveBeenCalledWith(true)
  })
  it('dialog close restores the explicit click trigger', () => {
    const prototype=HTMLDialogElement.prototype
    const originalShow=Object.getOwnPropertyDescriptor(prototype,'showModal'), originalClose=Object.getOwnPropertyDescriptor(prototype,'close')
    Object.defineProperty(prototype,'showModal',{ configurable: true,value: function(this: HTMLDialogElement) { this.open=true } })
    Object.defineProperty(prototype,'close',{ configurable: true,value: function(this: HTMLDialogElement) { this.open=false } })
    function Fixture() { const [open,setOpen]=useState(false); return <MemoryRouter><PrimaryButton onClick={() => setOpen(true)}>open</PrimaryButton><Modal open={open} title="fixture" onClose={() => setOpen(false)}>body</Modal></MemoryRouter> }
    const view=render(<Fixture />)
    try { const trigger=screen.getByRole('button',{ name: 'open' }); fireEvent.click(trigger); fireEvent.click(screen.getByRole('button',{ name: '닫기' })); expect(trigger).toHaveFocus() }
    finally {
      view.unmount()
      if(originalShow) Object.defineProperty(prototype,'showModal',originalShow); else delete (prototype as Partial<HTMLDialogElement>).showModal
      if(originalClose) Object.defineProperty(prototype,'close',originalClose); else delete (prototype as Partial<HTMLDialogElement>).close
    }
  })
})
