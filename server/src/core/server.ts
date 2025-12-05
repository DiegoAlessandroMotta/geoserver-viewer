import express, { Express, Router } from 'express'
import { Server as HttpServer } from 'node:http'
import cors from 'cors'
import { serverConfig } from '@/shared/config'
import { ILogger } from '@/shared/interfaces/logger.interface'
import { websocketServer } from '@/shared/providers'

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
    this._logger.debug('Configuring Middlewares...')
    this.configureMiddlewares()

    this._logger.debug('Configuring Routes...')
    this.configureRoutes()

    this._logger.debug('Configure Websocket Server...')
    await websocketServer.configure()
  }

  private configureMiddlewares(): void {
    this._app.disable('x-powered-by')

    if (serverConfig.corsEnabled) {
      this._app.use(cors({ origin: serverConfig.corsAllowedOrigins }))
      this._logger.info(
        `CORS enabled for origins: ${serverConfig.corsAllowedOrigins.join(', ')}`,
      )
    }

    this._app.use(express.json())
  }

  private configureRoutes(): void {
    this._app.use(this._routes)
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._httpServer = this._app.listen(this._port, this._host, () => {
        this._logger.info(
          `Server running on http://${this._host}:${this._port}`,
        )

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
              message: 'Error stopping server:',
              context: { error },
            })

            return reject(error)
          }

          this._logger.info('Server stopped successfully.')
          resolve()
        })
      } else {
        this._logger.warn('No HTTP server running to stop.')
        resolve()
      }
    })
  }
}
