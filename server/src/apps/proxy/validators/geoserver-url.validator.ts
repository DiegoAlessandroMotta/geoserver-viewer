export class GeoServerUrlValidator {
  private static readonly VALID_PROTOCOLS = ['http://', 'https://']

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

      new URL(decodedUrl)
      return decodedUrl
    } catch {
      return null
    }
  }
}
