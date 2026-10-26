import type { AssetProvider } from '../../src/services/assetProvider'
import type { AssetAccess, AssetProviderContext, AssetProviderRequest, AssetProviderResult } from '../../src/types/assets'

/** Test-only adapter; never downloads and is not bundled into the app. */
export class MockAssetProvider implements AssetProvider {
  readonly name: string
  readonly supportedAccess: readonly AssetAccess[]
  readonly calls: AssetProviderRequest[] = []
  readonly contexts: AssetProviderContext[] = []
  handler?: (request: AssetProviderRequest, context: AssetProviderContext) => Promise<AssetProviderResult>

  constructor(name = 'mock', supportedAccess: readonly AssetAccess[] = ['public']) {
    this.name = name
    this.supportedAccess = supportedAccess
  }

  async resolve(request: AssetProviderRequest, context: AssetProviderContext): Promise<AssetProviderResult> {
    this.calls.push(request)
    this.contexts.push(context)
    if (this.handler) return this.handler(request, context)
    await Promise.resolve()
    return { assetId: request.assetId, url: `https://${this.name}.invalid/${request.file.path}`, contentType: request.file.contentType, providerName: this.name }
  }
}
