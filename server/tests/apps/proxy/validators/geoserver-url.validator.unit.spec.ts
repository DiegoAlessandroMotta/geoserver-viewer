import { describe, it, expect, afterEach } from 'vitest'
import { GeoServerUrlValidator } from '@/apps/proxy/validators/geoserver-url.validator'
import { serverConfig } from '@/shared/config'
import { MissingGeoServerBaseUrlError } from '@/shared/errors/missing-geoserver-baseurl.error'
import { InvalidGeoServerUrlError } from '@/shared/errors/invalid-geoserver-url.error'
import { GeoServerHostNotAllowedError } from '@/shared/errors/geoserver-host-not-allowed.error'

describe('GeoServerUrlValidator', () => {
  const originalAllowed = serverConfig.geoserverAllowedHosts

  afterEach(() => {
    serverConfig.geoserverAllowedHosts = originalAllowed
  })

  it('validates a correct URL', () => {
    const url = 'http://localhost:8080'
    const result = GeoServerUrlValidator.validate(url)
    expect(result).toBe(url)
  })

  it('throws when header is missing', () => {
    expect(() => GeoServerUrlValidator.validate(undefined as any)).toThrow(
      MissingGeoServerBaseUrlError,
    )
  })

  it('throws for invalid protocol', () => {
    expect(() => GeoServerUrlValidator.validate('ftp://example.com')).toThrow(
      InvalidGeoServerUrlError,
    )
  })

  it('throws when host not in allowed list', () => {
    serverConfig.geoserverAllowedHosts = ['localhost']
    expect(() =>
      GeoServerUrlValidator.validate('http://malicious.example.com'),
    ).toThrow(GeoServerHostNotAllowedError)
  })
})
