import { test, expect } from '@playwright/test'

test('메뉴 이동, 직접 진입, 404 복귀와 반응형 UI', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'FishingKing', level: 1 })).toBeVisible()
  await expect(page.locator('header')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(page.locator('header > div')).toHaveCSS(
    'flex-direction', testInfo.project.name === 'mobile' ? 'column' : 'row',
  )
  const nav = page.getByRole('navigation', { name: '주요 메뉴' })
  for (const [label, path] of [
    ['낚시', '/game'], ['도감', '/collection'], ['랭킹', '/ranking'], ['로그인', '/login'],
  ]) {
    await nav.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  }
  await page.goto('/unknown/nested')
  await expect(page.getByRole('heading', { name: /404/ })).toBeVisible()
  await page.getByRole('link', { name: '홈으로 이동' }).click()
  await expect(page.getByRole('heading', { name: 'FishingKing' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true })
  expect(errors).toEqual([])
})

test('키보드로 본문과 메뉴에 접근한다', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: '본문으로 이동' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await page.goto('/')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('banner').getByRole('link', { name: 'FishingKing' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('navigation').getByRole('link', { name: '홈', exact: true })).toBeFocused()
})
