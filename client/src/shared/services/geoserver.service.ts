import { XMLParser } from 'fast-xml-parser'
import type { ILogger } from '@/shared/interfaces/logger.interface'

interface GeoserverServiceOptions {
  proxyUrl: string
  logger: ILogger
}

export class GeoserverService {
  private readonly proxyUrl: string
  private readonly logger: ILogger
  private readonly xmlParser: XMLParser

  constructor({ proxyUrl, logger }: GeoserverServiceOptions) {
    this.proxyUrl = proxyUrl
    this.logger = logger
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@',
      textNodeName: '#text',
    })
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
    } catch (error) {
      this.logger.error({
        msg: `Error fetching details for layer (${layerName}):`,
        error,
      })
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
      return this.xmlParser.parse(xmlString)
    } catch (error) {
      this.logger.error({ msg: 'Error parsing XML:', error })
      return null
    }
  }

  private extractCRSFromXML = (
    parsedXML: Record<string, any>,
    layerName: string,
  ) => {
    try {
      if (!parsedXML) return []

      const layers = parsedXML?.WMS_Capabilities?.Capability?.Layer?.Layer
      if (!layers) return []

      const layersList = Array.isArray(layers) ? layers : [layers]
      const foundLayer = layersList.find((layer) => layer.Name === layerName)

      if (!foundLayer) return []

      const crsList = foundLayer.CRS
      if (!crsList) return []

      return Array.isArray(crsList) ? crsList : [crsList]
    } catch (error) {
      this.logger.error({ msg: 'Error extracting CRS from XML:', error })
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
      const parsedXML = this.parseXML(text)

      if (!parsedXML) return []

      return this.extractCRSFromXML(parsedXML, layerName)
    } catch (error) {
      this.logger.warn({
        msg: `Error fetching CRS for layer ${layerName}:`,
        error,
      })
      return []
    }
  }

  public fetchWMSLayers = async (workspace: string) => {
    try {
      const layersList = await this.fetchAllLayersFromREST()
      if (layersList.length === 0) {
        this.logger.warn('No layers found from REST API')
        return []
      }

      const detailedLayers = []
      for (const layerInfo of layersList) {
        const layerName = layerInfo.name

        const [layerWorkspace, ...nameParts] = layerName.split(':')
        const shortName = nameParts.join(':')

        const details = await this.fetchLayerDetails(layerName)
        if (!details?.layer) {
          this.logger.warn(`No details found for layer: ${layerName}`)
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

      this.logger.debug(
        `fetchWMSLayers: found ${detailedLayers.length} layers (workspace=${workspace})`,
      )
      if (detailedLayers.length > 0)
        this.logger.debug({
          msg: 'layers',
          data: detailedLayers.map((l) => ({
            name: l.name,
            workspace: l.workspace,
            store: l.store,
            crs: l.crs,
          })),
        })

      return detailedLayers
    } catch (error) {
      this.logger.error({ msg: 'Error fetching WMS layers:', error })
      return []
    }
  }
}
