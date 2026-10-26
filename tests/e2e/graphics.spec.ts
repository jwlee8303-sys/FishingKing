import { test, expect } from '@playwright/test'

// Isolated browser fixture only: no application route or runtime manifest added.
test('SVG/WebP 디코딩, 알파, 반응형 배경 및 HTTP 형식', async ({ page }, testInfo) => {
  const errors: string[] = [], requests: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (request.url().includes('/assets/backgrounds/')) requests.push(request.url()) })
  await page.goto('/')
  await page.setContent(`<!doctype html><html lang="ko"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    *{box-sizing:border-box}body{margin:0;padding:16px;background:#071827;color:#F3F8FC;font:16px system-ui}h1{font-size:20px}picture{display:block}#background{display:block;width:100%;height:50vh;object-fit:cover;object-position:50% 35%;border-radius:16px}.sprite{margin-top:16px;border-radius:12px;background:repeating-conic-gradient(#12344D 0% 25%,#1A4661 0% 50%) 0 0/24px 24px;padding:12px}#fish{display:block;width:min(100%,600px);height:auto;margin:auto}.icons{display:flex;gap:12px;margin-top:16px}.icon{width:44px;height:44px;display:grid;place-items:center;background:#12344D;border-radius:12px}.icon img{width:24px;height:24px}
    </style></head><body><h1>FishingKing 그래픽 검증 · 격리된 테스트</h1><picture><source media="(orientation:portrait)" srcset="/assets/backgrounds/lake-day-mobile.webp"><img id="background" src="/assets/backgrounds/lake-day.webp" alt="호수 주간 배경"></picture><div class="sprite"><img id="fish" src="/assets/fish/bass-main.webp" alt="배스 측면 스프라이트"></div><div class="icons"><div class="icon"><img src="/assets/icons/fishing-rod.svg" alt="낚싯대"></div><div class="icon"><img src="/assets/icons/reel.svg" alt="릴 감기"></div><div class="icon"><img src="/assets/icons/hook.svg" alt="입질 반응"></div><div class="icon"><img src="/assets/placeholders/image-missing.svg" alt="이미지 누락"></div></div></body></html>`)
  await page.locator('img').evaluateAll(async images => { await Promise.all(images.map(image => (image as HTMLImageElement).decode())) })
  const size = page.viewportSize()!
  const portrait = size.height > size.width
  await expect(page.locator('#background')).toHaveJSProperty('currentSrc', new URL(portrait ? '/assets/backgrounds/lake-day-mobile.webp' : '/assets/backgrounds/lake-day.webp', page.url()).href)
  expect(requests.length).toBe(1)
  expect(requests[0]).toContain(portrait ? 'lake-day-mobile.webp' : 'lake-day.webp')
  const alpha = await page.locator('#fish').evaluate(element => {
    const image = element as HTMLImageElement
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')!
    context.drawImage(image, 0, 0)
    return { corner: context.getImageData(0, 0, 1, 1).data[3], center: context.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data[3], width: image.naturalWidth, height: image.naturalHeight }
  })
  expect(alpha.corner).toBe(0); expect(alpha.center).toBeGreaterThan(200)
  expect(alpha.width).toBe(1024); expect(alpha.height).toBe(512)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const files = ['fish/bass-main.webp', 'backgrounds/lake-day.webp', 'backgrounds/lake-day-mobile.webp', 'icons/fishing-rod.svg', 'icons/reel.svg', 'icons/hook.svg', 'placeholders/image-missing.svg']
  for (const file of files) {
    const response = await page.request.get(`/assets/${file}`)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain(file.endsWith('.webp') ? 'image/webp' : 'image/svg+xml')
  }
  await page.screenshot({ path: testInfo.outputPath('graphics.png'), fullPage: true })
  expect(errors).toEqual([])
})
