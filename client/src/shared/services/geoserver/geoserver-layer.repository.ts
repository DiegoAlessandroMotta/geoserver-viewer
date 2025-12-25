import type { ILogger } from '@/shared/interfaces/logger.interface'
import type { GeoserverHttpClient } from '@/shared/services/geoserver/geoserver-http.client'
import { GeoserverAuthRequiredError } from '@/shared/errors/geoserver-auth-required.error'
import type {
  RestLayerItem,
  LayerDetailsResponse,
} from '@/shared/services/geoserver/types'

export class GeoserverLayerRepository {
  constructor(
    private readonly httpClient: GeoserverHttpClient,
    private readonly logger: ILogger,
  ) {}

  public async fetchAllLayersFromREST(): Promise<RestLayerItem[]> {
    try {
      const data = await this.httpClient.fetchJson('rest/layers.json', true)
      const layers = data?.layers?.layer || []
      return Array.isArray(layers)
        ? (layers as RestLayerItem[])
        : ([layers] as RestLayerItem[])
    } catch (error) {
      if (error instanceof GeoserverAuthRequiredError) throw error
      this.logger.error({ msg: 'Error fetching layers from REST API:', error })
      return []
    }
  }

  public async fetchLayerDetails(
    layerName: string,
  ): Promise<LayerDetailsResponse | null> {
    try {
      const encodedName = layerName.replace(':', '%3A')
      const data = await this.httpClient.fetchJson(
        `rest/layers/${encodedName}.json`,
        true,
      )
      return data as LayerDetailsResponse
    } catch (error) {
      if (error instanceof GeoserverAuthRequiredError) throw error
      this.logger.error({
        msg: `Error fetching details for layer (${layerName}):`,
        error,
      })
      return null
    }
  }
}
