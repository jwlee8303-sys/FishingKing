import { test, expect } from '@playwright/test'

test('실제 Pixi 이미지, 모의 입력, 회전 상태와 렌더링 측정',async ({ page },testInfo) => {
  const errors: string[] = []
  page.on('pageerror',error => errors.push(error.message))
  page.on('console',message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/game')
  const canvas = page.getByTestId('game-canvas')
  await expect(canvas).toHaveAttribute('data-state','ready')
  await expect(canvas.locator('canvas')).toHaveCount(1)
  const size = page.viewportSize()!
  const initial = await canvas.getAttribute('data-metrics')
  expect(initial).toContain('fish/bass-main.webp')
  expect(initial).toContain(size.height > size.width && size.width < 1100 ? 'lake-day-mobile.webp' : 'lake-day.webp')
  const cast = page.getByRole('button',{ name: '캐스팅',exact: true })
  if (testInfo.project.use.hasTouch) await cast.tap(); else await cast.click()
  await expect(canvas).toHaveAttribute('data-metrics',/"casts":1/)
  await page.keyboard.press('KeyE')
  await expect(canvas).toHaveAttribute('data-metrics',/"hooks":1/)
  await page.keyboard.down('KeyR'); await expect(canvas).toHaveAttribute('data-input',/"reeling":true/)
  await page.setViewportSize(size.width > size.height ? { width: 390,height: 844 } : { width: 844,height: 390 })
  await expect(canvas).toHaveAttribute('data-input',/"reeling":false/)
  await page.keyboard.up('KeyR')
  await expect(canvas).toHaveAttribute('data-metrics',/"casts":1/)
  await expect(canvas).toHaveAttribute('data-metrics',size.width > size.height ? /lake-day-mobile.webp/ : /backgrounds\/lake-day.webp/)
  await expect(canvas.locator('canvas')).toHaveCount(1)
  await expect.poll(async () => JSON.parse((await canvas.getAttribute('data-metrics'))!).frames).toBeGreaterThan(30)
  const result = await canvas.evaluate(element => {
    const metrics = JSON.parse((element as HTMLElement).dataset.metrics!)
    const rendered = element.querySelector('canvas')!
    const sample = document.createElement('canvas'); sample.width = rendered.width; sample.height = rendered.height
    const context = sample.getContext('2d')!; context.drawImage(rendered,0,0)
    const pixel = context.getImageData(sample.width/2,sample.height/2,1,1).data
    return { metrics,bufferWidth: rendered.width,bufferHeight: rendered.height,pixel: Array.from(pixel) }
  })
  expect(result.bufferWidth).toBeCloseTo(result.metrics.width*result.metrics.dpr,0)
  expect(result.metrics.dpr).toBeLessThanOrEqual(2); expect(result.pixel[3]).toBe(255)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await testInfo.attach('render-metrics.json',{ body: JSON.stringify(result,null,2),contentType: 'application/json' })
  await page.screenshot({ path: testInfo.outputPath('game-integrated.png') })
  await page.getByRole('button',{ name: '메뉴',exact: true }).first().click()
  await page.getByRole('dialog').getByRole('link',{ name: '홈',exact: true }).click()
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('React AssetImage 실파일 및 HTML200 실패의 terminal fallback',async ({ page }) => {
  await page.goto('/collection')
  await page.getByText('에셋 미리보기 · 사용자 발견 기록 아님').click()
  const frame = page.locator('[data-asset-id="fish.bass.main"]')
  await expect(frame).toHaveAttribute('data-state','ready')
  expect(await frame.locator('img').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(1024)
  await page.route('**/assets/fish/bass-main.webp',route => route.fulfill({ status: 200,contentType: 'text/html',body: '<!doctype html><title>SPA fallback</title>' }))
  await page.route('**/assets/placeholders/image-missing.svg',route => route.fulfill({ status: 200,contentType: 'text/html',body: '<!doctype html><title>missing too</title>' }))
  await page.reload(); await page.getByText('에셋 미리보기 · 사용자 발견 기록 아님').click()
  await expect(frame).toHaveAttribute('data-state','error')
  await expect(frame).toHaveAttribute('data-error-code','ASSET_LOAD_FAILED')
  await expect(frame).toHaveAttribute('data-error-kind','NOT_IMAGE')
  await expect(page.getByRole('heading',{ name: '도감',exact: true })).toBeVisible()
})

test('Pixi 로딩 오류는 placeholder로 복구하고 앱을 유지',async ({ page }) => {
  await page.route('**/assets/fish/bass-main.webp',route => route.fulfill({ status: 200,contentType: 'text/html',body: '<!doctype html><title>missing fish</title>' }))
  await page.goto('/game')
  const canvas = page.getByTestId('game-canvas')
  await expect(canvas).toHaveAttribute('data-state','fallback')
  await expect(canvas).toHaveAttribute('data-metrics',/placeholders\/image-missing.svg/)
  await page.getByRole('button',{ name: '캐스팅',exact: true }).click()
  await expect(canvas).toHaveAttribute('data-metrics',/"casts":1/)
})

test('멀티터치·길게 누름·취소·비활성 전환의 입력 해제',async ({ page,browserName },testInfo) => {
  await page.goto('/game'); const canvas = page.getByTestId('game-canvas')
  await expect(canvas).toHaveAttribute('data-state','ready')
  const reel = page.getByRole('button',{ name: '릴 감기',exact: true })
  if (testInfo.project.use.hasTouch && browserName === 'chromium') {
    const direction = (await page.getByRole('button',{ name: '왼쪽',exact: true }).boundingBox())!, box = (await reel.boundingBox())!
    const session = await page.context().newCDPSession(page)
    const points = [{ x: direction.x+direction.width/2,y: direction.y+direction.height/2,id: 1 },{ x: box.x+box.width/2,y: box.y+box.height/2,id: 2 }]
    await session.send('Input.dispatchTouchEvent',{ type: 'touchStart',touchPoints: [points[0]] })
    await session.send('Input.dispatchTouchEvent',{ type: 'touchStart',touchPoints: points })
    await expect(canvas).toHaveAttribute('data-input',/"reeling":true/)
    await expect(canvas).toHaveAttribute('data-input',/"aimX":-1/)
    await page.waitForTimeout(180)
    await expect(reel).toHaveAttribute('aria-pressed','true')
    await session.send('Input.dispatchTouchEvent',{ type: 'touchCancel',touchPoints: [] }); await session.detach()
  } else {
    await reel.focus(); await page.keyboard.down('Space')
    await expect(reel).toHaveAttribute('aria-pressed','true')
    await page.evaluate(() => window.dispatchEvent(new Event('blur')))
    await page.keyboard.up('Space')
  }
  await expect(canvas).toHaveAttribute('data-input',/"reeling":false/)
  await expect(reel).toHaveAttribute('aria-pressed','false')
  await page.keyboard.down('KeyR'); await expect(canvas).toHaveAttribute('data-input',/"reeling":true/)
  await page.evaluate(() => { Object.defineProperty(document,'hidden',{ configurable: true,value: true }); document.dispatchEvent(new Event('visibilitychange')) })
  await expect(canvas).toHaveAttribute('data-input',/"reeling":false/)
  await page.evaluate(() => { delete (document as unknown as { hidden?: boolean }).hidden; document.dispatchEvent(new Event('visibilitychange')) })
  await page.keyboard.up('KeyR')
})
