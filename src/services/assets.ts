import type { AssetPath } from '../types/assets'

/** Public URL prefix only. Changing providers requires the user's approval. */
const configuredBase: string | undefined = import.meta.env.VITE_ASSET_BASE_URL
const assetBaseUrl = configuredBase?.trim() || `${import.meta.env.BASE_URL}assets/`

export function getAssetUrl(path: AssetPath): string {
  return `${assetBaseUrl.replace(/\/+$/, '')}/${path}`
}
