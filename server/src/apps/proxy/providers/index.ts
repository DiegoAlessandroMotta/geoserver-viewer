import { ProxyRoutes } from '@/apps/proxy/routes/index.routes'
import { ProxyGeoServerUseCase } from '@/apps/proxy/use-cases/proxy-geoserver.use-case'
import { logger, websocketSessionService } from '@/shared/providers'
import { ProxyGeoserverController } from '@/apps/proxy/controllers/proxy-geoserver.controller'

const proxyUseCase = new ProxyGeoServerUseCase(logger)

const proxyController = new ProxyGeoserverController(
  proxyUseCase,
  logger,
  websocketSessionService,
)

export const proxyRoutes = new ProxyRoutes(proxyController)
