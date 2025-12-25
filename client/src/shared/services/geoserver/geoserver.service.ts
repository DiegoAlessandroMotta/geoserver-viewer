import type { ILogger } from '@/shared/interfaces/logger.interface'
import type { GeoserverConfigManagerService } from '@/shared/services/geoserver/geoserver-config-manager.service'
import { generateSHA1HexHash, randomColorFromString } from '@/shared/lib/utils'
import { GeoserverHttpClient } from '@/shared/services/geoserver/geoserver-http.client'
import { GeoserverParser } from '@/shared/services/geoserver/geoserver-parser'
import { GeoserverLayerRepository } from '@/shared/services/geoserver/geoserver-layer.repository'
import { WMSCapabilitiesCache } from '@/shared/services/geoserver/wms-capabilities.cache'
import { ConcurrencyExecutor } from '@/shared/services/concurrency.executor'
import type {
  DetailedLayer,
  ParsedCapabilities,
  RestLayerItem,
} from '@/shared/services/geoserver/types'
interface GeoserverServiceOptions {
  proxyUrl: string
  logger: ILogger
  configManager: GeoserverConfigManagerService
}

export class GeoserverService {
  private readonly httpClient: GeoserverHttpClient
  private readonly parser: GeoserverParser
  private readonly layerRepo: GeoserverLayerRepository
  private readonly wmsCache: WMSCapabilitiesCache
  private readonly executor: ConcurrencyExecutor
  private readonly logger: ILogger

  constructor({ proxyUrl, logger, configManager }: GeoserverServiceOptions) {
    this.logger = logger
    this.httpClient = new GeoserverHttpClient(proxyUrl, configManager)
    this.parser = new GeoserverParser(logger)
    this.layerRepo = new GeoserverLayerRepository(this.httpClient, logger)
    this.wmsCache = new WMSCapabilitiesCache(
      this.httpClient,
      this.parser,
      logger,
    )
    this.executor = new ConcurrencyExecutor(6, logger)

    configManager.onChange((change) => {
      if (
        change.geoserverUrl !== undefined ||
        change.workspace !== undefined ||
        change.credentials !== undefined ||
        change.sessionId !== undefined
      ) {
        this.invalidateCache()
      }
    })
  }

  public getVectorTileUrl = (layerName: string) => {
    return this.httpClient.getVectorTileUrl(layerName)
  }

  public invalidateCache = (): void => {
    this.wmsCache.invalidate()
  }

  public getDefaultHeaders = (includeCredentials?: boolean) => {
    return this.httpClient.getDefaultHeaders(Boolean(includeCredentials))
  }

  private parseResourceInfo = (resourceUrl?: string) => {
    // Normalize empty values to explicit nulls so callers can rely on null when absent
    if (!resourceUrl) return { workspace: null, store: null }

    // Accept common GeoServer resource URL forms, e.g.:
    // /workspaces/{ws}/datastores/{store}, /workspaces/{ws}/stores/{store}, /workspaces/{ws}/coveragestores/{store}
    const match = resourceUrl.match(
      /\/workspaces\/([^/]+)\/(?:datastores|stores|coveragestores)\/([^/]+)/i,
    )

    if (match) {
      return {
        workspace: decodeURIComponent(match[1]),
        store: decodeURIComponent(match[2]),
      }
    }

    return { workspace: null, store: null }
  }

  public fetchWMSLayers = async (
    workspace: string,
  ): Promise<DetailedLayer[]> => {
    this.invalidateCache()

    const layersList = await this.layerRepo.fetchAllLayersFromREST()
    if (layersList.length === 0) {
      this.logger.warn({ msg: 'No layers found from REST API' })
      return []
    }

    const capabilities: ParsedCapabilities | null = await this.wmsCache.get()

    if (!capabilities) {
      this.logger.debug({
        msg: 'fetchWMSLayers: capabilities fetch canceled or returned null',
      })
      return []
    }

    const results = await this.executor.run<RestLayerItem, DetailedLayer>(
      layersList,
      async (layerInfo) => {
        const layerName = layerInfo.name

        const [layerWorkspace, ...nameParts] = layerName.split(':')
        const shortName = nameParts.join(':')

        const [details, crs, hexHash] = await Promise.all([
          this.layerRepo.fetchLayerDetails(layerName),
          this.parser.extractCRSFromXML(capabilities ?? null, layerName),
          generateSHA1HexHash(layerName),
        ])

        if (!details?.layer) {
          this.logger.warn({
            msg: `No details found for layer: ${layerName}`,
          })
          return null
        }

        const layer = details.layer
        const resourceInfo = this.parseResourceInfo(layer.resource?.href)
        const color = randomColorFromString(hexHash)

        const result: DetailedLayer = {
          fullName: layerName,
          layerName: shortName,
          workspace: resourceInfo.workspace ?? layerWorkspace,
          store: resourceInfo.store ?? null,
          type: layer.type,
          dateCreated: layer.dateCreated,
          dateModified: layer.dateModified,
          defaultStyle: layer.defaultStyle?.name,
          crs: crs,
          color: color,
        }

        return result
      },
    )

    const detailedLayers = results.filter(
      (layer): layer is DetailedLayer => layer !== null,
    )

    this.logger.debug({
      msg: `fetchWMSLayers: found ${detailedLayers.length} layers (workspace=${workspace})`,
    })
    if (detailedLayers.length > 0)
      this.logger.debug({ msg: 'layers', data: detailedLayers })

    return detailedLayers
  }
}
