import { test,expect } from '@playwright/test'

const routes=[['/','FishingKing'],['/game','낚시'],['/collection','도감'],['/ranking','랭킹'],['/profile','내 정보'],['/login','로그인']] as const

test('6개 라우트, 메뉴, 404, 터치 크기와 콘솔 회귀',async ({ page },testInfo) => {
  const errors: string[]=[]
  page.on('pageerror',error => errors.push(error.message))
  page.on('console',message => { if(message.type()==='error') errors.push(message.text()) })
  for(const [path,heading] of routes) {
    await page.goto('/')
    if(path==='/login') {
      const link=page.getByRole('banner').getByRole('link',{ name: '로그인',exact: true })
      if(testInfo.project.use.hasTouch) await link.tap(); else await link.click()
    }
    else if(path!=='/') {
      const nav=page.locator('nav:visible').first()
      const link=nav.getByRole('link',{ name: path==='/game'? '낚시':heading,exact: true })
      if(testInfo.project.use.hasTouch) await link.tap(); else await link.click()
    }
    await expect(page).toHaveURL(url => url.pathname===path)
    await expect(page.getByRole('heading',{ name: heading,exact: true,level: 1 })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading',{ name: heading,exact: true,level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
    const tooSmall=await page.locator('a,button,input,select,summary').evaluateAll(elements => elements.flatMap(el => {
      const r=el.getBoundingClientRect(),style=getComputedStyle(el)
      if(style.visibility==='hidden'||!r.width||!r.height||r.bottom<=0||r.top>=innerHeight) return []
      return r.width<43.9||r.height<43.9? [{ text: el.textContent?.trim(),width: r.width,height: r.height }]:[]
    }))
    expect(tooSmall).toEqual([])
    if(path==='/'||path==='/game') await page.screenshot({ path: testInfo.outputPath(path==='/'? 'home.png':'game.png'),fullPage: true })
  }
  await page.goto('/unknown/nested')
  await expect(page.getByRole('heading',{ name: /404/ })).toBeVisible()
  await page.getByRole('link',{ name: '홈으로 이동' }).click()
  await expect(page.getByRole('heading',{ name: 'FishingKing',exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('게임 HUD, 버튼 영역 분리, 누름 해제와 회전, 메뉴 접근',async ({ page },testInfo) => {
  await page.goto('/game')
  await expect(page.getByText('UI 시연 · 낚시')).toBeVisible()
  const buttons=page.locator('.direction-control button, .action-control button')
  const rectangles=await buttons.evaluateAll(elements => elements.map(el => {
    const r=el.getBoundingClientRect(); return { x: r.x,y: r.y,right: r.right,bottom: r.bottom }
  }))
  const size=page.viewportSize()!
  for(let i=0;i<rectangles.length;i++) {
    const a=rectangles[i]
    expect(a.x).toBeGreaterThanOrEqual(0); expect(a.y).toBeGreaterThanOrEqual(0)
    expect(a.right).toBeLessThanOrEqual(size.width); expect(a.bottom).toBeLessThanOrEqual(size.height)
    for(let j=i+1;j<rectangles.length;j++) {
      const b=rectangles[j]; expect(Math.min(a.right,b.right)-Math.max(a.x,b.x)>0.5&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>0.5).toBe(false)
    }
  }
  const scene=await page.getByTestId('game-scene').boundingBox()
  expect(scene).not.toBeNull()
  for(const a of rectangles) expect(Math.min(a.right,scene!.x+scene!.width)-Math.max(a.x,scene!.x)>0.5&&Math.min(a.bottom,scene!.y+scene!.height)-Math.max(a.y,scene!.y)>0.5).toBe(false)
  const reel=page.getByRole('button',{ name: '릴 감기',exact: true })
  await reel.focus(); await page.keyboard.down('Space')
  await expect(reel).toHaveAttribute('aria-pressed','true')
  await page.keyboard.up('Space'); await expect(reel).toHaveAttribute('aria-pressed','false')
  await reel.focus(); await page.keyboard.down('Space')
  await page.setViewportSize(size.width>size.height? { width: 390,height: 844 }:{ width: 844,height: 390 })
  await expect(reel).toHaveAttribute('aria-pressed','false')
  await page.keyboard.up('Space')
  await page.getByRole('button',{ name: '메뉴',exact: true }).first().click()
  const dialog=page.getByRole('dialog',{ name: '잠시 쉬어가기' })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape'); await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('button',{ name: '메뉴',exact: true }).first()).toBeFocused()
  await page.getByRole('button',{ name: '메뉴',exact: true }).first().click()
  await dialog.getByRole('link',{ name: '도감',exact: true }).click()
  await expect(page).toHaveURL(/\/collection$/)
  await page.screenshot({ path: testInfo.outputPath('collection.png'),fullPage: true })
})

test('로그인 필드, 키보드 접근, 비회원 및 시연 상태',async ({ page },testInfo) => {
  await page.goto('/')
  await page.keyboard.press('Tab'); await expect(page.getByRole('link',{ name: '본문으로 이동' })).toBeFocused()
  await page.keyboard.press('Enter'); await expect(page.getByRole('main')).toBeFocused()
  await page.goto('/login')
  await page.getByRole('button',{ name: '로그인 화면 확인' }).click()
  await expect(page.getByLabel('계정 정보')).toHaveAttribute('aria-invalid','true')
  await page.getByLabel('계정 정보').fill('시연 이름')
  await page.getByRole('button',{ name: '로그인 화면 확인' }).click()
  await expect(page.getByRole('alert')).toContainText('인증 서비스가 연결되지 않았어요')
  await page.getByRole('button',{ name: '회원가입 안내' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button',{ name: '닫기',exact: true }).click()
  await expect(page.getByRole('button',{ name: '회원가입 안내' })).toBeFocused()
  await page.screenshot({ path: testInfo.outputPath('login.png'),fullPage: true })
  await page.getByRole('link',{ name: '비회원으로 계속' }).click()
  await expect(page).toHaveURL(/\/game$/)
})

test('직접 누름과 취소, Safe Area 기본 여백 및 시연 상태',async ({ page },testInfo) => {
  await page.goto('/game')
  const reel=page.getByRole('button',{ name: '릴 감기',exact: true })
  const box=(await reel.boundingBox())!
  if(testInfo.project.use.hasTouch) {
    const session=await page.context().newCDPSession(page)
    await session.send('Input.dispatchTouchEvent',{ type: 'touchStart',touchPoints: [{ x: box.x+box.width/2,y: box.y+box.height/2,id: 1 }] })
    await expect(reel).toHaveAttribute('aria-pressed','true')
    await session.send('Input.dispatchTouchEvent',{ type: 'touchCancel',touchPoints: [] })
    await expect(reel).toHaveAttribute('aria-pressed','false')
    await session.detach()
  } else {
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2); await page.mouse.down()
    await expect(reel).toHaveAttribute('aria-pressed','true')
    await page.mouse.move(box.x-16,box.y-16)
    await expect(reel).toHaveAttribute('aria-pressed','false'); await page.mouse.up()
  }
  const padding=await page.locator('.game-shell').evaluate(el => { const s=getComputedStyle(el); return [s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft].map(parseFloat) })
  expect(padding[0]).toBeGreaterThanOrEqual(12); expect(padding[1]).toBeGreaterThanOrEqual(16)
  expect(padding[2]).toBeGreaterThanOrEqual(16); expect(padding[3]).toBeGreaterThanOrEqual(16)
  await page.getByRole('button',{ name: '메뉴',exact: true }).first().click()
  const dialog=page.getByRole('dialog')
  await dialog.getByText('화면 상태 미리보기',{ exact: true }).click()
  await dialog.getByRole('button',{ name: '입질 신호',exact: true }).click()
  await expect(page.getByText('！ 입질 신호 · 입질반응을 눌러보세요')).toBeVisible()
  await page.getByRole('button',{ name: '메뉴',exact: true }).first().click()
  await page.getByRole('dialog').getByRole('button',{ name: '오류',exact: true }).click()
  await expect(page.getByRole('button',{ name: '캐스팅',exact: true })).toBeDisabled()
  await page.getByRole('button',{ name: '재시도',exact: true }).click()
  await expect(page.getByRole('button',{ name: '캐스팅',exact: true })).toBeEnabled()
})
