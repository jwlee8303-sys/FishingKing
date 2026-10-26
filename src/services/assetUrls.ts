import { isSafeAssetPath } from '../assets/validation.ts'
import { AssetError } from './assetErrors.ts'

export interface AssetUrlOptions {
  readonly baseUrl: string
  /** Existing explicit public asset prefix, including its assets directory. */
  readonly assetBaseUrl?: string
}

function invalid(): never {
  throw new AssetError('INVALID_ASSET_METADATA', 'Invalid public asset base or relative path.')
}

/** Relative/embedded Vite bases are intentionally unsupported by this app. */
export function normalizePublicBase(input: string): string {
  if (typeof input !== 'string' || !input || /[%\\?#]/.test(input) || [...input].some(c => c.charCodeAt(0) <= 32 || c.charCodeAt(0) === 127) || input.startsWith('//')) invalid()
  let origin = ''
  let path = input
  if (/^https?:\/\//.test(input)) {
    const match = input.match(/^https?:\/\/[^/]+(\/.*)?$/)
    if (!match) invalid()
    let url: URL
    try { url = new URL(input) } catch { invalid() }
    if (url.username || url.password) invalid()
    origin = url.origin
    path = match[1] ?? '/'
  } else if (!input.startsWith('/')) invalid()
  const segments = path.split('/').filter(Boolean)
  if (segments.some(segment => !/^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(segment))) invalid()
  return `${origin}/${segments.length ? `${segments.map(encodeURIComponent).join('/')}/` : ''}`
}

export function publicAssetUrl(path: string, options: AssetUrlOptions): string {
  if (!isSafeAssetPath(path, 'public')) invalid()
  // Validate base even when the optional configured prefix takes precedence.
  const base = normalizePublicBase(options.baseUrl)
  const prefix = options.assetBaseUrl ? normalizePublicBase(options.assetBaseUrl) : `${base}assets/`
  return `${prefix}${path.split('/').map(encodeURIComponent).join('/')}`
}

export function getAssetUrlOptions(): AssetUrlOptions {
  return { baseUrl: import.meta.env.BASE_URL, assetBaseUrl: import.meta.env.VITE_ASSET_BASE_URL?.trim() || undefined }
}
