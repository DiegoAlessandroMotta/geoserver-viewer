import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { GeoserverConfigProvider } from '@/shared/context/geoserver-config/GeoserverConfigProvider'
import { useGeoserverConfig } from '@/shared/context/geoserver-config/useGeoserverConfig'
import { geoserverConfigService } from '@/shared/providers'

function Consumer() {
  const ctx = useGeoserverConfig()

  return (
    <div>
      <span data-testid="url">{String(ctx.geoserverUrl)}</span>
      <span data-testid="workspace">{String(ctx.workspace)}</span>
      <span data-testid="session">{String(ctx.sessionId)}</span>
      <span data-testid="cred-user">{String(ctx.credentials.username)}</span>
      <span data-testid="cred-pass">{String(ctx.credentials.password)}</span>
      <button onClick={() => ctx.setConfig({ geoserverUrl: 'new' })}>set</button>
      <button onClick={() => ctx.clearConfig()}>clear</button>
      <button onClick={() => ctx.setCredentials({ username: 'u', password: 'p' }, true)}>setCred</button>
      <button onClick={() => ctx.clearCredentials()}>clearCred</button>
    </div>
  )
}

describe('GeoserverConfigProvider', () => {

  beforeEach(() => {
    vi.spyOn(geoserverConfigService, 'getGeoserverUrl').mockReturnValue('http://g')
    vi.spyOn(geoserverConfigService, 'getWorkspace').mockReturnValue('ws')
    vi.spyOn(geoserverConfigService, 'getSessionId').mockReturnValue('sid')
    vi.spyOn(geoserverConfigService, 'getCredentials').mockReturnValue({ username: null, password: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('provides initial values from service', () => {
    render(
      <GeoserverConfigProvider>
        <Consumer />
      </GeoserverConfigProvider>,
    )

    expect(screen.getByTestId('url').textContent).toBe('http://g')
    expect(screen.getByTestId('workspace').textContent).toBe('ws')
    expect(screen.getByTestId('session').textContent).toBe('sid')
  })

  it('calls setConfig and clearConfig on service', () => {
    const setSpy = vi.spyOn(geoserverConfigService, 'setConfig')
    const clearCredSpy = vi.spyOn(geoserverConfigService, 'clearCredentials')

    render(
      <GeoserverConfigProvider>
        <Consumer />
      </GeoserverConfigProvider>,
    )

    act(() => screen.getByText('set').click())
    expect(setSpy).toHaveBeenCalledWith({ geoserverUrl: 'new' })

    act(() => screen.getByText('clear').click())
    expect(setSpy).toHaveBeenCalledWith({ geoserverUrl: null, workspace: null })
    expect(clearCredSpy).toHaveBeenCalled()
  })

  it('setCredentials and clearCredentials call service', () => {
    const setCredSpy = vi.spyOn(geoserverConfigService, 'setCredentials')
    const clearCredSpy = vi.spyOn(geoserverConfigService, 'clearCredentials')

    render(
      <GeoserverConfigProvider>
        <Consumer />
      </GeoserverConfigProvider>,
    )

    act(() => screen.getByText('setCred').click())
    expect(setCredSpy).toHaveBeenCalledWith({ username: 'u', password: 'p' }, true)

    act(() => screen.getByText('clearCred').click())
    expect(clearCredSpy).toHaveBeenCalled()
  })

  it('updates state when service emits change', () => {
    let cb: any = null
    const onChangeMock = vi.spyOn(geoserverConfigService, 'onChange').mockImplementation((c: any) => {
      cb = c
      return () => {}
    })

    render(
      <GeoserverConfigProvider>
        <Consumer />
      </GeoserverConfigProvider>,
    )

    act(() => {
      cb({ geoserverUrl: 'u1', workspace: 'w1' })
    })

    expect(screen.getByTestId('url').textContent).toBe('u1')
    expect(screen.getByTestId('workspace').textContent).toBe('w1')

    act(() => {
      cb({ credentials: { username: 'a', password: 'b' } })
    })

    expect(screen.getByTestId('cred-user').textContent).toBe('a')
    expect(screen.getByTestId('cred-pass').textContent).toBe('b')
    onChangeMock.mockRestore()
  })

  it('useGeoserverConfig throws when used outside provider', () => {
    function Bad() {
      useGeoserverConfig()
      return null
    }

    expect(() => render(<Bad />)).toThrow()
  })
})
