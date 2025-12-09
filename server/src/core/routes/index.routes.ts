import { Router } from 'express'
import { API_ROUTES, PROXY_ROUTES } from '@/core/routes/const.routes'
import { IRouter } from '@/shared/interfaces/router.interface'
import { proxyRoutes } from '@/apps/proxy/providers'

export class AppRoutes implements IRouter {
  routes() {
    const router = Router()

    router.use(PROXY_ROUTES.prefix, proxyRoutes.routes())

    router.get(API_ROUTES.up, (_req, res) => {
      res.status(200).json({
        status: 'up',
      })
    })

    return router
  }
}
