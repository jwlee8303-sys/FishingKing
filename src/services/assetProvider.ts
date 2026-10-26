import type { AssetAccess, AssetProviderContext, AssetProviderRequest, AssetProviderResult } from '../types/assets'

/** Storage boundary only. No concrete provider is connected in 3-06. */
export interface AssetProvider {
  readonly name: string
  readonly supportedAccess: readonly AssetAccess[]
  resolve(request: AssetProviderRequest, context: AssetProviderContext): Promise<AssetProviderResult>
}
