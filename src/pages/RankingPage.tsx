import { useState } from 'react'
import { RankingRow } from '../components/content'
import { EmptyState,LoadingState,PageTitle,SecondaryButton,StatusBadge } from '../components/ui'

export function RankingPage() {
  const [category,setCategory]=useState('전체 랭킹')
  const [period,setPeriod]=useState('전체 기간')
  const [state,setState]=useState('normal')
  return (
    <>
      <PageTitle title="랭킹" eyebrow="Along the shoreline" description="물가의 기록을 함께 살펴볼 공간. 지금은 시연 목록이에요." />
      <div className="toolbar">
        <label>랭킹 구분<select className="select mt-2" value={category} onChange={event => setCategory(event.target.value)}>
          <option>전체 랭킹</option>
          <option>어종별 랭킹</option>
        </select>
        </label>
        <label>기간 · 초안<select className="select mt-2" value={period} onChange={event => setPeriod(event.target.value)}>
          <option>전체 기간</option>
          <option>주간</option>
        </select>
        </label>{category==='어종별 랭킹'&&<label>어종<select className="select mt-2" aria-label="어종">
          <option>발견 예시 A · 시연</option>
          <option>발견 예시 B · 시연</option>
        </select>
        </label>}</div>
      <StatusBadge tone="gold">모의 목록 · 산식 미확정</StatusBadge>
      <div className="mt-5">{state==='loading'? <LoadingState label="랭킹을 불러오는 중…" />:state==='empty'? <EmptyState title="아직 집계된 기록이 없어요">미집계 상태의 화면 시연입니다.</EmptyState>:state==='error'? <EmptyState title="랭킹을 불러오지 못했어요" action={<SecondaryButton onClick={() => setState('normal')}>재시도</SecondaryButton>}>오류 화면 시연입니다.</EmptyState>:<table className="rank-table">
        <caption className="sr-only">{category} · {period} · 모의 목록</caption>
        <thead>
          <tr>
            <th scope="col">순위</th>
            <th scope="col">닉네임</th>
            <th scope="col" className="rank-desktop-note">구분</th>
            <th scope="col">기록</th>
          </tr>
        </thead>
        <tbody>{['플레이어 A','플레이어 B','플레이어 C'].map((name,i) => <RankingRow key={name} name={name} position={i+1} />)}</tbody>
      </table>}</div>
      <aside className="panel mt-6">
        <h2 className="font-bold">나의 참가 상태</h2>
        <p className="mt-2 text-fk-muted">비회원 · 공식 랭킹 제출과 계정 기록은 아직 연결되지 않았어요.</p>
      </aside>
      <details className="preview-tools">
        <summary>화면 상태 미리보기</summary>
        <div className="flex flex-wrap gap-3 mt-3">{[['normal','목록'],['loading','로딩'],['empty','빈 화면'],['error','오류']].map(([value,label]) => <SecondaryButton key={value} onClick={() => setState(value)} aria-pressed={state===value}>{label}</SecondaryButton>)}</div>
      </details>
    </>
  )
}
