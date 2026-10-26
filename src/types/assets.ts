export type AssetDirectory = 'images' | 'fish' | 'backgrounds' | 'icons' | 'placeholders' | 'audio'

/** Path relative to public/assets; keep filenames independent of the hosting provider. */
export type AssetPath = `${AssetDirectory}/${string}`

/** Inferred from the single registration table; variants do not create IDs. */
export type AssetId = keyof typeof import('../assets/manifest').assetManifest
export type AssetType = 'fish' | 'background' | 'icon' | 'placeholder'
export type AssetAccess = 'public' | 'private'
export type AssetContentType = 'image/webp' | 'image/svg+xml'
export type AssetLayout = 'default' | 'mobile-portrait' | 'mobile-landscape' | 'desktop'
export type AssetInputSource = 'internal' | 'external'

export interface AssetFileMetadata {
  readonly path: string
  readonly contentType: AssetContentType
  readonly width?: number
  readonly height?: number
  readonly sizeBytes?: number
  readonly sha256?: string
}

export interface AssetVariant extends AssetFileMetadata {
  readonly key: string
  readonly layout: AssetLayout
  readonly pixelRatio?: number
}

export interface AssetMetadata<Id extends string = string> extends AssetFileMetadata {
  readonly id: Id
  readonly type: AssetType
  readonly access: AssetAccess
  readonly fallbackId?: Id
  readonly variants?: readonly AssetVariant[]
  readonly version?: string
  readonly attribution?: string
}

export type AssetManifest<Id extends string = string> = Readonly<Record<Id, AssetMetadata<Id>>>

export interface AssetSelectionContext {
  readonly layout?: AssetLayout
  readonly viewport?: { readonly width: number; readonly height: number }
  readonly dpr?: number
  readonly renderWidth?: number
}

export interface SelectedAssetFile {
  readonly key: string
  readonly requestedLayout: AssetLayout
  readonly layout: AssetLayout
  readonly file: AssetFileMetadata
}

export interface AssetResolveContext extends AssetSelectionContext {
  readonly fallback?: 'none' | 'placeholder'
  readonly inputSource?: AssetInputSource
  readonly providerName?: string
  readonly signal?: AbortSignal
}

export interface AssetProviderRequest {
  readonly assetId: string
  readonly type: AssetType
  readonly access: AssetAccess
  readonly file: AssetFileMetadata
  readonly variantKey: string
  readonly version?: string
}

export interface AssetProviderContext {
  readonly signal?: AbortSignal
  /** Epoch milliseconds; providers can use this to evaluate signed URL expiry. */
  readonly now: number
}

export interface AssetProviderResult {
  readonly assetId: string
  readonly url: string
  readonly contentType: AssetContentType
  readonly providerName: string
  readonly expiresAt?: number
}

export interface ResolvedAsset<Id extends string = AssetId> extends AssetProviderResult {
  readonly assetId: Id
  readonly requestedId: string | null
  readonly access: AssetAccess
  readonly variantKey: string
  readonly requestedLayout: AssetLayout
  readonly selectedLayout: AssetLayout
  readonly file: AssetFileMetadata
  readonly usedFallback: boolean
  /** Safe diagnostics only; provider exceptions and credentials are not copied. */
  readonly fallbackErrors: readonly AssetDiagnostic[]
}

export type AssetErrorCode =
  | 'INVALID_ASSET_ID' | 'ASSET_NOT_FOUND' | 'INVALID_ASSET_METADATA'
  | 'PROVIDER_NOT_FOUND' | 'ACCESS_DENIED' | 'ASSET_RESOLVE_FAILED'
  | 'FALLBACK_CYCLE' | 'ASSET_LOAD_FAILED' | 'ASSET_RESOLVE_ABORTED'

export interface AssetDiagnostic {
  readonly code: AssetErrorCode
  readonly inputSource: AssetInputSource
}
