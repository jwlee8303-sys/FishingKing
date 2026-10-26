import assert from 'node:assert/strict'
import { cp, copyFile, mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium, webkit } from '@playwright/test'
import { createServer } from 'vite'
import { projectRoot } from '../graphics/lib.mjs'

const quick = process.argv.includes('--quick') || process.argv.includes('--reentry')
const engineName = process.argv.includes('--webkit') ? 'webkit' : 'chromium'
const requestedDpr = process.argv.includes('--dpr1') ? 1 : 2
const durationSeconds = quick ? 15 : 600
const entryTarget = process.argv.includes('--reentry') ? 30 : quick ? 3 : 30, rotationTarget = quick ? 6 : 30, inputTarget = quick ? 12 : 100
const artifactRoot = path.join(projectRoot,'.local/phase3-09')
await mkdir(artifactRoot,{ recursive: true })
const work = await mkdtemp(path.join(artifactRoot,`${engineName}-${quick?'quick':'soak'}-`))
const root = path.join(work,'snapshot')
await mkdir(root)
for(const directory of ['src','public','tests/fixtures']) await cp(path.join(projectRoot,directory),path.join(root,directory),{ recursive: true })
for(const file of ['index.html','package.json','vite.config.ts','tsconfig.json','tsconfig.app.json','tsconfig.node.json','tsconfig.tests.json']) await copyFile(path.join(projectRoot,file),path.join(root,file))
const report = { status: 'RUNNING',browser: engineName,startedAt: new Date().toISOString(),durationTargetSeconds: durationSeconds,entries: 0,rotations: 0,inputPairs: 0,samples: [],errors: [],warnings: [] }
report.requestedDpr = requestedDpr
const server = await createServer({ root,configFile: path.join(root,'vite.config.ts'),logLevel: 'warn',define: { 'import.meta.env.VITE_ASSET_BASE_URL': 'undefined' },server: { host: '127.0.0.1',port: 0,strictPort: true,watch: null } })
let browser
const save = () => writeFile(path.join(work,'report.json'),JSON.stringify(report,null,2))
try {
  await server.listen()
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  browser = await ({ chromium,webkit }[engineName]).launch()
  report.browserVersion = browser.version()
  const context = await browser.newContext({ viewport: { width: 390,height: 844 },deviceScaleFactor: requestedDpr,isMobile: true,hasTouch: true })
  const page = await context.newPage()
  page.on('pageerror',error => report.errors.push(error.message))
  page.on('console',message => { if(message.type()==='error') report.errors.push(message.text()); if(message.type()==='warning') report.warnings.push(message.text()) })
  await page.addInitScript(() => {
    const probe = globalThis.__stabilityProbe = { active: false,last: 0,histogram: Array(1001).fill(0),frames: 0,totalMs: 0,firstBackgroundMs: null,firstFishMs: null,readyMs: null }
    const inspect = () => {
      const canvas = globalThis.document.querySelector('[data-testid="game-canvas"]')
      if(!canvas) return
      const metrics = JSON.parse(canvas.getAttribute('data-metrics') || '{}')
      const now = globalThis.performance.now()
      if(metrics.background && probe.firstBackgroundMs===null) probe.firstBackgroundMs = now
      if(metrics.fish && probe.firstFishMs===null) probe.firstFishMs = now
      if(canvas.getAttribute('data-state')==='ready' && probe.readyMs===null) probe.readyMs = now
    }
    new globalThis.MutationObserver(inspect).observe(globalThis.document,{ subtree: true,attributes: true,attributeFilter: ['data-state','data-metrics'],childList: true })
    const tick = now => {
      if(probe.active && !globalThis.document.hidden && probe.last) {
        const delta = now-probe.last
        probe.histogram[Math.min(1000,Math.round(delta))]++; probe.frames++; probe.totalMs += delta
      }
      probe.last = now
      globalThis.requestAnimationFrame(tick)
    }
    globalThis.requestAnimationFrame(tick)
  })
  const cdp = engineName==='chromium' ? await context.newCDPSession(page) : undefined
  const requests = new Map(), downloads = []
  if(cdp) {
    await cdp.send('Network.enable')
    cdp.on('Network.requestWillBeSent',event => { const url = new globalThis.URL(event.request.url); if(/\/assets\/(fish|backgrounds)\//.test(url.pathname)) requests.set(event.requestId,{ path: url.pathname }) })
    cdp.on('Network.responseReceived',event => { const request=requests.get(event.requestId); if(request) Object.assign(request,{ status: event.response.status,fromDiskCache: !!event.response.fromDiskCache,mime: event.response.mimeType }) })
    cdp.on('Network.loadingFinished',event => { const request=requests.get(event.requestId); if(request) { downloads.push({ ...request,encodedDataLength: event.encodedDataLength }); requests.delete(event.requestId) } })
  }
  const diagnostics = () => page.evaluate(async () => { const modulePath='/tests/fixtures/browserScenes.ts'; const module=await import(modulePath); globalThis.__stabilityDiagnostics=module.getSceneDiagnostics; return module.getSceneDiagnostics() })
  const waitReady = () => page.waitForFunction(() => globalThis.document.querySelector('[data-testid="game-canvas"]')?.getAttribute('data-state')==='ready')
  const waitZero = async () => {
    await diagnostics()
    // A synchronous predicate is required: an async predicate can be truthy
    // before its imported diagnostic result and the React DOM teardown settle.
    await page.waitForFunction(() => { const data=globalThis.__stabilityDiagnostics(); return data.applications===0&&data.pendingInitializations===0&&data.textures.entries===0&&data.textures.references===0&&globalThis.document.querySelectorAll('canvas').length===0 })
    assert.equal(await page.locator('canvas').count(),0)
  }
  const home = async () => { await page.getByRole('button',{ name: '메뉴',exact: true }).first().click(); await page.getByRole('dialog').getByRole('link',{ name: '홈',exact: true }).click(); await waitZero() }
  const enter = async () => { await page.locator('nav:visible').first().getByRole('link',{ name: '낚시',exact: true }).click(); await waitReady() }
  const sample = async label => {
    const resources = await diagnostics()
    const result = { label,resources: { ...resources,frameTimes: undefined },canvasCount: await page.locator('canvas').count() }
    if(cdp) {
      const heap = await cdp.send('Runtime.getHeapUsage')
      result.jsHeapUsedBytes = heap.usedSize
      result.dom = await cdp.send('Memory.getDOMCounters')
      const counts = {}
      for(const target of ['window','document','window.visualViewport']) {
        const evaluated = await cdp.send('Runtime.evaluate',{ expression: target,objectGroup: 'stability-listeners' })
        counts[target] = evaluated.result.objectId ? (await cdp.send('DOMDebugger.getEventListeners',{ objectId: evaluated.result.objectId })).listeners.length : 0
      }
      await cdp.send('Runtime.releaseObjectGroup',{ objectGroup: 'stability-listeners' })
      result.globalListeners = counts
    }
    report.samples.push(result); return result
  }
  await page.goto(`${origin}/game`); await waitReady()
  report.initialImages = await page.evaluate(() => { const probe=globalThis.__stabilityProbe; return { backgroundAppliedMs: probe.firstBackgroundMs,fishAppliedMs: probe.firstFishMs,readyMs: probe.readyMs,metrics: JSON.parse(globalThis.document.querySelector('[data-testid="game-canvas"]').getAttribute('data-metrics')) } })
  report.initialDownloads = [...downloads]
  await home()
  if(cdp) await cdp.send('HeapProfiler.collectGarbage')
  const baseline = await sample('warm-baseline-home')
  await enter()
  report.renderedFrameStart = (await diagnostics()).renderedFrames
  const started = Date.now()
  await page.evaluate(() => { globalThis.__stabilityProbe.active = true; globalThis.__stabilityProbe.last = 0 })
  for(let i=0;i<inputTarget;i++) {
    if(i%2) { await page.keyboard.down('KeyR'); if(i===1) { await page.waitForTimeout(1000); report.longReelHoldMs=1000 } await page.keyboard.up('KeyR') }
    else await page.keyboard.press('KeyC')
    report.inputPairs++
  }
  for(let i=0;i<rotationTarget;i++) {
    const portrait = i%2===1
    await page.setViewportSize(portrait?{ width: 390,height: 844 }:{ width: 844,height: 390 })
    await page.waitForFunction(portrait => { const metrics=JSON.parse(globalThis.document.querySelector('[data-testid="game-canvas"]').getAttribute('data-metrics')||'{}'); return metrics.background===(portrait?'backgrounds/lake-day-mobile.webp':'backgrounds/lake-day.webp') },portrait)
    report.rotations++
  }
  while(Date.now()-started<durationSeconds*1000) {
    await page.waitForTimeout(Math.min(15000,durationSeconds*1000-(Date.now()-started)))
    const state = await sample(`active-${Math.round((Date.now()-started)/1000)}s`)
    assert.equal(state.resources.applications,1); assert.equal(state.resources.textures.references,2)
    console.log(`${engineName}: ${Math.round((Date.now()-started)/1000)}s / ${durationSeconds}s, apps=1 refs=2`)
    await save()
  }
  report.actualContinuousSeconds = (Date.now()-started)/1000
  report.renderedFrameEnd = (await diagnostics()).renderedFrames
  report.renderedAverageFps = (report.renderedFrameEnd-report.renderedFrameStart)/report.actualContinuousSeconds
  report.frameProbe = await page.evaluate(() => { globalThis.__stabilityProbe.active=false; return globalThis.__stabilityProbe })
  const quantile = probability => {
    let count = 0
    for(let i=0;i<report.frameProbe.histogram.length;i++) { count += report.frameProbe.histogram[i]; if(count>=report.frameProbe.frames*probability) return i }
    return null
  }
  report.frameTiming = { source: 'requestAnimationFrame wall intervals, 1ms buckets (>=1000ms merged)',samples: report.frameProbe.frames,averageFps: report.frameProbe.frames*1000/report.frameProbe.totalMs,medianMs: quantile(0.5),p95Ms: quantile(0.95),p99Ms: quantile(0.99),low5PercentFpsApprox: 1000/Math.max(1,quantile(0.95)) }
  report.gpuMemoryBytes = null
  report.finalDemoInput = JSON.parse(await page.getByTestId('game-canvas').getAttribute('data-input'))
  assert.equal(report.finalDemoInput.casting,false); assert.equal(report.finalDemoInput.reeling,false)
  assert.equal(report.finalDemoInput.casts,inputTarget/2)
  await home()
  for(let i=0;i<entryTarget;i++) {
    await enter(); assert.equal((await diagnostics()).applications,1)
    await home(); report.entries++
    if((i+1)%5===0 || i===entryTarget-1) { if(cdp) await cdp.send('HeapProfiler.collectGarbage'); await sample(`reentry-${i+1}`) }
  }
  if(cdp) await cdp.send('HeapProfiler.collectGarbage')
  const final = await sample('final-home')
  if(cdp) { assert.deepEqual(final.globalListeners,baseline.globalListeners); report.jsHeapDeltaAfterGC = final.jsHeapUsedBytes-baseline.jsHeapUsedBytes }
  report.downloads = downloads
  report.imageRequestCount = downloads.length
  report.imageEncodedTransferBytes = downloads.reduce((sum,item) => sum+item.encodedDataLength,0)
  assert.deepEqual(report.errors,[])
  report.status = 'PASS'
  report.finishedAt = new Date().toISOString()
  await context.close()
} catch(error) {
  report.status = 'FAIL'; report.failure = error.message; throw error
} finally {
  await save(); await browser?.close(); await server.close()
  console.log(`Report: ${path.relative(projectRoot,path.join(work,'report.json'))}`)
}
