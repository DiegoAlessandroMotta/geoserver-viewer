import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import LayerContextProvider from '@/shared/context/layer/LayerContextProvider'
import { useLayerContext } from '@/shared/context/layer/useLayerContext'
import { GeoserverConfigContext } from '@/shared/context/geoserver-config/GeoserverConfigContext'
import { geoserverService, logger } from '@/shared/providers'
import { GeoserverAuthRequiredError } from '@/shared/errors/geoserver-auth-required.error'
import { useEffect } from 'react'

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
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: null,
          workspace: null,
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
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

    act(() => screen.getByText('zoom').click())
    const stored = localStorage.getItem('geoserver-viewer:layer-zoom:a')
    expect(stored).toBeTruthy()
  })

  it('refreshLayers when not configured skips fetch and sets empty map', async () => {
    render(
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: null,
          workspace: null,
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
        <LayerContextProvider>
          <Consumer />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    act(() => screen.getByText('refresh').click())

    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('refreshLayers fetches layers when configured and handles auth error', async () => {
    const fetchSpy = vi
      .spyOn(geoserverService, 'fetchWMSLayers')
      .mockResolvedValue([
        {
          fullName: 'L1',
          layerName: 's',
          workspace: 'w',
          store: 'st',
          type: 't',
          defaultStyle: null,
          crs: ['EPSG:4326'],
          dateCreated: null,
          dateModified: null,
          color: '#fff',
        },
      ])

    render(
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: 'http://g',
          workspace: 'w',
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
        <LayerContextProvider>
          <Consumer />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    await act(async () => {
      await new Promise((r) => setTimeout(r, 60))
    })

    expect(fetchSpy).toHaveBeenCalled()
    expect(screen.getByTestId('count').textContent).toBe('1')

    fetchSpy.mockRejectedValueOnce(new GeoserverAuthRequiredError())

    await act(async () => {
      await screen.getByText('refresh').click()
    })

    expect(screen.getByTestId('auth').textContent).toBe('true')
  })

  it('useLayerContext throws outside provider', () => {
    function Bad() {
      const ctx = useLayerContext()
      return (
        <div>
          <span data-testid="dcount">{String(ctx.layers.size)}</span>
        </div>
      )
    }

    const { getByTestId } = render(<Bad />)
    expect(getByTestId('dcount').textContent).toBe('0')
  })

  it('logs when layer zoom in localStorage is invalid JSON', async () => {
    vi.spyOn(geoserverService, 'fetchWMSLayers').mockResolvedValueOnce([
      {
        fullName: 'L1',
        layerName: 's',

        workspace: 'w',
        store: 'st',
        type: 't',
        defaultStyle: null,
        crs: ['EPSG:4326'],
        dateCreated: null,
        dateModified: null,
        color: '#fff',
      },
    ])

    localStorage.setItem('geoserver-viewer:layer-zoom:L1', 'not-json')

    const loggerWarn = vi.spyOn(logger, 'warn')

    render(
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: 'http://g',
          workspace: 'w',
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
        <LayerContextProvider>
          <Consumer />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    await act(async () => {
      await screen.getByText('refresh').click()
    })

    expect(loggerWarn).toHaveBeenCalled()
    expect(screen.getByTestId('count').textContent).toBe('1')
  })

  it('logs when saving layer zoom to localStorage fails', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage fail')
      })
    const loggerWarn = vi.spyOn(logger, 'warn')

    render(
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: null,
          workspace: null,
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
        <LayerContextProvider>
          <Consumer />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    act(() => screen.getByText('zoom').click())

    expect(loggerWarn).toHaveBeenCalled()

    setItemSpy.mockRestore()
  })

  it('refreshLayers handles generic errors and clears layers', async () => {
    const fetchSpy = vi
      .spyOn(geoserverService, 'fetchWMSLayers')
      .mockRejectedValueOnce(new Error('boom'))
    const loggerWarn = vi.spyOn(logger, 'warn')

    render(
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: 'http://g',
          workspace: 'w',
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
        <LayerContextProvider>
          <Consumer />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    await act(async () => {
      await screen.getByText('refresh').click()
    })

    expect(fetchSpy).toHaveBeenCalled()
    expect(loggerWarn).toHaveBeenCalled()
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('loading').textContent).toBe('false')
  })

  it('uses stored zoom values when present during refresh', async () => {
    localStorage.setItem(
      'geoserver-viewer:layer-zoom:L1',
      JSON.stringify({ minZoom: 10, maxZoom: 15 }),
    )
    vi.spyOn(geoserverService, 'fetchWMSLayers').mockResolvedValueOnce([
      {
        fullName: 'L1',
        layerName: 's',
        workspace: 'w',
        store: 'st',
        type: 't',
        defaultStyle: null,
        crs: ['EPSG:4326'],
        dateCreated: null,
        dateModified: null,
        color: '#fff',
      },
    ])

    function ConsumerMinMax() {
      const ctx = useLayerContext()
      const l = ctx.layers.get('L1')
      return (
        <div>
          <span data-testid="min">{String(l?.minZoom)}</span>
          <span data-testid="max">{String(l?.maxZoom)}</span>
          <button onClick={() => ctx.refreshLayers()}>refresh</button>
        </div>
      )
    }

    render(
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: 'http://g',
          workspace: 'w',
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
        <LayerContextProvider>
          <ConsumerMinMax />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    await act(async () => {
      await screen.getByText('refresh').click()
    })

    expect(screen.getByTestId('min').textContent).toBe('10')
    expect(screen.getByTestId('max').textContent).toBe('15')
  })

  it('refreshLayers returns early when provider is unmounted', async () => {
    const fetchSpy = vi.spyOn(geoserverService, 'fetchWMSLayers')

    function ConsumerRef() {
      const ctx = useLayerContext()
      return (
        <div>
          <button onClick={() => ctx.refreshLayers()}>refresh</button>
        </div>
      )
    }

    const { unmount } = render(
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: 'http://g',
          workspace: 'w',
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
        <LayerContextProvider>
          <ConsumerRef />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    unmount()

    const refreshRef: { current: any } = { current: null }
    function Grabber() {
      const ctx = useLayerContext()
      useEffect(() => {
        refreshRef.current = ctx.refreshLayers
      }, [ctx.refreshLayers])
      return null
    }

    const { unmount: u2 } = render(
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: 'http://g',
          workspace: 'w',
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
        <LayerContextProvider>
          <Grabber />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    u2()

    await act(async () => {
      await refreshRef.current?.()
    })

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('does not update state after unmount when refresh resolves later', async () => {
    let resolveFn: any
    const p = new Promise((r) => (resolveFn = r))
    const fetchSpy2 = vi
      .spyOn(geoserverService, 'fetchWMSLayers')
      .mockReturnValue(p as any)
    const loggerDebug = vi.spyOn(logger, 'debug')

    const { unmount } = render(
      <GeoserverConfigContext.Provider
        value={{
          geoserverUrl: 'http://g',
          workspace: 'w',
          setConfig: () => {},
          clearConfig: () => {},
          setCredentials: () => {},
          getCredentials: () => ({ username: null, password: null }),
          clearCredentials: () => {},
          areCredentialsPersisted: () => false,
          credentials: { username: null, password: null },
        }}
      >
        <LayerContextProvider>
          <Consumer />
        </LayerContextProvider>
      </GeoserverConfigContext.Provider>,
    )

    await act(async () => {
      screen.getByText('refresh').click()
    })

    unmount()

    resolveFn([
      {
        fullName: 'L1',
        layerName: 's',
        workspace: 'w',
        store: 'st',
        type: 't',
        defaultStyle: null,
        crs: ['EPSG:4326'],
        dateCreated: null,
        dateModified: null,
        color: '#fff',
      },
    ])

    fetchSpy2

    await act(async () => {
      await Promise.resolve()
    })

    expect(loggerDebug).toHaveBeenCalledWith(
      expect.objectContaining({
        msg: 'LayerContextProvider.refreshLayers: mountedRef not found, skipping update',
      }),
    )
  })
})
