import express, { Express, Router } from 'express'
import { createServer, Server as HttpServer } from 'node:http'
import { serverConfig } from '@/shared/config'
import { ILogger } from '@/shared/interfaces/logger.interface'
import {
  corsMiddleware,
  loggerMiddleware,
  websocketServer,
} from '@/shared/providers'
import { API_ROUTES } from '@/core/routes/const.routes'

interface ServerOptions {
  logger: ILogger
  host: string
  port: number
  routes: Router
}

export class Server {
  private readonly _logger: ILogger
  private _app: Express
  private _httpServer?: HttpServer
  private readonly _port: number
  private readonly _host: string
  private readonly _routes: Router

  constructor(options: ServerOptions) {
    const { logger, host, port, routes } = options

    this._logger = logger
    this._app = express()
    this._host = host
    this._port = port
    this._routes = routes
  }

  public async configureServer(): Promise<void> {
    this._logger.debug({
      message: 'Configuring Middlewares...',
    })
    this.configureMiddlewares()

    this._logger.debug({
      message: 'Configuring Routes...',
    })
    this.configureRoutes()

    this._logger.debug({
      message: 'Configuring WebSocket Server...',
    })
    this.configureWebsocketServer()
  }

  private configureMiddlewares(): void {
    this._app.disable('x-powered-by')

    if (serverConfig.corsEnabled) {
      this._app.use(corsMiddleware.handle)
      this._logger.info({
        message: 'CORS enabled',
        context: {
          origins: serverConfig.corsAllowedOrigins.join(', '),
        },
      })
    }

    this._app.use(express.json())
    this._app.use(loggerMiddleware.handle)
  }

  private configureRoutes(): void {
    this._app.use(API_ROUTES.prefix, this._routes)
  }

  private configureWebsocketServer(): void {
    this._httpServer = createServer(this._app)

    websocketServer.configure(this._httpServer)
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._httpServer) {
        return reject(new Error('HTTP server not configured'))
      }

      this._httpServer.listen(this._port, this._host, () => {
        this._logger.info({
          message: 'Server started',
          context: {
            url: `http://${this._host}:${this._port}`,
            wsUrl: `ws://${this._host}:${this._port}/ws`,
          },
        })

        resolve()
      })

      this._httpServer.on('error', (err) => {
        reject(err)
      })
    })
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._httpServer != null) {
        this._httpServer.close((error) => {
          if (error != null) {
            this._logger.error({
              message: 'Error stopping server',
              context: {
                error: error instanceof Error ? error.message : String(error),
              },
            })

            return reject(error)
          }

          this._logger.info({
            message: 'Server stopped successfully',
          })
          resolve()
        })
      } else {
        this._logger.warn({
          message: 'No HTTP server running to stop',
        })
        resolve()
      }
    })
  }
}
