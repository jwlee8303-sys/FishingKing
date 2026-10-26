import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { assetManifest } from '../../src/assets/manifest'
import { getAssetMetadata, isValidAssetId, listAssetIds } from '../../src/assets/registry'
import { createAssetManifest, isAssetIdSyntax, validateAssetManifest } from '../../src/assets/validation'
import { selectAssetLayout, selectAssetVariant } from '../../src/assets/variants'
import { AssetResolver } from '../../src/services/assetResolver'
import { AssetError, createAssetLoadError } from '../../src/services/assetErrors'
import type { AssetId, AssetProviderResult } from '../../src/types/assets'
import { MockAssetProvider } from '../fixtures/MockAssetProvider'

const fish = assetManifest['fish.bass.main']
const lake = assetManifest['background.lake.day']
const placeholder = assetManifest['placeholder.image']
const privateFish = { ...fish, id: 'fish.private.main', access: 'private', path: 'private/fish/bass.webp', fallbackId: 'placeholder.image' } as const

function setup() {
  const provider = new MockAssetProvider()
  const resolver = new AssetResolver({ manifest: assetManifest, providers: [provider], defaultProvider: provider.name })
  return { provider, resolver }
}

describe('AssetManifest registration and runtime validation', () => {
  it('infers six static IDs and keeps the seven-file background behind one ID', () => {
    expect(listAssetIds()).toHaveLength(6)
    expect(getAssetMetadata('fish.bass.main').sizeBytes).toBe(138258)
    expect(lake.variants).toHaveLength(1)
    expect(isValidAssetId('background.lake.day.mobile')).toBe(false)
    expectTypeOf<AssetId>().toEqualTypeOf<'fish.bass.main' | 'background.lake.day' | 'icon.fishing.rod' | 'icon.fishing.reel' | 'icon.fishing.hook' | 'placeholder.image'>()
    expectTypeOf<Parameters<ReturnType<typeof setup>['resolver']['resolveAsset']>[0]>().toEqualTypeOf<AssetId>()
  })

  it.each(['fish.bass.main', 'fish.bass2.main', 'background.lake.day'])('accepts logical ID syntax: %s', value => {
    expect(isAssetIdSyntax(value)).toBe(true)
  })

  it.each([null, undefined, 1, {}, '', 'Fish.bass.main', 'fish/bass/main', 'fish.bass-main', 'https://bad.invalid/x', 'fish..main', ' fish.bass.main', '__proto__'])('rejects external ID syntax: %j', value => {
    expect(isAssetIdSyntax(value)).toBe(false)
    expect(isValidAssetId(value)).toBe(false)
  })

  it('distinguishes valid-but-unregistered IDs', () => {
    expect(isAssetIdSyntax('fish.unknown.main')).toBe(true)
    expect(isValidAssetId('fish.unknown.main')).toBe(false)
  })

  it('detects duplicate IDs and key/ID mismatches', () => {
    expect(() => createAssetManifest([fish, fish, placeholder])).toThrow(/Duplicate/)
    expect(() => validateAssetManifest({ wrong: fish, 'placeholder.image': placeholder })).toThrow(/key/)
  })

  it.each([
    { ...fish, path: undefined }, { ...fish, id: 'Bad' }, { ...fish, type: 'video' },
    { ...fish, access: 'secret' }, { ...fish, width: -1 }, { ...fish, height: undefined },
    { ...fish, url: 'https://storage.invalid/image.webp' },
    { ...fish, sizeBytes: 0 }, { ...fish, sha256: 'invalid' }, { ...fish, contentType: 'image/png' },
    { ...fish, path: 'icons/bass.webp' }, { ...fish, variants: {} },
    { ...fish, variants: [{ key: 'default', layout: 'default', path: fish.path, contentType: fish.contentType }] },
    { ...fish, variants: [{ key: 'small', layout: 'mobile', path: fish.path, contentType: fish.contentType }] },
    { ...fish, variants: [{ key: 'small', layout: 'default', pixelRatio: 0, path: fish.path, contentType: fish.contentType }] },
  ])('rejects invalid metadata and missing base/default: %#', metadata => {
    expect(() => createAssetManifest([metadata, placeholder])).toThrow(AssetError)
  })

  it.each(['../fish/bass.webp', '/fish/bass.webp', 'C:/fish/bass.webp', 'fish\\bass.webp', '//bad.invalid/a.webp', 'https://bad.invalid/a.webp', 'javascript:alert(1)', 'data:image/webp,x', 'fish/%2e%2e/a.webp', 'fish/%252e%252e/a.webp', 'fish/%2fbass.webp', 'fish/./bass.webp', 'fish//bass.webp', 'fish/bass.webp?key=value', 'fish/bass.webp#x', 'fish/bass.webp ', '', 'private/fish/bass.webp'])('rejects public path traversal/URL/encoding: %s', path => {
    expect(() => createAssetManifest([{ ...fish, path }, placeholder])).toThrow(AssetError)
  })

  it('validates private namespaces and references without exposing public files as private', () => {
    expect(() => createAssetManifest([privateFish, placeholder])).not.toThrow()
    expect(() => createAssetManifest([{ ...privateFish, path: fish.path }, placeholder])).toThrow(AssetError)
    expect(() => createAssetManifest([{ ...fish, fallbackId: 'placeholder.missing' }, placeholder])).toThrow(/not registered/)
    expect(() => createAssetManifest([{ ...fish, fallbackId: privateFish.id }, privateFish, placeholder])).toThrow(/private/)
  })

  it('detects direct and indirect fallback cycles', () => {
    expect(() => createAssetManifest([{ ...fish, fallbackId: fish.id }])).toThrow(expect.objectContaining({ code: 'FALLBACK_CYCLE' }))
    expect(() => createAssetManifest([fish, { ...placeholder, fallbackId: fish.id }])).toThrow(expect.objectContaining({ code: 'FALLBACK_CYCLE' }))
  })

  it('freezes registrations and variant files', () => {
    expect(Object.isFrozen(lake)).toBe(true)
    expect(Object.isFrozen(lake.variants[0])).toBe(true)
    const snapshot = createAssetManifest([fish, placeholder])
    expect(Object.isFrozen(snapshot)).toBe(true)
  })
})

