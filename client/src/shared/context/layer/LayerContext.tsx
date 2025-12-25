import { createContext } from 'react'

export interface LayerInfo {
  fullName: string
  layerName?: string
  workspace?: string | null
  store?: string | null
  type?: string
  defaultStyle?: string | null
  crs: string[]
  dateCreated?: string | null
  dateModified?: string | null
  enabled?: boolean
  color: string
  minZoom?: number
  maxZoom?: number
}

export type LayerMap = Map<string, LayerInfo>

export type LayerContextType = {
  layers: LayerMap
  setLayerEnabled: (layerName: string, enabled: boolean) => void
  setLayerZooms: (layerName: string, minZoom: number, maxZoom: number) => void
  toggleLayer: (layerName: string) => void
  refreshLayers: (workspace?: string) => Promise<void>
  loading: boolean
  isConfigured: boolean
  authRequired: boolean
}

export const LayerContext = createContext<LayerContextType>({
  layers: new Map(),
  setLayerEnabled: () => undefined,
  setLayerZooms: () => undefined,
  toggleLayer: () => undefined,
  refreshLayers: async () => undefined,
  loading: false,
  isConfigured: false,
  authRequired: false,
})
