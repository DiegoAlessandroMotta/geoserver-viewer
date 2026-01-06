import { Request, Response, NextFunction } from 'express'
import { ILogger } from '@/shared/interfaces/logger.interface'
import { ProxyGeoServerUseCase } from '@/apps/proxy/use-cases/proxy-geoserver.use-case'
import { GeoServerUrlValidator } from '@/apps/proxy/validators/geoserver-url.validator'
import { WebSocketSessionService } from '@/shared/services/websocket-server/websocket-session.service'

export class ProxyGeoserverController {
  constructor(
    private readonly _useCase: ProxyGeoServerUseCase,
    private readonly _logger: ILogger,
    private readonly _wsSessionService: WebSocketSessionService,
  ) {}

  public handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const geoServerUrl = GeoServerUrlValidator.validate(
        req.get('X-GeoServer-BaseUrl'),
      )

      if (!this.validateGeoServerUrl(geoServerUrl, req, res)) {
        return
      }

      const targetUrl = this.buildTargetUrl(geoServerUrl, req.url)
      const headers = this.buildRequestHeaders(req)

      this._logger.debug(targetUrl)

      if (!this.validateHttpMethod(req, res)) {
        return
      }

      const response = await this._useCase.execute({
        targetUrl,
        method: req.method,
        headers,
      })

      this.setResponseHeaders(res, response.headers)
      this.notifyWebSocketClientsIfNeeded(req, res, targetUrl, response)
      await this.sendResponseBody(res, response)
    } catch (error) {
      next(error)
    }
  }

  private validateGeoServerUrl(
    geoServerUrl: string | null,
    req: Request,
    res: Response,
  ): boolean {
    if (geoServerUrl) {
      return true
    }

    this._logger.warn({
      message: 'Missing or invalid X-GeoServer-BaseUrl header',
      context: { path: req.path },
    })

    res.status(400).json({
      error: 'Missing X-GeoServer-BaseUrl header',
      message:
        'The X-GeoServer-BaseUrl header is required for all GeoServer requests',
    })
    return false
  }

  private buildTargetUrl(base: string, path: string): string {
    const normalizedBase = String(base).replace(/\/+$/, '')
    const normalizedPath = String(path).replace(/^\/+/, '')
    return `${normalizedBase}/${normalizedPath}`
  }

  private buildRequestHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue
      const lower = key.toLowerCase()
      if (lower === 'host') continue
      if (Array.isArray(value)) {
        headers[key] = value.join(',')
      } else {
        headers[key] = String(value)
      }
    }
    return headers
  }

  private validateHttpMethod(req: Request, res: Response): boolean {
    if (['GET', 'HEAD'].includes(req.method.toUpperCase())) {
      return true
    }

    res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET and HEAD methods are supported by the proxy',
    })
    return false
  }

  private setResponseHeaders(res: Response, responseHeaders: Headers): void {
    const headers = this._useCase.getResponseHeaders(responseHeaders)
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value)
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.removeHeader('ETag')
    res.removeHeader('cache-control')
  }

  private async sendResponseBody(
    res: Response,
    response: Awaited<ReturnType<ProxyGeoServerUseCase['execute']>>,
  ): Promise<void> {
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
      const absoluteRequestUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.url}`

      this._wsSessionService.sendToClient(sessionId, {
        type: 'proxy-response',
        url: absoluteRequestUrl,
        target: targetUrl,
        status: response.status,
        cacheResult,
        viaProxy: true,
        durationMs: response.durationMs,
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
}
