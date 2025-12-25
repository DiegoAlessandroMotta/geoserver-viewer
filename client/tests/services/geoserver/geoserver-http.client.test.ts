import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeoserverHttpClient } from '@/shared/services/geoserver/geoserver-http.client'
import { GeoserverAuthRequiredError } from '@/shared/errors/geoserver-auth-required.error'

const proxyUrl = 'http://proxy.test'

function makeConfig(overrides: any = {}) {
  return {
    getGeoserverUrl: () => overrides.geoserverUrl ?? 'http://geoserver.test',
    getCredentials: () =>
      overrides.credentials ?? { username: 'u', password: 'p' },
    getSessionId: () => overrides.sessionId ?? 'sid',
  }
}

describe('GeoserverHttpClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('builds default headers correctly', () => {
    const cfg = makeConfig()
    const client = new GeoserverHttpClient(proxyUrl, cfg as any)

    const headers = client.getDefaultHeaders(true)
    expect(headers['X-GeoServer-BaseUrl']).toBe('http://geoserver.test')
    expect(headers['Authorization']).toContain('Basic ')
    expect(headers['X-Session-Id']).toBe('sid')
  })

  it('excludes authorization when includeCredentials is false', () => {
    const cfg = makeConfig()
    const client = new GeoserverHttpClient(proxyUrl, cfg as any)

    const headers = client.getDefaultHeaders(false)
    expect(headers['Authorization']).toBeUndefined()
  })

  it('does not include authorization when credentials missing', () => {
    const cfg = makeConfig({ credentials: { username: null, password: null } })
    const client = new GeoserverHttpClient(proxyUrl, cfg as any)
    const headers = client.getDefaultHeaders(true)
    expect(headers['Authorization']).toBeUndefined()
  })

  it('does not include base url or session when absent', () => {
    const cfg = {
      getGeoserverUrl: () => null,
      getCredentials: () => ({ username: 'u', password: 'p' }),
      getSessionId: () => null,
    }
    const client = new GeoserverHttpClient(proxyUrl, cfg as any)
    const headers = client.getDefaultHeaders(true)
    expect(headers['X-GeoServer-BaseUrl']).toBeUndefined()
    expect(headers['X-Session-Id']).toBeUndefined()
  })

  it('getBaseUrl returns proxy geoserver base', () => {
    const client = new GeoserverHttpClient(proxyUrl, makeConfig() as any)
    expect(client.getBaseUrl()).toBe(`${proxyUrl}/geoserver`)
  })

  it('fetchJson returns parsed json when ok', async () => {
    const client = new GeoserverHttpClient(proxyUrl, makeConfig() as any)
    const fake = { ok: true, status: 200, json: async () => ({ a: 1 }) } as any
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(fake)),
    )

    const res = await client.fetchJson('foo')
    expect(res).toEqual({ a: 1 })
    expect(fetch).toHaveBeenCalled()
  })

  it('fetchJson throws when response not ok', async () => {
    const client = new GeoserverHttpClient(proxyUrl, makeConfig() as any)
    const fake = { ok: false, status: 500, json: async () => ({}) } as any
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(fake)),
    )

    await expect(client.fetchJson('foo')).rejects.toThrow('foo failed: 500')
  })

  it('fetchJson throws GeoserverAuthRequiredError on 401', async () => {
    const client = new GeoserverHttpClient(proxyUrl, makeConfig() as any)
    const fake = { ok: false, status: 401 } as any
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(fake)),
    )

    await expect(client.fetchJson('foo')).rejects.toBeInstanceOf(
      GeoserverAuthRequiredError,
    )
  })

  it('fetchText returns text when ok', async () => {
    const client = new GeoserverHttpClient(proxyUrl, makeConfig() as any)
    const fake = { ok: true, status: 200, text: async () => 'hello' } as any
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(fake)),
    )

    const res = await client.fetchText('bar')
    expect(res).toBe('hello')
  })

  it('fetchText throws when response not ok', async () => {
    const client = new GeoserverHttpClient(proxyUrl, makeConfig() as any)
    const fake = { ok: false, status: 404, text: async () => 'no' } as any
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(fake)),
    )

    await expect(client.fetchText('bar')).rejects.toThrow('bar failed: 404')
  })
})
