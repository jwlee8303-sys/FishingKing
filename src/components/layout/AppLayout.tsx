import { NavLink, Outlet } from 'react-router'

const navigation = [
  { to: '/', label: '홈' },
  { to: '/game', label: '낚시' },
  { to: '/collection', label: '도감' },
  { to: '/ranking', label: '랭킹' },
  { to: '/login', label: '로그인' },
] as const

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <a className="sr-only focus:not-sr-only focus:p-3" href="#main-content">본문으로 이동</a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <NavLink to="/" className="w-fit text-xl font-semibold tracking-tight">FishingKing</NavLink>
          <nav aria-label="주요 메뉴" className="flex flex-wrap gap-1">
            {navigation.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 px-4 py-5 text-center text-sm text-slate-600">
        FishingKing · 개발 환경 구축 단계
      </footer>
    </div>
  )
}
