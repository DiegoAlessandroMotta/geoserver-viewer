import { serverConfig } from '@/shared/config'
import { GeoServerHostNotAllowedError } from '@/shared/errors/geoserver-host-not-allowed.error'
import { MissingGeoServerBaseUrlError } from '@/shared/errors/missing-geoserver-baseurl.error'
import { InvalidGeoServerUrlError } from '@/shared/errors/invalid-geoserver-url.error'

export class GeoServerUrlValidator {
  private static readonly VALID_PROTOCOLS = ['http://', 'https://']

  private static hostIsAllowed(
    hostname: string,
    hostWithPort: string,
  ): boolean {
    const allowed = serverConfig.geoserverAllowedHosts

    if (allowed.includes('*')) return true

    for (const entry of allowed) {
      if (!entry) continue
      if (entry === '*') return true
      if (entry === hostname || entry === hostWithPort) return true
      if (entry.startsWith('*.')) {
        const suffix = entry.slice(2)
        if (hostname === suffix || hostname.endsWith(`.${suffix}`)) return true
      }
    }

    return false
  }

  static validate(headerUrl: string | undefined): string {
    if (!headerUrl) {
      throw new MissingGeoServerBaseUrlError()
    }

    let decodedUrl: string
    try {
      decodedUrl = decodeURIComponent(headerUrl)
    } catch (err) {
      throw new InvalidGeoServerUrlError(
        headerUrl,
        err instanceof Error ? err : undefined,
      )
    }

    if (
      !this.VALID_PROTOCOLS.some((protocol) => decodedUrl.startsWith(protocol))
    ) {
      throw new InvalidGeoServerUrlError(decodedUrl)
    }

    let parsed: URL
    try {
      parsed = new URL(decodedUrl)
    } catch (err) {
      throw new InvalidGeoServerUrlError(
        decodedUrl,
        err instanceof Error ? err : undefined,
      )
    }

    const hostname = parsed.hostname
    const hostWithPort = parsed.port
      ? `${parsed.hostname}:${parsed.port}`
      : parsed.hostname

    if (!this.hostIsAllowed(hostname, hostWithPort)) {
      throw new GeoServerHostNotAllowedError(hostname)
    }

    return decodedUrl
  }
}
