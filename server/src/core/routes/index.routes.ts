import { Router } from 'express'
import { PROXY_ROUTES, ROUTES_API_V1 } from './const.routes'
import { IRouter } from '@/shared/interfaces/router.interface'
import { proxyRoutes } from '@/apps/proxy/infrastructure/providers'

class ApiV1Routes implements IRouter {
  routes() {
    const router = Router()

    router.use(PROXY_ROUTES.prefix, proxyRoutes.routes())

    return router
  }
}

export class AppRoutes implements IRouter {
  routes() {
    const router = Router()
    const apiV1Routes = new ApiV1Routes()

    router.use(ROUTES_API_V1.prefix, apiV1Routes.routes())

    router.get('/up', (_req, res) => {
      res.status(200).json({
        status: 'up',
      })
    })

    return router
  }
}
