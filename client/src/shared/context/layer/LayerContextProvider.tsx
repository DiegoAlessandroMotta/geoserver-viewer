import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import { LayerContext } from './LayerContext'
import type { LayerInfo } from './LayerContext'
import { geoserverService, logger } from '@/shared/providers'
import { GeoserverConfigContext } from '@/shared/context/geoserver-config/GeoserverConfigContext'

interface LayerContextProviderProps {
  children?: React.ReactNode
}

export const LayerContextProvider = ({
  children,
}: LayerContextProviderProps) => {
  const geoserverConfig = useContext(GeoserverConfigContext)
  const configWorkspace = geoserverConfig?.workspace ?? undefined
  const geoserverUrl = geoserverConfig?.geoserverUrl ?? undefined
  const configCredentials = geoserverConfig?.credentials
  const [layersMap, setLayersMap] = useState<Map<string, LayerInfo>>(new Map())
  const mountedRef = useRef(true)

  const setLayerEnabled = useCallback((layerName: string, enabled: boolean) => {
    setLayersMap((prev) => {
      const copy = new Map(prev)
      const existing = copy.get(layerName)
      if (existing) {
        copy.set(layerName, { ...existing, enabled })
      } else {
        copy.set(layerName, { name: layerName, enabled })
      }
      return copy
    })
  }, [])

  const toggleLayer = useCallback((layerName: string) => {
    setLayersMap((prev) => {
      const copy = new Map(prev)
      const existing = copy.get(layerName)
      copy.set(layerName, {
        ...existing,
        name: layerName,
        enabled: !(existing?.enabled ?? false),
      })
      return copy
    })
  }, [])

  const refreshLayers = useCallback(async () => {
    try {
      logger.debug({
        msg: 'LayerContextProvider.refreshLayers: starting refresh',
      })

      if (!mountedRef.current) {
        logger.debug({
          msg: 'LayerContextProvider.refreshLayers: mountedRef not found, skipping refresh',
        })
        return
      }

      const rawLayers = await geoserverService.fetchWMSLayers(
        configWorkspace ?? '',
      )

      const newLayers = new Map()

      rawLayers.forEach((l) => {
        const name = l.name || l.title || l.short

        newLayers.set(name, {
          name,
          short: l.short,
          title: l.title,
          workspace: l.workspace,
          store: l.store,
          type: l.type,
          fullName: l.name,
          defaultStyle: l.defaultStyle,
          crs: l.crs,
          dateCreated: l.dateCreated,
          dateModified: l.dateModified,
          enabled: false,
          color: l.color,
        })
      })

      setLayersMap(newLayers)
    } catch (error) {
      logger.warn({
        msg: 'LayerContextProvider.refreshLayers: could not fetch layers',
        error,
      })
      setLayersMap(new Map())
    }
  }, [configWorkspace])

  useEffect(() => {
    mountedRef.current = true
    logger.debug({
      msg: 'LayerContextProvider: configuration changed, invalidating cache and clearing layers',
    })
    geoserverService.invalidateCache()
    Promise.resolve().then(() => refreshLayers())

    return () => {
      mountedRef.current = false
    }
  }, [
    refreshLayers,
    configWorkspace,
    geoserverUrl,
    configCredentials?.username,
    configCredentials?.password,
  ])

  const value = useMemo(
    () => ({
      layers: layersMap,
      setLayerEnabled,
      toggleLayer,
      refreshLayers,
    }),
    [layersMap, setLayerEnabled, toggleLayer, refreshLayers],
  )

  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>
}

export default LayerContextProvider
