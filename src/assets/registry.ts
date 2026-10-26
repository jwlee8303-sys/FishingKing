import { assetManifest } from './manifest'
import { getManifestMetadata, isAssetIdSyntax, validateAssetManifest } from './validation'
import type { AssetId, AssetMetadata } from '../types/assets'

validateAssetManifest(assetManifest)

export function listAssetIds(): readonly AssetId[] {
  return Object.freeze(Object.keys(assetManifest) as AssetId[])
}

/** Membership guard for untrusted database strings; syntax alone is insufficient. */
export function isValidAssetId(input: unknown): input is AssetId {
  return isAssetIdSyntax(input) && Object.hasOwn(assetManifest, input)
}

export function getAssetMetadata(id: AssetId): AssetMetadata<AssetId> {
  return getManifestMetadata(assetManifest, id)
}
