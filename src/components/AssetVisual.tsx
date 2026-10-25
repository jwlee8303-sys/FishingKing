import { useState } from 'react'
import { getAssetUrl } from '../services/assets'
import type { AssetPath } from '../types/assets'

// A single image seam for 3-05 assets; no placeholder URLs or external requests.
export function AssetVisual({ path,alt,scene=false }: { path?: AssetPath; alt: string; scene?: boolean }) {
  const [failedPath,setFailedPath]=useState<AssetPath>()
  if(path&&failedPath!==path) return (
    <img className="asset-image" src={getAssetUrl(path)} alt={alt} onError={() => setFailedPath(path)} />
  )
  return (
    <div role="img" aria-label={alt} className={scene? 'lake-scene':'fish-placeholder'}>{scene? <>
      <div className="lake-sun" />
      <div className="lake-shore" />
      <div className="lake-water">
        <span>≈</span>
      </div>
      <span className="scene-caption">낚시터 그래픽 준비 중</span>
    </>:<span aria-hidden="true">≈</span>}</div>
  )
}
