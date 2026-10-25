import { useState } from 'react'
import { PageTitle,ProfileCard,SecondaryButton,StatusBadge } from '../components/ui'

export function ProfilePage() {
  const [reduced,setReduced]=useState(false)
  const [exampleSignedIn,setExampleSignedIn]=useState(false)
  return (
    <div data-reduced-motion={reduced}>
      <PageTitle title="내 정보" eyebrow="Your little logbook" description="나의 발견과 기록, 편안한 플레이를 위한 설정." />
      <div className="profile-grid">
        <ProfileCard exampleSignedIn={exampleSignedIn} />
        <div className="space-y-6">
          <section className="panel">
            <h2 className="text-xl font-bold mb-5">물가의 기록</h2>
            <dl className="stat-grid">
              <div>
                <dt>발견한 물고기</dt>
                <dd>—</dd>
              </div>
              <div>
                <dt>포획 기록</dt>
                <dd>—</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-fk-muted">기록 미연결 · 없는 기록을 0으로 표시하지 않아요.</p>
          </section>
          <section className="panel">
            <h2 className="text-xl font-bold mb-3">플레이 환경</h2>
            <label className="preference">이 화면의 동작 줄이기<input type="checkbox" checked={reduced} onChange={event => setReduced(event.target.checked)} />
            </label>
            <div className="preference">
              <span>소리</span>
              <StatusBadge tone="muted">준비 중</StatusBadge>
            </div>
            <p className="mt-4 text-sm text-fk-muted">현재 시연 설정은 저장되지 않아요. 비회원 기록 보존과 로그인 시 병합은 아직 지원하지 않아요.</p>
          </section>
        </div>
      </div>
      <details className="preview-tools">
        <summary>화면 상태 미리보기</summary>
        <SecondaryButton className="mt-3" aria-pressed={exampleSignedIn} onClick={() => setExampleSignedIn(!exampleSignedIn)}>{exampleSignedIn? '비회원 화면 보기':'로그인 상태 예시 보기'}</SecondaryButton>
      </details>
    </div>
  )
}
