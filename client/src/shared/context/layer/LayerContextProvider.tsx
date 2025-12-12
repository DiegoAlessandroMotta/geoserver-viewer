import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import { LayerContext } from '@/shared/context/layer/LayerContext'
import { appConfig } from '@/shared/config'
import type { LayerInfo } from '@/shared/context/layer/LayerContext'
import { geoserverService, logger } from '@/shared/providers'
import { GeoserverConfigContext } from '@/shared/context/geoserver-config/GeoserverConfigContext'
import { GeoserverAuthRequiredError } from '@/shared/errors/geoserver-auth-required.error'

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
  const [loading, setLoading] = useState(false)
  const [authRequired, setAuthRequired] = useState(false)
  const isConfigured = Boolean(geoserverUrl && configWorkspace)
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

  const setLayerZooms = useCallback((layerName: string, minZoom: number, maxZoom: number) => {
    setLayersMap((prev) => {
      const copy = new Map(prev)
      const existing = copy.get(layerName)
      copy.set(layerName, {
        ...existing,
        name: layerName,
        minZoom,
        maxZoom,
      })

      console.log(copy);
      return copy
    })
  }, [])

  const refreshLayers = useCallback(
    async (workspaceArg?: string) => {
      const ws = workspaceArg ?? configWorkspace
      if (!isConfigured) {
        logger.debug({
          msg: 'LayerContextProvider.refreshLayers: geoserver not configured; skipping fetch',
        })
        setLayersMap(new Map())
        setLoading(false)
        return
      }
      setLoading(true)
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

        const rawLayers = await geoserverService.fetchWMSLayers(ws ?? '')
        setAuthRequired(false)

        const newLayers = new Map()

        rawLayers.forEach((l) => {
          const name = l.name || l.title || l.short

          const defaultMin = Math.max(10, Number(appConfig.mapMinZoom ?? 0))
          const defaultMax = Number(appConfig.mapMaxZoom ?? 28)

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
            minZoom: defaultMin,
            maxZoom: defaultMax,
            color: l.color,
          })
        })

        setLayersMap(newLayers)
      } catch (error) {
        if (error instanceof GeoserverAuthRequiredError) {
          setAuthRequired(true)
          setLayersMap(new Map())
          logger.warn({
            msg: 'LayerContextProvider.refreshLayers: auth required to fetch layers',
            error,
          })
          return
        }

        logger.warn({
          msg: 'LayerContextProvider.refreshLayers: could not fetch layers',
          error,
        })
        setLayersMap(new Map())
      } finally {
        setLoading(false)
      }
    },
    [configWorkspace, isConfigured],
  )

  useEffect(() => {
    mountedRef.current = true
    logger.debug({
      msg: 'LayerContextProvider: configuration changed, clearing layers and scheduling refresh',
    })
    const debounceDelayMs = 50
    const timeoutId = setTimeout(() => {
      logger.debug({
        msg: 'LayerContextProvider: scheduled refresh is running',
      })
      if (isConfigured) refreshLayers()
    }, debounceDelayMs)

    return () => {
      clearTimeout(timeoutId)
      mountedRef.current = false
    }
  }, [
    refreshLayers,
    configWorkspace,
    geoserverUrl,
    configCredentials?.username,
    configCredentials?.password,
    isConfigured,
  ])

  const value = useMemo(
    () => ({
      layers: layersMap,
      setLayerEnabled,
      setLayerZooms,
      toggleLayer,
      refreshLayers,
      loading,
      isConfigured,
      authRequired,
    }),
    [
      layersMap,
      setLayerEnabled,
      setLayerZooms,
      toggleLayer,
      refreshLayers,
      loading,
      isConfigured,
      authRequired,
    ],
  )

  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>
}

export default LayerContextProvider
