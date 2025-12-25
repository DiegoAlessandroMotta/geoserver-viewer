import { GeoserverAuthRequiredError } from '@/shared/errors/geoserver-auth-required.error'
import type { GeoserverConfigManagerService } from '@/shared/services/geoserver/geoserver-config-manager.service'

export class GeoserverHttpClient {
  constructor(
    private readonly proxyUrl: string,
    private readonly configManager: GeoserverConfigManagerService,
  ) {}

  public getDefaultHeaders = (
    includeCredentials = false,
  ): Record<string, string> => {
    const headers: Record<string, string> = {}
    const geoserverUrl = this.configManager.getGeoserverUrl() ?? null
    if (geoserverUrl) {
      headers['X-GeoServer-BaseUrl'] = geoserverUrl
    }

    if (includeCredentials) {
      const { username, password } = this.configManager.getCredentials()
      if (username && password) {
        const credentials = btoa(`${username}:${password}`)
        headers['Authorization'] = `Basic ${credentials}`
      }
    }

    const sessionId = this.configManager.getSessionId()
    if (sessionId) {
      headers['X-Session-Id'] = sessionId
    }

    return headers
  }

  public getBaseUrl = () => `${this.proxyUrl}/geoserver`

  private async fetchWithHeaders(
    path: string,
    includeCredentials = false,
    signal?: AbortSignal,
  ): Promise<Response> {
    const base = this.getBaseUrl()
    const url = `${base}/${path}`
    const res = await fetch(url, {
      headers: this.getDefaultHeaders(includeCredentials),
      signal,
    })

    if (res.status === 401) {
      throw new GeoserverAuthRequiredError()
    }

    return res
  }

  public async fetchJson(
    path: string,
    includeCredentials = false,
    signal?: AbortSignal,
  ): Promise<any> {
    const res = await this.fetchWithHeaders(path, includeCredentials, signal)
    if (!res.ok) {
      throw new Error(`${path} failed: ${res.status}`)
    }
    return res.json()
  }

  public async fetchText(
    path: string,
    includeCredentials = false,
    signal?: AbortSignal,
  ): Promise<string> {
    const res = await this.fetchWithHeaders(path, includeCredentials, signal)
    if (!res.ok) {
      throw new Error(`${path} failed: ${res.status}`)
    }
    return res.text()
  }

  public getVectorTileUrl = (layerName: string) =>
    `${this.proxyUrl}/geoserver/gwc/service/tms/1.0.0/${layerName}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`
}
