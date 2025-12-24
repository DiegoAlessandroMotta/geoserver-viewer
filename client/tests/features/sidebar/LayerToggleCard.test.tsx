import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LayerToggleCard } from '@/features/sidebar/components/LayerToggleCard'

const mockLayerCtx = (overrides: any = {}) => ({
  layers: overrides.layers ?? new Map(),
  refreshLayers: overrides.refreshLayers ?? vi.fn(),
  loading: overrides.loading ?? false,
  isConfigured: overrides.isConfigured ?? true,
})

const mockTileLogger = (overrides: any = {}) => ({
  toggle: overrides.toggle ?? vi.fn(),
  visible: overrides.visible ?? false,
})

import * as layerHook from '@/shared/context/layer/useLayerContext'
import * as tileHook from '@/shared/context/tile-logger/useTileLogger'
vi.mock('@/shared/context/layer/useLayerContext', () => ({
  useLayerContext: () => mockLayerCtx(),
}))
vi.mock('@/shared/context/tile-logger/useTileLogger', () => ({
  useTileLoggerContext: () => mockTileLogger(),
}))

describe('LayerToggleCard', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('disables actualizar when loading or not configured', () => {
    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue(
      mockLayerCtx({ loading: true, isConfigured: true }) as any,
    )
    const { unmount } = render(<LayerToggleCard />)
    expect(screen.getByRole('button', { name: /Actualizar/i })).toBeDisabled()

    unmount()

    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue(
      mockLayerCtx({ loading: false, isConfigured: false }) as any,
    )
    render(<LayerToggleCard />)
    expect(screen.getByRole('button', { name: /Actualizar/i })).toBeDisabled()
  })

  it('calls refreshLayers and toggle', () => {
    const refresh = vi.fn()
    const toggle = vi.fn()

    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue(
      mockLayerCtx({ refreshLayers: refresh, loading: false, isConfigured: true }) as any,
    )
    vi.spyOn(tileHook, 'useTileLoggerContext').mockReturnValue(
      mockTileLogger({ toggle, visible: false }) as any,
    )

    render(<LayerToggleCard />)

    fireEvent.click(screen.getByRole('button', { name: /Actualizar/i }))
    expect(refresh).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /Mostrar logs/i }))
    expect(toggle).toHaveBeenCalled()
  })
})
