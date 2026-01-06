import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React, { useEffect } from 'react'
import { MapContainer } from '@/features/map/MapContainer'
import { geoserverService } from '@/shared/providers'

const mockMap = { getZoom: () => 7.5 }
const mockGetMap = () => mockMap

vi.mock('react-map-gl/maplibre', () => {
  return {
    __esModule: true,
    default: React.forwardRef(
      ({ transformRequest, onMove, children }: any, ref: any) => {
        useEffect(() => {
          if (ref) {
            ref.current = { getMap: mockGetMap }
          }
        }, [ref])

        return (
          <div
            data-testid="mock-map"
            data-transform={JSON.stringify({
              withGeo: transformRequest('/geoserver/test', ''),
              withoutGeo: transformRequest('/other/test', ''),
            })}
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
    const transform: any = JSON.parse(
      map.dataset.transform || '{}',
    )
    expect(transform.withGeo.headers).toEqual({ Authorization: 'x' })
    expect(transform.withoutGeo.headers).toBeUndefined()
  })

  it('updates displayed zoom on map move', async () => {
    render(<MapContainer />)

    const initial = screen.getByText(/Zoom:/)
    expect(initial).toBeTruthy()

    const btn = screen.getByTestId('trigger-move')
    act(() => {
      btn.click()
    })

    const updated = await screen.findByText(/Zoom: 7.50/)
    expect(updated).toBeTruthy()
  })

  it('does not update zoom when map ref is not available', async () => {
    vi.resetModules()
    vi.doMock('react-map-gl/maplibre', () => ({
      __esModule: true,
      default: ({ transformRequest, onMove, children }: any) => (
        <div
          data-testid="mock-map-no-ref"
          data-transform={JSON.stringify(transformRequest('/other/test', ''))}
        >
          <button
            data-testid="trigger-move-no-ref"
            onClick={() => onMove && onMove({})}
          />
          {children}
        </div>
      ),
      NavigationControl: () => null,
      ScaleControl: () => null,
    }))

    const { MapContainer: MapNoRef } =
      await import('@/features/map/MapContainer')

    render(<MapNoRef />)

    const initial = screen.getByText(/Zoom:/)
    expect(initial).toBeTruthy()

    const btn = screen.getByTestId('trigger-move-no-ref')
    act(() => btn.click())

    expect(screen.queryByText(/Zoom: 7.50/)).toBeNull()
  })
})
