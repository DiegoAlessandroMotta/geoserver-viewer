import { describe, it, expect, vi } from 'vitest'
import { WebSocketServer } from '@/shared/services/websocket-server/ws.service'
import { WebSocketSessionService } from '@/shared/services/websocket-server/websocket-session.service'

describe('WebSocketServer', () => {
  it('handles new connections, sends session id and registers client', () => {
    const info = vi.fn()
    const warn = vi.fn()
    const sessionService = new WebSocketSessionService({
      debug: () => {},
      warn: () => {},
      error: () => {},
    } as any)
    const wsServer = new WebSocketServer(
      { info, warn, debug: () => {} } as any,
      sessionService,
      '/base',
    )

    const sent: any[] = []
    const fakeWs: any = {
      send: (msg: string) => sent.push(msg),
      on: (_ev: string, _cb: any) => {},
    }

    ;(wsServer as any).handleNewConnection(fakeWs)

    expect(sent.length).toBe(1)
    const parsed = JSON.parse(sent[0])
    expect(parsed.type).toBe('session-id')
    expect(parsed).toHaveProperty('sessionId')
  })

  it('logs warn when sending session id fails', () => {
    const info = vi.fn()
    const warn = vi.fn()
    const sessionService = new WebSocketSessionService({
      debug: () => {},
      warn: () => {},
      error: () => {},
    } as any)
    const wsServer = new WebSocketServer(
      { info, warn, debug: () => {} } as any,
      sessionService,
      '/base',
    )

    const fakeWs: any = {
      send: () => {
        throw new Error('boom')
      },
      on: (_ev: string, _cb: any) => {},
    }

    ;(wsServer as any).handleNewConnection(fakeWs)

    expect(warn).toHaveBeenCalled()
  })
})
