import { Application, Assets, Sprite, Texture } from 'pixi.js'
import { assetResolver } from '../services/assetRuntime'
import type { AssetResolver } from '../services/assetResolver'
import type { AssetId, AssetLayout, ResolvedAsset } from '../types/assets'
import { selectAssetLayout } from '../assets/variants'
import { canFallback, diagnoseImageFailure } from '../services/imageFailures'
import { AssetError } from '../services/assetErrors'
import { InputController } from './InputController'
import { TexturePool, type TextureLease } from './TexturePool'

// WebKit can reject the worker data-URL capability probe during route teardown.
// Decode on the main thread without changing the public URL or texture cache.
const textures = new TexturePool<Texture>(async url => {
  // Apply after Application.init has registered its asynchronously loaded parsers.
  Assets.setPreferences({ preferWorkers: false,preferCreateImageBitmap: false })
  return Assets.load<Texture>(url)
}, async url => { await Assets.unload(url) },url => new URL(url,document.baseURI).href)

let applications = 0, pendingInitializations = 0, renderedFrames = 0
const frameTimes: number[] = []
/** Bounded DEV timing samples; counts contain no URLs and are safe to inspect. */
export function getSceneDiagnostics() {
  return { applications,pendingInitializations,renderedFrames,textures: textures.snapshot(),frameTimes: [...frameTimes] }
}

export interface SceneMetrics { width: number; height: number; dpr: number; frames: number; fps: number; background: string; fish: string; casts: number; hooks: number }
export interface SceneOptions {
  maxDpr?: 1 | 2
  resolver?: AssetResolver<AssetId>
  onStatus?: (status: 'loading'|'ready'|'fallback'|'error') => void
  onMetrics?: (metrics: SceneMetrics) => void
}

