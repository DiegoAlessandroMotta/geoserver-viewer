import { PROXY_ROUTES } from '@/core/routes/const.routes'
import { IRouter } from '@/shared/interfaces/router.interface'
import { Router } from 'express'

export class ProxyRoutes implements IRouter {
  routes() {
    const router = Router()

    router.use(PROXY_ROUTES.geoserver, (req, res) => {
      res.status(501).json({
        message: 'Not Implemented',
      })
    })

    return router
  }
}
