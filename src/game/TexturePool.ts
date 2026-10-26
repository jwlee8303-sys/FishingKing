export interface TextureLease<T> { readonly value: T; release(): void }
interface Entry<T> { promise: Promise<T>; refs: number; closing?: Promise<void> }
/** URL keys avoid logical-ID/alias collisions when layout or provider changes. */
export class TexturePool<T> {
  private entries = new Map<string,Entry<T>>()
  private readonly load: (url: string) => Promise<T>
  private readonly unload: (url: string) => Promise<void>
  private readonly keyForUrl: (url: string) => string
  constructor(load: (url: string) => Promise<T>, unload: (url: string) => Promise<void>, keyForUrl: (url: string) => string = url => url) { this.load = load; this.unload = unload; this.keyForUrl = keyForUrl }
  /** Read-only counts for stability tests; never exposes storage URLs. */
  snapshot(): { entries: number; references: number; disposing: number } {
    const entries = [...this.entries.values()]
    return { entries: entries.length,references: entries.reduce((sum,entry) => sum+entry.refs,0),disposing: entries.filter(entry => entry.closing).length }
  }
  async acquire(url: string): Promise<TextureLease<T>> {
    url = this.keyForUrl(url)
    let entry = this.entries.get(url)
    if (entry?.closing) { await entry.closing; return this.acquire(url) }
    if (!entry) {
      entry = { promise: this.load(url),refs: 0 }
      this.entries.set(url,entry)
    }
    const owned = entry
    owned.refs++
    let value: T
    try { value = await owned.promise } catch (error) { owned.refs--; if (this.entries.get(url) === owned) this.entries.delete(url); throw error }
    let released = false
    return { value, release: () => {
      if (released) return
      released = true
      owned.refs--
      if (owned.refs === 0) {
        owned.closing = Promise.resolve().then(() => this.unload(url)).catch(() => { /* no URL/credential diagnostics */ }).finally(() => { if (this.entries.get(url) === owned) this.entries.delete(url) })
      }
    } }
  }
}
