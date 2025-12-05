import { WebSocket } from 'ws'
import { ILogger } from '@/shared/interfaces/logger.interface'

export interface ProxyResponseMessage {
  type: 'proxy-response'
  url: string
  target: string
  status: number
  cacheResult: string | null
  viaProxy: boolean
  headers: {
    'geowebcache-cache-result': string | null
  }
}

export type WSMessage =
  | ProxyResponseMessage
  | { type: string; [key: string]: unknown }

export class WebSocketSessionService {
  private readonly _clients: Map<string, WebSocket>
  private readonly _logger: ILogger

  constructor(logger: ILogger) {
    this._logger = logger
    this._clients = new Map()
  }

  registerClient(sessionId: string, ws: WebSocket): void {
    this._clients.set(sessionId, ws)
    this._logger.debug(`WebSocket client registered: ${sessionId}`)
  }

  unregisterClient(sessionId: string): void {
    this._clients.delete(sessionId)
    this._logger.debug(`WebSocket client unregistered: ${sessionId}`)
  }

  sendToClient(sessionId: string, message: WSMessage): void {
    const ws = this._clients.get(sessionId)

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return
    }

    try {
      ws.send(JSON.stringify(message))
    } catch (error) {
      this._logger.warn({
        message: `Failed to send message to client ${sessionId}`,
        context: {
          error,
        },
      })
    }
  }

  getClient(sessionId: string): WebSocket | undefined {
    return this._clients.get(sessionId)
  }

  isClientConnected(sessionId: string): boolean {
    const ws = this._clients.get(sessionId)
    return ws !== undefined && ws.readyState === WebSocket.OPEN
  }
}
