import cors from 'cors'
import { serverConfig } from '@/shared/config'

export class CorsMiddleware {
  static readonly allowedOrigins = serverConfig.corsAllowedOrigins

  static readonly requests = cors({
    origin: (origin, callback) => {
      if (origin === undefined) {
        callback(null, true)
        return
      }

      if (
        CorsMiddleware.allowedOrigins.includes('*') ||
        CorsMiddleware.allowedOrigins.includes(origin)
      ) {
        callback(null, true)
        return
      }

      callback(new Error('Not allowed by CORS'), false)
    },
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  })
}
