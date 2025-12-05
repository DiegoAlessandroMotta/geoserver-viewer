import { PROXY_ROUTES } from '@/core/routes/const.routes'
import { IRouter } from '@/shared/interfaces/router.interface'
import { Router } from 'express'
import { ProxyGeoserverController } from '@/apps/proxy/infrastructure/in/web/controllers/proxy-geoserver.controller'

export class ProxyRoutes implements IRouter {
  constructor(
    private readonly proxyGeoserverController: ProxyGeoserverController,
  ) {}

  routes() {
    const router = Router()

    router.use(PROXY_ROUTES.geoserver, this.proxyGeoserverController.handle)

    return router
  }
}
