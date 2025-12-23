import { describe, it, expect } from 'vitest'
import { ProxyGeoserverController } from '@/apps/proxy/controllers/proxy-geoserver.controller'
import type { ILogger } from '@/shared/interfaces/logger.interface'

describe('ProxyGeoserverController (WebSocket notification)', () => {
  it('sends a proxy-response with durationMs to session client', () => {
    const fakeUseCase: any = {
      extractCacheResult: () => 'HIT',
    }

    const sent: any[] = []
    const fakeWsService: any = {
      sendToClient: (sessionId: string, message: any) => {
        sent.push({ sessionId, message })
      },
    }

    const logger: ILogger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      fatal: () => {},
    }

    const controller = new ProxyGeoserverController(
      fakeUseCase as any,
      logger,
      fakeWsService,
    ) as any

    const req: any = {
      path: '/geoserver/gwc/service/my/tiles',
      protocol: 'http',
      get: (header: string) =>
        header === 'X-Session-Id' ? 'session-123' : 'localhost',
      baseUrl: '/api/proxy',
      url: '/geoserver/gwc/service/my/tiles',
    }

    const res: any = {}
    const response = {
      status: 200,
      headers: new Headers({}),
      durationMs: 123,
    }

    ;(controller as any).notifyWebSocketClientsIfNeeded(
      req,
      res,
      'http://example/target',
      response,
    )

    expect(sent.length).toBe(1)
    expect(sent[0].sessionId).toBe('session-123')
    expect(sent[0].message).toHaveProperty('type', 'proxy-response')
    expect(sent[0].message).toHaveProperty('durationMs', 123)
    expect(sent[0].message).toHaveProperty('target', 'http://example/target')
  })
})
