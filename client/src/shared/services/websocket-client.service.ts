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
  durationMs: number | null
  headers: Record<string, unknown>
}

export interface SessionIdMessage {
  type: 'session-id'
  sessionId?: string
}

export type WSMessage =
  | SessionIdMessage
  | WSProxyResponseMessage
  | Record<string, unknown>

export interface WebsocketClientOptions {
  logger?: ILogger
  configManager: GeoserverConfigManagerService
  WSClass?: typeof WebSocket
  location?: Pick<Location, 'origin' | 'protocol' | 'host'>
  config: Pick<typeof appConfig, 'proxyUrl' | 'basePath'>
}

export class WebsocketClient {
  private ws?: WebSocket
  private reconnectAttempts = 0
  private isManualClose = false
  private readonly maxReconnectAttempts = 10
  private readonly messageListeners: Set<(msg: WSMessage) => void> = new Set()
  private readonly logger?: WebsocketClientOptions['logger']
  private readonly configManager: WebsocketClientOptions['configManager']
  private readonly WSClass: NonNullable<WebsocketClientOptions['WSClass']>
  private readonly location: NonNullable<WebsocketClientOptions['location']>
  private readonly config: WebsocketClientOptions['config']

  constructor({
    logger,
    configManager,
    WSClass = WebSocket,
    location = globalThis.location,
    config,
  }: WebsocketClientOptions) {
    this.logger = logger
    this.configManager = configManager
    this.WSClass = WSClass
    this.location = location
    this.config = config
  }

  public onMessage = (listener: (msg: WSMessage) => void) => {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  private getWsUrl() {
    try {
      const base = this.config?.proxyUrl || this.location.origin
      const url = new URL(base)
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
      const basePath = this.config.basePath ?? ''
      url.pathname = (basePath + '/ws').replaceAll(/\/+/g, '/')
      return url.toString()
    } catch {
      const protocol = this.location.protocol === 'https:' ? 'wss' : 'ws'
      const basePath = this.config.basePath ?? ''
      return `${protocol}://${this.location.host}${basePath}/ws`.replaceAll(
        /\/+/g,
        '/',
      )
    }
  }

  public connect = () => {
    if (this.ws && this.ws.readyState === this.WSClass.OPEN) {
      return
    }

    const wsUrl = this.getWsUrl()
    this.isManualClose = false
    this.logger?.debug({ msg: 'WebsocketClient: connecting', wsUrl })

    try {
      this.ws = new this.WSClass(wsUrl)

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
              // listener threw — ignore to avoid breaking other listeners
            }
          })
        } catch (error) {
          // invalid JSON payloads are ignored but logged
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
    if (!this.ws || this.ws.readyState !== this.WSClass.OPEN) return
    try {
      this.ws.send(JSON.stringify(message))
    } catch (error) {
      this.logger?.warn({ msg: 'WebsocketClient: send failed', error })
    }
  }

  private handleMessage = (msg: WSMessage) => {
    // this.logger?.debug({ msg: 'WebsocketClient: message received', data: msg })

    if (msg.type === 'session-id') {
      const m = msg as SessionIdMessage
      const sessionId = m.sessionId
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
      return
    }

    this.logger?.debug({
      msg: 'WebsocketClient: generic message',
      message: msg,
    })
  }
}
