export function parseCenter(value?: string): { lat: number; lon: number } {
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

export function parseProxyUrl(value?: string, basePath?: string): string {
  const defaultProxyPath = '/api/proxy'
  const realPath = ((basePath ?? '') + defaultProxyPath).replace(/\/+/g, '/')
  const defaultVal = window.location.origin + realPath

  if (value == null || value.trim().length === 0) {
    return defaultVal
  }

  const normalizedUrl = value.trim().replace(/\/$/, '')

  if (normalizedUrl.startsWith('/')) {
    const base = basePath || ''
    return window.location.origin + (base + normalizedUrl).replace(/\/+/g, '/')
  }

  if (
    normalizedUrl.startsWith('http://') ||
    normalizedUrl.startsWith('https://')
  ) {
    return normalizedUrl
  }

  const base = basePath || ''

  return (
    window.location.origin + (base + '/' + normalizedUrl).replace(/\/+/g, '/')
  )
}

export function parseBasePath(value?: string): string {
  if (!value || value.trim().length === 0) {
    return ''
  }

  let base = value.trim()

  if (!base.startsWith('/')) {
    base = `/${base}`
  }

  base = base.replace(/\/$/, '')

  if (base === '/') {
    return ''
  }

  return base
}

const parseEnvNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value as any)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const appConfig = {
  basePath: parseBasePath(import.meta.env.VITE_BASE_PATH),
  proxyUrl: parseProxyUrl(
    import.meta.env.VITE_PROXY_URL,
    parseBasePath(import.meta.env.VITE_BASE_PATH),
  ),
  mapCenter: parseCenter(import.meta.env.VITE_MAP_CENTER),
  mapZoom: parseEnvNumber(import.meta.env.VITE_MAP_ZOOM, 10),
  mapMinZoom: parseEnvNumber(import.meta.env.VITE_MAP_MIN_ZOOM, 2),
  mapMaxZoom: parseEnvNumber(import.meta.env.VITE_MAP_MAX_ZOOM, 22),
  mapStyle: String(
    import.meta.env.VITE_MAP_STYLE ??
      'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  ),
  isProduction: Boolean(import.meta.env.PROD),
  isTest: import.meta.env.MODE === 'test',
} as const
