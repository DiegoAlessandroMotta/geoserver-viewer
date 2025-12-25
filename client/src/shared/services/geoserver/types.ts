export interface RestLayerItem {
  name: string
  href: string
}

export interface LayerResource {
  '@class'?: string
  name?: string
  href?: string
}

export interface LayerDetails {
  name: string
  type?: string
  defaultStyle?: { name?: string; href?: string }
  resource?: LayerResource
  attribution?: { logoWidth?: number; logoHeight?: number }
  dateCreated?: string
  dateModified?: string
}

export type LayerDetailsResponse = {
  layer?: LayerDetails
}

export type ParsedCapabilities = Record<string, unknown>

export interface DetailedLayer {
  fullName: string
  title?: string
  layerName?: string
  workspace?: string | null
  store?: string | null
  type?: string
  defaultStyle?: string | null
  crs: string[]
  dateCreated?: string | null
  dateModified?: string | null
  color: string
}
