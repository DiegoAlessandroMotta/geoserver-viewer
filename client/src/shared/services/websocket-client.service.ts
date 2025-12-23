import { appConfig } from '@/shared/config'
import type { ILogger } from '@/shared/interfaces/logger.interface'
import type { GeoserverConfigManagerService } from '@/shared/services/geoserver/geoserver-config-manager.service'

export interface WSProxyResponseMessage {
  type: 'proxy-response'
  url: string
  target: string
  status: number
  cacheResult: string | null
  viaProxy: boolean
  headers: Record<string, any>
}

export type WSMessage = { type: string; [key: string]: any }

export interface WebsocketClientOptions {
  logger?: ILogger
  configManager?: GeoserverConfigManagerService
}

export class WebsocketClient {
  private ws?: WebSocket
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 10
  private isManualClose = false
  private readonly logger?: ILogger
  private readonly configManager?: GeoserverConfigManagerService
  private readonly messageListeners: Set<(msg: WSMessage) => void> = new Set()

  constructor({ logger, configManager }: WebsocketClientOptions = {}) {
    this.logger = logger
    this.configManager = configManager
  }

  public onMessage = (listener: (msg: WSMessage) => void) => {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  private getWsUrl() {
    try {
      const base = appConfig.proxyUrl || window.location.origin
      const url = new URL(base)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      const basePath = appConfig.basePath ?? ''
      url.pathname = (basePath + '/ws').replace(/\/+/g, '/')
      return url.toString()
    } catch {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const basePath = appConfig.basePath ?? ''
      return `${protocol}://${window.location.host}${basePath}/ws`.replace(
        /\/+/g,
        '/',
      )
    }
  }

  public connect = () => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }

    const wsUrl = this.getWsUrl()
    this.isManualClose = false
    this.logger?.debug({ msg: 'WebsocketClient: connecting', wsUrl })

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.reconnectAttempts = 0
        this.logger?.debug({ msg: 'WebsocketClient: connection opened', wsUrl })
      }

      this.ws.onmessage = (event) => {
        try {
          const payload: WSMessage = JSON.parse(event.data)
          this.handleMessage(payload)

          this.messageListeners.forEach((l) => {
            try {
              l(payload)
            } catch {
              // ignore
            }
          })
        } catch (error) {
          this.logger?.warn({ msg: 'WebsocketClient: invalid message', error })
        }
      }

      this.ws.onclose = (ev) => {
        this.logger?.debug({
          msg: 'WebsocketClient: connection closed',
          code: ev.code,
          reason: ev.reason,
        })
        if (!this.isManualClose) {
          this.scheduleReconnect()
        }
      }

      this.ws.onerror = (error) => {
        this.logger?.warn({ msg: 'WebsocketClient: socket error', error })
      }
    } catch (error) {
      this.logger?.warn({ msg: 'WebsocketClient: connect failed', error })
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect = () => {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger?.warn({
        msg: 'WebsocketClient: max reconnect attempts reached',
      })
      return
    }
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30_000)
    this.reconnectAttempts++
    this.logger?.debug({ msg: 'WebsocketClient: reconnect scheduled', delay })
    setTimeout(() => this.connect(), delay)
  }

  public disconnect = () => {
    this.isManualClose = true
    if (this.ws) {
      try {
        this.ws.close(1000, 'client disconnect')
      } catch {
        // ignore
      }
    }
  }

  public send = (message: WSMessage) => {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    try {
      this.ws.send(JSON.stringify(message))
    } catch (error) {
      this.logger?.warn({ msg: 'WebsocketClient: send failed', error })
    }
  }

  private handleMessage = (msg: WSMessage) => {
    // this.logger?.debug({ msg: 'WebsocketClient: message received', data: msg })

    if (msg.type === 'session-id') {
      const sessionId: string | undefined = (msg as any).sessionId
      if (sessionId) {
        this.logger?.debug({
          msg: 'WebsocketClient: session-id assigned',
          sessionId,
        })
        this.configManager?.setSessionId(sessionId)
      }
      return
    }

    if (msg.type === 'proxy-response') {
      // const proxyMsg = msg as WSProxyResponseMessage
      // this.logger?.debug({
      //   msg: 'Proxy response',
      //   url: proxyMsg.url,
      //   status: proxyMsg.status,
      //   cache: proxyMsg.cacheResult,
      //   headers: proxyMsg.headers,
      // })
      return
    }

    this.logger?.debug({
      msg: 'WebsocketClient: generic message',
      message: msg,
    })
  }
}
