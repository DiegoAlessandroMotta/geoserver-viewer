import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WMSCapabilitiesCache } from '@/shared/services/geoserver/wms-capabilities.cache'

const makeHttp = (impl: any = {}) => ({ fetchText: vi.fn(impl.fetchText) })
const makeParser = (impl: any = {}) => ({ parseXML: vi.fn(impl.parseXML) })
const makeLogger = () => ({ error: vi.fn(), debug: vi.fn() })

describe('WMSCapabilitiesCache abort behavior', () => {
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

  it('invalidate aborts an in-flight get and resolved value is null', async () => {
    http.fetchText.mockImplementation(
      (_path: string, _inc: boolean, signal?: AbortSignal) => {
        return new Promise((_resolve, reject) => {
          if (signal) {
            signal.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError')),
            )
          }
        })
      },
    )

    const p = cache.get()
    // give it a tick to start
    await Promise.resolve()
    cache.invalidate()

    const res = await p
    expect(res).toBeNull()
    expect(logger.debug).toHaveBeenCalled()
  })

  it('concurrent get() calls share the same promise and both resolve on abort', async () => {
    http.fetchText.mockImplementation(
      (_path: string, _inc: boolean, signal?: AbortSignal) => {
        return new Promise((_resolve, reject) => {
          if (signal) {
            signal.addEventListener('abort', () =>
              reject(new DOMException('aborted', 'AbortError')),
            )
          }
        })
      },
    )

    const a = cache.get()
    const b = cache.get()
    expect(http.fetchText).toHaveBeenCalledTimes(1)

    // abort
    cache.invalidate()

    const [ra, rb] = await Promise.all([a, b])
    expect(ra).toBeNull()
    expect(rb).toBeNull()
  })
})
