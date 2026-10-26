import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AssetImage } from '../../src/components/AssetImage'
import { createPublicAssetResolver } from '../../src/services/assetRuntime'
import { MockAssetProvider } from '../fixtures/MockAssetProvider'
import { AssetError } from '../../src/services/assetErrors'
import type { AssetProviderResult } from '../../src/types/assets'

afterEach(() => vi.unstubAllGlobals())
function setup() { const provider = new MockAssetProvider(); return { provider,resolver: createPublicAssetResolver({ publicProvider: provider }) } }
describe('AssetImage asynchronous and failure boundary', () => {
  it('resolves a logical ID, alt and browser loading attributes', async () => {
    const { resolver } = setup()
    render(<AssetImage assetId="fish.bass.main" alt="배스" resolver={resolver} />)
    const image = await screen.findByRole('img',{ name: '배스' })
    expect(image).toHaveAttribute('src','https://mock.invalid/fish/bass-main.webp')
    expect(image).toHaveAttribute('loading','lazy'); expect(image).toHaveAttribute('decoding','async')
    fireEvent.load(image); expect(image.parentElement).toHaveAttribute('data-state','ready')
  })
  it.each([['bad/id','INVALID_ASSET_ID'],['fish.unknown.main','ASSET_NOT_FOUND']])('diagnoses %s separately from loading failure', async (id,code) => {
    const { resolver } = setup(); const { container } = render(<AssetImage assetId={id} alt="배스" resolver={resolver} fallback={false} />)
    await waitFor(() => expect(container.firstChild).toHaveAttribute('data-error-code',code))
    expect(screen.queryByRole('img')).toBeNull()
  })
  it('can explicitly recover unknown external data to placeholder', async () => {
    const { resolver } = setup(); render(<AssetImage assetId="bad/id" alt="배스" resolver={resolver} />)
    expect(await screen.findByRole('img')).toHaveAttribute('src','https://mock.invalid/placeholders/image-missing.svg')
  })
  it.each([
    [404,'image/webp','HTTP_NOT_FOUND'],[500,'text/html','HTTP_ERROR'],[200,'text/html','NOT_IMAGE'],[200,'image/webp','DECODE_FAILED'],
  ] as const)('load failure %s/%s recovers with diagnostic %s', async (status,contentType,kind) => {
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('fixture',{ status,headers: { 'content-type': contentType } })))
    const { resolver } = setup(); const { container } = render(<AssetImage assetId="fish.bass.main" alt="배스" resolver={resolver} />)
    fireEvent.error(await screen.findByRole('img'))
    await waitFor(() => expect(screen.getByRole('img')).toHaveAttribute('src','https://mock.invalid/placeholders/image-missing.svg'))
    fireEvent.load(screen.getByRole('img'))
    expect(container.firstChild).toHaveAttribute('data-state','ready'); expect(container.firstChild).toHaveAttribute('data-error-kind',kind)
  })
  it('terminates after placeholder loading failure', async () => {
    vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('network')))
    const { resolver,provider } = setup(); const { container } = render(<AssetImage assetId="fish.bass.main" alt="배스" resolver={resolver} />)
    fireEvent.error(await screen.findByRole('img'))
    await waitFor(() => expect(screen.getByRole('img')).toHaveAttribute('src','https://mock.invalid/placeholders/image-missing.svg'))
    fireEvent.error(screen.getByRole('img'))
    await waitFor(() => expect(container.firstChild).toHaveAttribute('data-state','error'))
    expect(provider.calls).toHaveLength(2); expect(container.firstChild).toHaveAttribute('data-error-kind','NETWORK')
  })
  it('does not replace denied access with a public placeholder', async () => {
    const { resolver,provider } = setup(); provider.handler = async () => { throw new AssetError('ACCESS_DENIED','safe') }
    render(<AssetImage assetId="fish.bass.main" alt="배스" resolver={resolver} />)
    expect(await screen.findByText('이미지 접근이 허용되지 않았어요')).toBeVisible()
    expect(provider.calls).toHaveLength(1)
  })
  it('does not mask invalid metadata with fallback', async () => {
    const { resolver,provider } = setup(); provider.handler = async () => { throw new AssetError('INVALID_ASSET_METADATA','safe') }
    const { container } = render(<AssetImage assetId="fish.bass.main" alt="배스" resolver={resolver} />)
    await waitFor(() => expect(container.firstChild).toHaveAttribute('data-error-code','INVALID_ASSET_METADATA'))
    expect(provider.calls).toHaveLength(1)
  })
  it('ignores stale results after rapid ID changes', async () => {
    const { resolver,provider } = setup()
    let complete!: (value: AssetProviderResult) => void
    provider.handler = async request => request.assetId === 'fish.bass.main' ? new Promise(resolve => { complete = resolve }) : { assetId: request.assetId,url: `https://mock.invalid/${request.file.path}`,providerName: 'mock',contentType: request.file.contentType }
    const { rerender } = render(<AssetImage assetId="fish.bass.main" alt="sample" resolver={resolver} />)
    await waitFor(() => expect(complete).toBeDefined())
    rerender(<AssetImage assetId="icon.fishing.rod" alt="sample" resolver={resolver} />)
    expect(await screen.findByRole('img')).toHaveAttribute('src','https://mock.invalid/icons/fishing-rod.svg')
    await act(async () => complete({ assetId: 'fish.bass.main',url: 'https://mock.invalid/old.webp',providerName: 'mock',contentType: 'image/webp' }))
    expect(screen.getByRole('img')).toHaveAttribute('src','https://mock.invalid/icons/fishing-rod.svg')
  })
  it('ignores completion and fallback after unmount', async () => {
    const { resolver,provider } = setup()
    let reject!: (reason: Error) => void
    provider.handler = () => new Promise((_,failure) => { reject = failure })
    const { unmount } = render(<AssetImage assetId="fish.bass.main" alt="sample" resolver={resolver} />)
    await waitFor(() => expect(reject).toBeDefined()); unmount()
    await act(async () => reject(new Error('late')))
    expect(provider.calls).toHaveLength(1)
  })
  it('does not reset a loaded image for an equivalent new context object', async () => {
    const { resolver,provider } = setup()
    const { rerender } = render(<AssetImage assetId="fish.bass.main" alt="sample" resolver={resolver} context={{ layout: 'desktop' }} />)
    fireEvent.load(await screen.findByRole('img'))
    rerender(<AssetImage assetId="fish.bass.main" alt="sample" resolver={resolver} context={{ layout: 'desktop' }} />)
    expect(screen.getByRole('img').parentElement).toHaveAttribute('data-state','ready')
    expect(provider.calls).toHaveLength(1)
  })
  it('pagehide prevents late URL errors from starting placeholder resolution', async () => {
    const { resolver,provider }=setup()
    let reject!: (reason: Error) => void
    provider.handler=() => new Promise((_,failure) => { reject=failure })
    render(<AssetImage assetId="fish.bass.main" alt="sample" resolver={resolver} />)
    await waitFor(() => expect(reject).toBeDefined())
    window.dispatchEvent(new PageTransitionEvent('pagehide',{ persisted: false }))
    await act(async () => reject(new Error('unloaded')))
    expect(provider.calls).toHaveLength(1)
  })
})
