import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React, { useEffect } from 'react'
import { MapContainer } from '@/features/map/MapContainer'
import { geoserverService } from '@/shared/providers'

vi.mock('react-map-gl/maplibre', () => {
  return {
    __esModule: true,
    default: React.forwardRef(
      ({ transformRequest, onMove, children }: any, ref: any) => {
        useEffect(() => {
          if (ref) {
            ref.current = { getMap: () => ({ getZoom: () => 7.5 }) }
          }
        }, [ref])

        return (
          <div
            data-testid="mock-map"
            data-transform={JSON.stringify(
              transformRequest('/geoserver/test', ''),
            )}
          >
            <button
              data-testid="trigger-move"
              onClick={() => onMove && onMove({})}
            />
            {children}
          </div>
        )
      },
    ),
    NavigationControl: () => null,
    ScaleControl: () => null,
  }
})

describe('MapContainer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('uses geoserver headers for URLs containing /geoserver/', () => {
    vi.spyOn(geoserverService, 'getDefaultHeaders').mockReturnValue({
      Authorization: 'x',
    } as any)

    render(<MapContainer />)

    const map = screen.getByTestId('mock-map')
    const transform = JSON.parse(map.getAttribute('data-transform') || '{}')
    expect(transform.headers).toEqual({ Authorization: 'x' })
  })

  it('updates displayed zoom on map move', async () => {
    render(<MapContainer />)

    const initial = screen.getByText(/Zoom:/)
    expect(initial).toBeTruthy()

    const btn = screen.getByTestId('trigger-move')
    btn.click()

    const updated = await screen.findByText(/Zoom: 7.50/)
    expect(updated).toBeTruthy()
  })
})
