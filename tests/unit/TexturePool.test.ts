import { describe, expect, it, vi } from 'vitest'
import { TexturePool } from '../../src/game/TexturePool'
describe('URL texture ownership', () => {
  it('deduplicates concurrent loads and unloads only after last release', async () => {
    const load = vi.fn(async () => ({ texture: 1 })), unload = vi.fn(async () => {})
    const pool = new TexturePool(load,unload)
    const [a,b] = await Promise.all([pool.acquire('/same.webp'),pool.acquire('/same.webp')])
    expect(load).toHaveBeenCalledTimes(1); expect(a.value).toBe(b.value)
    a.release(); a.release(); expect(unload).not.toHaveBeenCalled()
    b.release(); await Promise.resolve(); expect(unload).toHaveBeenCalledTimes(1)
  })
  it('keys by resolved URL instead of reusing a logical-ID alias', async () => {
    const load = vi.fn(async (url: string) => url), unload = vi.fn(async () => {})
    const pool = new TexturePool(load,unload)
    const a = await pool.acquire('https://a.invalid/fish.webp'), b = await pool.acquire('https://b.invalid/fish.webp')
    expect(a.value).not.toBe(b.value); expect(load).toHaveBeenCalledTimes(2); a.release(); b.release()
  })
  it('serializes reacquisition while an old URL is unloading', async () => {
    let finish!: () => void
    const load = vi.fn(async () => ({})), unload = vi.fn(() => new Promise<void>(resolve => { finish = resolve }))
    const pool = new TexturePool(load,unload); const a = await pool.acquire('/a.webp'); a.release()
    await Promise.resolve(); const next = pool.acquire('/a.webp'); expect(load).toHaveBeenCalledTimes(1)
    finish(); const b = await next; expect(load).toHaveBeenCalledTimes(2); b.release(); await Promise.resolve(); finish()
  })
  it('does not cache rejected downloads permanently', async () => {
    const load = vi.fn<() => Promise<number>>().mockRejectedValueOnce(new Error('decode')).mockResolvedValue(1)
    const pool = new TexturePool(load,async () => {})
    await expect(pool.acquire('/a.webp')).rejects.toThrow('decode')
    const lease = await pool.acquire('/a.webp'); expect(lease.value).toBe(1); lease.release()
  })
  it('canonicalizes relative and absolute aliases before counting ownership', async () => {
    const load = vi.fn(async (url: string) => url), unload = vi.fn(async () => {})
    const pool = new TexturePool(load,unload,url => new URL(url,'https://game.invalid/').href)
    const a = await pool.acquire('/same.webp'), b = await pool.acquire('https://game.invalid/same.webp')
    expect(load).toHaveBeenCalledTimes(1); a.release(); expect(unload).not.toHaveBeenCalled()
    b.release(); await Promise.resolve(); expect(unload).toHaveBeenCalledTimes(1)
  })
})
