import { createContext } from 'react'

export interface GeoserverConfig {
  geoserverUrl: string | null
  workspace: string | null
}

export interface GeoserverConfigContextValue extends GeoserverConfig {
  setGeoserverUrl: (url: string | null) => void
  setWorkspace: (workspace: string | null) => void
  clearConfig: () => void
}

export const GeoserverConfigContext =
  createContext<GeoserverConfigContextValue | null>(null)
