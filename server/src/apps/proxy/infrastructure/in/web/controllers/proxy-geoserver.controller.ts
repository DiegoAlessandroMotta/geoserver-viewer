import { Request, Response } from 'express'
import { ILogger } from '@/shared/interfaces/logger.interface'
import { ProxyGeoServerUseCase } from '@/apps/proxy/application/use-cases/proxy-geoserver.use-case'
import { GeoServerUrlValidator } from '@/apps/proxy/infrastructure/in/validators/geoserver-url.validator'
import { WebSocketSessionService } from '@/shared/services/websocket-server/websocket-session.service'

export class ProxyGeoserverController {
  constructor(
    private readonly _useCase: ProxyGeoServerUseCase,
    private readonly _logger: ILogger,
    private readonly _wsSessionService: WebSocketSessionService,
  ) {}

  public handle = async (req: Request, res: Response): Promise<void> => {
    try {
      const geoServerUrl = GeoServerUrlValidator.validate(
        req.get('X-GeoServer-BaseUrl'),
      )

      if (!geoServerUrl) {
        this._logger.warn({
          message: 'Missing or invalid X-GeoServer-BaseUrl header',
          context: { path: req.path },
        })

        res.status(400).json({
          error: 'Missing X-GeoServer-BaseUrl header',
          message:
            'The X-GeoServer-BaseUrl header is required for all GeoServer requests',
        })
        return
      }

      const targetUrl = `${geoServerUrl}${req.path}`
        .replace(/\/\/+/g, '/')
        .replace('http:/', 'http://')

      const headers: Record<string, string> = {}
      const authHeader = req.get('Authorization')
      if (authHeader) {
        headers['Authorization'] = authHeader
      }

      const response = await this._useCase.execute({
        targetUrl,
        method: req.method,
        headers,
      })

      const responseHeaders = this._useCase.getResponseHeaders(response.headers)
      for (const [key, value] of Object.entries(responseHeaders)) {
        res.setHeader(key, value)
      }

      res.setHeader('Access-Control-Allow-Origin', '*')
      res.removeHeader('ETag')
      res.removeHeader('cache-control')

      this.notifyWebSocketClientsIfNeeded(req, res, targetUrl, response)

      res.status(response.status)

      if (response.body) {
        const reader = response.body.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            res.write(Buffer.from(value))
          }
        } finally {
          reader.releaseLock()
        }
      }

      res.send()
    } catch (error) {
      this.handleProxyError(error, res)
    }
  }

  private notifyWebSocketClientsIfNeeded = (
    req: Request,
    res: Response,
    targetUrl: string,
    response: Awaited<ReturnType<ProxyGeoServerUseCase['execute']>>,
  ): void => {
    try {
      if (!req.path.includes('/gwc/service')) {
        return
      }

      const sessionId = req.get('X-Session-Id')
      if (!sessionId) {
        return
      }

      const cacheResult = this._useCase.extractCacheResult(response.headers)
      const absoluteRequestUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`

      this._wsSessionService.sendToClient(sessionId, {
        type: 'proxy-response',
        url: absoluteRequestUrl,
        target: targetUrl,
        status: response.status,
        cacheResult,
        viaProxy: true,
        headers: {
          'geowebcache-cache-result': cacheResult,
        },
      })
    } catch (error) {
      this._logger.debug({
        message: 'WebSocket notification failed (non-critical)',
        context: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
    }
  }

  private handleProxyError = (error: unknown, res: Response): void => {
    const errorMessage = error instanceof Error ? error.message : String(error)

    const isConnectionRefused =
      error && typeof error === 'object' && 'code' in error
        ? (error as Record<string, unknown>).code === 'ECONNREFUSED'
        : false

    if (isConnectionRefused) {
      this._logger.warn({
        message: 'GeoServer is unreachable',
        context: { error: errorMessage },
      })

      res.status(502).json({
        error: 'GeoServer unreachable',
        message: errorMessage,
      })
      return
    }

    this._logger.error({
      message: 'Proxy request failed',
      context: { error: errorMessage },
    })

    res.status(500).json({
      error: 'Proxy error',
      message: 'An error occurred while proxying the request',
    })
  }
}
