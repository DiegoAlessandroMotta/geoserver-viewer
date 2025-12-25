import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TileLoggerContainer } from '@/features/tile-logger/TileLoggerContainer'

const makeCtx = (overrides: any = {}) => ({
  logs: overrides.logs ?? [],
  clearLogs: overrides.clearLogs ?? vi.fn(),
  close: overrides.close ?? vi.fn(),
  visible: overrides.visible ?? false,
})

import * as tileHook from '@/shared/context/tile-logger/useTileLogger'
vi.mock('@/shared/context/tile-logger/useTileLogger', () => ({
  useTileLoggerContext: () => makeCtx(),
}))

describe('TileLoggerContainer', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('renders null when not visible', () => {
    vi.spyOn(tileHook, 'useTileLoggerContext').mockReturnValue(
      makeCtx({ visible: false }) as any,
    )

    const { container } = render(<TileLoggerContainer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders header, count and buttons and calls clear/close', () => {
    const clear = vi.fn()
    const close = vi.fn()

    vi.spyOn(tileHook, 'useTileLoggerContext').mockReturnValue(
      makeCtx({
        visible: true,
        logs: [{ id: '1' }, { id: '2' }],
        clearLogs: clear,
        close,
      } as any) as any,
    )

    render(<TileLoggerContainer />)

    expect(screen.getByText(/2 Registros/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /Limpiar/i }))
    expect(clear).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }))
    expect(close).toHaveBeenCalled()
  })
})