/** Each mount owns one app; textures are shared separately and never destroyed by sprites. */
export function mountGameScene(host: HTMLDivElement, input: InputController, options: SceneOptions = {}) {
  const resolver = options.resolver ?? assetResolver
  const app = new Application()
  const lifetime = new AbortController()
  let disposed = false, initialized = false, cleaned = false
  let observer: ResizeObserver | undefined
  let background: Sprite | undefined, fish: Sprite | undefined
  let backgroundLease: TextureLease<Texture> | undefined, fishLease: TextureLease<Texture> | undefined
  let backgroundPath = '', fishPath = '', layout: AssetLayout | undefined
  let revision = 0, frames = 0, animation = 0
  let size = { width: 1,height: 1 }
  let backgroundFailed = false, fishFailed = false
  const maxDpr = options.maxDpr === 1 ? 1 : 2
  const metrics: SceneMetrics = { width: 1,height: 1,dpr: Math.min(window.devicePixelRatio || 1,maxDpr),frames: 0,fps: 0,background: '',fish: '',casts: 0,hooks: 0 }
  const publish = () => { if (!disposed) { Object.assign(metrics,{ ...size,frames,background: backgroundPath,fish: fishPath,casts: input.state.casts,hooks: input.state.hooks }); host.dataset.metrics = JSON.stringify(metrics); host.dataset.input = JSON.stringify(input.state); options.onMetrics?.({ ...metrics }) } }
  const placement = () => {
    if (background) {
      const scale = Math.max(size.width/background.texture.width,size.height/background.texture.height)
      background.scale.set(scale); background.position.set(size.width/2,size.height/2)
    }
    if (fish) {
      const scale = Math.min(size.width*0.46/fish.texture.width,size.height*0.3/fish.texture.height)
      fish.scale.set(scale)
      fish.position.set(size.width*(0.5 + input.state.aimX*0.18),size.height*(0.62 + input.state.aimY*0.12) + (input.state.reeling ? Math.sin(animation*8)*5 : 0))
      fish.rotation = input.state.casting ? -0.08-input.state.charge*0.1 : Math.sin(input.state.hooks)*0.04
      fish.tint = input.state.casting ? 0xc6fff0 : 0xffffff
    }
  }
  async function acquire(id: AssetId, selectedLayout: AssetLayout): Promise<{ lease: TextureLease<Texture>; result: ResolvedAsset }> {
    let result: ResolvedAsset
    try { result = await resolver.resolveAsset(id,{ layout: selectedLayout,signal: lifetime.signal }) }
    catch (error) { if (!canFallback(error)) throw error; result = await resolver.resolveExternalAsset('placeholder.image',{ signal: lifetime.signal }) }
    try { return { lease: await textures.acquire(result.url),result } }
    catch (error) {
      if(disposed) throw new AssetError('ASSET_RESOLVE_ABORTED','Scene image loading was cancelled.')
      const failure=error instanceof AssetError ? error : await diagnoseImageFailure(result.url,lifetime.signal)
      if(disposed) throw new AssetError('ASSET_RESOLVE_ABORTED','Scene image loading was cancelled.')
      if (!canFallback(failure) || result.assetId === 'placeholder.image') throw failure
      result = await resolver.resolveFallback(id,{ layout: selectedLayout,signal: lifetime.signal })
      return { lease: await textures.acquire(result.url),result }
    }
  }
  const reportStatus = () => { if (!disposed) options.onStatus?.(backgroundFailed || fishFailed ? 'error' : background && fish ? backgroundPath.includes('image-missing') || fishPath.includes('image-missing') ? 'fallback' : 'ready' : 'loading') }
  async function changeBackground(next: AssetLayout): Promise<void> {
    const current = ++revision
    try {
      const loaded = await acquire('background.lake.day',next)
      if (disposed || current !== revision) { loaded.lease.release(); return }
      const previous = backgroundLease
      if (background) background.texture = loaded.lease.value
      else { background = new Sprite(loaded.lease.value); background.anchor.set(0.5); app.stage.addChildAt(background,0) }
      backgroundLease = loaded.lease; backgroundPath = loaded.result.file.path; backgroundFailed = false
      previous?.release(); placement(); publish(); reportStatus()
    } catch { if (!disposed && current === revision) { backgroundFailed = true; reportStatus() } }
  }
  async function loadFish(): Promise<void> {
    try {
      const loaded = await acquire('fish.bass.main','default')
      if (disposed) { loaded.lease.release(); return }
      fishLease = loaded.lease; fishPath = loaded.result.file.path
      fish = new Sprite(loaded.lease.value); fish.anchor.set(0.5); app.stage.addChild(fish)
      placement(); publish(); reportStatus()
    } catch { if (!disposed) { fishFailed = true; reportStatus() } }
  }
  const resize = () => {
    if (disposed || !initialized) return
    const rect = host.getBoundingClientRect()
    size = { width: Math.max(1,Math.round(rect.width)),height: Math.max(1,Math.round(rect.height)) }
    metrics.dpr = Math.min(window.devicePixelRatio || 1,maxDpr)
    app.renderer.resize(size.width,size.height,metrics.dpr)
    placement(); publish()
    // Container controls rendering size; viewport controls the existing responsive layout contract.
    const next = selectAssetLayout({ viewport: { width: window.innerWidth,height: window.innerHeight } })
    if (next !== layout) { layout = next; void changeBackground(next) }
  }
  const visibility = () => { if (!initialized || disposed) return; if (document.hidden || input.state.paused) app.stop(); else app.start() }
  const unsubscribe = input.subscribe(() => { if (initialized && !disposed) { placement(); publish(); visibility() } })
  const hide = (event: PageTransitionEvent) => {
    input.cancel('pagehide')
    if(event.persisted) { if(initialized&&!disposed) app.stop() }
    else destroy()
  }
  const show = (event: PageTransitionEvent) => { if(event.persisted&&!disposed&&initialized) { input.cancel('pageshow'); resize(); visibility() } }
  const cleanup = () => {
    if (!initialized || cleaned) return
    cleaned = true
    applications--
    // Destroy scene objects only; leases own cached textures and shared sources.
    app.destroy({ removeView: true },{ children: true,texture: false,textureSource: false })
    backgroundLease?.release(); fishLease?.release()
  }
  const ready = (async () => {
    try {
      if (disposed) return
      options.onStatus?.('loading')
      pendingInitializations++
      try { await app.init({ width: 1,height: 1,resolution: metrics.dpr,autoDensity: true,backgroundColor: 0x071827,antialias: false,preference: 'webgl',autoStart: false }) }
      finally { pendingInitializations-- }
      initialized = true
      applications++
      if (disposed) { cleanup(); return }
      host.appendChild(app.canvas)
      app.canvas.setAttribute('aria-label','호수와 배스 · 모의 낚시 장면')
      app.canvas.setAttribute('role','img')
      app.ticker.maxFPS = 60
      let previousTick = performance.now()
      app.ticker.add(ticker => {
        frames++; renderedFrames++
        if(import.meta.env.DEV) {
          const now = performance.now()
          if(!document.hidden&&!input.state.paused) { frameTimes.push(now-previousTick); if(frameTimes.length>600) frameTimes.shift() }
          previousTick = now
        }
        animation += Math.min(ticker.deltaMS,50)/1000; placement(); if (frames % 30 === 0) { metrics.fps = ticker.FPS; publish() }
      })
      observer = new ResizeObserver(resize); observer.observe(host)
      window.addEventListener('resize',resize); document.addEventListener('visibilitychange',visibility)
      resize(); visibility(); await loadFish()
    } catch { if (!disposed) options.onStatus?.('error'); destroy() }
  })()
  function destroy(): void {
    disposed = true; lifetime.abort(); revision++; observer?.disconnect()
    window.removeEventListener('resize',resize); document.removeEventListener('visibilitychange',visibility)
    window.removeEventListener('pagehide',hide); window.removeEventListener('pageshow',show)
    unsubscribe(); cleanup()
  }
  window.addEventListener('pagehide',hide); window.addEventListener('pageshow',show)
  return { ready,destroy }
}
