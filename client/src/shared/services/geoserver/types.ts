export interface RestLayerItem {
  name: string
  href?: string
  title?: string | null
  short?: string | null
}

export interface LayerResource {
  '@class'?: string
  name?: string
  '@href'?: string
  href?: string
}

export interface LayerDetails {
  name: string
  title?: string | null
  type?: string
  defaultStyle?: { name?: string; href?: string } | null
  resource?: LayerResource | null
  attribution?: { logoWidth?: number; logoHeight?: number }
  dateCreated?: string | null
  dateModified?: string | null
}

export type LayerDetailsResponse = {
  layer?: LayerDetails
}

export type ParsedCapabilities = Record<string, any>

export interface DetailedLayer {
  name: string
  title?: string
  short?: string
  workspace?: string | null
  store?: string | null
  type?: string
  fullName?: string
  defaultStyle?: string | null
  crs?: string[]
  dateCreated?: string | null
  dateModified?: string | null
  color?: string | null
}
