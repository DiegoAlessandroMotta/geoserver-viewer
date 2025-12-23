import type { GeoserverHttpClient } from '@/shared/services/geoserver/geoserver-http.client'
import type { GeoserverParser } from '@/shared/services/geoserver/geoserver-parser'
import type { ILogger } from '@/shared/interfaces/logger.interface'
import { GeoserverAuthRequiredError } from '@/shared/errors/geoserver-auth-required.error'

export class WMSCapabilitiesCache {
  private cache: Record<string, any> | null = null
  private cachePromise: Promise<Record<string, any> | null> | null = null

  constructor(
    private readonly httpClient: GeoserverHttpClient,
    private readonly parser: GeoserverParser,
    private readonly logger: ILogger,
  ) {}

  public invalidate(): void {
    this.cache = null
    this.cachePromise = null
  }

  public async get(): Promise<Record<string, any> | null> {
    if (this.cachePromise) return this.cachePromise
    if (this.cache) return this.cache

    this.cachePromise = (async () => {
      try {
        const text = await this.httpClient.fetchText(
          'wms?service=WMS&version=1.3.0&request=GetCapabilities',
          true,
        )
        const parsed = this.parser.parseXML(text)
        if (parsed) this.cache = parsed
        return parsed
      } catch (error) {
        if (error instanceof GeoserverAuthRequiredError) throw error
        this.logger.error({ msg: 'Error fetching WMS capabilities:', error })
        return null
      } finally {
        this.cachePromise = null
      }
    })()

    return this.cachePromise
  }
}
