import { StrictMode } from 'react'
import { render, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { InputController } from '../../src/game/InputController'
const mock = { mount: vi.fn(),destroy: vi.fn() }
const loadScene = async () => ({ mountGameScene: mock.mount })
import { GameCanvas } from '../../src/components/game/GameCanvas'
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks() })
it('StrictMode does not double-mount after async import and ordinary rerenders', async () => {
  vi.stubGlobal('ResizeObserver',class {})
  mock.mount.mockReturnValue({ destroy: mock.destroy,ready: Promise.resolve() })
  const input = new InputController()
  const { rerender,unmount } = render(<StrictMode><GameCanvas input={input} loadScene={loadScene} /></StrictMode>)
  await waitFor(() => expect(mock.mount).toHaveBeenCalledTimes(1))
  rerender(<StrictMode><GameCanvas input={input} loadScene={loadScene} /></StrictMode>); expect(mock.mount).toHaveBeenCalledTimes(1)
  unmount(); expect(mock.destroy).toHaveBeenCalledTimes(1)
})
it('never creates a renderer after unmount before lazy import completion', async () => {
  vi.stubGlobal('ResizeObserver',class {}); const { unmount } = render(<GameCanvas input={new InputController()} loadScene={loadScene} />); unmount()
  await Promise.resolve(); expect(mock.mount).not.toHaveBeenCalled()
})
