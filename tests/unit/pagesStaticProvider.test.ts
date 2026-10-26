import { describe, expect, it } from 'vitest'
import { assetManifest } from '../../src/assets/manifest'
import { selectAssetVariant } from '../../src/assets/variants'
import { createAssetManifest } from '../../src/assets/validation'
import { PagesStaticProvider } from '../../src/services/pagesStaticProvider'
import { createPublicAssetResolver } from '../../src/services/assetRuntime'
import { normalizePublicBase, publicAssetUrl } from '../../src/services/assetUrls'
import { AssetResolver } from '../../src/services/assetResolver'
import type { AssetId, AssetLayout, AssetProviderRequest } from '../../src/types/assets'
import { MockAssetProvider } from '../fixtures/MockAssetProvider'

const context = { now: 1 }
function request(id: AssetId = 'fish.bass.main', layout: AssetLayout = 'default'): AssetProviderRequest {
  const metadata = assetManifest[id]
  const selected = selectAssetVariant(metadata, { layout })
  return { assetId: id, type: metadata.type, access: metadata.access, file: selected.file, variantKey: selected.key, version: metadata.version }
}
const provider = () => new PagesStaticProvider({ urls: { baseUrl: '/' } })

describe('Pages static public URL boundary', () => {
  it.each([
    ['/', '/assets/fish/bass-main.webp'],
    ['/fishingking/', '/fishingking/assets/fish/bass-main.webp'],
    ['/fishingking', '/fishingking/assets/fish/bass-main.webp'],
    ['/fishingking//game///', '/fishingking/game/assets/fish/bass-main.webp'],
    ['https://cdn.example/Game/', 'https://cdn.example/Game/assets/fish/bass-main.webp'],
  ])('base %s', async (baseUrl, url) => {
    const result = await new PagesStaticProvider({ urls: { baseUrl } }).resolve(request(), context)
    expect(result).toEqual({ assetId: 'fish.bass.main', url, contentType: 'image/webp', providerName: 'pages-static' })
    expect(result).not.toHaveProperty('expiresAt')
  })
  it.each(['', './', 'relative/', '//evil.example/', 'file:///tmp/', 'javascript:alert(1)', '/a/../', '/a/./', '/%2e%2e/', '/%zz/', '/a?x=1', '/a#b', '/a\\b', '/a b', 'https://user:pass@example.com/', 'https://example.com:bad/'])('rejects base %s', baseUrl => {
    expect(() => new PagesStaticProvider({ urls: { baseUrl } })).toThrow()
  })
  it('preserves the existing explicit asset prefix without duplicating assets', () => {
    expect(publicAssetUrl('icons/reel.svg', { baseUrl: '/game/', assetBaseUrl: 'https://cdn.example/static/' })).toBe('https://cdn.example/static/icons/reel.svg')
    expect(normalizePublicBase('/Game.v1/')).toBe('/Game.v1/')
    expect(publicAssetUrl('icons/reel-v2.svg', { baseUrl: '/' })).toBe('/assets/icons/reel-v2.svg')
  })
  it.each(['../secret.webp', '/fish/bass-main.webp', 'fish//bass.webp', 'fish\\bass.webp', 'https://evil.example/a.webp', '//evil/a.webp', 'fish/%2e%2e/a.webp', 'fish/%252e%252e/a.webp', 'fish/%zz.webp', 'fish/a.webp?secret=x', 'fish/a.webp#x', 'private/fish/a.webp', 'public/assets/fish/a.webp', 'C:/fish/a.webp', 'fish/a b.webp', ''])('rejects direct unsafe/unregistered path %s', async path => {
    const original = request()
    await expect(provider().resolve({ ...original, file: { ...original.file, path } }, context)).rejects.toMatchObject({ code: 'INVALID_ASSET_METADATA' })
  })
  it.each([
    ['default', '/assets/backgrounds/lake-day.webp'],
    ['mobile-portrait', '/assets/backgrounds/lake-day-mobile.webp'],
    ['mobile-landscape', '/assets/backgrounds/lake-day.webp'],
    ['desktop', '/assets/backgrounds/lake-day.webp'],
  ] as const)('uses resolver-selected %s file', async (layout, url) => {
    expect((await provider().resolve(request('background.lake.day', layout), context)).url).toBe(url)
  })
  it('denies private requests before matching any path', async () => {
    await expect(provider().resolve({ ...request(), access: 'private' }, context)).rejects.toMatchObject({ code: 'ACCESS_DENIED' })
  })
  it('denies a forged public request for registered private metadata', async () => {
    const metadata = { id: 'fish.secret.main', type: 'fish', access: 'private', path: 'private/fish/secret.webp', contentType: 'image/webp' } as const
    const manifest = createAssetManifest([metadata])
    const instance = new PagesStaticProvider({ manifest, urls: { baseUrl: '/' } })
    await expect(instance.resolve({ assetId: metadata.id, type: 'fish', access: 'public', file: metadata, variantKey: 'default' }, context)).rejects.toMatchObject({ code: 'ACCESS_DENIED' })
  })
  it.each(['type', 'version', 'variant', 'hash', 'mime', 'size'] as const)('rejects manifest mismatch %s', async field => {
    const original = request()
    const modified = { ...original, file: { ...original.file } }
    if (field === 'type') modified.type = 'icon'
    if (field === 'version') modified.version = '999'
    if (field === 'variant') modified.variantKey = 'missing'
    if (field === 'hash') modified.file = { ...modified.file, sha256: 'a'.repeat(64) }
    if (field === 'mime') modified.file = { ...modified.file, contentType: 'image/svg+xml' }
    if (field === 'size') modified.file = { ...modified.file, sizeBytes: 1 }
    await expect(provider().resolve(modified, context)).rejects.toMatchObject({ code: 'INVALID_ASSET_METADATA' })
  })
  it('keeps an asynchronous contract and cancels before URL resolution', async () => {
    expect(provider().resolve(request(), context)).toBeInstanceOf(Promise)
    const controller = new AbortController()
    controller.abort()
    await expect(provider().resolve(request(), { ...context, signal: controller.signal })).rejects.toMatchObject({ code: 'ASSET_RESOLVE_ABORTED' })
  })
  it('registers Pages as default and permits explicit provider replacement', async () => {
    const resolver = createPublicAssetResolver({ urls: { baseUrl: '/fishingking/' } })
    expect((await resolver.resolveAsset('fish.bass.main')).url).toBe('/fishingking/assets/fish/bass-main.webp')
    const mock = new MockAssetProvider()
    expect((await createPublicAssetResolver({ publicProvider: mock }).resolveAsset('fish.bass.main')).providerName).toBe('mock')
    const both = new AssetResolver({ manifest: assetManifest, providers: [provider(), mock], defaultProvider: 'pages-static' })
    expect((await both.resolveAsset('fish.bass.main', { providerName: 'mock' })).providerName).toBe('mock')
    expect((await both.resolveAsset('fish.bass.main', { providerName: 'pages-static' })).providerName).toBe('pages-static')
    await expect(both.resolveAsset('fish.bass.main', { providerName: 'missing' })).rejects.toMatchObject({ code: 'PROVIDER_NOT_FOUND' })
  })
  it('does not hide inconsistent provider metadata behind placeholder fallback', async () => {
    const altered = createAssetManifest(Object.values(assetManifest).map(entry => entry.id === 'fish.bass.main' ? { ...entry, sizeBytes: 1 } : entry))
    const resolver = new AssetResolver({ manifest: altered, providers: [provider()], defaultProvider: 'pages-static' })
    await expect(resolver.resolveExternalAsset('fish.bass.main', { fallback: 'placeholder' })).rejects.toMatchObject({ code: 'INVALID_ASSET_METADATA' })
  })
})
