import { ConsoleLogger } from '@/shared/services/logger/console.logger'
import { GeoserverService } from '@/shared/services/geoserver.service'
import { appConfig } from '@/shared/config'

export const logger = new ConsoleLogger()

export const geoserverService = new GeoserverService({
  proxyUrl: appConfig.proxyUrl,
  logger,
})
