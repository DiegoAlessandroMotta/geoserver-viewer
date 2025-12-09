function parseCenter(value?: string): { lat: number; lon: number } {
  const defaultVal = {
    lat: -12.046390113132471,
    lon: -77.0427648515243,
  }

  if (value == null || value?.trim().length === 0) {
    return defaultVal
  }

  const [lat, lon] = value.split(',').map((p) => parseFloat(p.trim()))

  if (isNaN(lat) || isNaN(lon)) {
    return defaultVal
  }

  return { lat, lon }
}

function parseProxyUrl(value?: string): string {
  const defaultVal =
    window.location.origin + window.location.pathname.replace(/\/$/, '')

  if (value == null || value.trim().length === 0) {
    return defaultVal
  }

  const normalizedUrl = value.trim().replace(/\/$/, '')

  if (normalizedUrl.startsWith('/')) {
    return window.location.origin + normalizedUrl
  }

  if (
    normalizedUrl.startsWith('http://') ||
    normalizedUrl.startsWith('https://')
  ) {
    return normalizedUrl
  }

  return window.location.origin + '/' + normalizedUrl
}

export const appConfig = {
  proxyUrl: parseProxyUrl(import.meta.env.VITE_PROXY_URL),
  mapCenter: parseCenter(import.meta.env.VITE_MAP_CENTER),
  mapZoom: Number(import.meta.env.VITE_MAP_ZOOM),
  mapMinZoom: Number(import.meta.env.VITE_MAP_MIN_ZOOM),
  mapMaxZoom: Number(import.meta.env.VITE_MAP_MAX_ZOOM),
  mapStyle: String(
    import.meta.env.VITE_MAP_STYLE ??
      'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  ),
} as const
