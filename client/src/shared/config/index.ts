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

export const config = {
  proxyUrl: String(import.meta.env.VITE_PROXY_URL),
  mapCenter: parseCenter(import.meta.env.VITE_MAP_CENTER),
  mapZoom: Number(import.meta.env.VITE_MAP_ZOOM),
  mapMinZoom: Number(import.meta.env.VITE_MAP_MIN_ZOOM),
  mapMaxZoom: Number(import.meta.env.VITE_MAP_MAX_ZOOM),
  mapStyle: String(
    import.meta.env.VITE_MAP_STYLE ??
      'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  ),
}
