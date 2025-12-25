import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WMSCapabilitiesCache } from '@/shared/services/geoserver/wms-capabilities.cache'
import { GeoserverAuthRequiredError } from '@/shared/errors/geoserver-auth-required.error'

const makeHttp = (impl: any = {}) => ({ fetchText: vi.fn(impl.fetchText) })
const makeParser = (impl: any = {}) => ({ parseXML: vi.fn(impl.parseXML) })
const makeLogger = () => ({ error: vi.fn() })

describe('WMSCapabilitiesCache', () => {
  let http: any
  let parser: any
  let logger: any
  let cache: WMSCapabilitiesCache

  beforeEach(() => {
    http = makeHttp()
    parser = makeParser()
    logger = makeLogger()
    cache = new WMSCapabilitiesCache(http as any, parser as any, logger as any)
  })

  it('fetches and caches parsed capabilities', async () => {
    http.fetchText.mockResolvedValue('<xml/>')
    parser.parseXML.mockReturnValue({ foo: 'bar' })

    const first = await cache.get()
    expect(first).toEqual({ foo: 'bar' })
    expect(http.fetchText).toHaveBeenCalledTimes(1)

    const second = await cache.get()
    expect(second).toEqual({ foo: 'bar' })
    expect(http.fetchText).toHaveBeenCalledTimes(1)
  })

  it('invalidates cache', async () => {
    http.fetchText.mockResolvedValue('<xml/>')
    parser.parseXML.mockReturnValue({ foo: 'bar' })

    await cache.get()
    cache.invalidate()
    await cache.get()
    expect(http.fetchText).toHaveBeenCalledTimes(2)
  })

  it('rethrows GeoserverAuthRequiredError', async () => {
    http.fetchText.mockRejectedValue(new GeoserverAuthRequiredError())

    await expect(cache.get()).rejects.toBeInstanceOf(GeoserverAuthRequiredError)
  })

  it('logs and returns null on other errors', async () => {
    http.fetchText.mockRejectedValue(new Error('network'))
    const res = await cache.get()
    expect(res).toBeNull()
    expect(logger.error).toHaveBeenCalled()
  })

  it('returns null when parser returns null', async () => {
    http.fetchText.mockResolvedValue('<xml/>')
    parser.parseXML.mockReturnValue(null)
    const res = await cache.get()
    expect(res).toBeNull()
  })

  it('shares a single promise for concurrent gets', async () => {
    let resolve: any
    const p = new Promise((r) => (resolve = r))
    http.fetchText.mockReturnValue(p)
    parser.parseXML.mockReturnValue({ foo: 'bar' })

    const a = cache.get()
    const b = cache.get()

    expect(http.fetchText).toHaveBeenCalledTimes(1)

    resolve('<xml/>')
    const [ra, rb] = await Promise.all([a, b])
    expect(ra).toEqual({ foo: 'bar' })
    expect(rb).toEqual({ foo: 'bar' })
  })
})
