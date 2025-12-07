import { ConsoleLogger } from '@/shared/services/logger/console.logger'
import { GeoserverService } from '@/shared/services/geoserver.service'
import { appConfig } from '@/shared/config'
import { GeoserverConfigManagerService } from '../services/geoserver-config-manager.service'

export const logger = new ConsoleLogger()
export const geoserverConfigService = new GeoserverConfigManagerService({
  logger,
})

export const geoserverService = new GeoserverService({
  proxyUrl: appConfig.proxyUrl,
  logger,
  configManager: geoserverConfigService,
})
