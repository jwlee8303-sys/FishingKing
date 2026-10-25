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
    const nav = within(screen.getByRole('navigation', { name: 'PC 주요 메뉴' }))
    for (const name of ['홈', '낚시', '도감', '랭킹', '내 정보']) {
      expect(nav.getByRole('link', { name })).toBeVisible()
    }
    expect(nav.getByRole('link', { name: '홈' })).toHaveAttribute('aria-current', 'page')
  })

  it('메뉴 클릭으로 이동하고 현재 페이지를 표시한다', async () => {
    const user = userEvent.setup()
    renderAt()
    for (const name of ['도감', '랭킹', '내 정보']) {
      const nav = within(screen.getByRole('navigation', { name: 'PC 주요 메뉴' }))
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

  it('도감은 빈 발견 목록으로 시작하고 시연 자료만 검색한다', async () => {
    const user = userEvent.setup()
    renderAt('/collection')
    expect(screen.getByText('아직 발견한 물고기가 없어요')).toBeVisible()
    await user.click(screen.getByText('화면 상태 미리보기'))
    await user.click(screen.getByRole('button', { name: '발견 예시 보기' }))
    expect(screen.getByText('발견 예시 A')).toBeVisible()
    await user.type(screen.getByRole('searchbox'), '없는 이름')
    expect(screen.getByText('검색 결과가 없어요')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '필터 초기화' }))
    expect(screen.getByText('발견 예시 A')).toBeVisible()
  })

  it('로그인은 필드 오류와 미연결 상태를 구분하며 비회원 진입을 제공한다', async () => {
    const user = userEvent.setup()
    renderAt('/login')
    await user.click(screen.getByRole('button', { name: '로그인 화면 확인' }))
    expect(screen.getByLabelText('계정 정보')).toHaveAttribute('aria-invalid', 'true')
    await user.type(screen.getByLabelText('계정 정보'), '시연')
    await user.click(screen.getByRole('button', { name: '로그인 화면 확인' }))
    expect(screen.getByRole('alert')).toHaveTextContent('인증 서비스가 연결되지 않았어요')
    await user.click(screen.getByRole('link', { name: '비회원으로 계속' }))
    expect(screen.getByRole('heading', { name: '낚시' })).toBeInTheDocument()
  })
})
