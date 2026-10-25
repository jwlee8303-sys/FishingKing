import type { Application } from 'pixi.js'

/** Type boundary only; stage 1 does not allocate a renderer or GPU resources. */
export interface GameRenderer {
  readonly application: Application
  destroy(): void
}
