import type { AssetPath } from '../types/assets'
import { getAssetUrlOptions, publicAssetUrl } from './assetUrls'

export function getAssetUrl(path: AssetPath): string {
  return publicAssetUrl(path, getAssetUrlOptions())
}
