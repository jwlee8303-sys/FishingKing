import { useEffect,useRef } from 'react'
import { Outlet,useLocation } from 'react-router'
import { AppHeader,MobileNavigation } from './AppHeader'

export function AppLayout() {
  const { pathname }=useLocation()
  const previous=useRef(pathname)
  useEffect(() => {
    if(previous.current!==pathname) document.getElementById('main-content')?.focus()
    previous.current=pathname
    document.title='FishingKing'
  },[pathname])
  const game=pathname==='/game'
  return (
    <div className={`app-shell ${game? 'game-route':''} ${pathname==='/login'? 'login-route':''}`}>
      <a className="skip-link" href="#main-content">본문으로 이동</a>
      {!game&&<AppHeader />}
      <main id="main-content" tabIndex={-1} className={game? 'game-main':'page-content'}>
        <Outlet />
      </main>
      {!game&&<><footer className="app-footer">FishingKing · 물가에서 시작하는 작은 모험</footer><MobileNavigation /></>}
    </div>
  )
}
