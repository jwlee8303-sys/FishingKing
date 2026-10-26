import type { AssetErrorCode, AssetInputSource } from '../types/assets'

export class AssetError extends Error {
  readonly code: AssetErrorCode
  readonly inputSource: AssetInputSource

  constructor(code: AssetErrorCode, message: string, inputSource: AssetInputSource = 'internal') {
    super(message)
    this.name = 'AssetError'
    this.code = code
    this.inputSource = inputSource
  }
}

/** Loaders call this after an HTTP/decode failure; resolving a URL is not loading it. */
export function createAssetLoadError(inputSource: AssetInputSource = 'internal'): AssetError {
  return new AssetError('ASSET_LOAD_FAILED', 'The resolved asset could not be loaded.', inputSource)
}
