import React, { useCallback, useMemo, useState } from 'react'
import { GeoserverConfigContext } from './GeoserverConfigContext'
import type { GeoserverConfig } from './GeoserverConfigContext'

const LOCAL_STORAGE_URL_KEY = 'geoserver_base_url'
const LOCAL_STORAGE_WORKSPACE_KEY = 'geoserver_workspace'

export interface GeoserverConfigProviderProps {
  children?: React.ReactNode
}

export const GeoserverConfigProvider = ({ children }: GeoserverConfigProviderProps) => {
  const [config, setConfig] = useState<GeoserverConfig>(() => {
    const url = localStorage.getItem(LOCAL_STORAGE_URL_KEY) || null
    const workspace = localStorage.getItem(LOCAL_STORAGE_WORKSPACE_KEY) || null
    return { geoserverUrl: url, workspace }
  })

  const setGeoserverUrl = useCallback((url: string | null) => {
    if (url == null) {
      localStorage.removeItem(LOCAL_STORAGE_URL_KEY)
    } else {
      localStorage.setItem(LOCAL_STORAGE_URL_KEY, url)
    }
    setConfig((prev) => ({ ...prev, geoserverUrl: url }))
  }, [])

  const setWorkspace = useCallback((workspace: string | null) => {
    if (workspace == null) {
      localStorage.removeItem(LOCAL_STORAGE_WORKSPACE_KEY)
    } else {
      localStorage.setItem(LOCAL_STORAGE_WORKSPACE_KEY, workspace)
    }
    setConfig((prev) => ({ ...prev, workspace }))
  }, [])

  const clearConfig = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_URL_KEY)
    localStorage.removeItem(LOCAL_STORAGE_WORKSPACE_KEY)
    setConfig({ geoserverUrl: null, workspace: null })
  }, [])

  const value = useMemo(
    () => ({ geoserverUrl: config.geoserverUrl, workspace: config.workspace, setGeoserverUrl, setWorkspace, clearConfig }),
    [config.geoserverUrl, config.workspace, setGeoserverUrl, setWorkspace, clearConfig],
  )

  return <GeoserverConfigContext.Provider value={value}>{children}</GeoserverConfigContext.Provider>
}

export default GeoserverConfigProvider
