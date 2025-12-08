import { ConsoleLogger } from '@/shared/services/logger/console.logger'
import { GeoserverService } from '@/shared/services/geoserver.service'
import { appConfig } from '@/shared/config'
import { GeoserverConfigManagerService } from '@/shared/services/geoserver-config-manager.service'
import { WebsocketClient } from '@/shared/services/websocket-client.service'

export const logger = new ConsoleLogger()
export const geoserverConfigService = new GeoserverConfigManagerService({
  logger,
})

export const geoserverService = new GeoserverService({
  proxyUrl: appConfig.proxyUrl,
  logger,
  configManager: geoserverConfigService,
})

export const websocketClient = new WebsocketClient({
  logger,
  configManager: geoserverConfigService,
})

websocketClient.connect()
