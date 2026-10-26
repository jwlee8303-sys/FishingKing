import type {
  AssetAccess, AssetDiagnostic, AssetInputSource, AssetManifest, AssetMetadata,
  AssetProviderRequest, AssetProviderResult, AssetResolveContext, ResolvedAsset,
} from '../types/assets'
import type { AssetProvider } from './assetProvider'
import { AssetError, createAssetLoadError } from './assetErrors'
import { createAssetManifest, getManifestMetadata, isAssetIdSyntax, validateAssetManifest } from '../assets/validation'
import { selectAssetVariant } from '../assets/variants'

export interface AssetResolverOptions<Id extends string> {
  readonly manifest: AssetManifest<Id>
  readonly providers: readonly AssetProvider[]
  readonly defaultProvider?: string
  readonly providerForAccess?: Readonly<Partial<Record<AssetAccess, string>>>
  readonly placeholderId?: Id
  readonly now?: () => number
  /** No authorization callback means private access is denied, even by a capable provider. */
  readonly authorizePrivate?: (metadata: AssetMetadata<Id>, context: AssetResolveContext) => boolean | Promise<boolean>
}

function safeUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value || value !== value.trim() || value.includes('\\') || [...value].some(character => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127) || value.startsWith('//')) return false
  if (!value.startsWith('/') && !/^https?:\/\//i.test(value)) return false
  try {
    const url = new URL(value, 'https://resolver.invalid')
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && !url.hash
  } catch { return false }
}

export class AssetResolver<Id extends string> {
  private readonly manifest: AssetManifest<Id>
  private readonly providers = new Map<string, AssetProvider>()
  private readonly options: AssetResolverOptions<Id>

  constructor(options: AssetResolverOptions<Id>) {
    validateAssetManifest(options.manifest)
    // Snapshot the validated registry and routes: later caller mutation cannot bypass checks.
    this.manifest = createAssetManifest(Object.values(options.manifest)) as AssetManifest<Id>
    const placeholderId = options.placeholderId ?? (Object.hasOwn(this.manifest, 'placeholder.image') ? 'placeholder.image' as Id : undefined)
    this.options = { ...options, placeholderId, providerForAccess: Object.freeze({ ...options.providerForAccess }) }
    if (placeholderId !== undefined) {
      const placeholder = getManifestMetadata(this.manifest, placeholderId)
      if (placeholder.access !== 'public' || placeholder.type !== 'placeholder' || placeholder.fallbackId) throw new AssetError('INVALID_ASSET_METADATA', 'The terminal placeholder must be public and have no fallback.')
    }
    for (const provider of options.providers) {
      if (typeof provider?.name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(provider.name) || this.providers.has(provider.name) || typeof provider.resolve !== 'function' || !Array.isArray(provider.supportedAccess) || !provider.supportedAccess.length || provider.supportedAccess.some(access => access !== 'public' && access !== 'private')) throw new AssetError('ASSET_RESOLVE_FAILED', 'Invalid or duplicate provider configuration.')
      this.providers.set(provider.name, Object.freeze({ name: provider.name, supportedAccess: Object.freeze([...provider.supportedAccess]), resolve: provider.resolve.bind(provider) }))
    }
  }

  getAssetMetadata(id: Id): AssetMetadata<Id> { return getManifestMetadata(this.manifest, id) }

  listAssetIds(): readonly Id[] { return Object.freeze(Object.keys(this.manifest) as Id[]) }

  isValidAssetId(input: unknown): input is Id {
    return isAssetIdSyntax(input) && Object.hasOwn(this.manifest, input)
  }

  /** Typed internal calls: typos in registered static IDs fail TypeScript checking. */
  resolveAsset(id: Id, context: AssetResolveContext = {}): Promise<ResolvedAsset<Id>> {
    return this.resolve(id, context)
  }

  /** Separate boundary for unknown database/API values, with external diagnostics. */
  resolveExternalAsset(input: unknown, context: AssetResolveContext = {}): Promise<ResolvedAsset<Id>> {
    return this.resolve(input, { ...context, inputSource: 'external' })
  }

  /** Explicit handoff after a React/Pixi loader observes an HTTP/decode failure. */
  resolveFallback(id: Id, context: AssetResolveContext = {}): Promise<ResolvedAsset<Id>> {
    return this.resolve(id, { ...context, fallback: 'placeholder' }, true)
  }

  private aborted(context: AssetResolveContext, source: AssetInputSource): void {
    if (context.signal?.aborted) throw new AssetError('ASSET_RESOLVE_ABORTED', 'Asset URL resolution was cancelled.', source)
  }

  private async checkAccess(metadata: AssetMetadata<Id>, context: AssetResolveContext, source: AssetInputSource): Promise<void> {
    if (metadata.access === 'public') return
    let allowed = false
    try { allowed = await this.options.authorizePrivate?.(metadata, context) === true } catch { /* deny closed */ }
    this.aborted(context, source)
    if (!allowed) throw new AssetError('ACCESS_DENIED', 'Private asset access is not authorized.', source)
  }

