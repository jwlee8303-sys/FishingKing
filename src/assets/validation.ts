import type { AssetAccess, AssetFileMetadata, AssetInputSource, AssetManifest, AssetMetadata, AssetType } from '../types/assets'
import { AssetError } from '../services/assetErrors.ts'

export const assetLayouts = ['default', 'mobile-portrait', 'mobile-landscape', 'desktop'] as const
const folders: Record<AssetType, string> = { fish: 'fish', background: 'backgrounds', icon: 'icons', placeholder: 'placeholders' }

export function isAssetIdSyntax(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 128 && /^[a-z0-9]+(?:\.[a-z0-9]+)+$/.test(value)
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function invalid(message: string): never {
  throw new AssetError('INVALID_ASSET_METADATA', message)
}

function containsControlCharacters(value: string): boolean {
  return [...value].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
}

/** Reject encodings entirely: paths are canonical relative storage keys, not URLs. */
export function isSafeAssetPath(value: unknown, access: AssetAccess): value is string {
  if (typeof value !== 'string' || !value || value.length > 512) return false
  const parts = value.split('/')
  if (parts.some(part => !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(part))) return false
  if (access === 'private') return parts[0] === 'private' && parts.length >= 3
  return parts[0] !== 'private' && parts.length >= 2
}

function assertFile(value: unknown, access: AssetAccess, type: AssetType): asserts value is AssetFileMetadata {
  if (!record(value) || !isSafeAssetPath(value.path, access)) invalid('Invalid or mixed-access asset path.')
  const folder = value.path.split('/')[access === 'private' ? 1 : 0]
  if (folder !== folders[type]) invalid('Asset type and path category do not match.')
  const mime = value.path.endsWith('.webp') ? 'image/webp' : value.path.endsWith('.svg') ? 'image/svg+xml' : null
  if (!mime || value.contentType !== mime) invalid('Invalid content type or extension.')
  for (const key of ['width', 'height', 'sizeBytes'] as const) {
    if (value[key] !== undefined && (!Number.isSafeInteger(value[key]) || Number(value[key]) <= 0)) invalid('Image dimensions and sizes must be positive integers.')
  }
  if ((value.width === undefined) !== (value.height === undefined)) invalid('Image width and height must be provided together.')
  if (value.sha256 !== undefined && (typeof value.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.sha256))) invalid('Invalid SHA-256 metadata.')
}

export function assertAssetMetadata(value: unknown): asserts value is AssetMetadata {
  if (!record(value) || !isAssetIdSyntax(value.id)) invalid('Invalid metadata asset ID.')
  const fields = new Set(['id', 'type', 'access', 'path', 'contentType', 'width', 'height', 'sizeBytes', 'sha256', 'fallbackId', 'variants', 'version', 'attribution'])
  if (Object.keys(value).some(key => !fields.has(key))) invalid('Unsupported metadata field; storage URLs belong to providers.')
  if (typeof value.type !== 'string' || !Object.hasOwn(folders, value.type)) invalid('Unsupported asset type.')
  if (value.access !== 'public' && value.access !== 'private') invalid('Invalid asset access policy.')
  // The membership check above establishes the finite type category.
  const type = value.type as AssetType
  const access = value.access
  assertFile(value, access, type)
  if (value.fallbackId !== undefined && !isAssetIdSyntax(value.fallbackId)) invalid('Invalid fallback asset ID.')
  if (value.version !== undefined && (typeof value.version !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,63}$/.test(value.version))) invalid('Invalid asset version.')
  if (value.attribution !== undefined && (typeof value.attribution !== 'string' || !value.attribution.trim() || value.attribution.length > 512 || containsControlCharacters(value.attribution))) invalid('Invalid attribution reference.')
  if (value.variants !== undefined) {
    if (!Array.isArray(value.variants)) invalid('Variants must be an array.')
    const keys = new Set<string>(['default'])
    for (const variant of value.variants) {
      if (!record(variant) || typeof variant.key !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(variant.key) || keys.has(variant.key)) invalid('Invalid or duplicate variant key.')
      const variantFields = new Set(['key', 'layout', 'pixelRatio', 'path', 'contentType', 'width', 'height', 'sizeBytes', 'sha256'])
      if (Object.keys(variant).some(key => !variantFields.has(key))) invalid('Unsupported variant field or access override.')
      keys.add(variant.key)
      if (typeof variant.layout !== 'string' || !(assetLayouts as readonly string[]).includes(variant.layout)) invalid('Invalid variant layout.')
      if (variant.pixelRatio !== undefined && (typeof variant.pixelRatio !== 'number' || !Number.isFinite(variant.pixelRatio) || variant.pixelRatio <= 0)) invalid('Invalid variant pixel ratio.')
      assertFile(variant, access, type)
    }
  }
}

function validateReferences(manifest: AssetManifest): void {
  for (const entry of Object.values(manifest)) {
    if (entry.fallbackId && !Object.hasOwn(manifest, entry.fallbackId)) invalid('Fallback asset is not registered.')
    if (entry.fallbackId && entry.access === 'public' && manifest[entry.fallbackId].access === 'private') invalid('A public asset cannot fall back to a private asset.')
    const visited = new Set<string>()
    let current: AssetMetadata | undefined = entry
    while (current) {
      if (visited.has(current.id)) throw new AssetError('FALLBACK_CYCLE', 'Circular asset fallback reference.')
      visited.add(current.id)
      current = current.fallbackId ? manifest[current.fallbackId] : undefined
    }
  }
}

export function createAssetManifest<const Entries extends readonly AssetMetadata[]>(entries: Entries): AssetManifest<Entries[number]['id']>
export function createAssetManifest(entries: unknown): AssetManifest
export function createAssetManifest(entries: unknown): AssetManifest {
  if (!Array.isArray(entries) || !entries.length) invalid('Manifest must contain metadata entries.')
  const result: Record<string, AssetMetadata> = {}
  for (const entry of entries) {
    assertAssetMetadata(entry)
    if (Object.hasOwn(result, entry.id)) invalid('Duplicate asset ID.')
    const variants = entry.variants?.map(variant => Object.freeze({ ...variant }))
    result[entry.id] = Object.freeze({ ...entry, variants: variants ? Object.freeze(variants) : undefined })
  }
  validateReferences(result)
  return Object.freeze(result)
}

/** Also checks object keys; an ID/key mismatch must not silently re-key data. */
export function validateAssetManifest(value: unknown): asserts value is AssetManifest {
  if (!record(value) || !Object.keys(value).length) invalid('Invalid manifest table.')
  for (const [key, entry] of Object.entries(value)) {
    assertAssetMetadata(entry)
    if (key !== entry.id) invalid('Manifest key does not match metadata ID.')
  }
  validateReferences(value as AssetManifest)
}

export function getManifestMetadata<Id extends string>(manifest: AssetManifest<Id>, input: unknown, inputSource: AssetInputSource = 'internal'): AssetMetadata<Id> {
  if (!isAssetIdSyntax(input)) throw new AssetError('INVALID_ASSET_ID', 'Asset ID must be a lowercase dotted logical name.', inputSource)
  if (!Object.hasOwn(manifest, input)) throw new AssetError('ASSET_NOT_FOUND', 'Asset ID is not registered.', inputSource)
  // Own-key membership has been checked before indexing a finite registration table.
  return manifest[input as Id]
}
