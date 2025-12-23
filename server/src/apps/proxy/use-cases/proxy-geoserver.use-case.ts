import { GeoServerUnreachableError } from '@/shared/errors/geoserver-unreachable.error'
import { ILogger } from '@/shared/interfaces/logger.interface'

export interface ProxyGeoServerRequest {
  targetUrl: string
  method: string
  headers: Record<string, string>
}

export interface ProxyGeoServerResponse {
  status: number
  headers: Headers
  body: ReadableStream<Uint8Array> | null
}

export class ProxyGeoServerUseCase {
  private readonly _logger: ILogger
  private readonly _headersToSkip = new Set([
    'etag',
    'cache-control',
    'expires',
    'pragma',
    'last-modified',
    'content-encoding',
    'www-authenticate',
  ])

  constructor(logger: ILogger) {
    this._logger = logger
  }

  async execute(
    request: ProxyGeoServerRequest,
  ): Promise<ProxyGeoServerResponse> {
    const { targetUrl, method, headers } = request

    try {
      const response = await fetch(targetUrl, {
        headers,
        method,
      })

      return {
        status: response.status,
        headers: response.headers,
        body: response.body,
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this._logger.error({
        message: 'Failed to proxy request to GeoServer',
        context: {
          target: targetUrl,
          error: errorMessage,
        },
      })

      const isConnectionRefused =
        error && typeof error === 'object' && 'code' in error
          ? (error as Record<string, unknown>).code === 'ECONNREFUSED'
          : false

      if (isConnectionRefused) {
        throw new GeoServerUnreachableError(
          errorMessage,
          error instanceof Error ? error : undefined,
        )
      }

      throw error
    }
  }

  getResponseHeaders(sourceHeaders: Headers): Record<string, string> {
    const result: Record<string, string> = {}

    for (const [key, value] of sourceHeaders.entries()) {
      if (!this._headersToSkip.has(key.toLowerCase())) {
        result[key] = value
      }
    }

    return result
  }

  extractCacheResult(headers: Headers): string | null {
    return (
      headers.get('geowebcache-cache-result') ||
      headers.get('x-geowebcache-cache-result') ||
      null
    )
  }
}
