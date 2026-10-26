import { AssetError } from './assetErrors'
export type ImageFailureKind = 'HTTP_NOT_FOUND' | 'HTTP_ERROR' | 'NOT_IMAGE' | 'DECODE_FAILED' | 'NETWORK'
export class ImageLoadError extends AssetError {
  readonly kind: ImageFailureKind
  constructor(kind: ImageFailureKind) { super('ASSET_LOAD_FAILED','The image could not be loaded.'); this.kind = kind }
}
/** Called only after a browser/Pixi failure, never logs URL or response bodies. */
export async function diagnoseImageFailure(url: string, signal?: AbortSignal): Promise<ImageLoadError> {
  try {
    const response = await fetch(url,{ cache: 'force-cache',signal })
    if (!response.ok) return new ImageLoadError(response.status === 404 ? 'HTTP_NOT_FOUND' : 'HTTP_ERROR')
    if (!response.headers.get('content-type')?.startsWith('image/')) return new ImageLoadError('NOT_IMAGE')
    return new ImageLoadError('DECODE_FAILED')
  } catch { return new ImageLoadError('NETWORK') }
}
export function canFallback(error: unknown): boolean {
  return error instanceof AssetError && ['INVALID_ASSET_ID','ASSET_NOT_FOUND','PROVIDER_NOT_FOUND','ASSET_RESOLVE_FAILED','ASSET_LOAD_FAILED'].includes(error.code)
}
