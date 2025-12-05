import { Router } from 'express'
import { ROUTES_API_V1 } from './const.routes'

class ApiV1Routes {
  routes() {
    const router = Router()

    return router
  }
}

export class AppRoutes {
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
