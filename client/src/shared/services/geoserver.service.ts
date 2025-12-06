import type { ILogger } from '@/shared/interfaces/logger.interface'

interface GeoserverServiceOptions {
  proxyUrl: string
  logger: ILogger
}

export class GeoserverService {
  private readonly proxyUrl: string
  private readonly logger: ILogger

  constructor({ proxyUrl, logger }: GeoserverServiceOptions) {
    this.proxyUrl = proxyUrl
    this.logger = logger
  }

  public getVectorTileUrl = (layerName: string) => {
    return `${this.proxyUrl}/gwc/service/tms/1.0.0/${layerName}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`
  }

  private getDefaultHeaders = () => {
    const headers: Record<string, string> = {}

    const geoserverUrl = localStorage.getItem('geoserver_base_url')
    if (geoserverUrl) {
      headers['X-GeoServer-BaseUrl'] = geoserverUrl
    }

    const username = localStorage.getItem('geoserver_username')
    const password = localStorage.getItem('geoserver_password')
    if (username && password) {
      const credentials = btoa(`${username}:${password}`)
      headers['Authorization'] = `Basic ${credentials}`
    }

    return headers
  }

  private getBaseUrl = () => {
    return `${this.proxyUrl}/geoserver`
  }

  private fetchAllLayersFromREST = async () => {
    try {
      const base = this.getBaseUrl()
      const url = `${base}/rest/layers.json`
      const res = await fetch(url, {
        headers: this.getDefaultHeaders(),
      })

      if (!res.ok) {
        throw new Error(`REST layers endpoint failed: ${res.status}`)
      }

      const data = await res.json()
      const layers = data?.layers?.layer || []
      return Array.isArray(layers) ? layers : [layers]
    } catch (error) {
      this.logger.error({ msg: 'Error fetching layers from REST API:', error })
      return []
    }
  }

  private fetchLayerDetails = async (layerName: string) => {
    try {
      const base = this.getBaseUrl()
      const encodedName = layerName.replace(':', '%3A')
      const url = `${base}/rest/layers/${encodedName}.json`
      const res = await fetch(url, {
        headers: this.getDefaultHeaders(),
      })
      if (!res.ok) {
        throw new Error(`Layer details fetch failed: ${res.status}`)
      }

      return await res.json()
    } catch (err) {
      console.error(`Error fetching details for layer (${layerName}):`, err)
      return null
    }
  }

  private parseResourceInfo = (resourceUrl?: string) => {
    if (resourceUrl == null) {
      return { workspace: null, store: null }
    }

    const match = resourceUrl.match(
      /\/workspaces\/([^/]+)\/datastores\/([^/]+)/,
    )

    if (match) {
      return {
        workspace: decodeURIComponent(match[1]),
        store: decodeURIComponent(match[2]),
      }
    }

    return { workspace: null, store: null }
  }

  private parseXML = (xmlString: string) => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

      if (xmlDoc.getElementsByTagName('parsererror').length) {
        console.error('XML parsing error')
        return null
      }

      return xmlDoc
    } catch (error) {
      this.logger.error({ msg: 'Error parsing XML:', error })
      return null
    }
  }

  private extractCRSFromXML = (xmlDoc: Document, layerName: string) => {
    try {
      if (!xmlDoc) return []

      const layers = xmlDoc.getElementsByTagName('Layer')
      let foundLayer = null

      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        const nameElement = layer.querySelector('Name')

        if (nameElement && nameElement.textContent.trim() === layerName) {
          const childLayers = layer.querySelectorAll(':scope > Layer')

          if (childLayers.length === 0) {
            foundLayer = layer
            break
          }

          if (!foundLayer) {
            foundLayer = layer
          }
        }
      }

      if (!foundLayer) return []

      const crsElements = foundLayer.querySelectorAll(':scope > CRS')
      const crsList: string[] = []

      crsElements.forEach((crsEl) => {
        const crs = crsEl.textContent.trim()
        if (crs && !crsList.includes(crs)) {
          crsList.push(crs)
        }
      })

      return crsList
    } catch (err) {
      console.error('Error extracting CRS from XML:', err)
      return []
    }
  }

  private fetchLayerCRS = async (layerName: string) => {
    try {
      const base = this.getBaseUrl()
      const url = `${base}/wms?service=WMS&version=1.3.0&request=GetCapabilities`
      const res = await fetch(url, {
        headers: this.getDefaultHeaders(),
      })
      if (!res.ok) return []

      const text = await res.text()
      const xmlDoc = this.parseXML(text)

      if (!xmlDoc) return []

      return this.extractCRSFromXML(xmlDoc, layerName)
    } catch (err) {
      console.warn(`Error fetching CRS for layer ${layerName}:`, err)
      return []
    }
  }

  public fetchWMSLayers = async (workspace: string) => {
    try {
      const layersList = await this.fetchAllLayersFromREST()
      if (layersList.length === 0) {
        console.warn('No layers found from REST API')
        return []
      }

      const detailedLayers = []
      for (const layerInfo of layersList) {
        const layerName = layerInfo.name

        const [layerWorkspace, ...nameParts] = layerName.split(':')
        const shortName = nameParts.join(':')

        const details = await this.fetchLayerDetails(layerName)
        if (!details?.layer) {
          console.warn(`No details found for layer: ${layerName}`)
          continue
        }

        const crs = await this.fetchLayerCRS(layerName)

        const layer = details.layer
        const resourceInfo = this.parseResourceInfo(
          layer.resource?.href || layer.resource?.['@href'],
        )

        detailedLayers.push({
          name: layerName,
          title: layer.title || layer.name || shortName,
          short: shortName,
          workspace: resourceInfo.workspace || layerWorkspace,
          store: resourceInfo.store,
          type: layer.type,
          fullName: layer.name,
          dateCreated: layer.dateCreated,
          dateModified: layer.dateModified,
          defaultStyle: layer.defaultStyle?.name,
          crs: crs,
        })
      }

      console.debug(
        `fetchWMSLayers: found ${detailedLayers.length} layers (workspace=${workspace})`,
      )
      if (detailedLayers.length > 0)
        console.debug(
          'layers',
          detailedLayers.map((l) => ({
            name: l.name,
            workspace: l.workspace,
            store: l.store,
            crs: l.crs,
          })),
        )

      return detailedLayers
    } catch (err) {
      console.error('Error fetching WMS layers:', err)
      return []
    }
  }
}
