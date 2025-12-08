import { createContext } from 'react'

export interface LayerInfo {
  name: string
  short?: string
  title?: string
  workspace?: string | null
  store?: string | null
  type?: string
  fullName?: string
  defaultStyle?: string | null
  crs?: string[]
  dateCreated?: string | null
  dateModified?: string | null
  enabled?: boolean
  color?: string
}

export type LayerMap = Map<string, LayerInfo>

export type LayerContextType = {
  layers: LayerMap
  setLayerEnabled: (layerName: string, enabled: boolean) => void
  toggleLayer: (layerName: string) => void
  refreshLayers: (workspace?: string) => Promise<void>
  loading: boolean
}

export const LayerContext = createContext<LayerContextType>({
  layers: new Map(),
  setLayerEnabled: () => undefined,
  toggleLayer: () => undefined,
  refreshLayers: async () => undefined,
  loading: false,
})
