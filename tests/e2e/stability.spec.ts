import { test, expect } from '@playwright/test'
import type { getSceneDiagnostics } from '../../src/game/scene'
type Diagnostics = ReturnType<typeof getSceneDiagnostics>
async function diagnostics(page: import('@playwright/test').Page): Promise<Diagnostics> {
  return page.evaluate(async () => { const path = '/tests/fixtures/browserScenes.ts'; const module = await import(path) as { getSceneDiagnostics(): Diagnostics }; return module.getSceneDiagnostics() })
}

test('native taps, pointer ownership and cancellation leave no active input',async ({ page },info) => {
  await page.goto('/game'); const canvas = page.getByTestId('game-canvas')
  await expect(canvas).toHaveAttribute('data-state','ready')
  const cast = page.getByRole('button',{ name: '캐스팅',exact: true })
  for(let i=0;i<10;i++) { if(info.project.use.hasTouch) await cast.tap(); else await cast.click() }
  await expect(canvas).toHaveAttribute('data-input',/"casts":10/)
  const reel = page.getByRole('button',{ name: '릴 감기',exact: true })
  const box = (await reel.boundingBox())!
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down()
  await expect(reel).toHaveAttribute('aria-pressed','true')
  await page.keyboard.down('KeyC')
  await expect(canvas).toHaveAttribute('data-input',/"casting":false/)
  await page.keyboard.up('KeyC')
  await page.mouse.move(box.x-12,box.y-12); await page.mouse.up()
  await expect(canvas).toHaveAttribute('data-input',/"reeling":false/)
  const castBox = (await cast.boundingBox())!
  await page.mouse.move(castBox.x+castBox.width/2,castBox.y+castBox.height/2); await page.mouse.down()
  await page.mouse.move(castBox.x-15,castBox.y-15); await page.mouse.up()
  await expect(canvas).toHaveAttribute('data-input',/"casts":10/)
  await expect(canvas).toHaveAttribute('data-input',/"casting":false/)
  await page.getByRole('button',{ name: '입질반응',exact: true }).click()
  await expect(canvas).toHaveAttribute('data-input',/"hooks":1/)
})

test('burst rotations keep latest background, controls and mock state',async ({ page }) => {
  await page.goto('/game'); const canvas = page.getByTestId('game-canvas')
  await expect(canvas).toHaveAttribute('data-state','ready')
  await page.keyboard.press('KeyC')
  await page.keyboard.down('KeyR')
  for(let i=0;i<6;i++) await page.setViewportSize(i%2 ? { width: 390,height: 844 } : { width: 844,height: 390 })
  await page.keyboard.up('KeyR')
  await expect(canvas).toHaveAttribute('data-input',/"reeling":false/)
  await expect(canvas).toHaveAttribute('data-metrics',/lake-day-mobile.webp/)
  await expect(canvas).toHaveAttribute('data-metrics',/"casts":1/)
  expect((await diagnostics(page)).applications).toBe(1)
  await expect(canvas.locator('canvas')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  const boxes = await page.locator('.game-controls button').evaluateAll(elements => elements.map(element => { const rect=element.getBoundingClientRect(); return { width: rect.width,height: rect.height,bottom: rect.bottom,right: rect.right } }))
  for(const rect of boxes) { expect(rect.width).toBeGreaterThanOrEqual(44); expect(rect.height).toBeGreaterThanOrEqual(44); expect(rect.bottom).toBeLessThanOrEqual(844); expect(rect.right).toBeLessThanOrEqual(390) }
})

test('reentry repeatedly restores zero apps, references and canvas at baseline',async ({ page }) => {
  await page.goto('/')
  for(let i=0;i<4;i++) {
    await page.locator('nav:visible').first().getByRole('link',{ name: '낚시',exact: true }).click()
    await expect(page.getByTestId('game-canvas')).toHaveAttribute('data-state','ready')
    expect((await diagnostics(page)).applications).toBe(1)
    await page.getByRole('button',{ name: '메뉴',exact: true }).first().click()
    await page.getByRole('dialog').getByRole('link',{ name: '홈',exact: true }).click()
    await expect.poll(async () => { const state = await diagnostics(page); return [state.applications,state.pendingInitializations,state.textures.references,state.textures.entries] }).toEqual([0,0,0,0])
    await expect(page.locator('canvas')).toHaveCount(0)
  }
})

test('multiple scenes share leases and changing provider URLs cannot collide',async ({ page }) => {
  await page.goto('/collection')
  const fixture = async (action: string,name: string,key?: string) => page.evaluate(async ({ action,name,key }) => { const path='/tests/fixtures/browserScenes.ts'; const module=await import(path); if(action==='start') module.startScene(name,key); else module.stopScene(name) },{ action,name,key })
  await fixture('start','a'); await fixture('start','b')
  await expect(page.locator('#test-scene-a')).toHaveAttribute('data-state','ready'); await expect(page.locator('#test-scene-b')).toHaveAttribute('data-state','ready')
  expect((await diagnostics(page)).textures).toMatchObject({ entries: 2,references: 4 })
  await fixture('stop','a')
  expect((await diagnostics(page)).textures.references).toBe(2)
  await expect(page.locator('#test-scene-b canvas')).toHaveCount(1)
  await fixture('start','c','different-provider')
  await expect(page.locator('#test-scene-c')).toHaveAttribute('data-state','ready')
  expect((await diagnostics(page)).textures).toMatchObject({ entries: 4,references: 4 })
  await fixture('stop','b'); await fixture('stop','c')
  await expect.poll(async () => (await diagnostics(page)).textures.entries).toBe(0)
})

for(const failure of ['404','500','network','corrupt','html'] as const) {
  test(`image failure ${failure} recovers while preserving page`,async ({ page }) => {
    await page.route('**/assets/fish/bass-main.webp',route => failure==='network' ? route.abort('failed') : route.fulfill({ status: failure==='404'?404:failure==='500'?500:200,contentType: failure==='html'?'text/html':'image/webp',body: failure==='html'?'<!doctype html><title>SPA</title>':'invalid-image-bytes' }))
    await page.goto('/collection')
    await page.getByText('에셋 미리보기 · 사용자 발견 기록 아님').click()
    const frame = page.locator('[data-asset-id="fish.bass.main"]')
    await expect(frame).toHaveAttribute('data-state','ready')
    await expect(frame).toHaveAttribute('data-error-code','ASSET_LOAD_FAILED')
    await expect(frame.locator('img')).toHaveAttribute('src',/image-missing.svg/)
    await expect(page.getByRole('heading',{ name: '도감',exact: true })).toBeVisible()
  })
}
