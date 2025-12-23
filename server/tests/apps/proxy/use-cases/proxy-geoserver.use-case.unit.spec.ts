import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProxyGeoServerUseCase } from '@/apps/proxy/use-cases/proxy-geoserver.use-case'
import { logger } from '@/shared/providers'
import { GeoServerUnreachableError } from '@/shared/errors/geoserver-unreachable.error'

describe('ProxyGeoServerUseCase', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns durationMs on successful fetch', async () => {
    globalThis.fetch = vi.fn(
      async () =>
        ({
          status: 200,
          headers: new Headers(),
          body: null,
        }) as any,
    ) as any

    const useCase = new ProxyGeoServerUseCase(logger)
    const res = await useCase.execute({
      targetUrl: 'http://localhost',
      method: 'GET',
      headers: {},
    })

    expect(res.status).toBe(200)
    expect(typeof res.durationMs).toBe('number')
    expect(res.durationMs! >= 0).toBe(true)
  })

  it('throws GeoServerUnreachableError on ECONNREFUSED', async () => {
    const err: any = new Error('connect refused')
    err.code = 'ECONNREFUSED'

    globalThis.fetch = vi.fn(async () => {
      throw err
    }) as any

    const useCase = new ProxyGeoServerUseCase(logger)

    await expect(
      useCase.execute({
        targetUrl: 'http://localhost',
        method: 'GET',
        headers: {},
      }),
    ).rejects.toBeInstanceOf(GeoServerUnreachableError)
  })
})
