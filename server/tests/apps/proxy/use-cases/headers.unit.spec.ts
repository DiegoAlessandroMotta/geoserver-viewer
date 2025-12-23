import { describe, it, expect } from 'vitest'
import { ProxyGeoServerUseCase } from '@/apps/proxy/use-cases/proxy-geoserver.use-case'

describe('ProxyGeoServerUseCase headers helpers', () => {
  it('getResponseHeaders removes skipped headers and preserves others', () => {
    const useCase: any = new ProxyGeoServerUseCase({} as any)
    const headers = new Headers({
      ETag: 'abc',
      'Content-Type': 'text/plain',
      'X-Custom': 'value',
    })

    const result = useCase.getResponseHeaders(headers)
    expect(result).toHaveProperty('content-type', 'text/plain')
    expect(result).toHaveProperty('x-custom', 'value')
    expect(result).not.toHaveProperty('etag')
  })

  it('extractCacheResult finds geowebcache header in either case', () => {
    const useCase: any = new ProxyGeoServerUseCase({} as any)
    const headers1 = new Headers({ 'geowebcache-cache-result': 'HIT' })
    const headers2 = new Headers({ 'x-geowebcache-cache-result': 'MISS' })

    expect(useCase.extractCacheResult(headers1)).toBe('HIT')
    expect(useCase.extractCacheResult(headers2)).toBe('MISS')
  })
})
