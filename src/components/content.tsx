import { AssetVisual } from './AssetVisual'
import { StatusBadge } from './ui'

export interface DiscoveredFish { id: string; name: string; water: '민물'|'바다'; discovered: true }
export function FishCard({ fish,onSelect }: { fish: DiscoveredFish; onSelect: () => void }) {
  return (
    <button className="fish-card text-left" onClick={onSelect}>
      <AssetVisual alt={`${fish.name} 이미지 준비 중`} />
      <span className="block p-4">
        <StatusBadge tone="muted">발견 · 시연</StatusBadge>
        <strong className="mt-3 block text-lg">{fish.name}</strong>
        <span className="mt-1 block text-sm text-fk-muted">{fish.water} · 크기 미기록</span>
      </span>
    </button>
  )
}
export function RankingRow({ position,name }: { position: number; name: string }) {
  return (
    <tr>
      <td className={position===1? 'text-fk-gold':'text-fk-muted'}>{String(position).padStart(2,'0')}</td>
      <th scope="row">{name}<span className="rank-mobile-note">모의 자료 · 공식 기록 아님</span>
      </th>
      <td className="rank-desktop-note">모의 자료</td>
      <td>미기록</td>
    </tr>
  )
}
