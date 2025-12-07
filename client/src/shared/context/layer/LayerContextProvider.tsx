import { useCallback, useEffect, useMemo, useState } from 'react'
import { LayerContext } from './LayerContext'
import type { LayerInfo } from './LayerContext'
import { geoserverService, logger } from '@/shared/providers'

interface LayerContextProviderProps {
  children?: React.ReactNode
  workspace?: string
}

export const LayerContextProvider = ({
  children,
  workspace,
}: LayerContextProviderProps) => {
  const [layersMap, setLayersMap] = useState<Map<string, LayerInfo>>(new Map())

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

  const refreshLayers = useCallback(
    async (workspaceArg?: string) => {
      const ws = workspaceArg || workspace
      try {
        const rawLayers = await geoserverService.fetchWMSLayers(ws ?? '')
        setLayersMap((prev) => {
          const copy = new Map(prev)
          rawLayers.forEach((l: any) => {
            const name = l.name || l.fullName || l.title
            const existing = copy.get(name)
            copy.set(name, {
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
              enabled: existing?.enabled ?? false,
            })
          })
          return copy
        })
      } catch (error) {
        logger.warn({
          msg: 'LayerContextProvider.refreshLayers: could not fetch layers',
          error,
        })
      }
    },
    [workspace],
  )

  useEffect(() => {
    refreshLayers(workspace)
  }, [refreshLayers, workspace])

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