  private async callProvider(metadata: AssetMetadata<Id>, context: AssetResolveContext, source: AssetInputSource): Promise<ResolvedAsset<Id>> {
    const selection = selectAssetVariant(metadata, context)
    const providerName = context.providerName ?? this.options.providerForAccess?.[metadata.access] ?? this.options.defaultProvider
    const provider = providerName ? this.providers.get(providerName) : undefined
    if (!provider) throw new AssetError('PROVIDER_NOT_FOUND', 'No asset provider is configured for this request.', source)
    if (!provider.supportedAccess.includes(metadata.access)) throw new AssetError('ACCESS_DENIED', 'The provider does not support this access policy.', source)
    const request: AssetProviderRequest = Object.freeze({ assetId: metadata.id, type: metadata.type, access: metadata.access, file: selection.file, variantKey: selection.key, version: metadata.version })
    const now = (this.options.now ?? Date.now)()
    let result: unknown
    try { result = await provider.resolve(request, { signal: context.signal, now }) }
    catch (error) {
      this.aborted(context, source)
      // Do not copy exception messages that might contain signed URLs or tokens.
      if (error instanceof AssetError && error.code === 'ACCESS_DENIED') throw new AssetError('ACCESS_DENIED', 'The provider denied asset access.', source)
      if (error instanceof AssetError && error.code === 'INVALID_ASSET_METADATA') throw new AssetError('INVALID_ASSET_METADATA', 'The provider rejected inconsistent asset metadata.', source)
      throw new AssetError('ASSET_RESOLVE_FAILED', 'The asset provider could not resolve a URL.', source)
    }
    this.aborted(context, source)
    if (!isProviderResult(result, request, provider.name, (this.options.now ?? Date.now)())) throw new AssetError('ASSET_RESOLVE_FAILED', 'The asset provider returned an invalid or expired result.', source)
    return Object.freeze({
      assetId: metadata.id, requestedId: metadata.id, access: metadata.access,
      url: result.url, contentType: result.contentType, providerName: result.providerName, expiresAt: result.expiresAt,
      variantKey: selection.key, requestedLayout: selection.requestedLayout, selectedLayout: selection.layout,
      file: selection.file, usedFallback: false, fallbackErrors: Object.freeze([]),
    })
  }

  private async resolve(input: unknown, context: AssetResolveContext, afterLoadFailure = false): Promise<ResolvedAsset<Id>> {
    const source = context.inputSource ?? 'internal'
    if (!['internal', 'external'].includes(source) || context.fallback !== undefined && context.fallback !== 'none' && context.fallback !== 'placeholder') throw new AssetError('INVALID_ASSET_METADATA', 'Invalid resolution policy.')
    const requestedId = isAssetIdSyntax(input) ? input : null
    const visited = new Set<string>()
    const errors: AssetDiagnostic[] = []
    let current: unknown = input
    let loadFailure = afterLoadFailure
    for (;;) {
      this.aborted(context, source)
      let metadata: AssetMetadata<Id> | undefined
      try {
        metadata = getManifestMetadata(this.manifest, current, source)
        if (visited.has(metadata.id)) throw new AssetError('FALLBACK_CYCLE', 'Circular asset fallback resolution.', source)
        visited.add(metadata.id)
        await this.checkAccess(metadata, context, source)
        this.aborted(context, source)
        if (loadFailure) { loadFailure = false; throw createAssetLoadError(source) }
        const resolved = await this.callProvider(metadata, context, source)
        return Object.freeze({ ...resolved, requestedId, usedFallback: errors.length > 0, fallbackErrors: Object.freeze([...errors]) })
      } catch (error) {
        if (!(error instanceof AssetError)) throw new AssetError('ASSET_RESOLVE_FAILED', 'Asset URL resolution failed.', source)
        const recoverable = ['INVALID_ASSET_ID', 'ASSET_NOT_FOUND', 'PROVIDER_NOT_FOUND', 'ASSET_RESOLVE_FAILED', 'ASSET_LOAD_FAILED'].includes(error.code)
        if (context.fallback !== 'placeholder' || !recoverable || metadata?.access === 'private' || metadata?.id === this.options.placeholderId) throw error
        const next = metadata?.fallbackId ?? this.options.placeholderId
        if (!next) throw error
        if (visited.has(next)) throw new AssetError('FALLBACK_CYCLE', 'Circular asset fallback resolution.', source)
        errors.push(Object.freeze({ code: error.code, inputSource: error.inputSource }))
        current = next
      }
    }
  }
}

function isProviderResult(value: unknown, request: AssetProviderRequest, providerName: string, now: number): value is AssetProviderResult {
  if (typeof value !== 'object' || value === null) return false
  const result = value as Record<string, unknown>
  return result.assetId === request.assetId && result.contentType === request.file.contentType && result.providerName === providerName && safeUrl(result.url)
    && (result.expiresAt === undefined || typeof result.expiresAt === 'number' && Number.isFinite(result.expiresAt) && result.expiresAt > now)
}
