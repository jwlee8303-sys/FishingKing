import { mountGameScene, getSceneDiagnostics } from '../../src/game/scene'
import { InputController } from '../../src/game/InputController'
import { createPublicAssetResolver } from '../../src/services/assetRuntime'
import type { AssetProvider } from '../../src/services/assetProvider'

// Dev-server test fixture only; never imported by application routes or production entries.
const scenes = new Map<string,{ destroy(): void }>()
export function startScene(name: string, providerKey = 'shared'): void {
  const host = document.createElement('div')
  host.id = `test-scene-${name}`; host.style.cssText = 'width:300px;height:300px;position:relative'
  document.body.append(host)
  const provider: AssetProvider = { name: 'fixture',supportedAccess: ['public'],resolve: async request => ({ assetId: request.assetId,providerName: 'fixture',contentType: request.file.contentType,url: `/assets/${request.file.path}?fixture=${encodeURIComponent(providerKey)}` }) }
  const scene = mountGameScene(host,new InputController(),{ resolver: createPublicAssetResolver({ publicProvider: provider }),onStatus: status => { host.dataset.state = status } })
  scenes.set(name,{ destroy: () => { scene.destroy(); host.remove() } })
}
export function stopScene(name: string): void { scenes.get(name)?.destroy(); scenes.delete(name) }
export { getSceneDiagnostics }
