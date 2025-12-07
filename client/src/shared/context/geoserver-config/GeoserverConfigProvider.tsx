import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GeoserverConfigContext } from './GeoserverConfigContext'
import { geoserverConfigService } from '@/shared/providers'
import type { GeoserverConfig } from './GeoserverConfigContext'

export interface GeoserverConfigProviderProps {
  children?: React.ReactNode
}

export const GeoserverConfigProvider = ({
  children,
}: GeoserverConfigProviderProps) => {
  const [config, setConfig] = useState<GeoserverConfig>(() => {
    const url = geoserverConfigService.getGeoserverUrl() ?? null
    const workspace = geoserverConfigService.getWorkspace() ?? null
    return { geoserverUrl: url, workspace }
  })

  const setGeoserverUrl = useCallback((url: string | null) => {
    geoserverConfigService.setGeoserverUrl(url)
    setConfig((prev) => ({ ...prev, geoserverUrl: url }))
  }, [])

  const setWorkspace = useCallback((workspace: string | null) => {
    geoserverConfigService.setWorkspace(workspace)
    setConfig((prev) => ({ ...prev, workspace }))
  }, [])

  const clearConfig = useCallback(() => {
    geoserverConfigService.setGeoserverUrl(null)
    geoserverConfigService.setWorkspace(null)
    setConfig({ geoserverUrl: null, workspace: null })
  }, [])

  const setCredentials = useCallback(
    (
      creds: { username: string | null; password: string | null },
      persist?: boolean,
    ) => {
      geoserverConfigService.setCredentials(creds, persist)
    },
    [],
  )

  const getCredentials = useCallback(() => {
    return geoserverConfigService.getCredentials()
  }, [])

  const clearCredentials = useCallback(() => {
    geoserverConfigService.clearCredentials()
  }, [])

  useEffect(() => {
    const unsubscribe = geoserverConfigService.onChange((change) => {
      if (change.geoserverUrl !== undefined || change.workspace !== undefined) {
        setConfig((prev) => ({
          geoserverUrl: change.geoserverUrl ?? prev.geoserverUrl,
          workspace: change.workspace ?? prev.workspace,
        }))
      }
    })
    return () => unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      geoserverUrl: config.geoserverUrl,
      workspace: config.workspace,
      setGeoserverUrl,
      setWorkspace,
      clearConfig,
      setCredentials,
      getCredentials,
      clearCredentials,
    }),
    [
      config.geoserverUrl,
      config.workspace,
      setGeoserverUrl,
      setWorkspace,
      clearConfig,
      setCredentials,
      getCredentials,
      clearCredentials,
    ],
  )

  return (
    <GeoserverConfigContext.Provider value={value}>
      {children}
    </GeoserverConfigContext.Provider>
  )
}
