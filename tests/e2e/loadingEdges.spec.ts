import { test, expect } from '@playwright/test'

test('a delayed portrait response cannot overwrite the newer landscape',async ({ page }) => {
  await page.setViewportSize({ width: 390,height: 844 })
  let release!: () => void, intercepted = false
  const gate = new Promise<void>(resolve => { release=resolve })
  await page.route('**/assets/backgrounds/lake-day-mobile.webp',async route => { intercepted=true; await gate; await route.continue() })
  try {
    await page.goto('/game')
    await expect.poll(() => intercepted).toBe(true)
    await page.setViewportSize({ width: 844,height: 390 })
    const canvas=page.getByTestId('game-canvas')
    await expect(canvas).toHaveAttribute('data-state','ready')
    await expect(canvas).toHaveAttribute('data-metrics',/backgrounds\/lake-day.webp/)
    await page.keyboard.press('KeyC')
    const response = page.waitForResponse(response => response.url().includes('lake-day-mobile.webp'))
    release(); await response
    await expect(canvas).toHaveAttribute('data-metrics',/backgrounds\/lake-day.webp/)
    await expect(canvas).toHaveAttribute('data-input',/"casts":1/)
  } finally { release() }
})

test('high-DPR browser context keeps CSS sizing and caps its render buffer',async ({ browser,baseURL }) => {
  const context=await browser.newContext({ baseURL,viewport: { width: 390,height: 844 },deviceScaleFactor: 3,hasTouch: true,isMobile: true })
  try {
    const page=await context.newPage(); await page.goto('/game')
    const canvas=page.getByTestId('game-canvas'); await expect(canvas).toHaveAttribute('data-state','ready')
    const result=await canvas.evaluate(element => { const metrics=JSON.parse((element as HTMLElement).dataset.metrics!); const buffer=element.querySelector('canvas')!; return { metrics,width: buffer.width,height: buffer.height,dpr: devicePixelRatio } })
    expect(result.dpr).toBe(3); expect(result.metrics.dpr).toBe(2)
    expect(result.width).toBe(result.metrics.width*2); expect(result.height).toBe(result.metrics.height*2)
    expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  } finally { await context.close() }
})
