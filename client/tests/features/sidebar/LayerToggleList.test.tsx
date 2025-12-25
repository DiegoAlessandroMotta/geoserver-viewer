import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

import { LayerToggleList } from '@/features/sidebar/components/LayerToggleList'

const baseCtx = {
  toggleLayer: vi.fn(),
  setLayerZooms: vi.fn(),
}

vi.mock('@/features/sidebar/components/LayerItem', () => ({
  LayerItem: (props: any) => <div data-testid={`li-${props.layer.fullName}`}>{props.layer.fullName}</div>,
}))

import * as layerHook from '@/shared/context/layer/useLayerContext'
vi.mock('@/shared/context/layer/useLayerContext', () => ({
  useLayerContext: () => ({
    layers: new Map(),
    toggleLayer: baseCtx.toggleLayer,
    loading: false,
    isConfigured: false,
    authRequired: false,
    setLayerZooms: baseCtx.setLayerZooms,
  }),
}))

describe('LayerToggleList', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('shows configure notice when not configured', () => {
    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue({
      layers: new Map(),
      toggleLayer: baseCtx.toggleLayer,
      loading: false,
      isConfigured: false,
      authRequired: false,
      setLayerZooms: baseCtx.setLayerZooms,
    } as any)

    render(<LayerToggleList />)
    expect(screen.getByText(/Debes configurar la URL de GeoServer/i)).toBeTruthy()
  })

  it('shows loading state when loading', () => {
    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue({
      layers: new Map(),
      toggleLayer: baseCtx.toggleLayer,
      loading: true,
      isConfigured: true,
      authRequired: false,
      setLayerZooms: baseCtx.setLayerZooms,
    } as any)

    render(<LayerToggleList />)
    expect(screen.getByText(/Obteniendo capas/i)).toBeTruthy()
  })

  it('shows auth required message', () => {
    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue({
      layers: new Map(),
      toggleLayer: baseCtx.toggleLayer,
      loading: false,
      isConfigured: true,
      authRequired: true,
      setLayerZooms: baseCtx.setLayerZooms,
    } as any)

    render(<LayerToggleList />)
    expect(screen.getByText(/Se requieren credenciales/i)).toBeTruthy()
  })

  it('shows empty message when no layers', () => {
    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue({
      layers: new Map(),
      toggleLayer: baseCtx.toggleLayer,
      loading: false,
      isConfigured: true,
      authRequired: false,
      setLayerZooms: baseCtx.setLayerZooms,
    } as any)

    render(<LayerToggleList />)
    expect(screen.getByText(/No se encontraron capas/i)).toBeTruthy()
  })

  it('renders LayerItem elements when layers present', () => {
    const m = new Map()
    m.set('a', { fullName: 'a', layerName: 'a' })
    m.set('b', { fullName: 'b', layerName: 'b' })

    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue({
      layers: m,
      toggleLayer: baseCtx.toggleLayer,
      loading: false,
      isConfigured: true,
      authRequired: false,
      setLayerZooms: baseCtx.setLayerZooms,
    } as any)

    render(<LayerToggleList />)
    expect(screen.getByText(/2 disponibles/i)).toBeTruthy()
    expect(screen.getByTestId('li-a')).toBeTruthy()
    expect(screen.getByTestId('li-b')).toBeTruthy()
  })
})
