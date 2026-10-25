import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '../../src/App'

function renderAt(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

describe('페이지와 내비게이션', () => {
  it('홈 제목과 기본 메뉴를 표시한다', () => {
    renderAt()
    expect(screen.getByRole('heading', { name: 'FishingKing', level: 1 })).toBeVisible()
    const nav = within(screen.getByRole('navigation', { name: '주요 메뉴' }))
    for (const name of ['홈', '낚시', '도감', '랭킹', '로그인']) {
      expect(nav.getByRole('link', { name })).toBeVisible()
    }
    expect(nav.getByRole('link', { name: '홈' })).toHaveAttribute('aria-current', 'page')
  })

  it('메뉴 클릭으로 이동하고 현재 페이지를 표시한다', async () => {
    const user = userEvent.setup()
    renderAt()
    const nav = within(screen.getByRole('navigation', { name: '주요 메뉴' }))
    for (const name of ['낚시', '도감', '랭킹', '로그인']) {
      await user.click(nav.getByRole('link', { name }))
      expect(screen.getByRole('heading', { name })).toBeVisible()
      expect(nav.getByRole('link', { name })).toHaveAttribute('aria-current', 'page')
    }
  })

  it('404 페이지에서 홈으로 복귀한다', async () => {
    const user = userEvent.setup()
    renderAt('/missing/nested')
    expect(screen.getByRole('heading', { name: /404/ })).toBeVisible()
    await user.click(screen.getByRole('link', { name: '홈으로 이동' }))
    expect(screen.getByRole('heading', { name: 'FishingKing' })).toBeVisible()
  })
})