describe('pure layout and variant selection', () => {
  it.each([
    [320, 568, 'mobile-portrait'], [390, 844, 'mobile-portrait'], [430, 932, 'mobile-portrait'],
    [844, 390, 'mobile-landscape'], [768, 1024, 'mobile-portrait'], [1440, 900, 'desktop'],
  ] as const)('selects using viewport %sx%s', (width, height, layout) => {
    expect(selectAssetLayout({ viewport: { width, height } })).toBe(layout)
    const selection = selectAssetVariant(lake, { viewport: { width, height } })
    expect(selection.file.path).toBe(layout === 'mobile-portrait' ? 'backgrounds/lake-day-mobile.webp' : lake.path)
  })

  it('honors explicit layout, rotates without changing the ID and uses default for a single file', () => {
    expect(selectAssetVariant(lake, { layout: 'desktop', viewport: { width: 390, height: 844 } }).key).toBe('default')
    expect(selectAssetVariant(lake, { layout: 'mobile-landscape' }).key).toBe('default')
    expect(selectAssetVariant(lake).key).toBe('default')
    expect(selectAssetVariant(fish, { layout: 'mobile-portrait' }).key).toBe('default')
    expect(lake.id).toBe('background.lake.day')
  })

  it('supports desktop-specific and density/render-width alternatives with bounded choice', () => {
    const metadata = { ...lake, variants: [
      ...lake.variants,
      { key: 'desktop-small', layout: 'desktop', path: lake.path, contentType: lake.contentType, width: 800, height: 450, pixelRatio: 1 },
      { key: 'desktop-large', layout: 'desktop', path: lake.path, contentType: lake.contentType, width: 1600, height: 900, pixelRatio: 2 },
    ] } as const
    expect(selectAssetVariant(metadata, { layout: 'desktop', dpr: 2 }).key).toBe('desktop-large')
    expect(selectAssetVariant(metadata, { layout: 'desktop', renderWidth: 500, dpr: 1 }).key).toBe('desktop-small')
    expect(selectAssetVariant(metadata, { layout: 'desktop', renderWidth: 2000, dpr: 3 }).key).toBe('desktop-large')
  })

  it('rejects invalid dimensions or DPR', () => {
    expect(() => selectAssetVariant(lake, { viewport: { width: 0, height: 844 } })).toThrow(AssetError)
    expect(() => selectAssetVariant(lake, { dpr: NaN })).toThrow(AssetError)
    expect(() => selectAssetVariant(lake, { renderWidth: -1 })).toThrow(AssetError)
  })
})

