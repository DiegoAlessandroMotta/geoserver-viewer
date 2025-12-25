import { XMLParser } from 'fast-xml-parser'
import type { ILogger } from '@/shared/interfaces/logger.interface'

export class GeoserverParser {
  private readonly xmlParser: XMLParser

  constructor(private readonly logger: ILogger) {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@',
      textNodeName: '#text',
    })
  }

  public parseXML(
    xmlString: string,
  ): import('@/shared/services/geoserver/types').ParsedCapabilities | null {
    try {
      return this.xmlParser.parse(
        xmlString,
      ) as import('@/shared/services/geoserver/types').ParsedCapabilities
    } catch (error) {
      this.logger.error({ msg: 'Error parsing XML:', error })
      return null
    }
  }

  public extractCRSFromXML(
    parsedXML:
      | import('@/shared/services/geoserver/types').ParsedCapabilities
      | null,
    layerName: string,
  ): string[] {
    try {
      if (!parsedXML) return []

      type LayerNode = { Name?: string; CRS?: string | string[] }
      type CapStruct = {
        WMS_Capabilities?: {
          Capability?: {
            Layer?: { Layer?: LayerNode | LayerNode[] }
          }
        }
      }

      const cap = parsedXML as unknown as CapStruct
      const layers = cap.WMS_Capabilities?.Capability?.Layer?.Layer
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
}
