import type { AssetLayout, AssetMetadata, AssetSelectionContext, AssetVariant, SelectedAssetFile } from '../types/assets'
import { AssetError } from '../services/assetErrors'
import { assetLayouts } from './validation'

function positive(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function selectAssetLayout(context: AssetSelectionContext = {}): AssetLayout {
  if (context.layout !== undefined && !(assetLayouts as readonly string[]).includes(context.layout)) throw new AssetError('INVALID_ASSET_METADATA', 'Invalid layout context.')
  if (context.dpr !== undefined && !positive(context.dpr) || context.renderWidth !== undefined && !positive(context.renderWidth)) throw new AssetError('INVALID_ASSET_METADATA', 'Invalid rendering context.')
  const viewport = context.viewport
  if (viewport && (!positive(viewport.width) || !positive(viewport.height))) throw new AssetError('INVALID_ASSET_METADATA', 'Invalid viewport dimensions.')
  if (context.layout) return context.layout
  if (!viewport) return 'default'
  // Mirrors the existing desktop GameShell threshold, without browser/device globals.
  if (viewport.width >= 1100 && viewport.height >= 600) return 'desktop'
  return viewport.height > viewport.width ? 'mobile-portrait' : 'mobile-landscape'
}

/** Pure selection: resizing selects another file, never resets gameplay or fetches data. */
export function selectAssetVariant(metadata: AssetMetadata, context: AssetSelectionContext = {}): SelectedAssetFile {
  const requestedLayout = selectAssetLayout(context)
  let candidates = metadata.variants?.filter(variant => variant.layout === requestedLayout) ?? []
  if (!candidates.length) candidates = metadata.variants?.filter(variant => variant.layout === 'default') ?? []
  const base: AssetVariant = { ...metadata, key: 'default', layout: 'default', pixelRatio: 1 }
  // Base remains a candidate for the default layout, including future density variants.
  if (!candidates.length || candidates[0].layout === 'default') candidates = [base, ...candidates]
  const dpr = context.dpr ?? 1
  let selected: AssetVariant
  if (context.renderWidth && candidates.every(candidate => candidate.width !== undefined)) {
    const targetWidth = context.renderWidth * dpr
    const sorted = [...candidates].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
    selected = sorted.find(candidate => (candidate.width ?? 0) >= targetWidth) ?? sorted[sorted.length - 1]
  } else {
    const sorted = [...candidates].sort((a, b) => (a.pixelRatio ?? 1) - (b.pixelRatio ?? 1))
    selected = sorted.find(candidate => (candidate.pixelRatio ?? 1) >= dpr) ?? sorted[sorted.length - 1]
  }
  const file = Object.freeze({ path: selected.path, contentType: selected.contentType, width: selected.width, height: selected.height, sizeBytes: selected.sizeBytes, sha256: selected.sha256 })
  return Object.freeze({ key: selected.key, requestedLayout, layout: selected.layout, file })
}
