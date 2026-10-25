import { useState } from 'react'
import { Link } from 'react-router'
import { FishCard } from '../components/content'
import type { DiscoveredFish } from '../components/content'
import { EmptyState,InputField,LoadingState,Modal,PageTitle,SecondaryButton,StatusBadge } from '../components/ui'

const examples: DiscoveredFish[]=[
  { id: 'demo-a',name: '발견 예시 A',water: '민물',discovered: true },
  { id: 'demo-b',name: '발견 예시 B',water: '바다',discovered: true },
]

export function CollectionPage() {
  const [demo,setDemo]=useState(false)
  const [query,setQuery]=useState('')
  const [water,setWater]=useState('전체')
  const [state,setState]=useState('normal')
  const [selected,setSelected]=useState<DiscoveredFish|null>(null)
  const discovered=demo? examples:[]
  const filtered=discovered.filter(fish => fish.discovered&&fish.name.includes(query)&&(water==='전체'||fish.water===water))
  return (
    <>
      <PageTitle title="도감" eyebrow="My discoveries" description="내가 발견한 물고기만 모아보는 작은 기록장." />
      <div className="toolbar">
        <InputField type="search" label="발견한 물고기 검색" value={query} onChange={event => setQuery(event.target.value)} placeholder="이름으로 검색" />
        <label>발견 수역<select aria-label="발견 수역" className="select mt-2" value={water} onChange={event => setWater(event.target.value)}>
          <option>전체</option>
          <option>민물</option>
          <option>바다</option>
        </select>
        </label>
      </div>
      <div className="mb-5 flex items-center gap-3">
        <StatusBadge tone="muted">발견 {discovered.length}종</StatusBadge>{demo&&<StatusBadge>UI 시연 자료</StatusBadge>}</div>{state==='loading'? <LoadingState />:state==='error'? <EmptyState title="발견 목록을 불러오지 못했어요" action={<SecondaryButton onClick={() => setState('normal')}>재시도</SecondaryButton>}>오류 화면 시연입니다. 저장된 자료를 변경하지 않습니다.</EmptyState>:filtered.length? <div className="fish-grid">{filtered.map(fish => <FishCard key={fish.id} fish={fish} onSelect={() => setSelected(fish)} />)}</div>:<EmptyState title={discovered.length? '검색 결과가 없어요':'아직 발견한 물고기가 없어요'} action={discovered.length? <SecondaryButton onClick={() => { setQuery(''); setWater('전체') }}>필터 초기화</SecondaryButton>:<Link to="/game" className="button button-primary">낚시 시작</Link>}>{discovered.length? '발견 목록 안에서 다른 조건을 선택해보세요.':'새로운 만남은 앞으로 이곳에 모일 거예요.'}</EmptyState>}<details className="preview-tools">
        <summary>화면 상태 미리보기</summary>
        <div className="flex flex-wrap gap-3 mt-3">
          <SecondaryButton aria-pressed={demo} onClick={() => setDemo(!demo)}>{demo? '발견 예시 숨기기':'발견 예시 보기'}</SecondaryButton>
          <SecondaryButton onClick={() => setState('loading')}>로딩 화면</SecondaryButton>
          <SecondaryButton onClick={() => setState('error')}>오류 화면</SecondaryButton>
          <SecondaryButton onClick={() => { setState('normal'); setDemo(false) }}>빈 화면</SecondaryButton>
        </div>
      </details>
      <Modal open={selected!==null} title={selected?.name??'물고기 정보'} onClose={() => setSelected(null)}>
        <StatusBadge>발견 예시 · UI 시연</StatusBadge>
        <dl className="mt-6 space-y-3">
          <div>
            <dt className="text-fk-muted">수역</dt>
            <dd>{selected?.water}</dd>
          </div>
          <div>
            <dt className="text-fk-muted">크기 · 발견 이력</dt>
            <dd>미기록</dd>
          </div>
        </dl>
        <p className="mt-6 text-sm text-fk-muted">실제 어종·사용자 기록과 연결되지 않은 자료예요.</p>
      </Modal>
    </>
  )
}
