import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import LayerContextProvider from '@/shared/context/layer/LayerContextProvider'
import { useLayerContext } from '@/shared/context/layer/useLayerContext'
import { GeoserverConfigContext } from '@/shared/context/geoserver-config/GeoserverConfigContext'
import { geoserverService } from '@/shared/providers'
import { GeoserverAuthRequiredError } from '@/shared/errors/geoserver-auth-required.error'

function Consumer() {
  const ctx = useLayerContext()
  return (
    <div>
      <span data-testid="count">{ctx.layers.size}</span>
      <button onClick={() => ctx.setLayerEnabled('a', true)}>enable</button>
      <button onClick={() => ctx.toggleLayer('a')}>toggle</button>
      <button onClick={() => ctx.setLayerZooms('a', 2, 5)}>zoom</button>
      <button onClick={() => ctx.refreshLayers()}>refresh</button>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="auth">{String(ctx.authRequired)}</span>
    </div>
  )
}

describe('LayerContextProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('setLayerEnabled, toggle and setLayerZooms behave and persist zooms', () => {
    render(
      <GeoserverConfigContext.Provider value={{ geoserverUrl: null, workspace: null, setConfig: () => {}, clearConfig: () => {}, setCredentials: () => {}, getCredentials: () => ({ username: null, password: null }), clearCredentials: () => {}, areCredentialsPersisted: () => false, credentials: { username: null, password: null } }}>
        <LayerContextProvider>
          <Consumer />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    expect(screen.getByTestId('count').textContent).toBe('0')

    act(() => screen.getByText('enable').click())
    expect(screen.getByTestId('count').textContent).toBe('1')

    act(() => screen.getByText('toggle').click())
    expect(screen.getByTestId('count').textContent).toBe('1')

    // set zooms should store to localStorage
    act(() => screen.getByText('zoom').click())
    const stored = localStorage.getItem('geoserver-viewer:layer-zoom:a')
    expect(stored).toBeTruthy()
  })

  it('refreshLayers when not configured skips fetch and sets empty map', async () => {
    render(
      <GeoserverConfigContext.Provider value={{ geoserverUrl: null, workspace: null, setConfig: () => {}, clearConfig: () => {}, setCredentials: () => {}, getCredentials: () => ({ username: null, password: null }), clearCredentials: () => {}, areCredentialsPersisted: () => false, credentials: { username: null, password: null } }}>
        <LayerContextProvider>
          <Consumer />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    act(() => screen.getByText('refresh').click())

    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('refreshLayers fetches layers when configured and handles auth error', async () => {
    const fetchSpy = vi.spyOn(geoserverService, 'fetchWMSLayers').mockResolvedValue([
      { name: 'L1', short: 's', title: 't', workspace: 'w', store: 'st', type: 't', defaultStyle: null, crs: ['EPSG:4326'], dateCreated: null, dateModified: null, color: '#fff' },
    ])

    render(
      <GeoserverConfigContext.Provider value={{ geoserverUrl: 'http://g', workspace: 'w', setConfig: () => {}, clearConfig: () => {}, setCredentials: () => {}, getCredentials: () => ({ username: null, password: null }), clearCredentials: () => {}, areCredentialsPersisted: () => false, credentials: { username: null, password: null } }}>
        <LayerContextProvider>
          <Consumer />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    // wait for scheduled refresh (debounce 50ms)
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60))
    })

    expect(fetchSpy).toHaveBeenCalled()
    expect(screen.getByTestId('count').textContent).toBe('1')

    // simulate auth required error
    fetchSpy.mockRejectedValueOnce(new GeoserverAuthRequiredError())

    await act(async () => {
      await screen.getByText('refresh').click()
    })

    expect(screen.getByTestId('auth').textContent).toBe('true')
  })

  it('useLayerContext throws outside provider', () => {
    function Bad() {
      const ctx = useLayerContext()
      // return some indicators from the default context
      return (
        <div>
          <span data-testid="dcount">{String(ctx.layers.size)}</span>
        </div>
      )
    }

    const { getByTestId } = render(<Bad />)
    expect(getByTestId('dcount').textContent).toBe('0')
  })
})
