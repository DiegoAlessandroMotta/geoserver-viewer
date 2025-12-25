import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MapLayers } from '@/features/map/components/MapLayers'

const makeCtx = (overrides: any = {}) => ({
  layers: overrides.layers ?? new Map(),
})

vi.mock('@/features/map/components/CustomLayer', () => ({
  CustomLayer: (props: any) => <div data-testid={`custom-${props.layer.name}`} />,
}))

import * as layerHook from '@/shared/context/layer/useLayerContext'
vi.mock('@/shared/context/layer/useLayerContext', () => ({
  useLayerContext: () => makeCtx(),
}))

describe('MapLayers', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('renders nothing when layers is empty', () => {
    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue(makeCtx({ layers: new Map() }) as any)
    const { container } = render(<MapLayers />)
    expect(container.firstChild).toBeNull()
  })

  it('renders CustomLayer for each layer', () => {
    const m = new Map()
    m.set('a', { name: 'a' })
    m.set('b', { name: 'b' })

    vi.spyOn(layerHook, 'useLayerContext').mockReturnValue(makeCtx({ layers: m }) as any)

    render(<MapLayers />)

    expect(screen.getByTestId('custom-a')).toBeTruthy()
    expect(screen.getByTestId('custom-b')).toBeTruthy()
  })
})