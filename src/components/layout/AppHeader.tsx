import { NavLink } from 'react-router'
import { navigation } from './navigation'

export function DesktopNavigation() {
  return (
    <nav aria-label="PC 주요 메뉴" className="desktop-navigation">{navigation.map(({ to,label }) => <NavLink key={to} to={to} end={to==='/'} className="nav-link">{label}</NavLink>)}</nav>
  )
}
export function MobileNavigation() {
  return (
    <nav aria-label="모바일 주요 메뉴" className="mobile-navigation">{navigation.map(({ to,label,symbol }) => <NavLink key={to} to={to} end={to==='/'} className="nav-link">
      <span aria-hidden="true" className="nav-symbol">{symbol}</span>
      <span>{label}</span>
    </NavLink>)}</nav>
  )
}
export function AppHeader() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <NavLink to="/" className="brand">
          <span aria-hidden="true" className="text-fk-primary">≈</span> FishingKing</NavLink>
        <DesktopNavigation />
        <NavLink to="/login" className="button button-secondary account-link">로그인</NavLink>
      </div>
    </header>
  )
}
