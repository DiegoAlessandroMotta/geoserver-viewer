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
    const geoserverUrl = geoserverConfigService.getGeoserverUrl()
    const workspace = geoserverConfigService.getWorkspace()
    const sessionId =
      geoserverConfigService.getSessionId() ?? crypto.randomUUID()

    return { geoserverUrl, workspace, sessionId }
  })

  const setConfigFn = useCallback((cfg: Partial<GeoserverConfig>) => {
    if (cfg.geoserverUrl !== undefined) {
      geoserverConfigService.setGeoserverUrl(cfg.geoserverUrl)
    }

    if (cfg.workspace !== undefined) {
      geoserverConfigService.setWorkspace(cfg.workspace)
    }

    if (cfg.sessionId !== undefined) {
      geoserverConfigService.setSessionId(cfg.sessionId)
    }

    setConfig((prev) => ({
      geoserverUrl:
        cfg.geoserverUrl !== undefined ? cfg.geoserverUrl : prev.geoserverUrl,
      workspace: cfg.workspace !== undefined ? cfg.workspace : prev.workspace,
      sessionId: cfg.sessionId !== undefined ? cfg.sessionId : prev.sessionId,
    }))
  }, [])

  const clearConfig = useCallback(() => {
    setConfig({ geoserverUrl: null, workspace: null, sessionId: null })
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
      if (
        change.geoserverUrl !== undefined ||
        change.workspace !== undefined ||
        change.sessionId !== undefined
      ) {
        setConfig((prev) => ({
          geoserverUrl: change.geoserverUrl ?? prev.geoserverUrl,
          workspace: change.workspace ?? prev.workspace,
          sessionId: change.sessionId ?? prev.sessionId,
        }))
      }
    })

    return () => unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      geoserverUrl: config.geoserverUrl,
      workspace: config.workspace,
      sessionId: config.sessionId,
      setConfig: setConfigFn,
      clearConfig,
      setCredentials,
      getCredentials,
      clearCredentials,
    }),
    [
      config.geoserverUrl,
      config.workspace,
      config.sessionId,
      setConfigFn,
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
