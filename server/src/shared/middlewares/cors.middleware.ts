import cors from 'cors'

export class CorsMiddleware {
  constructor(readonly allowedOrigins: string[]) {}

  handle = cors({
    origin: (origin, callback) => {
      if (origin === undefined) {
        callback(null, true)
        return
      }

      if (
        this.allowedOrigins.includes('*') ||
        this.allowedOrigins.includes(origin)
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
      'X-GeoServer-BaseUrl',
      'X-Session-Id',
    ],
    exposedHeaders: ['Content-Type', 'Content-Length'],
    credentials: false,
  })
}
