import { WebSocket, WebSocketServer as WSServer } from 'ws'
import { Server as HttpServer } from 'node:http'
import crypto from 'node:crypto'
import { ILogger } from '@/shared/interfaces/logger.interface'
import { WebSocketSessionService } from '@/shared/services/websocket-server/websocket-session.service'

export class WebSocketServer {
  private _wsServer?: WSServer
  private _sessionService: WebSocketSessionService
  private readonly _logger: ILogger
  private readonly basePath?: string

  constructor(
    logger: ILogger,
    sessionService: WebSocketSessionService,
    basePath?: string,
  ) {
    this._logger = logger
    this._sessionService = sessionService
    this.basePath = basePath
  }

  public configure(httpServer: HttpServer): void {
    const wsPath = `${this.basePath ?? ''}/ws`.replace(/\/+/g, '/')

    this._wsServer = new WSServer({ server: httpServer, path: wsPath })

    this._wsServer.on('connection', (ws) => {
      this.handleNewConnection(ws)
    })

    this._logger?.info({
      message: 'WebSocket server configured',
      context: { path: wsPath },
    })
  }

  private handleNewConnection(ws: WebSocket): void {
    const sessionId = crypto.randomUUID()

    this._sessionService?.registerClient(sessionId, ws)

    try {
      ws.send(JSON.stringify({ type: 'session-id', sessionId }))
    } catch {
      this._logger?.warn({
        message: 'Failed to send session ID to client',
        context: { sessionId },
      })
    }

    this._logger?.info({
      message: 'Client connected',
      context: { sessionId },
    })

    ws.on('close', () => {
      this._sessionService?.unregisterClient(sessionId)
      this._logger?.info({
        message: 'Client disconnected',
        context: { sessionId },
      })
    })

    ws.on('error', (error) => {
      this._sessionService?.unregisterClient(sessionId)
      this._logger?.warn({
        message: 'Client WebSocket error',
        context: {
          sessionId,
          error: error instanceof Error ? error.message : String(error),
        },
      })
    })
  }

  public getServer(): WSServer | undefined {
    return this._wsServer
  }

  public getSessionService(): WebSocketSessionService | undefined {
    return this._sessionService
  }
}
