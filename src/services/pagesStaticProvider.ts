import type { AssetManifest, AssetProviderContext, AssetProviderRequest, AssetProviderResult } from '../types/assets'
import type { AssetProvider } from './assetProvider'
import { assetManifest } from '../assets/manifest.ts'
import { assertAssetMetadata, createAssetManifest, getManifestMetadata, validateAssetManifest } from '../assets/validation.ts'
import { AssetError } from './assetErrors.ts'
import { getAssetUrlOptions, publicAssetUrl, type AssetUrlOptions } from './assetUrls.ts'

export interface PagesStaticProviderOptions {
  readonly urls?: AssetUrlOptions
  readonly manifest?: AssetManifest
}

/** Public files only; no downloads, orientation detection, or authorization bypass. */
export class PagesStaticProvider implements AssetProvider {
  readonly name = 'pages-static'
  readonly supportedAccess = Object.freeze(['public'] as const)
  private readonly manifest: AssetManifest
  private readonly urls: AssetUrlOptions

  constructor(options: PagesStaticProviderOptions = {}) {
    const manifest = options.manifest ?? assetManifest
    validateAssetManifest(manifest)
    this.manifest = createAssetManifest(Object.values(manifest))
    this.urls = Object.freeze({ ...(options.urls ?? getAssetUrlOptions()) })
    publicAssetUrl('placeholders/image-missing.svg', this.urls)
  }

  async resolve(request: AssetProviderRequest, context: AssetProviderContext): Promise<AssetProviderResult> {
    if (context.signal?.aborted) throw new AssetError('ASSET_RESOLVE_ABORTED', 'Asset URL resolution was cancelled.')
    if (request?.access !== 'public') throw new AssetError('ACCESS_DENIED', 'Pages static assets must be public.')
    const metadata = getManifestMetadata(this.manifest, request.assetId)
    if (metadata.access !== 'public') throw new AssetError('ACCESS_DENIED', 'Pages static assets must be public.')
    const fields = ['path', 'contentType', 'width', 'height', 'sizeBytes', 'sha256'] as const
    if (typeof request.file !== 'object' || request.file === null || Object.keys(request.file).some(field => !(fields as readonly string[]).includes(field))) {
      throw new AssetError('INVALID_ASSET_METADATA', 'Invalid static asset file fields.')
    }
    assertAssetMetadata({ ...request.file, id: request.assetId, type: request.type, access: request.access })
    const file = request.variantKey === 'default' ? metadata : metadata.variants?.find(variant => variant.key === request.variantKey)
    if (!file || request.type !== metadata.type || request.version !== metadata.version || fields.some(field => request.file[field] !== file[field])) {
      throw new AssetError('INVALID_ASSET_METADATA', 'Static asset request does not match the registered file.')
    }
    return Object.freeze({ assetId: metadata.id, url: publicAssetUrl(file.path, this.urls), contentType: file.contentType, providerName: this.name })
  }
}
