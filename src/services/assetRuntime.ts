import type { AssetId } from '../types/assets'
import type { AssetProvider } from './assetProvider'
import { assetManifest } from '../assets/manifest'
import { AssetResolver } from './assetResolver'
import { PagesStaticProvider } from './pagesStaticProvider'
import type { AssetUrlOptions } from './assetUrls'

export interface PublicAssetRuntimeOptions {
  readonly urls?: AssetUrlOptions
  /** Explicit replacement for tests or a future approved storage migration. */
  readonly publicProvider?: AssetProvider
}

export function createPublicAssetResolver(options: PublicAssetRuntimeOptions = {}): AssetResolver<AssetId> {
  const provider = options.publicProvider ?? new PagesStaticProvider({ urls: options.urls })
  return new AssetResolver({ manifest: assetManifest, providers: [provider], defaultProvider: provider.name, providerForAccess: { public: provider.name } })
}

/** Shared React/Pixi boundary for 3-08; constructing it does not load any images. */
export const assetResolver = createPublicAssetResolver()
