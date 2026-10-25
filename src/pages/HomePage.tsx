import { Link } from 'react-router'
import { AssetVisual } from '../components/AssetVisual'
import { StatusBadge } from '../components/ui'

export function HomePage() {
  return (
    <>
      <div className="hero">
        <div>
          <p className="eyebrow">A little escape by the water</p>
          <h1 className="text-xl font-bold text-fk-muted mb-4">FishingKing</h1>
          <h2 className="hero-title">물가에서 시작하는<br />나만의 작은 모험</h2>
          <p className="mt-5 mb-6 max-w-md text-fk-muted">잠시 숨을 고르고, 물결 너머의 만남을 기다려보세요. 계정 없이도 낚시 화면을 둘러볼 수 있어요.</p>
          <StatusBadge>UI 시연 · 비회원</StatusBadge>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/game" className="button button-primary min-w-44">낚시 시작 <span aria-hidden="true">→</span>
            </Link>
            <Link to="/login" className="button button-secondary">로그인</Link>
          </div>
          <p className="mt-4 text-sm text-fk-muted">현재는 화면과 조작 표시를 체험하는 시연입니다.</p>
        </div>
        <div className="hero-preview">
          <AssetVisual scene alt="해와 물결로 표현한 낚시터 미리보기" />
        </div>
      </div>
      <div className="quick-links">{[{ to: '/collection',title: '나의 발견 도감',body: '차곡차곡 쌓일 물가의 추억' },{ to: '/ranking',title: '랭킹 둘러보기',body: '기록 화면의 미리보기' },{ to: '/profile',title: '내 정보',body: '발견 요약과 플레이 환경' },{ to: '/game',title: '비회원으로 계속',body: '로그인 없이 화면 체험' }].map(item => <Link className="quick-link" to={item.to} key={item.to+item.title}>
        <strong>{item.title} <span aria-hidden="true" className="text-fk-primary">↗</span>
        </strong>
        <p>{item.body}</p>
      </Link>)}</div>
      <section className="mt-8 panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">나의 발견</h2>
          <p className="mt-2 text-sm text-fk-muted">아직 발견 기록이 없어요. 첫 만남을 기다리고 있어요.</p>
        </div>
        <Link to="/collection" className="button button-secondary">도감 보기</Link>
      </section>
    </>
  )
}
