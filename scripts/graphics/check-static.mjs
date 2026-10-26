import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL, URL } from 'node:url'
import { build, preview } from 'vite'
import { createServer } from 'node:net'
import { projectRoot } from './lib.mjs'

// Disposable builds only. No changes to vite.config.ts, dist, public, or remote services.
const localRoot = path.join(projectRoot, '.local')
await mkdir(localRoot, { recursive: true })
const work = await mkdtemp(path.join(localRoot, 'static-http-'))
const probe = path.join(work, 'probe.ts')
await writeFile(probe, `import { assetResolver } from ${JSON.stringify(path.join(projectRoot, 'src/services/assetRuntime.ts').replaceAll('\\', '/'))};
export async function inspect() {
  const results = [];
  for (const id of assetResolver.listAssetIds()) {
    results.push(await assetResolver.resolveAsset(id));
    if (id === 'background.lake.day') results.push(await assetResolver.resolveAsset(id, { layout: 'mobile-portrait' }));
  }
  return results;
}
`, 'utf8')

const report = []
for (const [name, configuredBase] of [['root', '/'], ['subpath', '/fishingking/'], ['absolute-http', '/fishingking/']]) {
  let previewPort = 0, base = configuredBase
  if(name==='absolute-http') {
    const reservation = createServer()
    await new Promise(resolve => reservation.listen(0,'127.0.0.1',resolve))
    previewPort = reservation.address().port
    await new Promise(resolve => reservation.close(resolve))
    base = `http://127.0.0.1:${previewPort}/fishingking/`
  }
  const outDir = path.join(work, name)
  const result = await build({
    root: projectRoot, base, logLevel: 'warn',
    define: { 'import.meta.env.VITE_ASSET_BASE_URL': 'undefined' },
    build: { outDir, emptyOutDir: false, rolldownOptions: { preserveEntrySignatures: 'strict', input: { app: path.join(projectRoot, 'index.html'), probe } } },
  })
  assert(!Array.isArray(result) && 'output' in result, 'Expected a non-watch production build')
  const entry = result.output.find(chunk => chunk.type === 'chunk' && chunk.isEntry && chunk.name === 'probe')
  assert(entry, 'Missing compiled BASE_URL probe')
  const compiled = await import(pathToFileURL(path.join(outDir, entry.fileName)).href)
  const assets = await compiled.inspect()
  assert.equal(assets.length, 7)
  const server = await preview({ root: projectRoot, base, logLevel: 'warn', build: { outDir }, preview: { host: '127.0.0.1', port: previewPort, strictPort: true } })
  try {
    const address = server.httpServer.address()
    assert(address && typeof address !== 'string')
    const origin = `http://127.0.0.1:${address.port}`
    const responses = []
    for (const asset of assets) {
      assert.equal(asset.url, `${base}assets/${asset.file.path}`)
      const response = await globalThis.fetch(new URL(asset.url, origin))
      const bytes = Buffer.from(await response.arrayBuffer())
      assert.equal(response.status, 200)
      assert.equal(response.headers.get('content-type')?.split(';')[0], asset.contentType)
      assert.equal(bytes.length, asset.file.sizeBytes)
      assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.file.sha256)
      assert.deepEqual(bytes, await readFile(path.join(projectRoot, 'public/assets', asset.file.path)))
      responses.push({ id: asset.assetId, variant: asset.variantKey, url: asset.url, status: response.status, contentType: asset.contentType, sizeBytes: bytes.length, sha256: 'PASS' })
    }
    const html = await (await globalThis.fetch(new URL(base, origin))).text()
    assert(html.includes(`${base}assets/`), 'Production HTML does not use the configured base')
    const missing = await globalThis.fetch(new URL(`${base}assets/fish/not-registered.webp`, origin))
    const missingType = missing.headers.get('content-type') ?? ''
    const missingBytes = Buffer.from(await missing.arrayBuffer())
    const htmlFallback = missingType.includes('text/html') && missingBytes.toString('utf8').includes('<!doctype html>')
    assert(missing.status >= 400 || htmlFallback, 'Missing image unexpectedly passed the image response contract')
    let routing
    if(process.env.ASSET_HTTP_BROWSER==='1') {
      const { chromium } = await import('@playwright/test')
      const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
      try {
        const page = await browser.newPage()
        const basePath = new URL(base,origin).pathname
        for(const [route,heading] of [['','FishingKing'],['game','낚시'],['collection','도감'],['ranking','랭킹'],['profile','내 정보'],['login','로그인']]) {
          await page.goto(`${origin}${basePath}${route}`)
          assert.equal(await page.getByRole('heading',{ level: 1 }).innerText(),heading,`SPA route did not match ${basePath}${route}`)
          if(route==='game') await page.waitForFunction(() => globalThis.document.querySelector('[data-testid="game-canvas"]')?.getAttribute('data-state')==='ready')
        }
        await page.goto(`${origin}${basePath}collection`)
        await page.locator('nav:visible').first().getByRole('link',{ name: '낚시',exact: true }).click()
        assert.equal(new URL(page.url()).pathname,`${basePath}game`)
        await page.reload()
        assert.equal(await page.getByRole('heading',{ level: 1 }).innerText(),'낚시')
        await page.goto(`${origin}${basePath}unknown/nested`)
        assert.match(await page.getByRole('heading',{ level: 1 }).innerText(),/404/)
        await page.getByRole('link',{ name: '홈으로 이동' }).click()
        assert.equal(new URL(page.url()).pathname,basePath)
        routing = { routes: 6,navigation: 'PASS',reload: 'PASS',notFound: 'PASS' }
      } finally { await browser.close() }
    }
    report.push({ base, productionBuild: 'PASS', compiledBaseUrl: 'PASS', responses, routing, missing: { status: missing.status, contentType: missingType, htmlFallback, classification: 'ASSET_LOAD_FAILED' } })
  } finally {
    await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()))
  }
}
await writeFile(path.join(localRoot, 'static-http-report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
