import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CustomLayer } from '@/features/map/components/CustomLayer'
import { geoserverService } from '@/shared/providers'

vi.mock('react-map-gl/maplibre', () => ({
  __esModule: true,
  Source: ({ id, children, tiles }: any) => (
    <div data-testid={`source-${id}`} data-tiles={JSON.stringify(tiles)}>
      {children}
    </div>
  ),
  Layer: (props: any) => (
    <div
      data-testid={`layer-${props.id}`}
      data-minzoom={String(props.minzoom)}
      data-maxzoom={String(props.maxzoom)}
      data-layout={JSON.stringify(props.layout)}
      data-paint={JSON.stringify(props.paint)}
    />
  ),
}))

describe('CustomLayer', () => {
  it('renders null when layer type is not vector', () => {
    const layer: any = { name: 'a:b', type: 'RASTER' }
    const { container } = render(<CustomLayer layer={layer} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders source and three layers for vector layer with expected props', () => {
    const layer: any = {
      fullName: 'ns:myLayer',
      layerName: 'myLayer',
      enabled: true,
      color: '#abcd12',
      minZoom: 2,
      maxZoom: 10,
      type: 'VECTOR',
    }

    render(<CustomLayer layer={layer} />)

    const src = screen.getByTestId('source-ns:myLayer')
    expect(src).toBeTruthy()
    expect(src.dataset.tiles).toBeTruthy()

    expect(screen.getByTestId('layer-myLayer-fill')).toBeTruthy()
    expect(screen.getByTestId('layer-myLayer-line')).toBeTruthy()
    expect(screen.getByTestId('layer-myLayer-point')).toBeTruthy()

    const fill = screen.getByTestId('layer-myLayer-fill')
    expect(fill.dataset.minzoom).toBe('2')
    expect(fill.dataset.maxzoom).toBe('10')

    const layout = JSON.parse(fill.dataset.layout || '{}')
    expect(layout.visibility).toBe('visible')
  })

  it('handles missing optional fields and calls getVectorTileUrl', () => {
    const spy = vi
      .spyOn(geoserverService, 'getVectorTileUrl')
      .mockReturnValue('vtile://url' as any)

    const layer: any = {
      fullName: 'ns:min',
      layerName: 'min',
      enabled: true,
      type: 'VECTOR',
    }

    const { container } = render(<CustomLayer layer={layer} />)

    expect(
      container.querySelector('[data-testid="source-ns:min"]'),
    ).toBeTruthy()
    expect(spy).toHaveBeenCalledWith('ns:min')
  })
})
