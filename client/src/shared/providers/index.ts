import { ConsoleLogger } from '@/shared/services/logger/pino.logger'
import { GeoserverService } from '@/shared/services/geoserver.service'
import { config } from '@/shared/config'

export const logger = new ConsoleLogger()

export const geoserverService = new GeoserverService({
  proxyUrl: config.proxyUrl,
  logger,
})