describe('provider-independent resolver', () => {
  it('resolves asynchronously and forwards selected metadata, not storage URL construction', async () => {
    const { resolver, provider } = setup()
    const pending = resolver.resolveAsset('background.lake.day', { viewport: { width: 390, height: 844 } })
    expect(pending).toBeInstanceOf(Promise)
    const result = await pending
    expect(result).toMatchObject({ assetId: lake.id, variantKey: 'mobile-portrait', usedFallback: false, contentType: 'image/webp' })
    expect(provider.calls[0].file.path).toBe(lake.variants[0].path)
    expect(provider.contexts[0].now).toBeGreaterThan(0)
    expect(resolver.getAssetMetadata('fish.bass.main').id).toBe(fish.id)
    expect(resolver.listAssetIds()).toHaveLength(6)
    expect(resolver.isValidAssetId('fish.notregistered.main')).toBe(false)
  })

  it('reports internal versus external invalid input and does not echo unsafe values', async () => {
    const { resolver } = setup()
    await expect(resolver.resolveAsset('BAD' as AssetId)).rejects.toMatchObject({ code: 'INVALID_ASSET_ID', inputSource: 'internal' })
    await expect(resolver.resolveExternalAsset('BAD')).rejects.toMatchObject({ code: 'INVALID_ASSET_ID', inputSource: 'external' })
    await expect(resolver.resolveExternalAsset('fish.unknown.main')).rejects.toMatchObject({ code: 'ASSET_NOT_FOUND' })
    const result = await resolver.resolveExternalAsset('https://unsafe.invalid', { fallback: 'placeholder' })
    expect(result).toMatchObject({ assetId: placeholder.id, requestedId: null, usedFallback: true, fallbackErrors: [{ code: 'INVALID_ASSET_ID', inputSource: 'external' }] })
  })

  it('does not assume a Pages provider has been implemented', async () => {
    const resolver = new AssetResolver({ manifest: assetManifest, providers: [] })
    await expect(resolver.resolveAsset('fish.bass.main')).rejects.toMatchObject({ code: 'PROVIDER_NOT_FOUND' })
  })

  it('can replace the selected provider without changing asset IDs', async () => {
    const first = new MockAssetProvider('first'), second = new MockAssetProvider('second')
    const resolver = new AssetResolver({ manifest: assetManifest, providers: [first, second], defaultProvider: first.name })
    expect((await resolver.resolveAsset(fish.id)).providerName).toBe('first')
    expect((await resolver.resolveAsset(fish.id, { providerName: 'second' })).providerName).toBe('second')
    expect(first.calls[0].assetId).toBe(second.calls[0].assetId)
  })

  it('uses an individual fallback before the global placeholder, retaining diagnostics', async () => {
    const provider = new MockAssetProvider()
    provider.handler = async request => {
      if (request.assetId === fish.id) throw new Error('upstream URL must not leak')
      return { assetId: request.assetId, url: '/assets/icons/reel.svg', contentType: request.file.contentType, providerName: provider.name }
    }
    const manifest = createAssetManifest([{ ...fish, fallbackId: 'icon.fishing.reel' }, assetManifest['icon.fishing.reel'], placeholder])
    const resolver = new AssetResolver({ manifest, providers: [provider], defaultProvider: provider.name })
    const result = await resolver.resolveAsset(fish.id, { fallback: 'placeholder' })
    expect(result).toMatchObject({ assetId: 'icon.fishing.reel', requestedId: fish.id, usedFallback: true })
    expect(result.fallbackErrors[0].code).toBe('ASSET_RESOLVE_FAILED')
    expect(JSON.stringify(result.fallbackErrors)).not.toContain('upstream')
  })

  it('stops if the placeholder itself fails', async () => {
    const { provider, resolver } = setup()
    provider.handler = async () => { throw new Error('unavailable') }
    await expect(resolver.resolveAsset(fish.id, { fallback: 'placeholder' })).rejects.toMatchObject({ code: 'ASSET_RESOLVE_FAILED' })
    expect(provider.calls.map(call => call.assetId)).toEqual([fish.id, placeholder.id])
  })

  it('denies private access by default before calling a provider, without fallback masking', async () => {
    const provider = new MockAssetProvider('private-mock', ['public', 'private'])
    const resolver = new AssetResolver({ manifest: createAssetManifest([privateFish, placeholder]), providers: [provider], defaultProvider: provider.name })
    await expect(resolver.resolveAsset(privateFish.id, { fallback: 'placeholder' })).rejects.toMatchObject({ code: 'ACCESS_DENIED' })
    expect(provider.calls).toHaveLength(0)
  })

  it('requires both explicit authorization and private-capable provider', async () => {
    const provider = new MockAssetProvider()
    const options = { manifest: createAssetManifest([privateFish, placeholder]), providers: [provider], defaultProvider: provider.name, authorizePrivate: () => true }
    await expect(new AssetResolver(options).resolveAsset(privateFish.id)).rejects.toMatchObject({ code: 'ACCESS_DENIED' })
    const privateProvider = new MockAssetProvider('private-mock', ['private'])
    const resolver = new AssetResolver({ ...options, providers: [privateProvider], providerForAccess: { private: privateProvider.name } })
    expect((await resolver.resolveAsset(privateFish.id)).access).toBe('private')
  })

  it('does not hide provider access denial, including public requests, behind fallback', async () => {
    const { provider, resolver } = setup()
    provider.handler = async () => { throw new AssetError('ACCESS_DENIED', 'private diagnostic') }
    await expect(resolver.resolveAsset(fish.id, { fallback: 'placeholder' })).rejects.toMatchObject({ code: 'ACCESS_DENIED' })
    expect(provider.calls).toHaveLength(1)
  })

  it.each([
    { url: 'javascript:alert(1)' }, { url: 'data:image/svg+xml,x' }, { url: '//unsafe.invalid/a.webp' },
    { url: 'file:///private/a.webp' }, { url: 'https://user:password@unsafe.invalid/a.webp' },
    { url: 'https:\\unsafe.invalid\\a.webp' }, { assetId: 'wrong.id' },
    { contentType: 'image/png' }, { providerName: 'wrong' }, { expiresAt: 999 },
    { expiresAt: NaN }, { url: '' },
  ])('rejects malformed, mismatched or expired provider responses: %#', async change => {
    const provider = new MockAssetProvider()
    provider.handler = async request => ({ assetId: request.assetId, url: '/assets/fish/bass-main.webp', contentType: request.file.contentType, providerName: provider.name, ...change } as AssetProviderResult)
    const resolver = new AssetResolver({ manifest: assetManifest, providers: [provider], defaultProvider: provider.name, now: () => 1000 })
    await expect(resolver.resolveAsset(fish.id)).rejects.toMatchObject({ code: 'ASSET_RESOLVE_FAILED' })
  })

  it('accepts future expiry as a contract for later renewal, without implementing a URL cache', async () => {
    const provider = new MockAssetProvider()
    provider.handler = async request => ({ assetId: request.assetId, url: 'https://private-mock.invalid/image.webp?signature=example', contentType: request.file.contentType, providerName: provider.name, expiresAt: 2000 })
    const resolver = new AssetResolver({ manifest: assetManifest, providers: [provider], defaultProvider: provider.name, now: () => 1000 })
    expect((await resolver.resolveAsset(fish.id)).expiresAt).toBe(2000)
  })

  it('separates successful URL resolution from HTTP/decode loading failure', async () => {
    const { resolver, provider } = setup()
    await resolver.resolveAsset(fish.id)
    expect(createAssetLoadError().code).toBe('ASSET_LOAD_FAILED')
    const result = await resolver.resolveFallback(fish.id)
    expect(result.assetId).toBe(placeholder.id)
    expect(result.fallbackErrors).toEqual([{ code: 'ASSET_LOAD_FAILED', inputSource: 'internal' }])
    expect(provider.calls).toHaveLength(2)
    await expect(resolver.resolveFallback(placeholder.id)).rejects.toMatchObject({ code: 'ASSET_LOAD_FAILED' })
  })

  it('rejects aborted requests without running fallback or making a provider call', async () => {
    const { resolver, provider } = setup()
    const controller = new AbortController()
    controller.abort()
    await expect(resolver.resolveAsset(fish.id, { signal: controller.signal, fallback: 'placeholder' })).rejects.toMatchObject({ code: 'ASSET_RESOLVE_ABORTED' })
    expect(provider.calls).toHaveLength(0)
  })

  it('rejects stale in-flight results after cancellation', async () => {
    const { resolver, provider } = setup()
    const controller = new AbortController()
    let complete: (() => void) | undefined
    provider.handler = request => new Promise(resolve => {
      complete = () => resolve({ assetId: request.assetId, url: '/assets/fish/bass-main.webp', contentType: request.file.contentType, providerName: provider.name })
    })
    const pending = resolver.resolveAsset(fish.id, { signal: controller.signal, fallback: 'placeholder' })
    await vi.waitFor(() => expect(complete).toBeTypeOf('function'))
    controller.abort()
    if (!complete) throw new Error('Mock provider did not start')
    complete()
    await expect(pending).rejects.toMatchObject({ code: 'ASSET_RESOLVE_ABORTED' })
    expect(provider.calls).toHaveLength(1)
  })
})
