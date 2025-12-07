import { XMLParser } from 'fast-xml-parser'
import type { ILogger } from '@/shared/interfaces/logger.interface'
import { generateSHA1HexHash, randomColorFromString } from '../lib/utils'

interface GeoserverServiceOptions {
  proxyUrl: string
  logger: ILogger
}

export class GeoserverService {
  private readonly proxyUrl: string
  private readonly logger: ILogger
  private readonly xmlParser: XMLParser
  private wmsCapabilitiesCache: Record<string, any> | null = null
  private wmsCapabilitiesCachePromise: Promise<Record<
    string,
    any
  > | null> | null = null
  private readonly MAX_CONCURRENT_REQUESTS = 6

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
    return `${this.proxyUrl}/geoserver/gwc/service/tms/1.0.0/${layerName}@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`
  }

  public invalidateCache = (): void => {
    this.logger.debug({ msg: 'Cache invalidated manually' })
    this.wmsCapabilitiesCache = null
    this.wmsCapabilitiesCachePromise = null
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

  private async executeWithConcurrencyLimit<T>(
    items: T[],
    executor: (item: T) => Promise<any>,
  ): Promise<any[]> {
    const results: any[] = []
    let currentIndex = 0

    const executeNext = async (): Promise<void> => {
      while (currentIndex < items.length) {
        const index = currentIndex
        currentIndex++

        try {
          const result = await executor(items[index])
          results[index] = result
        } catch (error) {
          this.logger.error({
            msg: `Error processing item ${index}:`,
            error,
          })
          results[index] = null
        }
      }
    }

    const workers = Array.from({ length: this.MAX_CONCURRENT_REQUESTS }).map(
      () => executeNext(),
    )

    await Promise.all(workers)
    return results
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

  private fetchWMSCapabilities = async (): Promise<Record<
    string,
    any
  > | null> => {
    if (this.wmsCapabilitiesCachePromise) {
      return this.wmsCapabilitiesCachePromise
    }

    if (this.wmsCapabilitiesCache) {
      return this.wmsCapabilitiesCache
    }

    this.wmsCapabilitiesCachePromise = (async () => {
      try {
        const base = this.getBaseUrl()
        const url = `${base}/wms?service=WMS&version=1.3.0&request=GetCapabilities`
        const res = await fetch(url, {
          headers: this.getDefaultHeaders(),
        })
        if (!res.ok) {
          this.logger.warn({
            msg: 'WMS GetCapabilities request failed',
            status: res.status,
          })
          return null
        }

        const text = await res.text()
        const parsedXML = this.parseXML(text)

        if (parsedXML) {
          this.wmsCapabilitiesCache = parsedXML
        }

        return parsedXML
      } catch (error) {
        this.logger.error({ msg: 'Error fetching WMS capabilities:', error })
        return null
      } finally {
        this.wmsCapabilitiesCachePromise = null
      }
    })()

    return this.wmsCapabilitiesCachePromise
  }

  private fetchLayerCRS = async (
    layerName: string,
    cachedCapabilities?: Record<string, any>,
  ) => {
    try {
      const capabilities =
        cachedCapabilities || (await this.fetchWMSCapabilities())

      if (!capabilities) return []

      return this.extractCRSFromXML(capabilities, layerName)
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
        this.logger.warn({ msg: 'No layers found from REST API' })
        return []
      }

      const capabilities = await this.fetchWMSCapabilities()

      this.logger.debug({
        msg: `Starting to fetch details for ${layersList.length} layers with concurrency limit of ${this.MAX_CONCURRENT_REQUESTS}`,
      })

      const results = await this.executeWithConcurrencyLimit(
        layersList,
        async (layerInfo) => {
          const layerName = layerInfo.name

          const [layerWorkspace, ...nameParts] = layerName.split(':')
          const shortName = nameParts.join(':')

          const [details, crs, hexHash] = await Promise.all([
            this.fetchLayerDetails(layerName),
            this.fetchLayerCRS(layerName, capabilities ?? undefined),
            generateSHA1HexHash(layerName),
          ])

          if (!details?.layer) {
            this.logger.warn({
              msg: `No details found for layer: ${layerName}`,
            })
            return null
          }

          const layer = details.layer
          const resourceInfo = this.parseResourceInfo(
            layer.resource?.href || layer.resource?.['@href'],
          )
          const color = randomColorFromString(hexHash)

          return {
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
            crs,
            color,
          }
        },
      )

      const detailedLayers = results.filter((layer) => layer !== null)

      this.logger.debug({
        msg: `fetchWMSLayers: found ${detailedLayers.length} layers (workspace=${workspace})`,
      })

      if (detailedLayers.length > 0) {
        this.logger.debug({
          msg: 'layers',
          data: detailedLayers,
        })
      }

      return detailedLayers
    } catch (error) {
      this.logger.error({ msg: 'Error fetching WMS layers:', error })
      return []
    }
  }
}
