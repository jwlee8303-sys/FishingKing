import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { InputController } from '../../src/game/InputController'
const mocks = vi.hoisted(() => ({ apps: [] as { destroy: ReturnType<typeof vi.fn>; renderer: { resize: ReturnType<typeof vi.fn> }; canvas: HTMLCanvasElement; stage: { children: unknown[] }; ticker: { add: ReturnType<typeof vi.fn> } }[], load: vi.fn(), unload: vi.fn(), init: vi.fn(), observer: undefined as undefined | (() => void) }))
vi.mock('pixi.js',() => ({
  Assets: { load: mocks.load,unload: mocks.unload,setPreferences: vi.fn() },
  Texture: class {},
  Sprite: class {
    texture: { width: number; height: number }
    anchor = { set: vi.fn() }; scale = { set: vi.fn() }; position = { set: vi.fn() }
    constructor(texture: { width: number; height: number }) { this.texture = texture }
  },
  Application: class {
    canvas = document.createElement('canvas')
    renderer = { resize: vi.fn() }
    stage = { children: [] as unknown[],addChild: (sprite: unknown) => this.stage.children.push(sprite),addChildAt: (sprite: unknown) => this.stage.children.unshift(sprite) }
    ticker = { add: vi.fn(),maxFPS: 0 }
    start = vi.fn(); stop = vi.fn(); destroy = vi.fn(() => this.canvas.remove())
    constructor() { mocks.apps.push(this) }
    async init() { await mocks.init() }
  },
}))
import { mountGameScene } from '../../src/game/scene'

let mounts: ReturnType<typeof mountGameScene>[] = []
beforeEach(() => {
  mocks.apps.length = 0; mocks.init.mockResolvedValue(undefined); mocks.load.mockImplementation(async () => ({ width: 1024,height: 512 })); mocks.unload.mockResolvedValue(undefined)
  vi.stubGlobal('ResizeObserver',class { constructor(callback: () => void) { mocks.observer = callback } observe() {} disconnect() {} })
  Object.defineProperty(window,'innerWidth',{ configurable: true,value: 390 }); Object.defineProperty(window,'innerHeight',{ configurable: true,value: 844 })
})
afterEach(async () => { for (const mount of mounts) mount.destroy(); mounts = []; await Promise.resolve(); vi.clearAllMocks(); vi.unstubAllGlobals() })
function setup() {
  const host = document.createElement('div'); document.body.append(host)
  host.getBoundingClientRect = () => ({ width: 300,height: 400 } as DOMRect)
  const input = new InputController(), status = vi.fn()
  const scene = mountGameScene(host,input,{ onStatus: status }); mounts.push(scene)
  return { host,input,status,scene }
}
describe('Pixi scene lifecycle and variant races', () => {
  it('initializes one canvas and loads background + fish through resolver', async () => {
    const { host,status,scene } = setup(); await scene.ready
    await waitFor(() => expect(status).toHaveBeenCalledWith('ready'))
    expect(host.querySelectorAll('canvas')).toHaveLength(1)
    expect(mocks.load).toHaveBeenCalledWith(expect.stringContaining('/assets/backgrounds/lake-day-mobile.webp'))
    expect(mocks.load).toHaveBeenCalledWith(expect.stringContaining('/assets/fish/bass-main.webp'))
    expect(mocks.apps[0].stage.children).toHaveLength(2)
  })
  it('resizes container and preserves demo state on rotation', async () => {
    const { host,input,scene } = setup(); await scene.ready
    input.press('cast','p','pointer'); input.release('p')
    Object.defineProperty(window,'innerWidth',{ configurable: true,value: 844 }); Object.defineProperty(window,'innerHeight',{ configurable: true,value: 390 })
    mocks.observer?.()
    await waitFor(() => expect(host.dataset.metrics).toContain('backgrounds/lake-day.webp'))
    expect(input.state.casts).toBe(1); expect(mocks.apps).toHaveLength(1)
    expect(mocks.apps[0].renderer.resize).toHaveBeenCalledWith(300,400,1)
  })
  it('discards an old portrait result arriving after landscape', async () => {
    let portrait!: (value: { width: number; height: number }) => void
    mocks.load.mockImplementation(async (url: string) => url.includes('mobile') ? new Promise(resolve => { portrait = resolve }) : { width: 1600,height: 900 })
    const { host,scene } = setup(); await scene.ready
    Object.defineProperty(window,'innerWidth',{ configurable: true,value: 844 }); Object.defineProperty(window,'innerHeight',{ configurable: true,value: 390 }); mocks.observer?.()
    await waitFor(() => expect(host.dataset.metrics).toContain('backgrounds/lake-day.webp'))
    portrait({ width: 720,height: 1080 }); await Promise.resolve(); await Promise.resolve()
    expect(host.dataset.metrics).not.toContain('lake-day-mobile.webp')
  })
  it('destroys only scene objects, releases textures and removes canvas once', async () => {
    const { host,scene } = setup(); await scene.ready; scene.destroy(); scene.destroy()
    expect(host.querySelector('canvas')).toBeNull()
    expect(mocks.apps[0].destroy).toHaveBeenCalledTimes(1)
    expect(mocks.apps[0].destroy).toHaveBeenCalledWith({ removeView: true },{ children: true,texture: false,textureSource: false })
  })
  it('finishes cleanup when unmounted during asynchronous init', async () => {
    let finish!: () => void; mocks.init.mockImplementation(() => new Promise<void>(resolve => { finish = resolve }))
    const { host,scene } = setup(); scene.destroy(); finish(); await scene.ready
    expect(host.querySelector('canvas')).toBeNull(); expect(mocks.apps[0].destroy).toHaveBeenCalledTimes(1); expect(mocks.load).not.toHaveBeenCalled()
  })
  it('uses placeholder on decode failure and ends if placeholder fails too', async () => {
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('html',{ headers: { 'content-type': 'text/html' } })))
    mocks.load.mockRejectedValue(new Error('decode'))
    const { status,scene } = setup(); await scene.ready
    await waitFor(() => expect(status).toHaveBeenCalledWith('error'))
    expect(mocks.load).toHaveBeenCalledWith(expect.stringContaining('/assets/placeholders/image-missing.svg'))
    expect(mocks.load.mock.calls.length).toBeLessThanOrEqual(4)
  })
  it('retains fallback sprites when placeholder succeeds', async () => {
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('x',{ status: 404 })))
    mocks.load.mockImplementation(async (url: string) => { if (!url.includes('image-missing')) throw new Error('404'); return { width: 64,height: 64 } })
    const { status,scene } = setup(); await scene.ready
    await waitFor(() => expect(status).toHaveBeenCalledWith('fallback'))
  })
  it('can lower renderer quality to DPR1 without changing CSS coordinates', async () => {
    vi.stubGlobal('devicePixelRatio',3)
    const host = document.createElement('div'); host.getBoundingClientRect = () => ({ width: 300,height: 400 } as DOMRect)
    const scene = mountGameScene(host,new InputController(),{ maxDpr: 1 }); mounts.push(scene); await scene.ready
    expect(mocks.apps[0].renderer.resize).toHaveBeenCalledWith(300,400,1)
  })
  it('pagehide releases the scene before document navigation and is idempotent', async () => {
    const { scene,host }=setup(); await scene.ready
    window.dispatchEvent(new PageTransitionEvent('pagehide',{ persisted: false }))
    expect(host.querySelector('canvas')).toBeNull(); expect(mocks.apps[0].destroy).toHaveBeenCalledTimes(1)
    scene.destroy(); expect(mocks.apps[0].destroy).toHaveBeenCalledTimes(1)
  })
})
