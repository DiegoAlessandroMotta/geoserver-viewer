import { Request, Response, NextFunction } from 'express'
import { ILogger } from '@/shared/interfaces/logger.interface'

export class LoggerMiddleware {
  constructor(private readonly logger: ILogger) {}

  handle = (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint()

    this.logger.info({
      message: 'Incoming request',
      context: {
        ip: req.ip,
        method: req.method,
        path: req.path,
        protocol: req.protocol,
        host: req.hostname,
        body: req.body,
        query: req.query,
        params: req.params,
        userAgent: req.get('user-agent'),
      },
    })

    res.on('finish', () => {
      const end = process.hrtime.bigint()
      const duration = Number(end - start) / 1_000_000

      this.logger.info({
        message: 'Request completed',
        context: {
          ip: req.ip,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs: duration,
        },
      })
    })

    next()
  }
}
