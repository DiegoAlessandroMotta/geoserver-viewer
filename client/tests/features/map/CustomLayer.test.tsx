import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CustomLayer } from '@/features/map/components/CustomLayer'

vi.mock('react-map-gl/maplibre', () => ({
  __esModule: true,
  Source: ({ id, children, tiles }: any) => (
    <div data-testid={`source-${id}`} data-tiles={JSON.stringify(tiles)}>{children}</div>
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
    expect(src.getAttribute('data-tiles')).toBeTruthy()

    expect(screen.getByTestId('layer-myLayer-fill')).toBeTruthy()
    expect(screen.getByTestId('layer-myLayer-line')).toBeTruthy()
    expect(screen.getByTestId('layer-myLayer-point')).toBeTruthy()

    const fill = screen.getByTestId('layer-myLayer-fill')
    expect(fill.getAttribute('data-minzoom')).toBe('2')
    expect(fill.getAttribute('data-maxzoom')).toBe('10')

    const layout = JSON.parse(fill.getAttribute('data-layout') || '{}')
    expect(layout.visibility).toBe('visible')
  })
})
