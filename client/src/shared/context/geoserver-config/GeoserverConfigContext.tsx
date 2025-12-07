import { createContext } from 'react'
import type { GeoserverCredentials } from '@/shared/services/geoserver-config-manager.service'

export interface GeoserverConfig {
  geoserverUrl: string | null
  workspace: string | null
  sessionId?: string
}

export interface GeoserverConfigContextValue extends GeoserverConfig {
  setConfig: (cfg: Partial<GeoserverConfig>) => void
  clearConfig: () => void
  setCredentials: (creds: GeoserverCredentials, persist?: boolean) => void
  getCredentials: () => GeoserverCredentials
  clearCredentials: () => void
  areCredentialsPersisted: () => boolean
  credentials: GeoserverCredentials
}

export const GeoserverConfigContext =
  createContext<GeoserverConfigContextValue | null>(null)
