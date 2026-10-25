import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section aria-labelledby="page-title">
      <h1 id="page-title" className="text-2xl font-semibold">404 · 페이지를 찾을 수 없습니다</h1>
      <p className="mt-4 text-fk-muted">주소를 확인하거나 홈으로 이동해 주세요.</p>
      <Link to="/" className="button button-primary mt-6">홈으로 이동</Link>
    </section>
  )
}
