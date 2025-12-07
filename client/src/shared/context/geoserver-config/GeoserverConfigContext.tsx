import { createContext } from 'react'
import type { GeoserverCredentials } from '@/shared/services/geoserver-config-manager.service'

export interface GeoserverConfig {
  geoserverUrl: string | null
  workspace: string | null
}

export interface GeoserverConfigContextValue extends GeoserverConfig {
  setGeoserverUrl: (url: string | null) => void
  setWorkspace: (workspace: string | null) => void
  clearConfig: () => void
  setCredentials: (creds: GeoserverCredentials, persist?: boolean) => void
  getCredentials: () => GeoserverCredentials
  clearCredentials: () => void
}

export const GeoserverConfigContext =
  createContext<GeoserverConfigContextValue | null>(null)
