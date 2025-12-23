import { serverConfig } from '@/shared/config'
import { GeoServerHostNotAllowedError } from '@/shared/errors/geoserver-host-not-allowed.error'

export class GeoServerUrlValidator {
  private static readonly VALID_PROTOCOLS = ['http://', 'https://']

  private static hostIsAllowed(
    hostname: string,
    hostWithPort: string,
  ): boolean {
    const allowed = serverConfig.geoserverAllowedHosts || ['*']

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

  static validate(headerUrl: string | undefined): string | null {
    if (!headerUrl) {
      return null
    }

    try {
      const decodedUrl = decodeURIComponent(headerUrl)

      if (
        !this.VALID_PROTOCOLS.some((protocol) =>
          decodedUrl.startsWith(protocol),
        )
      ) {
        return null
      }

      const parsed = new URL(decodedUrl)
      const hostname = parsed.hostname
      const hostWithPort = parsed.port
        ? `${parsed.hostname}:${parsed.port}`
        : parsed.hostname

      if (!this.hostIsAllowed(hostname, hostWithPort)) {
        throw new GeoServerHostNotAllowedError(hostname)
      }

      return decodedUrl
    } catch (err) {
      if (err && err instanceof GeoServerHostNotAllowedError) throw err
      return null
    }
  }
}
